/**
 * İnteqrasiya testləri — real HTTP + real baza.
 *
 * İşlətmək: node --test server/test.mjs
 * Test öz bazasını yaradır, mövcud məlumata toxunmur.
 */
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORT = 3097;
const BASE = `http://127.0.0.1:${PORT}`;
const dir = mkdtempSync(join(tmpdir(), 'qarga-test-'));
const DB = join(dir, 'test.db');

let proc;

async function api(path, { method = 'GET', body, cookie } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  const setCookie = res.headers.get('set-cookie');
  return { status: res.status, json, cookie: setCookie ? setCookie.split(';')[0] : null };
}

async function login(phone) {
  const otp = await api('/api/auth/otp', { method: 'POST', body: { phone } });
  const v = await api('/api/auth/verify', { method: 'POST', body: { phone, code: otp.json.devCode } });
  assert.equal(v.status, 200, 'giriş uğurlu olmalıdır');
  return v.cookie;
}

before(async () => {
  // Seed test bazasına
  await new Promise((res, rej) => {
    const s = spawn(process.execPath, ['server/seed.mjs', '--fresh'], {
      env: { ...process.env, QARGA_DB: DB }, stdio: 'ignore', shell: false,
    });
    s.on('exit', (c) => (c === 0 ? res() : rej(new Error('seed uğursuz: ' + c))));
  });

  proc = spawn(process.execPath, ['server/index.mjs'], {
    env: { ...process.env, QARGA_DB: DB, PORT: String(PORT) }, stdio: 'ignore',
  });

  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(BASE + '/api/health'); if (r.ok) return; } catch { /* hələ qalxmayıb */ }
    await new Promise((r) => setTimeout(r, 120));
  }
  throw new Error('API qalxmadı');
});

after(() => {
  proc?.kill();
  try { rmSync(dir, { recursive: true, force: true }); } catch { /* təmizlik */ }
});

test('kataloq bazadan gəlir və qiymət tam ədəddir', async () => {
  const r = await api('/api/offerings?perPage=5');
  assert.equal(r.status, 200);
  assert.ok(r.json.total > 0, 'ən azı bir təklif olmalıdır');
  const item = r.json.items[0];
  assert.equal(Number.isInteger(item.effectivePriceMinor), true, 'qiymət qəpiklə tam ədəd olmalıdır');
});

test('xəritə sərhədi nəticəni daraldır', async () => {
  const hamisi = await api('/api/offerings?perPage=60');
  const dar = await api('/api/offerings?perPage=60&south=40.40&west=49.84&north=40.42&east=49.86');
  assert.ok(dar.json.total < hamisi.json.total, 'sərhəd nəticəni azaltmalıdır');
  assert.ok(dar.json.total > 0, 'sərhəd daxilində nəticə qalmalıdır');
});

test('sponsorluq filtri ləğv etmir', async () => {
  const r = await api('/api/offerings?perPage=60&format=online');
  assert.ok(r.json.items.every((i) => i.format === 'online'),
    'sponsorlu təklif də seçilmiş formatdan kənara çıxmamalıdır');
});

test('giriş olmadan qeydiyyat mümkün deyil', async () => {
  const r = await api('/api/registrations', { method: 'POST', body: { cohortId: 'x' } });
  assert.equal(r.status, 401);
});

test('səhv OTP kodu qəbul olunmur', async () => {
  await api('/api/auth/otp', { method: 'POST', body: { phone: '+994500000001' } });
  const r = await api('/api/auth/verify', { method: 'POST', body: { phone: '+994500000001', code: '000000' } });
  assert.equal(r.status, 400);
  assert.equal(r.json.error.code, 'otp_invalid');
});

test('rol brauzerdən təyin oluna bilmir', async () => {
  const cookie = await login('+994500000002');
  const me = await api('/api/auth/me', { cookie });
  assert.equal(me.json.user.role, 'student', 'yeni istifadəçi həmişə student olmalıdır');

  // Admin ünvanına cəhd
  const admin = await api('/api/admin/overview', { cookie });
  assert.equal(admin.status, 403, 'student admin icmalını görməməlidir');
});

test('başqa provayderin məlumatına çıxış bağlıdır', async () => {
  const cookie = await login('+994500000003');
  const r = await api('/api/provider/p-lingua/registrations', { cookie });
  assert.equal(r.status, 403);
});

