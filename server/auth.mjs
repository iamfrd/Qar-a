/**
 * Kimlik və icazə.
 *
 * - Telefon OTP ilə giriş. Kod hash-lənmiş saxlanılır, 5 dəqiqə yaşayır,
 *   5 cəhddən sonra bloklanır.
 * - Sessiya tokeni httpOnly cookie-də gedir; bazada yalnız hash saxlanılır.
 * - Rol və sahiblik HƏMİŞƏ serverdə yoxlanılır. Brauzerdən gələn rol iddiası
 *   nəzərə alınmır.
 */
import { get1, run, all, uid, now, sha256, token, audit } from './db.mjs';

const OTP_TTL_MIN = 5;
const OTP_MAX_ATTEMPTS = 5;
const SESSION_TTL_DAYS = 30;
const isDev = process.env.NODE_ENV !== 'production';

export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const normalisePhone = (p) => String(p ?? '').replace(/[^\d+]/g, '');

export function requestOtp(phone) {
  const ph = normalisePhone(phone);
  if (!/^\+?\d{9,15}$/.test(ph)) throw new HttpError(400, 'invalid_phone', 'Telefon nömrəsi düzgün deyil.');

  const recent = all(
    "SELECT id FROM otp_codes WHERE phone = ? AND created_at > ?",
    [ph, new Date(Date.now() - 60_000).toISOString()],
  );
  if (recent.length >= 3) throw new HttpError(429, 'rate_limited', 'Çox sayda cəhd. Bir dəqiqə gözləyin.');

  const code = String(Math.floor(100000 + Math.random() * 900000));
  run(
    'INSERT INTO otp_codes (id, phone, code_hash, expires_at, attempts, created_at) VALUES (?,?,?,?,0,?)',
    [uid(), ph, sha256(code), new Date(Date.now() + OTP_TTL_MIN * 60_000).toISOString(), now()],
  );

  // Development-də kodu qaytarırıq ki, SMS provayderi olmadan test etmək mümkün olsun.
  // Produksiyada bu sahə heç vaxt göndərilmir.
  return { sent: true, expiresInSec: OTP_TTL_MIN * 60, devCode: isDev ? code : undefined };
}

export function verifyOtp(phone, code) {
  const ph = normalisePhone(phone);
  const row = get1(
    `SELECT * FROM otp_codes WHERE phone = ? AND consumed_at IS NULL
     ORDER BY created_at DESC LIMIT 1`, [ph],
  );
  if (!row) throw new HttpError(400, 'otp_not_found', 'Kod tapılmadı. Yenidən sorğu göndərin.');
  if (row.attempts >= OTP_MAX_ATTEMPTS) throw new HttpError(429, 'otp_locked', 'Çox sayda səhv cəhd.');
  if (row.expires_at < now()) throw new HttpError(400, 'otp_expired', 'Kodun vaxtı bitib.');

  if (row.code_hash !== sha256(String(code))) {
    run('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?', [row.id]);
    throw new HttpError(400, 'otp_invalid', 'Kod yanlışdır.');
  }
  run('UPDATE otp_codes SET consumed_at = ? WHERE id = ?', [now(), row.id]);

  let user = get1('SELECT * FROM users WHERE phone = ?', [ph]);
  if (!user) {
    const id = uid();
    run('INSERT INTO users (id, phone, name, role, referral_code, created_at) VALUES (?,?,?,?,?,?)',
      [id, ph, '', 'student', `QG${id.slice(0, 6).toUpperCase()}`, now()]);
    user = get1('SELECT * FROM users WHERE id = ?', [id]);
    audit(id, 'user.created', 'user', id, { phone: ph });
  }

  const raw = token();
  run('INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at) VALUES (?,?,?,?,?)',
    [uid(), user.id, sha256(raw), now(), new Date(Date.now() + SESSION_TTL_DAYS * 864e5).toISOString()]);
  audit(user.id, 'session.created', 'session', user.id, {});

  return { token: raw, user: publicUser(user) };
}

export function logout(rawToken) {
  if (!rawToken) return;
  run('UPDATE sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL', [now(), sha256(rawToken)]);
}

export function userFromToken(rawToken) {
  if (!rawToken) return null;
  const s = get1(
    `SELECT s.*, u.id AS uid FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ?`,
    [sha256(rawToken), now()],
  );
  if (!s) return null;
  const user = get1('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL', [s.user_id]);
  return user ?? null;
}

export function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    phone: u.phone,
    name: u.name,
    email: u.email,
    role: u.role,
    referralCode: u.referral_code,
    providerIds: all('SELECT provider_id FROM provider_members WHERE user_id = ?', [u.id]).map((r) => r.provider_id),
  };
}

// ------------------------------------------------------------------ icazələr

const ADMIN_ROLES = new Set(['support_agent', 'content_moderator', 'finance_admin', 'super_admin']);

const PERMISSIONS = {
  support_agent:     ['support.read', 'support.write', 'registration.read', 'trial.read'],
  content_moderator: ['course.moderate', 'review.moderate', 'category.write', 'provider.verify', 'course.read'],
  finance_admin:     ['registration.read', 'payment.read', 'loyalty.write', 'course.read'],
  super_admin:       ['*'],
};

export function isAdmin(user) {
  return !!user && ADMIN_ROLES.has(user.role);
}

export function can(user, permission) {
  if (!user) return false;
  const list = PERMISSIONS[user.role] ?? [];
  return list.includes('*') || list.includes(permission);
}

export function requireUser(user) {
  if (!user) throw new HttpError(401, 'unauthenticated', 'Giriş tələb olunur.');
  return user;
}

export function requirePermission(user, permission) {
  requireUser(user);
  if (!can(user, permission)) throw new HttpError(403, 'forbidden', 'Bu əməliyyat üçün icazəniz yoxdur.');
  return user;
}

/** İstifadəçinin həmin provayderə aid olduğunu yoxlayır. Admin istisna deyil. */
export function requireProviderAccess(user, providerId) {
  requireUser(user);
  if (isAdmin(user)) return { providerId, via: 'admin' };
  const m = get1('SELECT * FROM provider_members WHERE provider_id = ? AND user_id = ?', [providerId, user.id]);
  if (!m) throw new HttpError(403, 'forbidden', 'Bu provayderin məlumatına çıxışınız yoxdur.');
  return { providerId, via: m.role };
}

/** Resursun sahibi olub-olmadığını yoxlayır (IDOR-un qarşısını alır). */
export function requireOwnRecord(user, ownerUserId) {
  requireUser(user);
  if (user.id !== ownerUserId && !isAdmin(user)) {
    throw new HttpError(403, 'forbidden', 'Bu qeyd sizə aid deyil.');
  }
}
