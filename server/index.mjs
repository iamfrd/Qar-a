/**
 * Qarğa API — modulyar monolit.
 *
 * Xarici asılılıq yoxdur: node:http + node:sqlite. Vite `/api` sorğularını
 * bura proxy edir, ona görə cookie eyni mənşəlidir və CORS lazım deyil.
 */
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { migrate, get1, all, closeDb } from './db.mjs';
import {
  HttpError, requestOtp, verifyOtp, logout, userFromToken, publicUser,
  requireUser, requirePermission, requireProviderAccess, isAdmin,
} from './auth.mjs';
import { searchOfferings, offeringDetail, listAreas, listCategories } from './catalog.mjs';
import {
  bookTrial, updateTrialStatus, listTrialsForUser, listTrialsForProvider, trialHistory,
  createRegistration, updateRegistrationStatus, listRegistrationsForUser, registrationHistory,
  submitReview, canReview,
} from './booking.mjs';

const PORT = Number(process.env.PORT ?? 3001);
const COOKIE = 'qarga_session';
const isDev = process.env.NODE_ENV !== 'production';

const log = (level, msg, extra = {}) =>
  console.log(JSON.stringify({ level, msg, at: new Date().toISOString(), ...extra }));

function parseCookies(header = '') {
  return Object.fromEntries(
    header.split(';').map((p) => p.trim().split('=')).filter((p) => p[0]).map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]),
  );
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 1_000_000) throw new HttpError(413, 'payload_too_large', 'Sorğu həddindən böyükdür.');
    chunks.push(c);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new HttpError(400, 'invalid_json', 'JSON düzgün deyil.'); }
}

const num = (v) => (v == null || v === '' ? undefined : Number(v));
const bool = (v) => v === '1' || v === 'true';

function filtersFromQuery(q) {
  const f = {
    q: q.get('q') || undefined,
    categoryId: q.get('categoryId') || undefined,
    subcategory: q.get('subcategory') || undefined,
    providerId: q.get('providerId') || undefined,
    areaId: q.get('areaId') || undefined,
    format: q.get('format') || undefined,
    mode: q.get('mode') || undefined,
    level: q.get('level') || undefined,
    ageGroup: q.get('ageGroup') || undefined,
    language: q.get('language') || undefined,
    dayPart: q.get('dayPart') || undefined,
    startsAfter: q.get('startsAfter') || undefined,
    priceMin: num(q.get('priceMin')),
    priceMax: num(q.get('priceMax')),
    minRating: num(q.get('minRating')),
    radiusKm: num(q.get('radiusKm')),
    certificate: bool(q.get('certificate')),
    verifiedOnly: bool(q.get('verifiedOnly')),
    qargaExclusiveOnly: bool(q.get('qargaExclusiveOnly')),
    availableSeatsOnly: bool(q.get('availableSeatsOnly')),
    freeTrialOnly: bool(q.get('freeTrialOnly')),
    sort: q.get('sort') || undefined,
    page: num(q.get('page')),
    perPage: num(q.get('perPage')),
  };
  const s = num(q.get('south')), w = num(q.get('west')), n = num(q.get('north')), e = num(q.get('east'));
  if ([s, w, n, e].every((v) => Number.isFinite(v))) f.bounds = { south: s, west: w, north: n, east: e };
  return f;
}

