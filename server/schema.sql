-- Qarğa — verilənlər bazası sxemi
--
-- Qeyd: bu mühitdə Docker/PostgreSQL mövcud olmadığı üçün SQLite işlədilir.
-- Sxem PostgreSQL-ə köçürülə bilən şəkildə yazılıb: pul tam ədəd (qəpik),
-- tarixlər ISO-8601 mətn, tutum məhdudiyyətləri CHECK ilə.
-- PostGIS əvəzinə coğrafi axtarış bounding box + haversine ilə aparılır.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------- kimlik

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  phone       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL DEFAULT '',
  email       TEXT,
  role        TEXT NOT NULL DEFAULT 'student'
                CHECK (role IN ('student','provider_member','provider_owner',
                                'support_agent','content_moderator','finance_admin','super_admin')),
  referral_code TEXT UNIQUE,
  created_at  TEXT NOT NULL,
  deleted_at  TEXT
);

CREATE TABLE IF NOT EXISTS otp_codes (
  id          TEXT PRIMARY KEY,
  phone       TEXT NOT NULL,
  code_hash   TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  consumed_at TEXT,
  attempts    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone, consumed_at);

CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  created_at  TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  revoked_at  TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- ---------------------------------------------------------------- provayder

CREATE TABLE IF NOT EXISTS providers (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  logo        TEXT NOT NULL DEFAULT '',
  about       TEXT NOT NULL DEFAULT '',
  phone       TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  plan        TEXT NOT NULL DEFAULT 'basic' CHECK (plan IN ('basic','professional','premium')),
  verification_status TEXT NOT NULL DEFAULT 'unsubmitted'
                CHECK (verification_status IN ('unsubmitted','pending','needs_changes','verified','rejected','suspended')),
  verified_at TEXT,
  created_at  TEXT NOT NULL
);

-- Provayder üzvlüyü: sahiblik burada saxlanılır, users.role-da yox.
CREATE TABLE IF NOT EXISTS provider_members (
  provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','member')),
  created_at  TEXT NOT NULL,
  PRIMARY KEY (provider_id, user_id)
);

