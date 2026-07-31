# Qarğa

Bakı üçün xəritə əsaslı kurs kəşfi və qeydiyyat marketplace-i.

> **Sən kurs axtarma, Qarğa tapsın.**

Hazırkı vəziyyət: **backend qurulub və test olunub, UI hələ ona bağlanmayıb.** API real verilənlər bazası üzərində işləyir; frontend isə hələ `src/data/mockData.ts` faylından oxuyur. Bu keçid növbəti addımdır.

## İşə salmaq

İki proses lazımdır — API və frontend.

```bash
npm install
npm run db:reset
npm run api
```

Ayrı terminalda:

```bash
npm run dev
```

Sonra http://localhost:5173 ünvanını açın. Vite `/api` sorğularını API serverinə yönləndirir, ona görə cookie eyni mənşəlidir və CORS konfiqurasiyası lazım deyil.

| Əmr | Nə edir |
|---|---|
| `npm run dev` | Vite development serveri (port 5173) |
| `npm run api` | API serveri (port 3001) |
| `npm run db:seed` | Mock məlumatı bazaya köçürür |
| `npm run db:reset` | Bazanı silib yenidən qurur |
| `npm test` | İnteqrasiya testləri (real HTTP + real baza) |
| `npm run build` | TypeScript yoxlaması + produksiya build-i |
| `npm run lint` | Oxlint |

Tələb olunan: **Node.js 22.5+** (daxili `node:sqlite` sürücüsü üçün).

## Texnologiyalar

**Frontend:** React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Zustand · React Router 7 · Leaflet

**Backend:** Node.js (`node:http` + `node:sqlite`) — xarici asılılıq yoxdur

### Niyə SQLite, PostgreSQL yox

Prompt PostgreSQL + PostGIS tələb edir, lakin bu mühitdə Docker və PostgreSQL mövcud deyil. SQLite eyni SQL semantikasını verir — tranzaksiyalar, foreign key-lər, `CHECK` məhdudiyyətləri — quraşdırma tələb etmədən. Sxem köçürülə bilən şəkildə yazılıb: pul tam ədəd (qəpik), tarixlər ISO-8601 mətn. PostGIS əvəzinə coğrafi axtarış bounding box + haversine ilə aparılır, bu ölçüdə tamamilə kifayətdir. PostgreSQL-ə keçid miqrasiya olacaq, yenidən yazma yox.

## Backend arxitekturası

Modulyar monolit, `server/` qovluğunda:

| Fayl | Məsuliyyət |
|---|---|
| `schema.sql` | Bütün cədvəllər və məhdudiyyətlər |
| `db.mjs` | Bağlantı, miqrasiya, tranzaksiya, audit köməkçisi |
| `auth.mjs` | OTP, sessiya, rol və sahiblik yoxlaması |
| `catalog.mjs` | Axtarış, filtrlər, sıralama balı |
| `booking.mjs` | Sınaq dərsi, qeydiyyat, rəy — hamısı tranzaksiyalı |
| `index.mjs` | HTTP marşrutlaşdırma, xəta idarəsi, sorğu ID-ləri |
| `seed.mjs` | Mock məlumatı bazaya köçürür |
| `test.mjs` | İnteqrasiya testləri |

### Domen modeli

Kurs bir filiala bağlı deyil. Üç ayrı varlıq var:

```
course           məzmun — ad, təsvir, sertifikat, ləğv qaydası
  └─ course_offering   filiala bağlı kommersiya — qiymət, format, müəllim, səviyyə
       └─ cohort       əməliyyat — başlanğıc tarixi, cədvəl, tutum
       └─ trial_slot   sınaq dərsi vaxtı, tutumu ilə
```

Beləliklə eyni kurs müxtəlif filiallarda fərqli qiymət və cədvəllə mövcud ola bilər.

### Təhlükəsizlik təminatları

Bunların hamısı `npm test` ilə yoxlanılır:

- **Rol brauzerdən təyin oluna bilmir.** Yeni istifadəçi həmişə `student` olur; admin ünvanları 403 qaytarır.
- **Sessiya tokeni JavaScript-ə görünmür** — `httpOnly` cookie, bazada yalnız SHA-256 hash saxlanılır.
- **Provayder yalnız öz məlumatını görür.** Başqasının qeydiyyatlarına sorğu 403 alır.
- **Overbooking mümkün deyil.** Tutum şərtli `UPDATE` ilə qorunur, üstəlik sxemdə `CHECK (booked <= capacity)` var. Test tutumdan çox paralel sorğu göndərir — artıq olanlar `slot_full` alır.
- **Qiymət serverdə hesablanır.** Brauzerin göndərdiyi məbləğ nəzərə alınmır.
- **Ödəniş heç vaxt brauzerdən "paid" olmur.** Yeganə üsul `pay_at_center`.
- **Təkrar sorğu ikinci qeyd yaratmır** — `idempotency_key` unikal indeksi.
- **Rəy yalnız iştirakdan sonra yazıla bilər.** Rezervasiya yaratmaq kifayət etmir — `attended` və ya `confirmed` statusu lazımdır.
- **Status keçidləri qaydaya tabedir.** `submitted → completed` kimi sıçrayışlar 409 qaytarır.
- **Həssas əməliyyatlar audit log-a düşür.**

