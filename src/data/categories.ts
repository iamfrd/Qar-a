import type { Category } from '../types';

export const categories: Category[] = [
  { id: 'ingilis-dili', icon: '🇬🇧', color: '#2563eb', name: { az: 'İngilis dili', en: 'English language', ru: 'Английский язык' }, subcategories: [
    { az: 'Ümumi ingilis dili', en: 'General English', ru: 'Общий английский' },
    { az: 'Danışıq klubu', en: 'Speaking club', ru: 'Разговорный клуб' },
    { az: 'Uşaqlar üçün ingilis dili', en: 'English for kids', ru: 'Английский для детей' },
  ]},
  { id: 'rus-dili', icon: '🇷🇺', color: '#dc2626', name: { az: 'Rus dili', en: 'Russian language', ru: 'Русский язык' }, subcategories: [
    { az: 'Başlanğıc səviyyə', en: 'Beginner level', ru: 'Начальный уровень' },
    { az: 'Danışıq dili', en: 'Conversational', ru: 'Разговорный' },
  ]},
  { id: 'alman-dili', icon: '🇩🇪', color: '#111827', name: { az: 'Alman dili', en: 'German language', ru: 'Немецкий язык' }, subcategories: [
    { az: 'A1-A2 səviyyə', en: 'A1-A2 level', ru: 'Уровень A1-A2' },
    { az: 'Goethe imtahanına hazırlıq', en: 'Goethe exam prep', ru: 'Подготовка к Goethe' },
  ]},
  { id: 'ielts', icon: '📝', color: '#7c3aed', name: { az: 'IELTS hazırlığı', en: 'IELTS preparation', ru: 'Подготовка к IELTS' }, subcategories: [
    { az: 'Academic IELTS', en: 'Academic IELTS', ru: 'Academic IELTS' },
    { az: 'General Training', en: 'General Training', ru: 'General Training' },
  ]},
  { id: 'toefl', icon: '📝', color: '#8b5cf6', name: { az: 'TOEFL hazırlığı', en: 'TOEFL preparation', ru: 'Подготовка к TOEFL' }, subcategories: [
    { az: 'iBT TOEFL', en: 'iBT TOEFL', ru: 'iBT TOEFL' },
  ]},
  { id: 'mekteb-fenleri', icon: '📚', color: '#0891b2', name: { az: 'Məktəb fənləri', en: 'School subjects', ru: 'Школьные предметы' }, subcategories: [
    { az: 'Fizika', en: 'Physics', ru: 'Физика' },
    { az: 'Kimya', en: 'Chemistry', ru: 'Химия' },
  ]},
  { id: 'riyaziyyat', icon: '📐', color: '#0d9488', name: { az: 'Riyaziyyat', en: 'Mathematics', ru: 'Математика' }, subcategories: [
    { az: 'Buraxılış imtahanına hazırlıq', en: 'Graduation exam prep', ru: 'Подготовка к экзамену' },
    { az: 'Abituriyent hazırlığı', en: 'University entrance prep', ru: 'Подготовка к поступлению' },
  ]},
  { id: 'proqramlasdirma', icon: '💻', color: '#4338ca', name: { az: 'Proqramlaşdırma', en: 'Programming', ru: 'Программирование' }, subcategories: [
    { az: 'Python', en: 'Python', ru: 'Python' },
    { az: 'Veb inkişaf', en: 'Web development', ru: 'Веб-разработка' },
    { az: 'Uşaqlar üçün kodlaşdırma', en: 'Coding for kids', ru: 'Кодинг для детей' },
  ]},
  { id: 'qrafik-dizayn', icon: '🎨', color: '#db2777', name: { az: 'Qrafik dizayn', en: 'Graphic design', ru: 'Графический дизайн' }, subcategories: [
    { az: 'Figma', en: 'Figma', ru: 'Figma' },
    { az: 'Adobe Photoshop', en: 'Adobe Photoshop', ru: 'Adobe Photoshop' },
  ]},
  { id: 'reqemsal-marketinq', icon: '📈', color: '#ea580c', name: { az: 'Rəqəmsal marketinq', en: 'Digital marketing', ru: 'Цифровой маркетинг' }, subcategories: [
    { az: 'SMM', en: 'SMM', ru: 'SMM' },
    { az: 'Google Ads', en: 'Google Ads', ru: 'Google Ads' },
  ]},
  { id: 'muhasibatliq', icon: '🧮', color: '#16a34a', name: { az: 'Mühasibatlıq', en: 'Accounting', ru: 'Бухгалтерия' }, subcategories: [
    { az: '1C Mühasibatlıq', en: '1C Accounting', ru: '1С Бухгалтерия' },
  ]},
  { id: 'musiqi', icon: '🎵', color: '#c026d3', name: { az: 'Musiqi', en: 'Music', ru: 'Музыка' }, subcategories: [
    { az: 'Gitara', en: 'Guitar', ru: 'Гитара' },
    { az: 'Fortepiano', en: 'Piano', ru: 'Фортепиано' },
  ]},
  { id: 'reqs', icon: '💃', color: '#e11d48', name: { az: 'Rəqs', en: 'Dance', ru: 'Танцы' }, subcategories: [
    { az: 'Latin rəqsləri', en: 'Latin dance', ru: 'Латинские танцы' },
    { az: 'Hip-hop', en: 'Hip-hop', ru: 'Хип-хоп' },
  ]},
  { id: 'incesenet', icon: '🖌️', color: '#9333ea', name: { az: 'İncəsənət', en: 'Art', ru: 'Искусство' }, subcategories: [
    { az: 'Rəssamlıq', en: 'Painting', ru: 'Живопись' },
  ]},
  { id: 'suruculuk', icon: '🚗', color: '#334155', name: { az: 'Sürücülük kursları', en: 'Driving courses', ru: 'Курсы вождения' }, subcategories: [
    { az: 'B kateqoriyası', en: 'Category B', ru: 'Категория B' },
  ]},
  { id: 'fitness', icon: '🏋️', color: '#f97316', name: { az: 'Fitnes', en: 'Fitness', ru: 'Фитнес' }, subcategories: [
    { az: 'Şəxsi məşqçi', en: 'Personal trainer', ru: 'Персональный тренер' },
    { az: 'Qrup məşğələləri', en: 'Group classes', ru: 'Групповые занятия' },
  ]},
  { id: 'asbazliq', icon: '🍳', color: '#d97706', name: { az: 'Aşbazlıq', en: 'Cooking', ru: 'Кулинария' }, subcategories: [
    { az: 'Şirniyyat hazırlanması', en: 'Pastry making', ru: 'Кондитерское дело' },
  ]},
  { id: 'gozellik', icon: '💄', color: '#f43f5e', name: { az: 'Gözəllik və qulluq', en: 'Beauty and personal care', ru: 'Красота и уход' }, subcategories: [
    { az: 'Manikür-pedikür', en: 'Manicure-pedicure', ru: 'Маникюр-педикюр' },
    { az: 'Vizajist kursu', en: 'Makeup artist course', ru: 'Курс визажиста' },
  ]},
  { id: 'pese-hazirligi', icon: '🎓', color: '#0369a1', name: { az: 'Peşə hazırlığı', en: 'Professional training', ru: 'Профессиональная подготовка' }, subcategories: [
    { az: 'Sertifikatlı kurslar', en: 'Certified courses', ru: 'Сертифицированные курсы' },
  ]},
  { id: 'usaq-tehsili', icon: '🧒', color: '#65a30d', name: { az: 'Uşaq təhsili', en: "Children's education", ru: 'Детское образование' }, subcategories: [
    { az: 'Erkən inkişaf', en: 'Early development', ru: 'Раннее развитие' },
  ]},
  { id: 'universitete-hazirliq', icon: '🏛️', color: '#1d4ed8', name: { az: 'Universitetə hazırlıq', en: 'University preparation', ru: 'Подготовка к университету' }, subcategories: [
    { az: 'SAT hazırlığı', en: 'SAT prep', ru: 'Подготовка к SAT' },
  ]},
  { id: 'karyera-inkisafi', icon: '🚀', color: '#0f766e', name: { az: 'Karyera inkişafı', en: 'Career development', ru: 'Карьерное развитие' }, subcategories: [
    { az: 'CV və müsahibə', en: 'CV & interview', ru: 'Резюме и собеседование' },
  ]},
];

export function getCategory(id: string) {
  return categories.find((c) => c.id === id);
}