function userLocFromQuery(q) {
  const lat = num(q.get('lat')), lng = num(q.get('lng'));
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

// --------------------------------------------------------------- marşrutlar

const routes = [];
const route = (method, pattern, handler) => routes.push({ method, pattern, handler });

route('GET', '/api/health', () => ({ ok: true }));
route('GET', '/api/areas', () => ({ areas: listAreas() }));
route('GET', '/api/categories', () => ({ categories: listCategories() }));

route('GET', '/api/offerings', ({ query }) =>
  searchOfferings(filtersFromQuery(query), userLocFromQuery(query)));

route('GET', /^\/api\/offerings\/([^/]+)$/, ({ params, query }) => {
  const item = offeringDetail(params[0], userLocFromQuery(query));
  if (!item) throw new HttpError(404, 'not_found', 'Təklif tapılmadı.');
  return item;
});

route('GET', '/api/providers', () => ({
  providers: all(`SELECT id, name, logo, about, phone, email, plan,
                         verification_status AS verificationStatus
                  FROM providers ORDER BY name`),
}));

route('GET', /^\/api\/providers\/([^/]+)$/, ({ params }) => {
  const p = get1(`SELECT id, name, logo, about, phone, email, plan,
                         verification_status AS verificationStatus FROM providers WHERE id = ?`, [params[0]]);
  if (!p) throw new HttpError(404, 'not_found', 'Provayder tapılmadı.');
  p.branches = all('SELECT id, name, address, lat, lng, area_id AS areaId FROM branches WHERE provider_id = ?', [p.id]);
  return p;
});

// --------------------------------------------------------------- kimlik

route('POST', '/api/auth/otp', async ({ body }) => requestOtp(body.phone));

route('POST', '/api/auth/verify', async ({ body, setCookie }) => {
  const { token: raw, user } = verifyOtp(body.phone, body.code);
  setCookie(COOKIE, raw, { httpOnly: true, sameSite: 'Lax', path: '/', maxAge: 30 * 864e2, secure: !isDev });
  return { user };
});

route('POST', '/api/auth/logout', async ({ rawToken, setCookie }) => {
  logout(rawToken);
  setCookie(COOKIE, '', { httpOnly: true, sameSite: 'Lax', path: '/', maxAge: 0 });
  return { ok: true };
});

route('GET', '/api/auth/me', ({ user }) => ({ user: publicUser(user) }));

route('PATCH', '/api/auth/me', async ({ user, body }) => {
  requireUser(user);
  const { run } = await import('./db.mjs');
  run('UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE id = ?',
    [body.name ?? null, body.email ?? null, user.id]);
  return { user: publicUser(get1('SELECT * FROM users WHERE id = ?', [user.id])) };
});

// --------------------------------------------------------------- sınaq dərsi

route('POST', '/api/trials', async ({ user, body }) => bookTrial(user, body));
route('GET', '/api/trials', ({ user }) => ({ trials: listTrialsForUser(user) }));
route('GET', /^\/api\/trials\/([^/]+)\/history$/, ({ user, params }) => ({ history: trialHistory(user, params[0]) }));
route('POST', /^\/api\/trials\/([^/]+)\/status$/, async ({ user, params, body }) =>
  updateTrialStatus(user, params[0], body.status, { note: body.note, proposedSlotId: body.proposedSlotId }));

// --------------------------------------------------------------- qeydiyyat

route('POST', '/api/registrations', async ({ user, body }) => createRegistration(user, body));
route('GET', '/api/registrations', ({ user }) => ({ registrations: listRegistrationsForUser(user) }));
route('GET', /^\/api\/registrations\/([^/]+)\/history$/, ({ user, params }) =>
  ({ history: registrationHistory(user, params[0]) }));
route('POST', /^\/api\/registrations\/([^/]+)\/status$/, async ({ user, params, body }) =>
  updateRegistrationStatus(user, params[0], body.status, body.note));

// --------------------------------------------------------------- rəy

route('POST', '/api/reviews', async ({ user, body }) => submitReview(user, body));
route('GET', /^\/api\/courses\/([^/]+)\/can-review$/, ({ user, params }) => ({ canReview: canReview(user, params[0]) }));

// --------------------------------------------------------------- provayder

route('GET', /^\/api\/provider\/([^/]+)\/trials$/, ({ user, params }) =>
  ({ trials: listTrialsForProvider(user, params[0]) }));

route('GET', /^\/api\/provider\/([^/]+)\/registrations$/, ({ user, params }) => {
  requireProviderAccess(user, params[0]);
  return {
    registrations: all(
      `SELECT rg.id, rg.ref, rg.status, rg.final_price_minor AS finalPriceMinor,
              rg.student_name AS studentName, rg.created_at AS createdAt, c.title
       FROM registrations rg
       JOIN cohorts coh ON coh.id = rg.cohort_id
       JOIN course_offerings o ON o.id = coh.offering_id
       JOIN courses c ON c.id = o.course_id
       WHERE c.provider_id = ? ORDER BY rg.created_at DESC`, [params[0]]),
  };
});

// --------------------------------------------------------------- admin

route('GET', '/api/admin/audit', ({ user, query }) => {
  requirePermission(user, 'course.moderate');
  const limit = Math.min(200, Number(query.get('limit')) || 50);
  return { entries: all('SELECT * FROM audit_log ORDER BY at DESC LIMIT ?', [limit]) };
});

route('GET', '/api/admin/overview', ({ user }) => {
  requireUser(user);
  if (!isAdmin(user)) throw new HttpError(403, 'forbidden', 'Admin icazəsi tələb olunur.');
  const one = (sql) => get1(sql)?.n ?? 0;
  return {
    users: one('SELECT COUNT(*) n FROM users'),
    providers: one('SELECT COUNT(*) n FROM providers'),
    courses: one('SELECT COUNT(*) n FROM courses'),
    registrations: one('SELECT COUNT(*) n FROM registrations'),
    trials: one('SELECT COUNT(*) n FROM trial_reservations'),
    pendingProviders: one("SELECT COUNT(*) n FROM providers WHERE verification_status IN ('pending','needs_changes')"),
    pendingCourses: one("SELECT COUNT(*) n FROM courses WHERE status = 'submitted'"),
    reportedReviews: one('SELECT COUNT(*) n FROM reviews WHERE reported = 1'),
  };
});

// --------------------------------------------------------------- server

function matchRoute(method, pathname) {
  for (const r of routes) {
    if (r.method !== method) continue;
    if (typeof r.pattern === 'string') {
      if (r.pattern === pathname) return { handler: r.handler, params: [] };
    } else {
      const m = pathname.match(r.pattern);
      if (m) return { handler: r.handler, params: m.slice(1).map(decodeURIComponent) };
    }
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  const requestId = randomUUID();
  const started = Date.now();
  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
  const cookies = parseCookies(req.headers.cookie);
  const setCookies = [];

  const setCookie = (name, value, opt = {}) => {
    let s = `${name}=${encodeURIComponent(value)}`;
    if (opt.maxAge != null) s += `; Max-Age=${opt.maxAge}`;
    if (opt.path) s += `; Path=${opt.path}`;
    if (opt.sameSite) s += `; SameSite=${opt.sameSite}`;
    if (opt.httpOnly) s += '; HttpOnly';
    if (opt.secure) s += '; Secure';
    setCookies.push(s);
  };

  const send = (status, payload) => {
    if (setCookies.length) res.setHeader('Set-Cookie', setCookies);
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'X-Request-Id': requestId });
    res.end(JSON.stringify(payload));
    log(status >= 500 ? 'error' : 'info', 'request', {
      requestId, method: req.method, path: url.pathname, status, ms: Date.now() - started,
    });
  };

  try {
    const hit = matchRoute(req.method, url.pathname);
    if (!hit) return send(404, { error: { code: 'not_found', message: 'Belə bir ünvan yoxdur.' } });

    const rawToken = cookies[COOKIE] ?? (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '') ?? null;
    const user = userFromToken(rawToken);
    const body = req.method === 'GET' || req.method === 'HEAD' ? {} : await readJson(req);

    const result = await hit.handler({
      user, rawToken, body, params: hit.params, query: url.searchParams, setCookie, requestId,
    });
    send(200, result ?? { ok: true });
  } catch (e) {
    if (e instanceof HttpError) {
      return send(e.status, { error: { code: e.code, message: e.message }, requestId });
    }
    log('error', 'unhandled', { requestId, err: String(e?.stack ?? e) });
    send(500, { error: { code: 'internal', message: 'Serverdə gözlənilməz xəta.' }, requestId });
  }
});

migrate();
server.listen(PORT, () => log('info', 'api_started', { port: PORT, dev: isDev }));

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => { server.close(); closeDb(); process.exit(0); });
}
