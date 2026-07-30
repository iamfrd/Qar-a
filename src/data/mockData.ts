import type { Provider, Branch, Course, Review } from '../types';
import { areas, jitter } from './areas';

const area = (id: string) => areas.find((a) => a.id === id)!;

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------
export const providers: Provider[] = [
  { id: 'p-lingua', name: 'LinguaBaku Dil Mərkəzi', logo: '🗣️', verified: true, approved: true, plan: 'premium', phone: '+994 50 123 45 67', email: 'info@linguabaku.az', about: '2014-cü ildən fəaliyyət göstərən dil mərkəzi. Kembric sertifikatlı müəllim heyəti.', branchIds: ['b-lingua-genclik', 'b-lingua-nizami'], createdAt: '2024-02-10' },
  { id: 'p-smartkids', name: 'Smart Kids Akademiyası', logo: '🧒', verified: true, approved: true, plan: 'professional', phone: '+994 55 234 56 78', email: 'info@smartkids.az', about: 'Uşaqlar üçün erkən inkişaf və dil təhsili mərkəzi.', branchIds: ['b-smartkids-narimanov'], createdAt: '2023-09-01' },
  { id: 'p-codeup', name: 'CodeUp Proqramlaşdırma Məktəbi', logo: '💻', verified: true, approved: true, plan: 'premium', phone: '+994 51 345 67 89', email: 'hello@codeup.az', about: 'Praktiki proqramlaşdırma təlimləri, məzunlara iş dəstəyi.', branchIds: ['b-codeup-28may', 'b-codeup-narimanov'], createdAt: '2022-05-14' },
  { id: 'p-mathpro', name: 'MathPro Riyaziyyat Mərkəzi', logo: '📐', verified: false, approved: true, plan: 'basic', phone: '+994 70 456 78 90', email: 'mathpro@mail.az', about: 'Buraxılış və abituriyent imtahanlarına hazırlıq üzrə ixtisaslaşmış mərkəz.', branchIds: ['b-mathpro-nizami'], createdAt: '2024-11-20' },
  { id: 'p-pixel', name: 'Pixel Studio Dizayn Akademiyası', logo: '🎨', verified: true, approved: true, plan: 'professional', phone: '+994 55 567 89 01', email: 'info@pixelstudio.az', about: 'Qrafik dizayn və UI/UX üzrə praktiki kurslar.', branchIds: ['b-pixel-elmler'], createdAt: '2023-03-18' },
  { id: 'p-growthlab', name: 'GrowthLab Marketinq Məktəbi', logo: '📈', verified: true, approved: true, plan: 'professional', phone: '+994 50 678 90 12', email: 'team@growthlab.az', about: 'Rəqəmsal marketinq üzrə tətbiqi təlim proqramları.', branchIds: ['b-growthlab-insaatcilar'], createdAt: '2023-07-02' },
  { id: 'p-rusdil', name: 'RusDil Mərkəzi', logo: '🇷🇺', verified: false, approved: true, plan: 'basic', phone: '+994 51 789 01 23', email: 'rusdil@mail.az', about: 'Rus dilinin bütün səviyyələri üzrə tədris.', branchIds: ['b-rusdil-xetai'], createdAt: '2024-04-09' },
  { id: 'p-deutschhaus', name: 'Deutsch Haus', logo: '🇩🇪', verified: true, approved: true, plan: 'professional', phone: '+994 55 890 12 34', email: 'info@deutschhaus.az', about: 'Goethe İnstitutu proqramına uyğun alman dili tədrisi.', branchIds: ['b-deutschhaus-ehmedli'], createdAt: '2023-01-25' },
  { id: 'p-ieltspro', name: 'IELTS Pro Baku', logo: '📝', verified: true, approved: true, plan: 'premium', phone: '+994 70 901 23 45', email: 'contact@ieltspro.az', about: 'IELTS və TOEFL imtahanlarına hazırlıqda 9 illik təcrübə.', branchIds: ['b-ieltspro-neftcilar'], createdAt: '2021-10-11' },
  { id: 'p-abitur', name: 'Abitur Hazırlıq Mərkəzi', logo: '🏛️', verified: true, approved: true, plan: 'professional', phone: '+994 51 012 34 56', email: 'info@abitur.az', about: 'Ali məktəbə qəbul imtahanlarına hazırlıq mərkəzi.', branchIds: ['b-abitur-koroglu'], createdAt: '2022-08-30' },
  { id: 'p-melody', name: 'Melody Music School', logo: '🎵', verified: false, approved: true, plan: 'basic', phone: '+994 55 123 98 76', email: 'melody@mail.az', about: 'Fərdi musiqi alətləri təlimi.', branchIds: ['b-melody-genclik'], createdAt: '2024-06-05' },
  { id: 'p-danceflow', name: 'Dance Flow Studio', logo: '💃', verified: true, approved: true, plan: 'professional', phone: '+994 50 234 87 65', email: 'info@danceflow.az', about: 'Latin, hip-hop və müasir rəqs studiyası.', branchIds: ['b-danceflow-narimanov'], createdAt: '2023-02-14' },
  { id: 'p-fitzone', name: 'Fit Zone', logo: '🏋️', verified: false, approved: true, plan: 'basic', phone: '+994 51 345 76 54', email: 'fitzone@mail.az', about: 'Şəxsi məşqçi və qrup fitnes məşğələləri.', branchIds: ['b-fitzone-28may'], createdAt: '2024-03-22' },
  { id: 'p-cheftable', name: "Chef's Table Kulinariya Studiyası", logo: '🍳', verified: true, approved: true, plan: 'basic', phone: '+994 55 456 65 43', email: 'info@chefstable.az', about: 'Peşəkar şirniyyatçılardan praktiki dərslər.', branchIds: ['b-cheftable-nizami'], createdAt: '2023-11-09' },
  { id: 'p-glam', name: 'Glam Beauty Akademiya', logo: '💄', verified: true, approved: true, plan: 'professional', phone: '+994 70 567 54 32', email: 'info@glambeauty.az', about: 'Vizajist və dırnaq dizaynı üzrə sertifikatlı kurslar.', branchIds: ['b-glam-elmler'], createdAt: '2022-12-01' },
  { id: 'p-drivesafe', name: 'DriveSafe Sürücülük Məktəbi', logo: '🚗', verified: true, approved: true, plan: 'basic', phone: '+994 51 678 43 21', email: 'info@drivesafe.az', about: 'B kateqoriyası üzrə nəzəri və praktiki sürücülük təlimi.', branchIds: ['b-drivesafe-insaatcilar'], createdAt: '2021-06-17' },
  { id: 'p-careernext', name: 'CareerNext Karyera Mərkəzi', logo: '🚀', verified: false, approved: true, plan: 'basic', phone: '+994 55 789 32 10', email: 'hello@careernext.az', about: 'CV yazılışı, müsahibəyə hazırlıq və karyera məsləhəti.', branchIds: ['b-careernext-xetai'], createdAt: '2024-09-13' },
  { id: 'p-artspace', name: 'ArtSpace Rəssamlıq Studiyası', logo: '🖌️', verified: false, approved: false, plan: 'basic', phone: '+994 50 890 21 09', email: 'artspace@mail.az', about: 'Uşaq və böyüklər üçün rəssamlıq dərsləri.', branchIds: ['b-artspace-ehmedli'], createdAt: '2026-07-20' },
];

