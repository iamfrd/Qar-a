/**
 * Sınaq dərsi və qeydiyyat — hər ikisi tranzaksiya daxilində.
 *
 * Overbooking-in qarşısı iki qatla alınır:
 *   1) `UPDATE ... SET booked = booked + 1 WHERE id = ? AND booked < capacity`
 *      — şərtli yeniləmə, changes === 0 olarsa yer qalmayıb.
 *   2) sxemdəki `CHECK (booked <= capacity)` — hər ehtimala qarşı son sədd.
 *
 * Təkrar sorğular idempotency_key ilə eyni nəticəni qaytarır.
 */
import { tx, get1, run, all, uid, now, ref, audit } from './db.mjs';
import { HttpError, requireUser, requireOwnRecord, requireProviderAccess, isAdmin } from './auth.mjs';

function providerOfSlot(slotId) {
  return get1(
    `SELECT c.provider_id AS providerId FROM trial_slots s
     JOIN course_offerings o ON o.id = s.offering_id
     JOIN courses c ON c.id = o.course_id WHERE s.id = ?`, [slotId],
  );
}

function historyTrial(reservationId, status, actorUserId, note = '') {
  run('INSERT INTO trial_status_history (id, reservation_id, status, actor_user_id, note, at) VALUES (?,?,?,?,?,?)',
    [uid(), reservationId, status, actorUserId ?? null, note, now()]);
}

// ------------------------------------------------------------- sınaq dərsi

export function bookTrial(user, { slotId, note = '', idempotencyKey }) {
  requireUser(user);

  if (idempotencyKey) {
    const existing = get1('SELECT * FROM trial_reservations WHERE idempotency_key = ?', [idempotencyKey]);
    if (existing) return { reservation: existing, replayed: true };
  }

  return tx(() => {
    const slot = get1("SELECT * FROM trial_slots WHERE id = ? AND status = 'open'", [slotId]);
    if (!slot) throw new HttpError(404, 'slot_not_found', 'Bu sınaq dərsi vaxtı mövcud deyil.');
    if (slot.starts_at < now()) throw new HttpError(400, 'slot_past', 'Bu vaxt keçmişdə qalıb.');

    const dup = get1('SELECT id FROM trial_reservations WHERE user_id = ? AND slot_id = ?', [user.id, slotId]);
    if (dup) throw new HttpError(409, 'already_booked', 'Bu vaxta artıq yazılmısınız.');

    // Şərtli yeniləmə — yarış şəraitində yalnız biri qazanır.
    const upd = run('UPDATE trial_slots SET booked = booked + 1 WHERE id = ? AND booked < capacity', [slotId]);
    if (upd.changes !== 1) throw new HttpError(409, 'slot_full', 'Təəssüf, bu vaxt üçün yer qalmadı.');

    const id = uid();
    const reference = ref('SN');
    run(`INSERT INTO trial_reservations (id, ref, user_id, slot_id, note, status, idempotency_key, created_at)
         VALUES (?,?,?,?,?,'requested',?,?)`,
      [id, reference, user.id, slotId, note, idempotencyKey ?? null, now()]);
    historyTrial(id, 'requested', user.id);
    audit(user.id, 'trial.requested', 'trial_reservation', id, { slotId });

    return { reservation: get1('SELECT * FROM trial_reservations WHERE id = ?', [id]), replayed: false };
  });
}

const TRIAL_TRANSITIONS = {
  requested: ['confirmed', 'alternative_proposed', 'declined', 'cancelled_by_student', 'cancelled_by_provider'],
  confirmed: ['attended', 'no_show', 'cancelled_by_student', 'cancelled_by_provider'],
  alternative_proposed: ['confirmed', 'declined', 'cancelled_by_student'],
  declined: [],
  cancelled_by_student: [],
  cancelled_by_provider: [],
  attended: [],
  no_show: [],
};

const RELEASES_SEAT = new Set(['declined', 'cancelled_by_student', 'cancelled_by_provider']);

