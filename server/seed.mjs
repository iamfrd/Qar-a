/**
 * Seed — mövcud mock məlumatı verilənlər bazasına köçürür.
 *
 * Mock fayllar TypeScript olduğu üçün Vite-in ssrLoadModule-u ilə oxunur
 * (uzantısız import-ları və tipləri həll edir). Bu, yalnız development alətidir.
 *
 * Əsas çevrilmə: mock-dakı hər "kurs" üç varlığa bölünür —
 *   course (məzmun) → course_offering (filial + qiymət) → cohort (cədvəl + tutum)
 */
import { createServer } from 'vite';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rmSync } from 'node:fs';
import { migrate, tx, now, toMinor, run, DB_PATH, closeDb } from './db.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function loadMocks() {
  const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
  try {
    const mock = await vite.ssrLoadModule('/src/data/mockData.ts');
    const cats = await vite.ssrLoadModule('/src/data/categories.ts');
    const areas = await vite.ssrLoadModule('/src/data/areas.ts');
    return { mock, cats, areas };
  } finally {
    await vite.close();
  }
}

function areaIdFor(areaName, areas) {
  const a = areas.find((x) => x.name === areaName);
  return a ? a.id : null;
}

// Mock trial dates are authored as fixed calendar dates and drift into the
// past as real time passes. Roll a stale date forward in whole weeks so it
// keeps the same time-of-day and weekday, and lands in the future relative
// to the seed run.
function futureSlotStart(dateStr, timeStr, refIso) {
  const week = 7 * 24 * 60 * 60 * 1000;
  const ref = new Date(refIso).getTime();
  let dt = new Date(`${dateStr}T${timeStr}:00.000Z`);
  while (dt.getTime() <= ref) dt = new Date(dt.getTime() + week);
  return dt.toISOString();
}