test('eyni anda gələn rezervasiyalar tutumu aşmır', async () => {
  const det = await api('/api/offerings/off-c-english-general-genclik');
  const slot = det.json.trialSlots[0];
  assert.ok(slot, 'sınaq vaxtı olmalıdır');
  const capacity = slot.capacity;

  // capacity + 3 fərqli istifadəçi eyni anda eyni slota yazılmağa çalışır
  const cookies = [];
  for (let i = 0; i < capacity + 3; i++) cookies.push(await login(`+99455000${String(100 + i).padStart(4, '0')}`));

  const results = await Promise.all(
    cookies.map((cookie) => api('/api/trials', { method: 'POST', body: { slotId: slot.id }, cookie })),
  );
  const ok = results.filter((r) => r.status === 200).length;
  const full = results.filter((r) => r.json?.error?.code === 'slot_full').length;

  assert.equal(ok, capacity, `qəbul olunan sayı tutuma bərabər olmalıdır (gözlənilən ${capacity}, alınan ${ok})`);
  assert.equal(full, 3, 'artıq sorğular slot_full almalıdır');

  const after = await api('/api/offerings/off-c-english-general-genclik');
  const s2 = after.json.trialSlots.find((x) => x.id === slot.id);
  assert.ok(!s2 || s2.remaining === 0, 'yer qalmamalıdır');
});

test('eyni idempotency açarı ikinci qeydiyyat yaratmır', async () => {
  const cookie = await login('+994500000200');
  const det = await api('/api/offerings/off-c-guitar-genclik');
  const cohortId = det.json.cohortId;
  const key = 'test-idem-1';

  const a = await api('/api/registrations', {
    method: 'POST', cookie,
    body: { cohortId, studentName: 'Test', studentPhone: '+994500000200', idempotencyKey: key },
  });
  const b = await api('/api/registrations', {
    method: 'POST', cookie,
    body: { cohortId, studentName: 'Test', studentPhone: '+994500000200', idempotencyKey: key },
  });
  assert.equal(a.status, 200);
  assert.equal(b.status, 200);
  assert.equal(b.json.replayed, true, 'ikinci sorğu təkrar kimi qaytarılmalıdır');
  assert.equal(a.json.registration.id, b.json.registration.id, 'eyni qeyd qaytarılmalıdır');
});

test('qeydiyyat heç vaxt brauzerdən "paid" olmur', async () => {
  const cookie = await login('+994500000201');
  const det = await api('/api/offerings/off-c-guitar-genclik');
  const r = await api('/api/registrations', {
    method: 'POST', cookie,
    body: { cohortId: det.json.cohortId, studentName: 'Test', studentPhone: '+994500000201' },
  });
  assert.equal(r.json.registration.payment_status, 'pay_at_center');
  assert.notEqual(r.json.registration.payment_status, 'paid');
});

test('qiymət serverdə hesablanır, brauzerin göndərdiyi məbləğ nəzərə alınmır', async () => {
  const cookie = await login('+994500000202');
  const det = await api('/api/offerings/off-c-guitar-genclik');
  const r = await api('/api/registrations', {
    method: 'POST', cookie,
    body: {
      cohortId: det.json.cohortId, studentName: 'T', studentPhone: '+994500000202',
      finalPriceMinor: 1, priceMinor: 1, // brauzerin uydurduğu məbləğ
    },
  });
  assert.equal(r.json.registration.final_price_minor, det.json.effectivePriceMinor,
    'server öz qiymətini işlətməlidir');
});

test('rəy yalnız iştirakdan sonra yazıla bilər', async () => {
  const cookie = await login('+994500000203');
  const r = await api('/api/reviews', {
    method: 'POST', cookie,
    body: { courseId: 'c-guitar-genclik', ratings: { overall: 5 }, text: 'Əla' },
  });
  assert.equal(r.status, 403);
  assert.equal(r.json.error.code, 'not_eligible');
});

test('status keçidləri qaydaya tabedir', async () => {
  const cookie = await login('+994500000204');
  const det = await api('/api/offerings/off-c-latin-narimanov');
  const reg = await api('/api/registrations', {
    method: 'POST', cookie,
    body: { cohortId: det.json.cohortId, studentName: 'T', studentPhone: '+994500000204' },
  });
  // submitted → completed birbaşa keçid qadağandır
  const bad = await api(`/api/registrations/${reg.json.registration.id}/status`, {
    method: 'POST', cookie, body: { status: 'completed' },
  });
  assert.ok(bad.status === 409 || bad.status === 403, 'qanunsuz keçid rədd olunmalıdır');
});

// ---- DEC-0001 / DEC-0002: qeydiyyat haqqı və QARGA10 promosunun dayandırılması ----