## Rollar

Tətbiqin üç ayrı interfeysi var:

| Rol | Marşrut | Görünüş |
|---|---|---|
| Tələbə | `/app/*` | Mobil tətbiq, aşağıda 5 bölməli naviqasiya |
| Provayder (kurs mərkəzi) | `/provider/*` | Yan menyulu panel |
| Admin (platforma) | `/admin/*` | Yan menyulu panel |

Development rejimində giriş ekranının altındakı düymələrlə rollar arasında keçid etmək olar. Bu düymələr produksiya build-ində görünmür (`import.meta.env.DEV` ilə bağlanıb).

## Funksiyaların real statusu

Aşağıdakı cədvəl hansı funksiyanın həqiqətən işlədiyini göstərir. **Interfeysi olan hər şey işlək demək deyil.**

### Frontend-only — interfeys işləyir, məlumat brauzerdə saxlanılır

Xəritə və siyahı ilə kəşf · axtarış və filtrlər · kurs profili · 3-lü müqayisə · seçilmişlər · yadda saxlanan axtarışlar · sınaq dərsi rezervi · qeydiyyat sorğusu · rəy yazma · mesajlar · bildirişlər · Lələk cüzdanı · referral · dəstək müraciəti · provayder paneli · admin paneli

Bu funksiyaların hamısı brauzerdə işləyir və `localStorage` təmizlənəndə itir. Server yoxlaması yoxdur.

### Mocked — statik məlumat

Kurslar, provayderlər, filiallar, kateqoriyalar və rəylər `src/data/mockData.ts` faylındadır. 20-dən çox komponent bu fayldan **birbaşa** oxuyur, ona görə Zustand üzərindən edilən dəyişikliklər hər yerdə görünmür. Bu, bilinən defektdir və növbəti addımda `src/lib/api.ts` klientinə keçidlə həll olunacaq.

### Serverdə işlək — API hazırdır, UI hələ bağlanmayıb

Telefon OTP girişi · sessiya · rol və sahiblik yoxlaması · kataloq axtarışı (sərhəd, filtr, sıralama) · təklif detalı · tranzaksiyalı sınaq rezervi · tranzaksiyalı qeydiyyat · status tarixçəsi · rəy hüququ · audit log

Bunları indi `curl` və ya brauzer konsolundan sınaya bilərsiniz, məsələn:

```bash
curl "http://localhost:3001/api/offerings?perPage=3&lat=40.4103&lng=49.8478"
```

### Disabled — qəsdən söndürülüb

- **Kart ödənişi, Apple Pay, Google Pay** — real ödəniş inteqrasiyası olmadığı üçün seçilə bilmir. Yeganə işlək üsul "Kursda ödəniş"dir. Brauzer heç vaxt ödənişi "ödənilib" kimi işarələmir.

### Yoxdur — hələ qurulmayıb

Fayl yükləmə · email/SMS göndərilməsi · onlayn ödəniş · analitika hadisələri · E2E testləri · kurs redaktəsi üçün revision/təsdiq axını

## Bilinən risklər

- **UI hələ köhnə yolla işləyir.** Frontend `localStorage` və `mockData` üzərindədir, ona görə yuxarıdakı server təminatları istifadəçiyə hələ təsir etmir. Bu, ən vacib açıq işdir.
- **SMS provayderi yoxdur.** OTP kodu development-də cavabda qaytarılır. Produksiyada real provayder qoşulmalıdır.
- **Coğrafi axtarış PostGIS deyil.** Bounding box + haversine işlədilir; bu ölçüdə kifayətdir, böyük məlumat həcmində PostGIS-ə keçmək lazım gələcək.
- **Kurs redaktəsi üçün revision axını yoxdur.** Provayder dəyişikliyi hazırda birbaşa tətbiq olunur, admin təsdiqi mərhələsi qurulmayıb.

## Növbəti addım

Frontend-i API-ya bağlamaq: komponentlərin `src/data/mockData.ts`-dən birbaşa oxumasını `src/lib/api.ts` üzərindən oxumaqla əvəz etmək. Dizayn dəyişmir — yalnız məlumatın haradan gəldiyi dəyişir.

## Demo məlumat

`src/data/mockData.ts` faylındakı bütün provayder və kurs adları nümunə məlumatdır. Real biznes iddiaları deyil.