async function main() {
  const fresh = process.argv.includes('--fresh');
  if (fresh) {
    for (const suffix of ['', '-wal', '-shm']) {
      try { rmSync(DB_PATH + suffix); } catch { /* yoxdur */ }
    }
  }

  const { mock, cats, areas } = await loadMocks();
  migrate();
  const t = now();

  const counts = tx(() => {
    const c = { areas: 0, categories: 0, providers: 0, branches: 0, courses: 0, offerings: 0, cohorts: 0, slots: 0, reviews: 0 };

    for (const a of areas.areas) {
      run('INSERT OR REPLACE INTO areas (id,name,lat,lng) VALUES (?,?,?,?)', [a.id, a.name, a.lat, a.lng]);
      c.areas++;
    }

    for (const k of cats.categories) {
      run('INSERT OR REPLACE INTO categories (id,name_az,name_en,name_ru,icon,color) VALUES (?,?,?,?,?,?)',
        [k.id, k.name.az, k.name.en, k.name.ru, k.icon, k.color]);
      c.categories++;
    }

    for (const p of mock.providers) {
      run(`INSERT OR REPLACE INTO providers
           (id,name,logo,about,phone,email,plan,verification_status,verified_at,created_at)
           VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [p.id, p.name, p.logo ?? '', p.about ?? '', p.phone ?? '', p.email ?? '', p.plan ?? 'basic',
         p.verified ? 'verified' : (p.approved ? 'pending' : 'unsubmitted'),
         p.verified ? p.createdAt : null, p.createdAt ?? t]);
      c.providers++;
    }

    for (const b of mock.branches) {
      run('INSERT OR REPLACE INTO branches (id,provider_id,name,area_id,address,lat,lng,created_at) VALUES (?,?,?,?,?,?,?,?)',
        [b.id, b.providerId, b.name, areaIdFor(b.area, areas.areas), b.address ?? '', b.lat, b.lng, t]);
      c.branches++;
    }

    for (const m of mock.courses) {
      const courseId = m.id;
      const status = m.status === 'active' ? 'published'
        : m.status === 'pending' ? 'submitted'
        : m.status === 'hidden' ? 'paused' : 'rejected';

      run(`INSERT OR REPLACE INTO courses
           (id,provider_id,category_id,subcategory,title,description,certificate,cancellation_policy,status,created_at)
           VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [courseId, m.providerId, m.categoryId, m.subcategory ?? '', m.title, m.description ?? '',
         m.certificate ? 1 : 0, m.cancellationPolicy ?? '', status, m.createdAt ?? t]);
      c.courses++;

      const offeringId = `off-${courseId}`;
      run(`INSERT OR REPLACE INTO course_offerings
           (id,course_id,branch_id,format,mode,price_minor,discount_price_minor,registration_fee_minor,
            teacher_name,teacher_bio,teacher_experience,language,age_group,level,
            qarga_exclusive,promoted,active,last_confirmed_at,created_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [offeringId, courseId, m.branchId, m.format, m.mode,
         toMinor(m.price), m.discountPrice != null ? toMinor(m.discountPrice) : null,
         toMinor(m.registrationFee ?? 0),
         m.teacher?.name ?? '', m.teacher?.bio ?? '', m.teacher?.experienceYears ?? 0,
         m.language ?? '', m.ageGroup ?? '', m.level ?? 'all',
         m.qargaExclusive ? 1 : 0, m.promoted ? 1 : 0, 1,
         '2026-07-12T00:00:00.000Z', m.createdAt ?? t]);
      c.offerings++;

      const booked = Math.max(0, (m.seatsTotal ?? 0) - (m.seatsAvailable ?? 0));
      run(`INSERT OR REPLACE INTO cohorts
           (id,offering_id,start_date,duration_weeks,lesson_days,lesson_time,day_part,
            capacity,booked,registration_deadline,status,created_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [`coh-${courseId}`, offeringId, m.startDate, m.durationWeeks ?? 0,
         JSON.stringify(m.lessonDays ?? []), m.lessonTime ?? '', m.dayPart ?? 'evening',
         m.seatsTotal ?? 0, booked, m.startDate, 'open', t]);
      c.cohorts++;

      if (m.freeTrial) {
        for (const s of m.trialSlots ?? []) {
          for (const time of s.times ?? []) {
            run(`INSERT OR REPLACE INTO trial_slots
                 (id,offering_id,starts_at,duration_min,capacity,booked,status,created_at)
                 VALUES (?,?,?,?,?,?,?,?)`,
              [`slot-${courseId}-${s.date}-${time.replace(':', '')}`, offeringId,
               futureSlotStart(s.date, time, t), 60, 4, 0, 'open', t]);
            c.slots++;
          }
        }
      }
    }

    // Mock rəylər — uyğunluq qeydi ilə birlikdə, çünki sxem onu tələb edir.
    const demoUser = 'u-demo-reviewer';
    run(`INSERT OR REPLACE INTO users (id,phone,name,role,referral_code,created_at)
         VALUES (?,?,?,?,?,?)`, [demoUser, '+994000000000', 'Demo rəyçi', 'student', 'DEMO-REV', t]);

    for (const r of mock.reviews) {
      const eid = `elig-${r.id}`;
      run(`INSERT OR REPLACE INTO review_eligibility (id,user_id,course_id,source,source_id,consumed_at,created_at)
           VALUES (?,?,?,?,?,?,?)`,
        [eid, demoUser, r.courseId, 'registration_confirmed', `seed-${r.id}`, t, t]);
      run(`INSERT OR REPLACE INTO reviews
           (id,course_id,user_id,eligibility_id,overall,teacher_quality,content,location,price_value,
            communication,schedule_accuracy,text,provider_reply,moderation,reported,created_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [r.id, r.courseId, demoUser, eid, r.overall, r.teacherQuality, r.content, r.location,
         r.priceValue, r.communication, r.scheduleAccuracy, r.text ?? '', r.providerReply ?? null,
         'published', r.reported ? 1 : 0, r.createdAt ?? t]);
      c.reviews++;
    }

    return c;
  });

  console.log('Seed tamamlandı:', JSON.stringify(counts));
  console.log('Baza:', DB_PATH);
  closeDb();
}

main().catch((e) => { console.error('Seed xətası:', e); process.exit(1); });