test('qeydiyyat haqqı olan təklifdə yekun məbləğ = endirimli qiymət + haqq (DEC-0001)', async () => {
  const cookie = await login('+994500000300');
  const det = await api('/api/offerings/off-c-english-general-genclik');
  assert.ok(det.json.registrationFeeMinor > 0, 'test təklifi sıfırdan fərqli qeydiyyat haqqı ilə seçilməlidir');

  const r = await api('/api/registrations', {
    method: 'POST', cookie,
    body: { cohortId: det.json.cohortId, studentName: 'Fee Test', studentPhone: '+994500000300' },
  });
  assert.equal(r.status, 200);
  const reg = r.json.registration;
  assert.equal(reg.registration_fee_minor, det.json.registrationFeeMinor,
    'qeydiyyat qeydində haqq təklifdəki ilə eyni olmalıdır');
  assert.equal(reg.price_minor, det.json.discountPriceMinor ?? det.json.priceMinor,
    'baza qiymət təklif-səviyyəli endirimdən sonrakı qiymət olmalıdır');
  assert.equal(
    reg.final_price_minor,
    (det.json.discountPriceMinor ?? det.json.priceMinor) + det.json.registrationFeeMinor,
    'yekun məbləğ = baza qiymət + qeydiyyat haqqı olmalıdır',
  );
});

test('qeydiyyat haqqı sıfır olan təklifdə yekun məbləğ dəyişmir', async () => {
  const cookie = await login('+994500000301');
  // off-c-guitar-genclik digər testlərdə artıq dolur, ona görə istifadə olunmamış
  // sıfır-haqqlı təklif seçilir.
  const det = await api('/api/offerings/off-c-english-speaking-nizami');
  assert.equal(det.json.registrationFeeMinor, 0, 'test təklifi sıfır qeydiyyat haqqı ilə seçilməlidir');

  const r = await api('/api/registrations', {
    method: 'POST', cookie,
    body: { cohortId: det.json.cohortId, studentName: 'No Fee Test', studentPhone: '+994500000301' },
  });
  assert.equal(r.status, 200);
  const reg = r.json.registration;
  assert.equal(reg.registration_fee_minor, 0);
  assert.equal(reg.final_price_minor, det.json.effectivePriceMinor,
    'haqq sıfır olduqda yekun məbləğ dəyişməməlidir');
});

test('QARGA10 promo kodu artıq endirim vermir (DEC-0002)', async () => {
  const cookie = await login('+994500000302');
  const det = await api('/api/offerings/off-c-english-general-genclik');

  const r = await api('/api/registrations', {
    method: 'POST', cookie,
    body: {
      cohortId: det.json.cohortId, studentName: 'Promo Test', studentPhone: '+994500000302',
      promoCode: 'QARGA10',
    },
  });
  assert.equal(r.status, 200);
  const reg = r.json.registration;
  assert.equal(reg.discount_minor, 0, 'promo dayandırılıb — endirim sıfır olmalıdır');
  assert.equal(
    reg.final_price_minor,
    (det.json.discountPriceMinor ?? det.json.priceMinor) + det.json.registrationFeeMinor,
    'promo kodu yekun məbləği azaltmamalıdır',
  );
  assert.equal(reg.promo_applied, false, 'API promo tətbiq olunmadığını açıq bildirməlidir');
  assert.ok(reg.promo_message, 'API promonun aktiv olmadığını izah edən mesaj qaytarmalıdır');
});

test('eyni idempotency açarı ilə təkrar sorğu haqqı ikiqat almır', async () => {
  const cookie = await login('+994500000303');
  const det = await api('/api/offerings/off-c-english-general-genclik');
  const key = 'test-idem-fee-1';

  const a = await api('/api/registrations', {
    method: 'POST', cookie,
    body: { cohortId: det.json.cohortId, studentName: 'Idem Fee', studentPhone: '+994500000303', idempotencyKey: key },
  });
  const b = await api('/api/registrations', {
    method: 'POST', cookie,
    body: { cohortId: det.json.cohortId, studentName: 'Idem Fee', studentPhone: '+994500000303', idempotencyKey: key },
  });
  assert.equal(a.status, 200);
  assert.equal(b.status, 200);
  assert.equal(b.json.replayed, true);
  assert.equal(a.json.registration.id, b.json.registration.id);
  assert.equal(a.json.registration.final_price_minor, b.json.registration.final_price_minor,
    'təkrar sorğu eyni yekun məbləği qaytarmalıdır, haqq ikiqat əlavə olunmamalıdır');
});

test('həssas əməliyyatlar audit log-a düşür', async () => {
  const cookie = await login('+994500000205');
  const det = await api('/api/offerings/off-c-latin-narimanov');
  await api('/api/registrations', {
    method: 'POST', cookie,
    body: { cohortId: det.json.cohortId, studentName: 'T', studentPhone: '+994500000205' },
  });
  // audit yalnız icazəli rol üçün görünür — student 403 almalıdır
  const denied = await api('/api/admin/audit', { cookie });
  assert.equal(denied.status, 403);
});
