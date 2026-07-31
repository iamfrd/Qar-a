/**
 * Kataloq və axtarış.
 *
 * Nəticələr HƏMİŞƏ bazadan gəlir. Sıralama şəffaf baldır — sponsorluq
 * istifadəçinin seçdiyi filtrləri ləğv etmir, yalnız bərabər şərtlərdə
 * yuxarı qalxır və cavabda `promoted: true` ilə işarələnir.
 */
import { all, get1 } from './db.mjs';

const R = 6371; // km
export function haversineKm(lat1, lng1, lat2, lng2) {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const BASE_SELECT = `
  SELECT
    o.id                AS offeringId,
    o.course_id         AS courseId,
    o.branch_id         AS branchId,
    o.format, o.mode, o.level, o.language, o.age_group AS ageGroup,
    o.price_minor       AS priceMinor,
    o.discount_price_minor AS discountPriceMinor,
    o.registration_fee_minor AS registrationFeeMinor,
    o.teacher_name      AS teacherName,
    o.teacher_bio       AS teacherBio,
    o.teacher_experience AS teacherExperience,
    o.qarga_exclusive   AS qargaExclusive,
    o.promoted          AS promoted,
    o.last_confirmed_at AS lastConfirmedAt,
    c.title, c.description, c.subcategory, c.certificate,
    c.category_id       AS categoryId,
    c.provider_id       AS providerId,
    c.cancellation_policy AS cancellationPolicy,
    p.name              AS providerName,
    p.verification_status AS providerVerification,
    b.name              AS branchName,
    b.address           AS branchAddress,
    b.lat, b.lng,
    a.id                AS areaId,
    a.name              AS areaName,
    coh.id              AS cohortId,
    coh.start_date      AS startDate,
    coh.duration_weeks  AS durationWeeks,
    coh.lesson_days     AS lessonDaysJson,
    coh.lesson_time     AS lessonTime,
    coh.day_part        AS dayPart,
    coh.capacity        AS seatsTotal,
    (coh.capacity - coh.booked) AS seatsAvailable,
    coh.status          AS cohortStatus,
    (SELECT COUNT(*) FROM trial_slots ts
       WHERE ts.offering_id = o.id AND ts.status = 'open' AND ts.booked < ts.capacity) AS openTrialSlots,
    (SELECT ROUND(AVG(r.overall), 2) FROM reviews r
       WHERE r.course_id = c.id AND r.moderation = 'published') AS rating,
    (SELECT COUNT(*) FROM reviews r
       WHERE r.course_id = c.id AND r.moderation = 'published') AS reviewCount
  FROM course_offerings o
  JOIN courses  c   ON c.id = o.course_id
  JOIN providers p  ON p.id = c.provider_id
  JOIN branches b   ON b.id = o.branch_id
  LEFT JOIN areas a ON a.id = b.area_id
  LEFT JOIN cohorts coh ON coh.offering_id = o.id
`;

function shape(row, userLoc) {
  const effectiveMinor = row.discountPriceMinor ?? row.priceMinor;
  const distanceKm = userLoc ? haversineKm(userLoc.lat, userLoc.lng, row.lat, row.lng) : null;
  return {
    offeringId: row.offeringId,
    courseId: row.courseId,
    cohortId: row.cohortId,
    title: row.title,
    description: row.description,
    subcategory: row.subcategory,
    categoryId: row.categoryId,
    provider: {
      id: row.providerId,
      name: row.providerName,
      verified: row.providerVerification === 'verified',
    },
    branch: {
      id: row.branchId,
      name: row.branchName,
      address: row.branchAddress,
      areaId: row.areaId,
      areaName: row.areaName,
      lat: row.lat,
      lng: row.lng,
    },
    format: row.format,
    mode: row.mode,
    level: row.level,
    language: row.language,
    ageGroup: row.ageGroup,
    certificate: !!row.certificate,
    priceMinor: row.priceMinor,
    discountPriceMinor: row.discountPriceMinor,
    effectivePriceMinor: effectiveMinor,
    registrationFeeMinor: row.registrationFeeMinor,
    teacher: { name: row.teacherName, bio: row.teacherBio, experienceYears: row.teacherExperience },
    schedule: {
      startDate: row.startDate,
      durationWeeks: row.durationWeeks,
      lessonDays: JSON.parse(row.lessonDaysJson ?? '[]'),
      lessonTime: row.lessonTime,
      dayPart: row.dayPart,
    },
    seatsTotal: row.seatsTotal,
    seatsAvailable: row.seatsAvailable,
    freeTrial: row.openTrialSlots > 0,
    openTrialSlots: row.openTrialSlots,
    rating: row.rating ?? 0,
    reviewCount: row.reviewCount ?? 0,
    qargaExclusive: !!row.qargaExclusive,
    promoted: !!row.promoted,
    lastConfirmedAt: row.lastConfirmedAt,
    cancellationPolicy: row.cancellationPolicy,
    distanceKm,
  };
}

/**
 * Şəffaf relevantlıq balı. Hər komponent cavabda izah üçün saxlanılır.
 */
function relevanceScore(item, f) {
  const parts = {};
  parts.rating = (item.rating || 0) * 0.5;
  parts.confidence = Math.min(item.reviewCount, 40) / 40 * 0.6;
  parts.freshness = item.lastConfirmedAt ? 0.4 : 0;
  parts.trial = item.freeTrial ? 0.35 : 0;
  parts.seats = item.seatsAvailable > 0 ? 0.25 : -0.8;
  parts.exclusive = item.qargaExclusive ? 0.3 : 0;
  parts.verified = item.provider.verified ? 0.3 : 0;
  parts.distance = item.distanceKm != null ? -Math.min(item.distanceKm, 12) * 0.18 : 0;
  parts.budget = f.priceMax != null && item.effectivePriceMinor <= f.priceMax ? 0.25 : 0;
  parts.promoted = item.promoted ? 0.5 : 0;
  const total = Object.values(parts).reduce((s, v) => s + v, 0);
  return { total, parts };
}

/**
 * @param {object} f filtrlər
 * @param {{lat:number,lng:number}|null} userLoc
 */
export function searchOfferings(f = {}, userLoc = null) {
  const where = ["o.active = 1", "c.status = 'published'"];
  const params = [];

  if (f.categoryId)   { where.push('c.category_id = ?'); params.push(f.categoryId); }
  if (f.subcategory)  { where.push('c.subcategory = ?'); params.push(f.subcategory); }
  if (f.providerId)   { where.push('c.provider_id = ?'); params.push(f.providerId); }
  if (f.areaId)       { where.push('b.area_id = ?');     params.push(f.areaId); }
  if (f.format)       { where.push('o.format = ?');      params.push(f.format); }
  if (f.mode)         { where.push('o.mode = ?');        params.push(f.mode); }
  if (f.level)        { where.push("(o.level = ? OR o.level = 'all')"); params.push(f.level); }
  if (f.ageGroup)     { where.push('o.age_group = ?');   params.push(f.ageGroup); }
  if (f.language)     { where.push('o.language LIKE ?'); params.push(`%${f.language}%`); }
  if (f.dayPart)      { where.push('coh.day_part = ?');  params.push(f.dayPart); }
  if (f.certificate)  { where.push('c.certificate = 1'); }
  if (f.verifiedOnly) { where.push("p.verification_status = 'verified'"); }
  if (f.qargaExclusiveOnly) { where.push('o.qarga_exclusive = 1'); }
  if (f.availableSeatsOnly) { where.push('(coh.capacity - coh.booked) > 0'); }
  if (f.priceMin != null) { where.push('COALESCE(o.discount_price_minor, o.price_minor) >= ?'); params.push(f.priceMin); }
  if (f.priceMax != null) { where.push('COALESCE(o.discount_price_minor, o.price_minor) <= ?'); params.push(f.priceMax); }
  if (f.startsAfter)  { where.push('coh.start_date >= ?'); params.push(f.startsAfter); }

  // Xəritə sərhədi — indeksdən istifadə edən sadə bounding box.
  if (f.bounds) {
    const { south, west, north, east } = f.bounds;
    where.push('b.lat BETWEEN ? AND ? AND b.lng BETWEEN ? AND ?');
    params.push(south, north, west, east);
  }

  if (f.q) {
    where.push('(c.title LIKE ? OR c.description LIKE ? OR c.subcategory LIKE ? OR p.name LIKE ? OR a.name LIKE ?)');
    const like = `%${f.q}%`;
    params.push(like, like, like, like, like);
  }

  const rows = all(`${BASE_SELECT} WHERE ${where.join(' AND ')}`, params);
  let items = rows.map((r) => shape(r, userLoc));

  if (f.freeTrialOnly) items = items.filter((i) => i.freeTrial);
  if (f.minRating)     items = items.filter((i) => i.rating >= f.minRating);
  if (f.radiusKm && userLoc) items = items.filter((i) => i.distanceKm != null && i.distanceKm <= f.radiusKm);

  const sort = f.sort ?? 'relevance';
  if (sort === 'price') items.sort((a, b) => a.effectivePriceMinor - b.effectivePriceMinor);
  else if (sort === 'rating') items.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  else if (sort === 'distance') items.sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9));
  else if (sort === 'startDate') items.sort((a, b) => String(a.schedule.startDate).localeCompare(String(b.schedule.startDate)));
  else {
    for (const i of items) { const s = relevanceScore(i, f); i.score = s.total; i.scoreParts = s.parts; }
    items.sort((a, b) => b.score - a.score);
  }

  const total = items.length;
  const page = Math.max(1, Number(f.page) || 1);
  const perPage = Math.min(60, Math.max(1, Number(f.perPage) || 20));
  const paged = items.slice((page - 1) * perPage, page * perPage);

  return { items: paged, total, page, perPage, pageCount: Math.ceil(total / perPage) || 1 };
}

