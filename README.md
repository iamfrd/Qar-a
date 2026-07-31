# Qarğa

Bakı üçün xəritə əsaslı kurs kəşfi və qeydiyyat marketplace-i.

> **Sən kurs axtarma, Qarğa tapsın.**

Hazırkı vəziyyət: **frontend prototipi**. Backend yoxdur — bütün məlumat `src/data/mockData.ts` faylındadır və brauzerin `localStorage`-ında saxlanılır. Bu repo hələ produksiyaya hazır deyil.

## İşə salmaq

```bash
npm install
npm run dev
```

Sonra http://localhost:5173 ünvanını açın.

| Əmr | Nə edir |
|---|---|
| `npm run dev` | Vite development serveri (port 5173) |
| `npm run build` | TypeScript yoxlaması + produksiya build-i |
| `npm run preview` | Build olunmuş versiyanı yerli serverdə açır |
| `npm run lint` | Oxlint |

Tələb olunan: Node.js 20+.

## Texnologiyalar

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Zustand (persist) · React Router 7 · Leaflet + React-Leaflet

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

Kurslar, provayderlər, filiallar, kateqoriyalar və rəylər `src/data/mockData.ts` faylındadır. 20-dən çox komponent bu fayldan **birbaşa** oxuyur, ona görə Zustand üzərindən edilən dəyişikliklər hər yerdə görünmür. Bu, bilinən defektdir.

### Disabled — qəsdən söndürülüb

- **Kart ödənişi, Apple Pay, Google Pay** — real ödəniş inteqrasiyası olmadığı üçün seçilə bilmir. Yeganə işlək üsul "Kursda ödəniş"dir. Brauzer heç vaxt ödənişi "ödənilib" kimi işarələmir.

### Yoxdur — hələ qurulmayıb

Backend API · verilənlər bazası · real autentifikasiya · server tərəfi icazə yoxlaması · audit log · fayl yükləmə · email/SMS bildirişləri · analitika · testlər · CI

## Bilinən risklər

- **Rol yoxlaması yalnız brauzerdədir.** `localStorage` dəyişdirilərək admin panelinə çıxmaq mümkündür. Bu, prototip üçün qəbul edilir, real istifadə üçün yox.
- **Yerlərin sayı yalnız brauzerdə azalır.** Eyni anda iki nəfər son yeri götürsə, hər ikisi uğurlu cavab alacaq.
- **Pul `number` (float) kimi saxlanılır.** Maliyyə hesablamaları üçün minor units-ə keçilməlidir.
- **Bir kurs bir filiala bağlıdır.** Real həyatda eyni kurs müxtəlif filiallarda fərqli qiymət və cədvəllə ola bilər.

## Demo məlumat

`src/data/mockData.ts` faylındakı bütün provayder və kurs adları nümunə məlumatdır. Real biznes iddiaları deyil.
