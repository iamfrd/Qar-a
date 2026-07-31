import { DatabaseSync } from 'node:sqlite';
import { randomUUID, createHash, randomBytes } from 'node:crypto';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export const DB_PATH = process.env.QARGA_DB ?? join(here, 'data', 'qarga.db');

let db;

export function getDb() {
  if (db) return db;
  mkdirSync(dirname(DB_PATH), { recursive: true });
  db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA busy_timeout = 4000');
  return db;
}

export function migrate() {
  const d = getDb();
  d.exec(readFileSync(join(here, 'schema.sql'), 'utf8'));
  return d;
}

export function closeDb() {
  if (db) { db.close(); db = undefined; }
}

/** Tranzaksiya. Callback xəta atarsa hər şey geri qaytarılır. */
export function tx(fn) {
  const d = getDb();
  d.exec('BEGIN IMMEDIATE');
  try {
    const out = fn(d);
    d.exec('COMMIT');
    return out;
  } catch (e) {
    try { d.exec('ROLLBACK'); } catch { /* artıq bağlanıb */ }
    throw e;
  }
}

export const uid = () => randomUUID();
export const now = () => new Date().toISOString();
export const sha256 = (s) => createHash('sha256').update(String(s)).digest('hex');
export const token = () => randomBytes(32).toString('base64url');

export function ref(prefix) {
  return `${prefix}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

/** AZN → qəpik. Float saxlanmır. */
export const toMinor = (azn) => Math.round(Number(azn) * 100);
export const fromMinor = (minor) => minor / 100;

export function all(sql, params = []) {
  return getDb().prepare(sql).all(...params);
}
export function get1(sql, params = []) {
  return getDb().prepare(sql).get(...params);
}
export function run(sql, params = []) {
  return getDb().prepare(sql).run(...params);
}

export function audit(actorUserId, action, entity, entityId, meta = {}) {
  run(
    'INSERT INTO audit_log (id, actor_user_id, action, entity, entity_id, meta, at) VALUES (?,?,?,?,?,?,?)',
    [uid(), actorUserId ?? null, action, entity, entityId ?? null, JSON.stringify(meta), now()],
  );
}