// ---------------------------------------------------------------------------
// Branches
// ---------------------------------------------------------------------------
function mkBranch(id: string, providerId: string, areaId: string, name: string, address: string, seed: number): Branch {
  const a = area(areaId);
  const [lat, lng] = jitter(a.lat, a.lng, seed);
  return { id, providerId, name, area: a.name, address, lat, lng };
}

export const branches: Branch[] = [
  mkBranch('b-lingua-genclik', 'p-lingua', 'genclik', 'LinguaBaku — Gənclik filialı', 'Həsən Əliyev küç. 14', 1),
  mkBranch('b-lingua-nizami', 'p-lingua', 'nizami', 'LinguaBaku — Nizami filialı', 'Nizami küç. 203', 2),
  mkBranch('b-smartkids-narimanov', 'p-smartkids', 'narimanov', 'Smart Kids — Nərimanov filialı', 'Ə. Rəcəbli küç. 8', 3),
  mkBranch('b-codeup-28may', 'p-codeup', '28-may', 'CodeUp — 28 May filialı', 'İstiqlaliyyət küç. 45', 4),
  mkBranch('b-codeup-narimanov', 'p-codeup', 'narimanov', 'CodeUp — Nərimanov filialı', 'Nərimanov pr. 112', 5),
  mkBranch('b-mathpro-nizami', 'p-mathpro', 'nizami', 'MathPro — Nizami filialı', 'Rəşid Behbudov küç. 21', 6),
  mkBranch('b-pixel-elmler', 'p-pixel', 'elmler-akademiyasi', 'Pixel Studio — Elmlər filialı', 'H. Cavid pr. 33', 7),
  mkBranch('b-growthlab-insaatcilar', 'p-growthlab', 'insaatcilar', 'GrowthLab — İnşaatçılar filialı', 'Təbriz küç. 56', 8),
  mkBranch('b-rusdil-xetai', 'p-rusdil', 'xetai', 'RusDil Mərkəzi — Xətai filialı', 'S. Bəhlulzadə küç. 19', 9),
  mkBranch('b-deutschhaus-ehmedli', 'p-deutschhaus', 'ehmedli', 'Deutsch Haus — Əhmədli filialı', 'Zabit Əliyev küç. 7', 10),
  mkBranch('b-ieltspro-neftcilar', 'p-ieltspro', 'neftcilar', 'IELTS Pro — Neftçilər filialı', 'Əhmədli şosesi 3', 11),
  mkBranch('b-abitur-koroglu', 'p-abitur', 'koroglu', 'Abitur Mərkəzi — Koroğlu filialı', 'M. Qaşqay küç. 41', 12),
  mkBranch('b-melody-genclik', 'p-melody', 'genclik', 'Melody Music — Gənclik filialı', 'Bakıxanov küç. 12', 13),
  mkBranch('b-danceflow-narimanov', 'p-danceflow', 'narimanov', 'Dance Flow — Nərimanov filialı', 'Nərimanov pr. 78', 14),
  mkBranch('b-fitzone-28may', 'p-fitzone', '28-may', 'Fit Zone — 28 May filialı', 'Nizami küç. 156', 15),
  mkBranch('b-cheftable-nizami', 'p-cheftable', 'nizami', "Chef's Table — Nizami filialı", 'Xaqani küç. 29', 16),
  mkBranch('b-glam-elmler', 'p-glam', 'elmler-akademiyasi', 'Glam Beauty — Elmlər filialı', 'H. Cavid pr. 17', 17),
  mkBranch('b-drivesafe-insaatcilar', 'p-drivesafe', 'insaatcilar', 'DriveSafe — İnşaatçılar filialı', 'Təbriz küç. 88', 18),
  mkBranch('b-careernext-xetai', 'p-careernext', 'xetai', 'CareerNext — Xətai filialı', 'S. Bəhlulzadə küç. 60', 19),
  mkBranch('b-artspace-ehmedli', 'p-artspace', 'ehmedli', 'ArtSpace — Əhmədli filialı', 'Zabit Əliyev küç. 22', 20),
];

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------
const DAYS_MWF = ['Bazar ertəsi', 'Çərşənbə', 'Cümə'];
const DAYS_TTS = ['Çərşənbə axşamı', 'Cümə axşamı', 'Şənbə'];
const DAYS_WEEKEND = ['Şənbə', 'Bazar'];
const DAYS_DAILY = ['Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə'];