export function updateTrialStatus(user, reservationId, nextStatus, { note = '', proposedSlotId } = {}) {
  requireUser(user);

  return tx(() => {
    const r = get1('SELECT * FROM trial_reservations WHERE id = ?', [reservationId]);
    if (!r) throw new HttpError(404, 'not_found', 'Rezervasiya tapılmadı.');

    const owner = providerOfSlot(r.slot_id);
    const studentActions = new Set(['cancelled_by_student']);
    if (studentActions.has(nextStatus)) {
      requireOwnRecord(user, r.user_id);
    } else {
      requireProviderAccess(user, owner.providerId);
    }

    const allowed = TRIAL_TRANSITIONS[r.status] ?? [];
    if (!allowed.includes(nextStatus)) {
      throw new HttpError(409, 'invalid_transition', `"${r.status}" vəziyyətindən "${nextStatus}" vəziyyətinə keçmək olmaz.`);
    }

    if (RELEASES_SEAT.has(nextStatus)) {
      run('UPDATE trial_slots SET booked = MAX(0, booked - 1) WHERE id = ?', [r.slot_id]);
    }

    if (nextStatus === 'alternative_proposed') {
      if (!proposedSlotId) throw new HttpError(400, 'slot_required', 'Alternativ vaxt göstərilməlidir.');
      const alt = get1("SELECT * FROM trial_slots WHERE id = ? AND status = 'open'", [proposedSlotId]);
      if (!alt) throw new HttpError(404, 'slot_not_found', 'Təklif olunan vaxt mövcud deyil.');
      run('UPDATE trial_reservations SET proposed_slot_id = ? WHERE id = ?', [proposedSlotId, reservationId]);
    }

    run('UPDATE trial_reservations SET status = ? WHERE id = ?', [nextStatus, reservationId]);
    historyTrial(reservationId, nextStatus, user.id, note);
    audit(user.id, `trial.${nextStatus}`, 'trial_reservation', reservationId, { note });

    // Rəy hüququ yalnız iştirakdan sonra yaranır — rezervasiya yaratmaq kifayət etmir.
    if (nextStatus === 'attended') {
      const course = get1(
        `SELECT c.id FROM trial_slots s JOIN course_offerings o ON o.id = s.offering_id
         JOIN courses c ON c.id = o.course_id WHERE s.id = ?`, [r.slot_id],
      );
      run(`INSERT OR IGNORE INTO review_eligibility (id, user_id, course_id, source, source_id, created_at)
           VALUES (?,?,?,'trial_attended',?,?)`,
        [uid(), r.user_id, course.id, reservationId, now()]);
    }

    return get1('SELECT * FROM trial_reservations WHERE id = ?', [reservationId]);
  });
}

export function listTrialsForUser(user) {
  requireUser(user);
  return all(
    `SELECT tr.id, tr.ref, tr.status, tr.note, tr.created_at AS createdAt,
            ts.starts_at AS startsAt, c.title, b.name AS branchName
     FROM trial_reservations tr
     JOIN trial_slots ts ON ts.id = tr.slot_id
     JOIN course_offerings o ON o.id = ts.offering_id
     JOIN courses c ON c.id = o.course_id
     JOIN branches b ON b.id = o.branch_id
     WHERE tr.user_id = ? ORDER BY tr.created_at DESC`, [user.id],
  );
}

export function listTrialsForProvider(user, providerId) {
  requireProviderAccess(user, providerId);
  return all(
    `SELECT tr.id, tr.ref, tr.status, tr.note, tr.created_at AS createdAt,
            ts.starts_at AS startsAt, c.title, u.name AS studentName, u.phone AS studentPhone
     FROM trial_reservations tr
     JOIN trial_slots ts ON ts.id = tr.slot_id
     JOIN course_offerings o ON o.id = ts.offering_id
     JOIN courses c ON c.id = o.course_id
     JOIN users u ON u.id = tr.user_id
     WHERE c.provider_id = ? ORDER BY tr.created_at DESC`, [providerId],
  );
}

export function trialHistory(user, reservationId) {
  requireUser(user);
  const r = get1('SELECT * FROM trial_reservations WHERE id = ?', [reservationId]);
  if (!r) throw new HttpError(404, 'not_found', 'Rezervasiya tapılmadı.');
  if (r.user_id !== user.id && !isAdmin(user)) {
    requireProviderAccess(user, providerOfSlot(r.slot_id).providerId);
  }
  return all(
    'SELECT status, note, at FROM trial_status_history WHERE reservation_id = ? ORDER BY at',
    [reservationId],
  );
}

// ------------------------------------------------------------- qeydiyyat

// DEC-0002: QARGA10 promo kodu maliyyələşdirmə modeli təsdiqlənənə qədər
// dayandırılıb. Promo çərçivəsi qurulmur, sütun silinmir — yalnız real
// endirim vermə funksiyası bağlanır. `PROMO_KNOWN_CODES` yalnız "istifadəçi
// tanınan kodu göndərdi" faktını qeyd etmək üçündür, endirimə təsir etmir.
const PROMO_SUSPENDED = true;
const PROMO_KNOWN_CODES = new Set(['QARGA10']);
const PROMO_SUSPENDED_MESSAGE = 'QARGA10 promo kodu hazırda aktiv deyil (maliyyələşdirmə modeli təsdiqlənməyib).';