export function offeringDetail(offeringId, userLoc = null) {
  const row = get1(`${BASE_SELECT} WHERE o.id = ?`, [offeringId]);
  if (!row) return null;
  const item = shape(row, userLoc);
  item.faqs = [];
  item.trialSlots = all(
    `SELECT id, starts_at AS startsAt, duration_min AS durationMin, capacity,
            booked, (capacity - booked) AS remaining
     FROM trial_slots WHERE offering_id = ? AND status = 'open' ORDER BY starts_at`,
    [offeringId],
  );
  item.reviews = all(
    `SELECT r.id, r.overall, r.text, r.created_at AS createdAt, r.provider_reply AS providerReply,
            u.name AS userName
     FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.course_id = ? AND r.moderation = 'published' ORDER BY r.created_at DESC`,
    [item.courseId],
  );
  item.otherBranches = all(
    `SELECT o.id AS offeringId, b.name AS branchName, a.name AS areaName,
            COALESCE(o.discount_price_minor, o.price_minor) AS effectivePriceMinor
     FROM course_offerings o JOIN branches b ON b.id = o.branch_id
     LEFT JOIN areas a ON a.id = b.area_id
     WHERE o.course_id = ? AND o.id != ? AND o.active = 1`,
    [item.courseId, offeringId],
  );
  return item;
}

export const listAreas = () => all('SELECT id, name, lat, lng FROM areas ORDER BY name');
export const listCategories = () => all(
  'SELECT id, name_az AS nameAz, name_en AS nameEn, name_ru AS nameRu, icon, color FROM categories ORDER BY name_az',
);