export const courses: Course[] = [
  {
    id: 'c-english-general-genclik', providerId: 'p-lingua', branchId: 'b-lingua-genclik', categoryId: 'ingilis-dili', subcategory: 'Ümumi ingilis dili',
    title: 'Ümumi İngilis Dili — Elementary', description: 'Gündəlik həyatda sərbəst ünsiyyət qura bilməyiniz üçün nəzərdə tutulmuş 4 bacarıq (dinləmə, oxu, yazı, danışıq) üzərində qurulmuş kurs. Kiçik qruplarda, kommunikativ metodla tədris.',
    photos: ['📘', '🗣️', '👥'], price: 120, discountPrice: 99, registrationFee: 20, durationWeeks: 12, startDate: '2026-08-10',
    lessonDays: DAYS_MWF, lessonTime: '18:00-19:30', dayPart: 'evening', format: 'offline', mode: 'group', maxGroupSize: 10,
    ageGroup: '16-45 yaş', level: 'elementary', language: 'İngilis / Azərbaycan', certificate: true, seatsTotal: 10, seatsAvailable: 3,
    freeTrial: true, trialSlots: [{ date: '2026-08-03', times: ['18:00'] }, { date: '2026-08-05', times: ['18:00'] }],
    rating: 4.7, reviewCount: 38, verifiedProvider: true, qargaExclusive: true, promoted: true,
    teacher: { name: 'Nərmin Quliyeva', bio: 'CELTA sertifikatlı müəllim, 7 illik təcrübə.', experienceYears: 7 },
    faqs: [{ q: { az: 'Kurs bitdikdən sonra sertifikat verilirmi?', en: 'Is a certificate provided after the course?', ru: 'Выдаётся ли сертификат после курса?' }, a: { az: 'Bəli, uğurla bitirən tələbələrə mərkəzin sertifikatı təqdim olunur.', en: 'Yes, students who complete the course successfully receive the center\'s certificate.', ru: 'Да, успешно завершившим курс студентам выдаётся сертификат центра.' } }],
    cancellationPolicy: 'Dərslər başlamazdan 48 saat əvvəl ləğv etdikdə tam geri ödəmə.', status: 'active', views: 842, clicks: 210, createdAt: '2026-06-01',
  },
  {
    id: 'c-english-speaking-nizami', providerId: 'p-lingua', branchId: 'b-lingua-nizami', categoryId: 'ingilis-dili', subcategory: 'Danışıq klubu',
    title: 'İngilis Dili Danışıq Klubu', description: 'Əsas qrammatikanı bilən, lakin sərbəst danışmaqda çətinlik çəkənlər üçün intensiv danışıq klubu. Real həyat mövzuları, debatlar və rol-oyunları.',
    photos: ['💬', '🌍'], price: 90, registrationFee: 0, durationWeeks: 8, startDate: '2026-08-15',
    lessonDays: DAYS_TTS, lessonTime: '19:00-20:30', dayPart: 'evening', format: 'hybrid', mode: 'group', maxGroupSize: 12,
    ageGroup: '18+ yaş', level: 'intermediate', language: 'İngilis dili', certificate: false, seatsTotal: 12, seatsAvailable: 7,
    freeTrial: true, trialSlots: [{ date: '2026-08-06', times: ['19:00'] }],
    rating: 4.5, reviewCount: 21, verifiedProvider: true, qargaExclusive: false, promoted: false,
    teacher: { name: 'Cavid Məmmədov', bio: 'IELTS 8.5, beynəlxalq danışıq klubları təcrübəsi.', experienceYears: 5 },
    faqs: [], cancellationPolicy: 'Sınaq dərsindən 24 saat əvvəl pulsuz ləğv.', status: 'active', views: 410, clicks: 96, createdAt: '2026-06-10',
  },
  {
    id: 'c-english-kids-narimanov', providerId: 'p-smartkids', branchId: 'b-smartkids-narimanov', categoryId: 'ingilis-dili', subcategory: 'Uşaqlar üçün ingilis dili',
    title: 'Uşaqlar üçün İngilis Dili (7-11 yaş)', description: 'Oyun əsaslı metodika ilə uşaqlarda ingilis dilinə maraq formalaşdıran, əyləncəli və interaktiv kurs.',
    photos: ['🧸', '🎈', '📖'], price: 80, discountPrice: 70, registrationFee: 15, durationWeeks: 16, startDate: '2026-09-01',
    lessonDays: DAYS_MWF, lessonTime: '16:00-17:00', dayPart: 'afternoon', format: 'offline', mode: 'group', maxGroupSize: 8,
    ageGroup: '7-11 yaş', level: 'beginner', language: 'İngilis / Azərbaycan', certificate: true, seatsTotal: 8, seatsAvailable: 2,
    freeTrial: true, trialSlots: [{ date: '2026-08-25', times: ['16:00', '17:00'] }],
    rating: 4.9, reviewCount: 54, verifiedProvider: true, qargaExclusive: true, promoted: true,
    teacher: { name: 'Aytac Nəbiyeva', bio: 'Uşaq psixologiyası üzrə əlavə təhsilli dil müəllimi.', experienceYears: 6 },
    faqs: [], cancellationPolicy: 'İstənilən vaxt pulsuz təxirə salına bilər.', status: 'active', views: 690, clicks: 188, createdAt: '2026-05-20',
  },
  {
    id: 'c-ielts-academic', providerId: 'p-ieltspro', branchId: 'b-ieltspro-neftcilar', categoryId: 'ielts', subcategory: 'Academic IELTS',
    title: 'IELTS Academic — Nəticə Zəmanətli Kurs', description: 'Xaricdə təhsil planlaşdıran tələbələr üçün intensiv IELTS Academic hazırlıq proqramı. Real imtahan formatında mock testlər daxildir.',
    photos: ['📝', '🎯', '🌎'], price: 180, discountPrice: 150, registrationFee: 25, durationWeeks: 10, startDate: '2026-08-12',
    lessonDays: DAYS_DAILY, lessonTime: '18:30-20:00', dayPart: 'evening', format: 'offline', mode: 'group', maxGroupSize: 8,
    ageGroup: '17+ yaş', level: 'advanced', language: 'İngilis dili', certificate: true, seatsTotal: 8, seatsAvailable: 4,
    freeTrial: true, trialSlots: [{ date: '2026-08-04', times: ['18:30'] }, { date: '2026-08-06', times: ['18:30'] }],
    rating: 4.8, reviewCount: 76, verifiedProvider: true, qargaExclusive: true, promoted: true,
    teacher: { name: 'Röya Əsgərova', bio: 'IELTS 8.5, 9 il təcrübəli imtahan hazırlığı meneceri.', experienceYears: 9 },
    faqs: [{ q: { az: 'Mock imtahan daxildir?', en: 'Is a mock exam included?', ru: 'Включён ли пробный экзамен?' }, a: { az: 'Bəli, kurs ərzində 2 tam mock imtahan keçirilir.', en: 'Yes, two full mock exams are held during the course.', ru: 'Да, в течение курса проводятся два полных пробных экзамена.' } }],
    cancellationPolicy: 'Qeydiyyatdan sonra 3 günə qədər tam geri ödəmə mümkündür.', status: 'active', views: 1120, clicks: 340, createdAt: '2026-04-15',
  },
  {
    id: 'c-toefl-ibt', providerId: 'p-ieltspro', branchId: 'b-ieltspro-neftcilar', categoryId: 'toefl', subcategory: 'iBT TOEFL',
    title: 'TOEFL iBT Hazırlıq Kursu', description: 'ABŞ və Kanada universitetlərinə sənəd vermək istəyənlər üçün TOEFL iBT formatına uyğun hazırlıq.',
    photos: ['📝', '🍁'], price: 170, registrationFee: 25, durationWeeks: 8, startDate: '2026-08-20',
    lessonDays: DAYS_TTS, lessonTime: '17:00-18:30', dayPart: 'afternoon', format: 'hybrid', mode: 'group', maxGroupSize: 6,
    ageGroup: '17+ yaş', level: 'advanced', language: 'İngilis dili', certificate: true, seatsTotal: 6, seatsAvailable: 1,
    freeTrial: false, trialSlots: [], rating: 4.6, reviewCount: 19, verifiedProvider: true, qargaExclusive: false, promoted: false,
    teacher: { name: 'Röya Əsgərova', bio: 'IELTS 8.5, 9 il təcrübəli imtahan hazırlığı meneceri.', experienceYears: 9 },
    faqs: [], cancellationPolicy: 'Qeydiyyatdan sonra 3 günə qədər tam geri ödəmə mümkündür.', status: 'active', views: 355, clicks: 88, createdAt: '2026-05-02',
  },
  {
    id: 'c-math-graduation-nizami', providerId: 'p-mathpro', branchId: 'b-mathpro-nizami', categoryId: 'riyaziyyat', subcategory: 'Buraxılış imtahanına hazırlıq',
    title: 'Riyaziyyat — Buraxılış İmtahanına Hazırlıq (9-cu sinif)', description: '9-cu sinif buraxılış imtahanına hazırlaşan şagirdlər üçün mövzu təkrarı və test həlli üzrə intensiv kurs.',
    photos: ['📐', '✏️', '📊'], price: 100, discountPrice: 85, registrationFee: 0, durationWeeks: 20, startDate: '2026-09-05',
    lessonDays: DAYS_MWF, lessonTime: '15:00-16:30', dayPart: 'afternoon', format: 'offline', mode: 'group', maxGroupSize: 12,
    ageGroup: '14-15 yaş', level: 'intermediate', language: 'Azərbaycan dili', certificate: false, seatsTotal: 12, seatsAvailable: 5,
    freeTrial: true, trialSlots: [{ date: '2026-08-29', times: ['15:00'] }], rating: 4.3, reviewCount: 12, verifiedProvider: false, qargaExclusive: false, promoted: false,
    teacher: { name: 'Elşən Hüseynov', bio: 'Riyaziyyat müəllimi, 11 il məktəb təcrübəsi.', experienceYears: 11 },
    faqs: [], cancellationPolicy: 'Ayın istənilən vaxtı ləğv oluna bilər, istifadə olunmamış dərslər geri ödənilir.', status: 'active', views: 210, clicks: 44, createdAt: '2026-06-25',
  },
  {
    id: 'c-math-university-koroglu', providerId: 'p-abitur', branchId: 'b-abitur-koroglu', categoryId: 'riyaziyyat', subcategory: 'Abituriyent hazırlığı',
    title: 'Riyaziyyat — Abituriyent Qrupu', description: 'Ali məktəbə qəbul imtahanına hazırlaşan abituriyentlər üçün intensiv riyaziyyat kursu, DİM formatında testlər.',
    photos: ['📐', '🎓'], price: 140, registrationFee: 20, durationWeeks: 30, startDate: '2026-09-01',
    lessonDays: DAYS_DAILY, lessonTime: '10:00-11:30', dayPart: 'morning', format: 'offline', mode: 'group', maxGroupSize: 15,
    ageGroup: '16-18 yaş', level: 'advanced', language: 'Azərbaycan dili', certificate: false, seatsTotal: 15, seatsAvailable: 6,
    freeTrial: true, trialSlots: [{ date: '2026-08-24', times: ['10:00'] }], rating: 4.6, reviewCount: 44, verifiedProvider: true, qargaExclusive: true, promoted: false,
    teacher: { name: 'Vüqar Nəsirov', bio: 'Abituriyent hazırlığı üzrə 14 il təcrübə.', experienceYears: 14 },
    faqs: [], cancellationPolicy: 'Semestr başlamazdan əvvəl tam geri ödəmə.', status: 'active', views: 530, clicks: 140, createdAt: '2026-05-11',
  },
  {
    id: 'c-python-28may', providerId: 'p-codeup', branchId: 'b-codeup-28may', categoryId: 'proqramlasdirma', subcategory: 'Python',
    title: 'Python ilə Proqramlaşdırmaya Giriş', description: 'Sıfırdan başlayanlar üçün Python əsasları, məntiqi düşüncə və kiçik layihələr üzərində praktika.',
    photos: ['💻', '🐍', '🧠'], price: 160, discountPrice: 135, registrationFee: 0, durationWeeks: 12, startDate: '2026-08-18',
    lessonDays: DAYS_TTS, lessonTime: '19:00-21:00', dayPart: 'evening', format: 'hybrid', mode: 'group', maxGroupSize: 14,
    ageGroup: '16+ yaş', level: 'beginner', language: 'Azərbaycan / İngilis', certificate: true, seatsTotal: 14, seatsAvailable: 9,
    freeTrial: true, trialSlots: [{ date: '2026-08-11', times: ['19:00'] }, { date: '2026-08-13', times: ['19:00'] }],
    rating: 4.8, reviewCount: 63, verifiedProvider: true, qargaExclusive: true, promoted: true,
    teacher: { name: 'Tural Abbasov', bio: 'Backend developer, 6 il sənaye təcrübəsi.', experienceYears: 6 },
    faqs: [{ q: { az: 'Noutbuk özümlə gətirməliyəm?', en: 'Do I need to bring my own laptop?', ru: 'Нужно ли приносить свой ноутбук?' }, a: { az: 'Bəli, dərslərə şəxsi noutbukla gəlmək tövsiyə olunur.', en: 'Yes, it is recommended to bring your own laptop to classes.', ru: 'Да, рекомендуется приходить на занятия со своим ноутбуком.' } }],
    cancellationPolicy: 'İlk 2 dərs ərzində ləğv etdikdə tam geri ödəmə.', status: 'active', views: 980, clicks: 265, createdAt: '2026-04-28',
  },
  {
    id: 'c-webdev-narimanov', providerId: 'p-codeup', branchId: 'b-codeup-narimanov', categoryId: 'proqramlasdirma', subcategory: 'Veb inkişaf',
    title: 'Frontend Veb İnkişaf (React)', description: 'HTML, CSS, JavaScript və React üzərində praktiki layihələrlə frontend developer hazırlığı.',
    photos: ['💻', '🌐'], price: 220, discountPrice: 190, registrationFee: 30, durationWeeks: 16, startDate: '2026-09-08',
    lessonDays: DAYS_MWF, lessonTime: '19:30-21:30', dayPart: 'evening', format: 'online', mode: 'group', maxGroupSize: 16,
    ageGroup: '18+ yaş', level: 'intermediate', language: 'Azərbaycan / İngilis', certificate: true, seatsTotal: 16, seatsAvailable: 10,
    freeTrial: true, trialSlots: [{ date: '2026-08-30', times: ['19:30'] }], rating: 4.7, reviewCount: 29, verifiedProvider: true, qargaExclusive: false, promoted: false,
    teacher: { name: 'Kənan Rüstəmov', bio: 'Frontend developer, 5 il təcrübə.', experienceYears: 5 },
    faqs: [], cancellationPolicy: 'Kurs başlamazdan 5 gün əvvələ qədər tam geri ödəmə.', status: 'active', views: 460, clicks: 121, createdAt: '2026-06-03',
  },
  {
    id: 'c-kids-coding-narimanov', providerId: 'p-codeup', branchId: 'b-codeup-narimanov', categoryId: 'proqramlasdirma', subcategory: 'Uşaqlar üçün kodlaşdırma',
    title: 'Uşaqlar üçün Kodlaşdırma (Scratch)', description: 'Uşaqlarda məntiqi düşüncəni inkişaf etdirən, oyun yaratma əsaslı kodlaşdırma kursu.',
    photos: ['🧩', '🎮'], price: 90, registrationFee: 0, durationWeeks: 10, startDate: '2026-09-01',
    lessonDays: DAYS_WEEKEND, lessonTime: '11:00-12:30', dayPart: 'morning', format: 'offline', mode: 'group', maxGroupSize: 10,
    ageGroup: '9-13 yaş', level: 'beginner', language: 'Azərbaycan dili', certificate: false, seatsTotal: 10, seatsAvailable: 4,
    freeTrial: true, trialSlots: [{ date: '2026-08-23', times: ['11:00'] }], rating: 4.5, reviewCount: 17, verifiedProvider: true, qargaExclusive: false, promoted: false,
    teacher: { name: 'Kənan Rüstəmov', bio: 'Frontend developer, 5 il təcrübə.', experienceYears: 5 },
    faqs: [], cancellationPolicy: 'Kurs başlamazdan 5 gün əvvələ qədər tam geri ödəmə.', status: 'active', views: 190, clicks: 51, createdAt: '2026-06-20',
  },
  {
    id: 'c-figma-elmler', providerId: 'p-pixel', branchId: 'b-pixel-elmler', categoryId: 'qrafik-dizayn', subcategory: 'Figma',
    title: 'UI/UX Dizayn — Figma ilə Praktika', description: 'Mobil və veb interfeys dizaynı əsasları, Figma alətləri və real layihə üzərində portfolio hazırlığı.',
    photos: ['🎨', '📱'], price: 150, discountPrice: 130, registrationFee: 0, durationWeeks: 10, startDate: '2026-08-22',
    lessonDays: DAYS_TTS, lessonTime: '18:00-20:00', dayPart: 'evening', format: 'hybrid', mode: 'group', maxGroupSize: 12,
    ageGroup: '17+ yaş', level: 'beginner', language: 'Azərbaycan dili', certificate: true, seatsTotal: 12, seatsAvailable: 6,
    freeTrial: true, trialSlots: [{ date: '2026-08-15', times: ['18:00'] }], rating: 4.9, reviewCount: 41, verifiedProvider: true, qargaExclusive: true, promoted: true,
    teacher: { name: 'Səbinə Əliyeva', bio: 'Product designer, 6 il təcrübə.', experienceYears: 6 },
    faqs: [], cancellationPolicy: 'İlk dərsdən sonra 100% geri ödəmə seçimi var.', status: 'active', views: 720, clicks: 199, createdAt: '2026-05-08',
  },
  {
    id: 'c-photoshop-elmler', providerId: 'p-pixel', branchId: 'b-pixel-elmler', categoryId: 'qrafik-dizayn', subcategory: 'Adobe Photoshop',
    title: 'Adobe Photoshop — Rəqəmsal Dizayn', description: 'Sosial media qrafikaları, banner və foto redaktəsi üçün praktiki Photoshop kursu.',
    photos: ['🖼️', '🎨'], price: 110, registrationFee: 0, durationWeeks: 8, startDate: '2026-09-03',
    lessonDays: DAYS_MWF, lessonTime: '17:00-18:30', dayPart: 'afternoon', format: 'offline', mode: 'individual', maxGroupSize: 1,
    ageGroup: '16+ yaş', level: 'beginner', language: 'Azərbaycan dili', certificate: true, seatsTotal: 4, seatsAvailable: 2,
    freeTrial: false, trialSlots: [], rating: 4.4, reviewCount: 9, verifiedProvider: true, qargaExclusive: false, promoted: false,
    teacher: { name: 'Səbinə Əliyeva', bio: 'Product designer, 6 il təcrübə.', experienceYears: 6 },
    faqs: [], cancellationPolicy: 'İlk dərsdən sonra 100% geri ödəmə seçimi var.', status: 'active', views: 145, clicks: 33, createdAt: '2026-06-14',
  },
  {
    id: 'c-smm-insaatcilar', providerId: 'p-growthlab', branchId: 'b-growthlab-insaatcilar', categoryId: 'reqemsal-marketinq', subcategory: 'SMM',
    title: 'SMM — Sosial Media Marketinqi', description: 'Instagram və Facebook üçün məzmun strategiyası, reklam kampaniyaları və analitika əsasları.',
    photos: ['📱', '📈'], price: 130, discountPrice: 110, registrationFee: 15, durationWeeks: 8, startDate: '2026-08-16',
    lessonDays: DAYS_TTS, lessonTime: '18:30-20:00', dayPart: 'evening', format: 'online', mode: 'group', maxGroupSize: 20,
    ageGroup: '18+ yaş', level: 'beginner', language: 'Azərbaycan dili', certificate: true, seatsTotal: 20, seatsAvailable: 12,
    freeTrial: true, trialSlots: [{ date: '2026-08-09', times: ['18:30'] }], rating: 4.6, reviewCount: 33, verifiedProvider: true, qargaExclusive: true, promoted: false,
    teacher: { name: 'Nihad Xəlilov', bio: 'Marketinq meneceri, 7 il agentlik təcrübəsi.', experienceYears: 7 },
    faqs: [], cancellationPolicy: 'Kurs başlamazdan əvvəl tam geri ödəmə mümkündür.', status: 'active', views: 610, clicks: 172, createdAt: '2026-05-27',
  },
  {
    id: 'c-googleads-insaatcilar', providerId: 'p-growthlab', branchId: 'b-growthlab-insaatcilar', categoryId: 'reqemsal-marketinq', subcategory: 'Google Ads',
    title: 'Google Ads üzrə Peşəkar Kurs', description: 'Axtarış, displey və YouTube reklamlarının qurulması, büdcə idarəetməsi və konversiya optimallaşdırması.',
    photos: ['📊', '🔍'], price: 170, registrationFee: 20, durationWeeks: 6, startDate: '2026-08-25',
    lessonDays: DAYS_WEEKEND, lessonTime: '11:00-13:00', dayPart: 'morning', format: 'online', mode: 'group', maxGroupSize: 15,
    ageGroup: '20+ yaş', level: 'intermediate', language: 'Azərbaycan / İngilis', certificate: true, seatsTotal: 15, seatsAvailable: 5,
    freeTrial: false, trialSlots: [], rating: 4.5, reviewCount: 14, verifiedProvider: true, qargaExclusive: false, promoted: false,
    teacher: { name: 'Nihad Xəlilov', bio: 'Marketinq meneceri, 7 il agentlik təcrübəsi.', experienceYears: 7 },
    faqs: [], cancellationPolicy: 'Kurs başlamazdan əvvəl tam geri ödəmə mümkündür.', status: 'active', views: 240, clicks: 62, createdAt: '2026-06-18',
  },
  {
    id: 'c-russian-xetai', providerId: 'p-rusdil', branchId: 'b-rusdil-xetai', categoryId: 'rus-dili', subcategory: 'Başlanğıc səviyyə',
    title: 'Rus Dili — Başlanğıc Səviyyə', description: 'Əlifbadan başlayaraq gündəlik ünsiyyət səviyyəsinə çatmaq üçün nəzərdə tutulmuş kurs.',
    photos: ['🇷🇺', '📖'], price: 85, registrationFee: 0, durationWeeks: 14, startDate: '2026-08-14',
    lessonDays: DAYS_MWF, lessonTime: '17:30-19:00', dayPart: 'afternoon', format: 'offline', mode: 'group', maxGroupSize: 10,
    ageGroup: '16+ yaş', level: 'beginner', language: 'Rus / Azərbaycan', certificate: false, seatsTotal: 10, seatsAvailable: 6,
    freeTrial: true, trialSlots: [{ date: '2026-08-07', times: ['17:30'] }], rating: 4.2, reviewCount: 11, verifiedProvider: false, qargaExclusive: false, promoted: false,
    teacher: { name: 'Yelena Petrova', bio: 'Ana dili rus dili, 8 il tədris təcrübəsi.', experienceYears: 8 },
    faqs: [], cancellationPolicy: 'Aylıq abunə, istənilən vaxt dayandırıla bilər.', status: 'active', views: 165, clicks: 38, createdAt: '2026-06-30',
  },
  {
    id: 'c-german-a1-ehmedli', providerId: 'p-deutschhaus', branchId: 'b-deutschhaus-ehmedli', categoryId: 'alman-dili', subcategory: 'A1-A2 səviyyə',
    title: 'Alman Dili A1-A2', description: 'Almaniyada təhsil və ya işləmək planlaşdıranlar üçün Goethe standartlarına uyğun A1-A2 kursu.',
    photos: ['🇩🇪', '📗'], price: 140, discountPrice: 120, registrationFee: 20, durationWeeks: 16, startDate: '2026-09-01',
    lessonDays: DAYS_TTS, lessonTime: '18:00-19:30', dayPart: 'evening', format: 'offline', mode: 'group', maxGroupSize: 10,
    ageGroup: '18+ yaş', level: 'beginner', language: 'Alman / Azərbaycan', certificate: true, seatsTotal: 10, seatsAvailable: 3,
    freeTrial: true, trialSlots: [{ date: '2026-08-25', times: ['18:00'] }], rating: 4.7, reviewCount: 27, verifiedProvider: true, qargaExclusive: true, promoted: false,
    teacher: { name: 'Markus Weber', bio: 'Goethe institutunda sertifikatlı müəllim.', experienceYears: 10 },
    faqs: [], cancellationPolicy: 'Qeydiyyatdan sonra 3 gün ərzində tam geri ödəmə.', status: 'active', views: 380, clicks: 94, createdAt: '2026-05-19',
  },
  {
    id: 'c-guitar-genclik', providerId: 'p-melody', branchId: 'b-melody-genclik', categoryId: 'musiqi', subcategory: 'Gitara',
    title: 'Fərdi Gitara Dərsləri', description: 'Bütün yaş qrupları üçün fərdi gitara təlimi, klassik və akustik üslublarda.',
    photos: ['🎸', '🎶'], price: 100, registrationFee: 0, durationWeeks: 12, startDate: '2026-08-11',
    lessonDays: ['Çərşənbə axşamı', 'Şənbə'], lessonTime: '16:00-17:00', dayPart: 'afternoon', format: 'offline', mode: 'individual', maxGroupSize: 1,
    ageGroup: 'Bütün yaşlar', level: 'all', language: 'Azərbaycan dili', certificate: false, seatsTotal: 5, seatsAvailable: 3,
    freeTrial: true, trialSlots: [{ date: '2026-08-04', times: ['16:00', '17:00'] }], rating: 4.6, reviewCount: 22, verifiedProvider: false, qargaExclusive: false, promoted: false,
    teacher: { name: 'Rasim Quliyev', bio: 'Konservatoriya məzunu, 9 il tədris təcrübəsi.', experienceYears: 9 },
    faqs: [], cancellationPolicy: 'Hər dərs 24 saat əvvəldən pulsuz təxirə salına bilər.', status: 'active', views: 220, clicks: 58, createdAt: '2026-06-08',
  },
  {
    id: 'c-latin-narimanov', providerId: 'p-danceflow', branchId: 'b-danceflow-narimanov', categoryId: 'reqs', subcategory: 'Latin rəqsləri',
    title: 'Latin Rəqsləri — Başlanğıc Qrupu', description: 'Salsa və bachata əsasları, cütlərlə və fərdi iştirak mümkündür.',
    photos: ['💃', '🕺'], price: 95, discountPrice: 80, registrationFee: 0, durationWeeks: 8, startDate: '2026-08-19',
    lessonDays: DAYS_TTS, lessonTime: '20:00-21:30', dayPart: 'evening', format: 'offline', mode: 'group', maxGroupSize: 16,
    ageGroup: '16+ yaş', level: 'beginner', language: 'Azərbaycan dili', certificate: false, seatsTotal: 16, seatsAvailable: 8,
    freeTrial: true, trialSlots: [{ date: '2026-08-12', times: ['20:00'] }], rating: 4.8, reviewCount: 47, verifiedProvider: true, qargaExclusive: true, promoted: true,
    teacher: { name: 'Diana Səmədova', bio: 'Beynəlxalq yarışlarda iştirak etmiş rəqs müəllimi.', experienceYears: 8 },
    faqs: [], cancellationPolicy: 'İlk dərsdən məmnun qalmasanız pulunuz geri qaytarılır.', status: 'active', views: 505, clicks: 156, createdAt: '2026-05-30',
  },
  {
    id: 'c-personal-trainer-28may', providerId: 'p-fitzone', branchId: 'b-fitzone-28may', categoryId: 'fitness', subcategory: 'Şəxsi məşqçi',
    title: 'Şəxsi Məşqçi ilə Fitnes Proqramı', description: 'Fərdi məşq və qidalanma planı ilə formada qalmaq istəyənlər üçün.',
    photos: ['🏋️', '💪'], price: 200, registrationFee: 0, durationWeeks: 4, startDate: '2026-08-05',
    lessonDays: DAYS_DAILY, lessonTime: '07:00-08:00', dayPart: 'morning', format: 'offline', mode: 'individual', maxGroupSize: 1,
    ageGroup: '18+ yaş', level: 'all', language: 'Azərbaycan dili', certificate: false, seatsTotal: 3, seatsAvailable: 1,
    freeTrial: true, trialSlots: [{ date: '2026-08-01', times: ['07:00']}], rating: 4.3, reviewCount: 8, verifiedProvider: false, qargaExclusive: false, promoted: false,
    teacher: { name: 'Orxan Cəfərov', bio: 'Sertifikatlı fitnes məşqçisi.', experienceYears: 4 },
    faqs: [], cancellationPolicy: 'Aylıq ödəniş, istənilən vaxt dayandırıla bilər.', status: 'active', views: 130, clicks: 29, createdAt: '2026-06-27',
  },
  {
    id: 'c-pastry-nizami', providerId: 'p-cheftable', branchId: 'b-cheftable-nizami', categoryId: 'asbazliq', subcategory: 'Şirniyyat hazırlanması',
    title: 'Şirniyyat Hazırlanması Kursu', description: 'Ev şəraitində və peşəkar səviyyədə tort, keks və desertlərin hazırlanması.',
    photos: ['🍰', '🧁'], price: 110, discountPrice: 95, registrationFee: 0, durationWeeks: 6, startDate: '2026-08-09',
    lessonDays: DAYS_WEEKEND, lessonTime: '14:00-16:00', dayPart: 'afternoon', format: 'offline', mode: 'group', maxGroupSize: 8,
    ageGroup: '16+ yaş', level: 'all', language: 'Azərbaycan dili', certificate: true, seatsTotal: 8, seatsAvailable: 4,
    freeTrial: false, trialSlots: [], rating: 4.9, reviewCount: 36, verifiedProvider: true, qargaExclusive: true, promoted: false,
    teacher: { name: 'Günel İsmayılova', bio: 'Peşəkar şirniyyatçı, öz brendi var.', experienceYears: 7 },
    faqs: [], cancellationPolicy: 'Kurs başlamazdan 48 saat əvvəl ləğv - tam geri ödəmə.', status: 'active', views: 300, clicks: 81, createdAt: '2026-06-05',
  },
  {
    id: 'c-makeup-elmler', providerId: 'p-glam', branchId: 'b-glam-elmler', categoryId: 'gozellik', subcategory: 'Vizajist kursu',
    title: 'Vizajist Sertifikat Kursu', description: 'Gündəlik, gəlinlik və fotosessiya makyajı üzrə peşəkar hazırlıq proqramı.',
    photos: ['💄', '✨'], price: 250, discountPrice: 220, registrationFee: 30, durationWeeks: 6, startDate: '2026-08-17',
    lessonDays: DAYS_TTS, lessonTime: '15:00-17:00', dayPart: 'afternoon', format: 'offline', mode: 'group', maxGroupSize: 6,
    ageGroup: '18+ yaş', level: 'beginner', language: 'Azərbaycan dili', certificate: true, seatsTotal: 6, seatsAvailable: 2,
    freeTrial: true, trialSlots: [{ date: '2026-08-10', times: ['15:00'] }], rating: 4.9, reviewCount: 58, verifiedProvider: true, qargaExclusive: true, promoted: true,
    teacher: { name: 'Aynur Bağırova', bio: 'Beynəlxalq sertifikatlı vizajist, 10 il təcrübə.', experienceYears: 10 },
    faqs: [], cancellationPolicy: 'Qeydiyyatdan 5 gün ərzində ləğv - tam geri ödəmə.', status: 'active', views: 890, clicks: 245, createdAt: '2026-04-22',
  },
  {
    id: 'c-driving-b-insaatcilar', providerId: 'p-drivesafe', branchId: 'b-drivesafe-insaatcilar', categoryId: 'suruculuk', subcategory: 'B kateqoriyası',
    title: 'B Kateqoriyası Sürücülük Kursu', description: 'Nəzəri dərslər və praktiki sürücülük məşğələləri daxil olmaqla tam hazırlıq proqramı.',
    photos: ['🚗', '🛣️'], price: 350, registrationFee: 50, durationWeeks: 8, startDate: '2026-08-13',
    lessonDays: DAYS_DAILY, lessonTime: '18:00-19:30', dayPart: 'evening', format: 'offline', mode: 'group', maxGroupSize: 20,
    ageGroup: '18+ yaş', level: 'all', language: 'Azərbaycan dili', certificate: true, seatsTotal: 20, seatsAvailable: 11,
    freeTrial: false, trialSlots: [], rating: 4.4, reviewCount: 64, verifiedProvider: true, qargaExclusive: false, promoted: false,
    teacher: { name: 'Elnur Hacıyev', bio: 'DYP təlimçisi, 15 il təcrübə.', experienceYears: 15 },
    faqs: [], cancellationPolicy: 'Nəzəri hissə başlamazdan əvvəl tam geri ödəmə.', status: 'active', views: 670, clicks: 178, createdAt: '2026-05-01',
  },
  {
    id: 'c-cv-interview-xetai', providerId: 'p-careernext', branchId: 'b-careernext-xetai', categoryId: 'karyera-inkisafi', subcategory: 'CV və müsahibə',
    title: 'CV Yazılışı və Müsahibəyə Hazırlıq', description: 'Peşəkar CV hazırlama, LinkedIn profili qurma və müsahibə bacarıqları üzrə praktiki seminar.',
    photos: ['🚀', '📄'], price: 60, registrationFee: 0, durationWeeks: 2, startDate: '2026-08-08',
    lessonDays: ['Şənbə'], lessonTime: '11:00-14:00', dayPart: 'morning', format: 'online', mode: 'group', maxGroupSize: 25,
    ageGroup: '18+ yaş', level: 'all', language: 'Azərbaycan dili', certificate: false, seatsTotal: 25, seatsAvailable: 18,
    freeTrial: false, trialSlots: [], rating: 4.1, reviewCount: 6, verifiedProvider: false, qargaExclusive: false, promoted: false,
    teacher: { name: 'Fərid Vəliyev', bio: 'HR meneceri, işə qəbul üzrə 8 il təcrübə.', experienceYears: 8 },
    faqs: [], cancellationPolicy: 'Seminardan 24 saat əvvəl tam geri ödəmə.', status: 'active', views: 120, clicks: 27, createdAt: '2026-07-01',
  },
  {
    id: 'c-painting-ehmedli', providerId: 'p-artspace', branchId: 'b-artspace-ehmedli', categoryId: 'incesenet', subcategory: 'Rəssamlıq',
    title: 'Rəssamlıq Dərsləri (Yağlı Boya)', description: 'Yağlı boya texnikası ilə tablo çəkməyi öyrədən başlanğıc səviyyə kurs.',
    photos: ['🖼️', '🎨'], price: 90, registrationFee: 0, durationWeeks: 8, startDate: '2026-09-10',
    lessonDays: DAYS_WEEKEND, lessonTime: '13:00-15:00', dayPart: 'afternoon', format: 'offline', mode: 'group', maxGroupSize: 8,
    ageGroup: 'Bütün yaşlar', level: 'beginner', language: 'Azərbaycan dili', certificate: false, seatsTotal: 8, seatsAvailable: 8,
    freeTrial: false, trialSlots: [], rating: 0, reviewCount: 0, verifiedProvider: false, qargaExclusive: false, promoted: false,
    teacher: { name: 'Ləman Rzayeva', bio: 'Sərbəst rəssam.', experienceYears: 3 },
    faqs: [], cancellationPolicy: 'Kurs başlamazdan əvvəl tam geri ödəmə.', status: 'pending', views: 12, clicks: 2, createdAt: '2026-07-25',
  },
];

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
export const reviews: Review[] = [
  { id: 'r1', courseId: 'c-english-general-genclik', userId: 'demo-seed-1', userName: 'Kamran S.', verified: true, overall: 5, teacherQuality: 5, content: 5, location: 4, priceValue: 5, communication: 5, scheduleAccuracy: 5, text: 'Nərmin müəllimə çox səbrlidir, 3 aydan sonra artıq sərbəst danışa bilirəm. Qarğa endirimi ilə daha da sərfəli oldu.', photos: [], reported: false, createdAt: '2026-06-20' },
  { id: 'r2', courseId: 'c-english-general-genclik', userId: 'demo-seed-2', userName: 'Aygün M.', verified: true, overall: 4, teacherQuality: 5, content: 4, location: 4, priceValue: 4, communication: 4, scheduleAccuracy: 4, text: 'Qrup bir az böyükdür, amma müəllim hamıya vaxt ayırmağa çalışır.', photos: [], providerReply: 'Rəyiniz üçün təşəkkürlər! Növbəti dövrdə qrup ölçüsünü azaldacağıq.', reported: false, createdAt: '2026-06-25' },
  { id: 'r3', courseId: 'c-ielts-academic', userId: 'demo-seed-3', userName: 'Elvin H.', verified: true, overall: 5, teacherQuality: 5, content: 5, location: 5, priceValue: 4, communication: 5, scheduleAccuracy: 5, text: 'Mock imtahanlar reallıqla eyni idi, 7.5 bal aldım. Tövsiyə edirəm!', photos: [], reported: false, createdAt: '2026-05-10' },
  { id: 'r4', courseId: 'c-python-28may', userId: 'demo-seed-4', userName: 'Nicat Q.', verified: true, overall: 5, teacherQuality: 5, content: 4, location: 5, priceValue: 5, communication: 5, scheduleAccuracy: 4, text: 'Tural müəllim çox aydın izah edir, praktiki tapşırıqlar faydalı idi.', photos: [], reported: false, createdAt: '2026-05-22' },
  { id: 'r5', courseId: 'c-figma-elmler', userId: 'demo-seed-5', userName: 'Səbinə T.', verified: true, overall: 5, teacherQuality: 5, content: 5, location: 5, priceValue: 5, communication: 5, scheduleAccuracy: 5, text: 'Portfolio üçün əla layihələr etdik, işə düzəlməyimə kömək oldu.', photos: [], reported: false, createdAt: '2026-05-15' },
  { id: 'r6', courseId: 'c-makeup-elmler', userId: 'demo-seed-6', userName: 'Günay F.', verified: true, overall: 5, teacherQuality: 5, content: 5, location: 4, priceValue: 4, communication: 5, scheduleAccuracy: 5, text: 'Aynur xanımın təcrübəsi hiss olunur, indi öz müştərilərimlə işləyirəm.', photos: [], reported: false, createdAt: '2026-04-30' },
  { id: 'r7', courseId: 'c-latin-narimanov', userId: 'demo-seed-7', userName: 'Rəşad B.', verified: true, overall: 5, teacherQuality: 5, content: 4, location: 5, priceValue: 5, communication: 5, scheduleAccuracy: 4, text: 'Çox əyləncəli mühit, Diana xanım hər hərəkəti addım-addım öyrədir.', photos: [], reported: false, createdAt: '2026-06-02' },
  { id: 'r8', courseId: 'c-english-kids-narimanov', userId: 'demo-seed-8', userName: 'Türkan Ə. (valideyn)', verified: true, overall: 5, teacherQuality: 5, content: 5, location: 5, priceValue: 4, communication: 5, scheduleAccuracy: 5, text: 'Oğlum dərslərə həvəslə gedir, 4 ayda çox söz öyrənib.', photos: [], reported: false, createdAt: '2026-06-12' },
];

export function coursesByProvider(providerId: string) {
  return courses.filter((c) => c.providerId === providerId);
}
export function branchesByProvider(providerId: string) {
  return branches.filter((b) => b.providerId === providerId);
}
export function getBranch(id: string) {
  return branches.find((b) => b.id === id);
}
export function getProvider(id: string) {
  return providers.find((p) => p.id === id);
}
export function getCourse(id: string) {
  return courses.find((c) => c.id === id);
}
export function reviewsByCourse(courseId: string) {
  return reviews.filter((r) => r.courseId === courseId);
}