/** Saxlanmış `promo_code` sütununa əsasən istifadəçiyə göstəriləcək promo vəziyyətini törədir. */
function derivePromoInfo(promoCodeStored) {
  const applied = !PROMO_SUSPENDED && !!promoCodeStored;
  const message = promoCodeStored ? PROMO_SUSPENDED_MESSAGE : null;
  return { promo_applied: applied, promo_message: message };
}

function withPromoInfo(row) {
  if (!row) return row;
  return { ...row, ...derivePromoInfo(row.promo_code) };
}

export function createRegistration(user, { cohortId, studentName, studentPhone, studentAge = '', promoCode, idempotencyKey }) {
  requireUser(user);

  if (idempotencyKey) {
    const existing = get1('SELECT * FROM registrations WHERE idempotency_key = ?', [idempotencyKey]);
    if (existing) return { registration: withPromoInfo(existing), replayed: true };
  }
  if (!studentName?.trim()) throw new HttpError(400, 'name_required', 'Tələbənin adı tələb olunur.');
  if (!studentPhone?.trim()) throw new HttpError(400, 'phone_required', 'Telefon nömrəsi tələb olunur.');

  return tx(() => {
    const coh = get1(
      `SELECT coh.*, o.price_minor, o.discount_price_minor, o.registration_fee_minor
       FROM cohorts coh JOIN course_offerings o ON o.id = coh.offering_id
       WHERE coh.id = ?`, [cohortId],
    );
    if (!coh) throw new HttpError(404, 'cohort_not_found', 'Bu qrup mövcud deyil.');
    if (coh.status !== 'open') throw new HttpError(409, 'cohort_closed', 'Bu qrupa qeydiyyat bağlıdır.');

    const upd = run('UPDATE cohorts SET booked = booked + 1 WHERE id = ? AND booked < capacity', [cohortId]);
    if (upd.changes !== 1) throw new HttpError(409, 'cohort_full', 'Təəssüf, bu qrupda yer qalmadı.');

    // Qiymət SERVERDƏ hesablanır. Brauzerdən gələn məbləğ nəzərə alınmır.
    // DEC-0001: qeydiyyat haqqı yekun məbləğə daxildir və qeyd zamanı
    // donduraraq saxlanılır. DEC-0002: QARGA10 dayandırılıb, endirim həmişə 0-dır.
    const baseMinor = coh.discount_price_minor ?? coh.price_minor;
    const registrationFeeMinor = coh.registration_fee_minor ?? 0;
    const promoSubmitted = String(promoCode ?? '').trim().toUpperCase();
    const promoRecognized = PROMO_KNOWN_CODES.has(promoSubmitted);
    const discountMinor = 0; // DEC-0002 — promo dayandırılıb, endirim funksiyası bağlıdır
    const finalMinor = Math.max(0, baseMinor - discountMinor) + registrationFeeMinor;
    const promoCodeToStore = promoRecognized ? promoSubmitted : null;

    const id = uid();
    const reference = ref('QR');
    run(`INSERT INTO registrations
         (id, ref, user_id, cohort_id, student_name, student_phone, student_age,
          price_minor, discount_minor, registration_fee_minor, final_price_minor, promo_code,
          payment_method, payment_status, status, idempotency_key, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'pay_at_center','pay_at_center','submitted',?,?)`,
      [id, reference, user.id, cohortId, studentName.trim(), studentPhone.trim(), studentAge,
       baseMinor, discountMinor, registrationFeeMinor, finalMinor, promoCodeToStore,
       idempotencyKey ?? null, now()]);

    run('INSERT INTO registration_status_history (id, registration_id, status, actor_user_id, at) VALUES (?,?,?,?,?)',
      [uid(), id, 'submitted', user.id, now()]);
    audit(user.id, 'registration.submitted', 'registration', id, { cohortId, finalMinor });

    if (coh.booked + 1 >= coh.capacity) {
      run("UPDATE cohorts SET status = 'full' WHERE id = ?", [cohortId]);
    }

    return { registration: withPromoInfo(get1('SELECT * FROM registrations WHERE id = ?', [id])), replayed: false };
  });
}

const REG_TRANSITIONS = {
  submitted: ['provider_review', 'cancelled', 'rejected'],
  provider_review: ['confirmed', 'rejected', 'cancelled'],
  confirmed: ['completed', 'cancelled', 'disputed'],
  completed: ['disputed'],
  cancelled: [], rejected: [], disputed: ['refunded', 'completed'], refunded: [],
};
const REG_RELEASES_SEAT = new Set(['cancelled', 'rejected', 'refunded']);