CREATE TABLE IF NOT EXISTS areas (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lat  REAL NOT NULL,
  lng  REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS branches (
  id          TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  area_id     TEXT REFERENCES areas(id),
  address     TEXT NOT NULL DEFAULT '',
  lat         REAL NOT NULL,
  lng         REAL NOT NULL,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_branches_provider ON branches(provider_id);
CREATE INDEX IF NOT EXISTS idx_branches_bbox ON branches(lat, lng);

-- ---------------------------------------------------------------- kataloq

CREATE TABLE IF NOT EXISTS categories (
  id      TEXT PRIMARY KEY,
  name_az TEXT NOT NULL,
  name_en TEXT NOT NULL DEFAULT '',
  name_ru TEXT NOT NULL DEFAULT '',
  icon    TEXT NOT NULL DEFAULT '',
  color   TEXT NOT NULL DEFAULT ''
);

-- Kurs = təkrar istifadə olunan məzmun. Qiymət/cədvəl BURADA saxlanılmır.
CREATE TABLE IF NOT EXISTS courses (
  id           TEXT PRIMARY KEY,
  provider_id  TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  category_id  TEXT REFERENCES categories(id),
  subcategory  TEXT NOT NULL DEFAULT '',
  title        TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  certificate  INTEGER NOT NULL DEFAULT 0,
  cancellation_policy TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft','submitted','changes_requested','approved',
                                   'published','paused','stale','rejected','archived')),
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_courses_provider ON courses(provider_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

-- Təklif = filiala bağlı kommersiya məlumatı. Eyni kurs müxtəlif filiallarda
-- fərqli qiymət və formatla ola bilər.
CREATE TABLE IF NOT EXISTS course_offerings (
  id                    TEXT PRIMARY KEY,
  course_id             TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  branch_id             TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  format                TEXT NOT NULL CHECK (format IN ('offline','online','hybrid')),
  mode                  TEXT NOT NULL CHECK (mode IN ('individual','group')),
  price_minor           INTEGER NOT NULL CHECK (price_minor >= 0),
  discount_price_minor  INTEGER CHECK (discount_price_minor IS NULL OR discount_price_minor >= 0),
  discount_starts_at    TEXT,
  discount_ends_at      TEXT,
  registration_fee_minor INTEGER NOT NULL DEFAULT 0 CHECK (registration_fee_minor >= 0),
  teacher_name          TEXT NOT NULL DEFAULT '',
  teacher_bio           TEXT NOT NULL DEFAULT '',
  teacher_experience    INTEGER NOT NULL DEFAULT 0,
  language              TEXT NOT NULL DEFAULT '',
  age_group             TEXT NOT NULL DEFAULT '',
  level                 TEXT NOT NULL DEFAULT 'all'
                          CHECK (level IN ('beginner','elementary','intermediate','advanced','all')),
  qarga_exclusive       INTEGER NOT NULL DEFAULT 0,
  promoted              INTEGER NOT NULL DEFAULT 0,
  active                INTEGER NOT NULL DEFAULT 1,
  last_confirmed_at     TEXT,
  created_at            TEXT NOT NULL,
  UNIQUE (course_id, branch_id, mode, format)
);
CREATE INDEX IF NOT EXISTS idx_offerings_course ON course_offerings(course_id);
CREATE INDEX IF NOT EXISTS idx_offerings_branch ON course_offerings(branch_id);

-- Qrup = əməliyyat məlumatı: tarix, cədvəl, tutum.
CREATE TABLE IF NOT EXISTS cohorts (
  id                    TEXT PRIMARY KEY,
  offering_id           TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  start_date            TEXT NOT NULL,
  duration_weeks        INTEGER NOT NULL DEFAULT 0,
  lesson_days           TEXT NOT NULL DEFAULT '[]',
  lesson_time           TEXT NOT NULL DEFAULT '',
  day_part              TEXT NOT NULL DEFAULT 'evening' CHECK (day_part IN ('morning','afternoon','evening')),
  capacity              INTEGER NOT NULL CHECK (capacity >= 0),
  booked                INTEGER NOT NULL DEFAULT 0 CHECK (booked >= 0),
  registration_deadline TEXT,
  status                TEXT NOT NULL DEFAULT 'open'
                          CHECK (status IN ('draft','open','full','closed','running','completed','cancelled')),
  created_at            TEXT NOT NULL,
  CHECK (booked <= capacity)
);
CREATE INDEX IF NOT EXISTS idx_cohorts_offering ON cohorts(offering_id);

-- ---------------------------------------------------------------- sınaq dərsi

CREATE TABLE IF NOT EXISTS trial_slots (
  id           TEXT PRIMARY KEY,
  offering_id  TEXT NOT NULL REFERENCES course_offerings(id) ON DELETE CASCADE,
  starts_at    TEXT NOT NULL,
  duration_min INTEGER NOT NULL DEFAULT 60,
  capacity     INTEGER NOT NULL CHECK (capacity >= 0),
  booked       INTEGER NOT NULL DEFAULT 0 CHECK (booked >= 0),
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','cancelled')),
  created_at   TEXT NOT NULL,
  CHECK (booked <= capacity)
);
CREATE INDEX IF NOT EXISTS idx_slots_offering ON trial_slots(offering_id, starts_at);

CREATE TABLE IF NOT EXISTS trial_reservations (
  id              TEXT PRIMARY KEY,
  ref             TEXT NOT NULL UNIQUE,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slot_id         TEXT NOT NULL REFERENCES trial_slots(id) ON DELETE CASCADE,
  note            TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'requested'
                    CHECK (status IN ('requested','confirmed','alternative_proposed','declined',
                                      'cancelled_by_student','cancelled_by_provider','attended','no_show')),
  proposed_slot_id TEXT REFERENCES trial_slots(id),
  idempotency_key TEXT UNIQUE,
  created_at      TEXT NOT NULL,
  -- eyni istifadəçi eyni slota iki dəfə yazıla bilməz
  UNIQUE (user_id, slot_id)
);
CREATE INDEX IF NOT EXISTS idx_trials_user ON trial_reservations(user_id);

CREATE TABLE IF NOT EXISTS trial_status_history (
  id             TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL REFERENCES trial_reservations(id) ON DELETE CASCADE,
  status         TEXT NOT NULL,
  actor_user_id  TEXT REFERENCES users(id),
  note           TEXT NOT NULL DEFAULT '',
  at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_trial_hist ON trial_status_history(reservation_id, at);

-- ---------------------------------------------------------------- qeydiyyat

CREATE TABLE IF NOT EXISTS registrations (
  id                 TEXT PRIMARY KEY,
  ref                TEXT NOT NULL UNIQUE,
  user_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cohort_id          TEXT NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  student_name       TEXT NOT NULL,
  student_phone      TEXT NOT NULL,
  student_age        TEXT NOT NULL DEFAULT '',
  price_minor        INTEGER NOT NULL CHECK (price_minor >= 0),
  discount_minor     INTEGER NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
  final_price_minor  INTEGER NOT NULL CHECK (final_price_minor >= 0),
  promo_code         TEXT,
  lelek_used         INTEGER NOT NULL DEFAULT 0 CHECK (lelek_used >= 0),
  payment_method     TEXT NOT NULL DEFAULT 'pay_at_center' CHECK (payment_method IN ('pay_at_center')),
  payment_status     TEXT NOT NULL DEFAULT 'pay_at_center'
                       CHECK (payment_status IN ('pay_at_center','pending','paid','refunded')),
  status             TEXT NOT NULL DEFAULT 'submitted'
                       CHECK (status IN ('draft','submitted','provider_review','confirmed','payment_pending',
                                         'paid','pay_at_center','cancelled','rejected','completed','disputed','refunded')),
  idempotency_key    TEXT UNIQUE,
  created_at         TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reg_user ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_reg_cohort ON registrations(cohort_id);

CREATE TABLE IF NOT EXISTS registration_status_history (
  id              TEXT PRIMARY KEY,
  registration_id TEXT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  status          TEXT NOT NULL,
  actor_user_id   TEXT REFERENCES users(id),
  note            TEXT NOT NULL DEFAULT '',
  at              TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reg_hist ON registration_status_history(registration_id, at);

-- ---------------------------------------------------------------- rəy

-- Rəy yazmaq hüququ ancaq iştirakdan sonra yaranır.
CREATE TABLE IF NOT EXISTS review_eligibility (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  source      TEXT NOT NULL CHECK (source IN ('trial_attended','registration_confirmed')),
  source_id   TEXT NOT NULL,
  consumed_at TEXT,
  created_at  TEXT NOT NULL,
  UNIQUE (source, source_id)
);
CREATE INDEX IF NOT EXISTS idx_elig_user ON review_eligibility(user_id, course_id);

CREATE TABLE IF NOT EXISTS reviews (
  id             TEXT PRIMARY KEY,
  course_id      TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  eligibility_id TEXT NOT NULL UNIQUE REFERENCES review_eligibility(id),
  overall        INTEGER NOT NULL CHECK (overall BETWEEN 1 AND 5),
  teacher_quality INTEGER CHECK (teacher_quality BETWEEN 1 AND 5),
  content        INTEGER CHECK (content BETWEEN 1 AND 5),
  location       INTEGER CHECK (location BETWEEN 1 AND 5),
  price_value    INTEGER CHECK (price_value BETWEEN 1 AND 5),
  communication  INTEGER CHECK (communication BETWEEN 1 AND 5),
  schedule_accuracy INTEGER CHECK (schedule_accuracy BETWEEN 1 AND 5),
  text           TEXT NOT NULL DEFAULT '',
  provider_reply TEXT,
  moderation     TEXT NOT NULL DEFAULT 'published'
                   CHECK (moderation IN ('pending','published','hidden','removed')),
  reported       INTEGER NOT NULL DEFAULT 0,
  report_reason  TEXT,
  created_at     TEXT NOT NULL,
  updated_at     TEXT
);
CREATE INDEX IF NOT EXISTS idx_reviews_course ON reviews(course_id, moderation);

-- ---------------------------------------------------------------- Lələk

-- Dəyişməz ledger: sətir silinmir, düzəliş əks yazılışla edilir.
CREATE TABLE IF NOT EXISTS lelek_ledger (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('earn','spend','expire','reversal')),
  amount          INTEGER NOT NULL CHECK (amount > 0),
  source          TEXT NOT NULL,
  source_id       TEXT,
  status          TEXT NOT NULL DEFAULT 'settled' CHECK (status IN ('pending','settled','reversed')),
  idempotency_key TEXT UNIQUE,
  reversal_of     TEXT REFERENCES lelek_ledger(id),
  expires_at      TEXT,
  created_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_lelek_user ON lelek_ledger(user_id, status);

-- ---------------------------------------------------------------- audit

CREATE TABLE IF NOT EXISTS audit_log (
  id            TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES users(id),
  action        TEXT NOT NULL,
  entity        TEXT NOT NULL,
  entity_id     TEXT,
  meta          TEXT NOT NULL DEFAULT '{}',
  at            TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity, entity_id, at);