export function updateRegistrationStatus(user, registrationId, nextStatus, note = '') {
  requireUser(user);
  return tx(() => {
    const r = get1('SELECT * FROM registrations WHERE id = ?', [registrationId]);
    if (!r) throw new HttpError(404, 'not_found', 'Qeydiyyat tapılmadı.');

    const owner = get1(
      `SELECT c.provider_id AS providerId, c.id AS courseId FROM registrations rg
       JOIN cohorts coh ON coh.id = rg.cohort_id
       JOIN course_offerings o ON o.id = coh.offering_id
       JOIN courses c ON c.id = o.course_id WHERE rg.id = ?`, [registrationId],
    );

    if (nextStatus === 'cancelled') requireOwnRecord(user, r.user_id);
    else requireProviderAccess(user, owner.providerId);

    const allowed = REG_TRANSITIONS[r.status] ?? [];
    if (!allowed.includes(nextStatus)) {
      throw new HttpError(409, 'invalid_transition', `"${r.status}" → "${nextStatus}" keçidi mümkün deyil.`);
    }

    if (REG_RELEASES_SEAT.has(nextStatus)) {
      run("UPDATE cohorts SET booked = MAX(0, booked - 1), status = 'open' WHERE id = ?", [r.cohort_id]);
    }

    run('UPDATE registrations SET status = ? WHERE id = ?', [nextStatus, registrationId]);
    run('INSERT INTO registration_status_history (id, registration_id, status, actor_user_id, note, at) VALUES (?,?,?,?,?,?)',
      [uid(), registrationId, nextStatus, user.id, note, now()]);
    audit(user.id, `registration.${nextStatus}`, 'registration', registrationId, { note });

    if (nextStatus === 'confirmed') {
      run(`INSERT OR IGNORE INTO review_eligibility (id, user_id, course_id, source, source_id, created_at)
           VALUES (?,?,?,'registration_confirmed',?,?)`,
        [uid(), r.user_id, owner.courseId, registrationId, now()]);
    }

    return get1('SELECT * FROM registrations WHERE id = ?', [registrationId]);
  });
}

export function listRegistrationsForUser(user) {
  requireUser(user);
  return all(
    `SELECT rg.id, rg.ref, rg.status, rg.payment_status AS paymentStatus,
            rg.price_minor AS priceMinor, rg.discount_minor AS discountMinor,
            rg.registration_fee_minor AS registrationFeeMinor, rg.final_price_minor AS finalPriceMinor,
            rg.created_at AS createdAt,
            c.title, b.name AS branchName, coh.lesson_time AS lessonTime
     FROM registrations rg
     JOIN cohorts coh ON coh.id = rg.cohort_id
     JOIN course_offerings o ON o.id = coh.offering_id
     JOIN courses c ON c.id = o.course_id
     JOIN branches b ON b.id = o.branch_id
     WHERE rg.user_id = ? ORDER BY rg.created_at DESC`, [user.id],
  );
}

export function registrationHistory(user, registrationId) {
  requireUser(user);
  const r = get1('SELECT * FROM registrations WHERE id = ?', [registrationId]);
  if (!r) throw new HttpError(404, 'not_found', 'Qeydiyyat tapılmadı.');
  requireOwnRecord(user, r.user_id);
  return all('SELECT status, note, at FROM registration_status_history WHERE registration_id = ? ORDER BY at',
    [registrationId]);
}

// ------------------------------------------------------------- rəy

export function submitReview(user, { courseId, ratings, text = '' }) {
  requireUser(user);
  return tx(() => {
    const elig = get1(
      'SELECT * FROM review_eligibility WHERE user_id = ? AND course_id = ? AND consumed_at IS NULL LIMIT 1',
      [user.id, courseId],
    );
    if (!elig) {
      throw new HttpError(403, 'not_eligible',
        'Rəy yazmaq üçün əvvəlcə sınaq dərsində iştirak etməli və ya qeydiyyatınız təsdiqlənməlidir.');
    }
    const id = uid();
    run(`INSERT INTO reviews (id, course_id, user_id, eligibility_id, overall, teacher_quality, content,
         location, price_value, communication, schedule_accuracy, text, moderation, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'published',?)`,
      [id, courseId, user.id, elig.id, ratings.overall, ratings.teacherQuality ?? null, ratings.content ?? null,
       ratings.location ?? null, ratings.priceValue ?? null, ratings.communication ?? null,
       ratings.scheduleAccuracy ?? null, text, now()]);
    run('UPDATE review_eligibility SET consumed_at = ? WHERE id = ?', [now(), elig.id]);
    audit(user.id, 'review.submitted', 'review', id, { courseId });
    return get1('SELECT * FROM reviews WHERE id = ?', [id]);
  });
}

export function canReview(user, courseId) {
  if (!user) return false;
  return !!get1(
    'SELECT 1 FROM review_eligibility WHERE user_id = ? AND course_id = ? AND consumed_at IS NULL',
    [user.id, courseId],
  );
}
