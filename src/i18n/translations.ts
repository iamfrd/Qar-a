// Central translation dictionary. Azerbaijani is the source of truth (default language).
// English and Russian are prepared so the app can switch languages; product/sample data
// (course titles, descriptions) stays Azerbaijani-only for the MVP per the brief.
export const translations = {
  app_name: { az: 'Qarğa', en: 'Qarğa', ru: 'Qarğa' },
  slogan: {
    az: 'Sən kurs axtarma, Qarğa tapsın.',
    en: "Don't search for a course. Let Qarğa find it.",
    ru: 'Не ищи курс сам — пусть Qarğa найдёт его.',
  },
  slogan_alt: {
    az: 'Qarğa tapır. Sən seçirsən.',
    en: 'The Crow finds. You choose.',
    ru: 'Ворон находит. Ты выбираешь.',
  },

  // Bottom nav
  nav_map: { az: 'Xəritə', en: 'Map', ru: 'Карта' },
  nav_search: { az: 'Axtarış', en: 'Search', ru: 'Поиск' },
  nav_crow: { az: 'Qarğa', en: 'Crow', ru: 'Ворон' },
  nav_favorites: { az: 'Seçilmişlər', en: 'Favorites', ru: 'Избранное' },
  nav_profile: { az: 'Profil', en: 'Profile', ru: 'Профиль' },

  // Onboarding
  onboarding_1_title: { az: 'Yaxınlığındakı kursları tap', en: 'Find courses near you', ru: 'Найди курсы рядом с тобой' },
  onboarding_1_body: { az: 'Xəritədə ətrafındakı bütün kursları gör, məsafəyə görə müqayisə et.', en: 'See every course around you on the map and compare by distance.', ru: 'Смотри все курсы рядом на карте и сравнивай по расстоянию.' },
  onboarding_2_title: { az: 'Qiyməti, cədvəli və rəyləri müqayisə et', en: 'Compare prices, schedules and verified reviews', ru: 'Сравнивай цены, расписание и отзывы' },
  onboarding_2_body: { az: 'Hər kurs üçün real qiymət, cədvəl və təsdiqlənmiş tələbə rəyləri.', en: 'Real prices, real schedules, reviews from verified students.', ru: 'Реальные цены, расписание и отзывы проверенных студентов.' },
  onboarding_3_title: { az: 'Qarğaya güvən, ən uyğun kursu tapsın', en: 'Let the crow find the best course for you', ru: 'Пусть ворон найдёт лучший курс для тебя' },
  onboarding_3_body: { az: 'Ağıllı köməkçi sənə ən uyğun variantları tövsiyə edir.', en: 'The smart assistant recommends the best matching options.', ru: 'Умный помощник подскажет лучшие варианты.' },
  onboarding_4_title: { az: 'Qarğa vasitəsilə qeydiyyatdan keç, üstünlüklər qazan', en: 'Register through Qarğa and get exclusive benefits', ru: 'Регистрируйся через Qarğa и получай выгоды' },
  onboarding_4_body: { az: 'Endirimlər, pulsuz sınaq dərsi, Lələk xalları və daha çoxu.', en: 'Discounts, free trial lessons, Lələk points and more.', ru: 'Скидки, бесплатные пробные уроки, баллы Lələk и многое другое.' },
  onboarding_skip: { az: 'Keç', en: 'Skip', ru: 'Пропустить' },
  onboarding_next: { az: 'Növbəti', en: 'Next', ru: 'Далее' },
  onboarding_start: { az: 'Başla', en: 'Get started', ru: 'Начать' },

  // Auth
  login_title: { az: 'Hesabına daxil ol', en: 'Log in', ru: 'Войти в аккаунт' },
  register_title: { az: 'Hesab yarat', en: 'Create account', ru: 'Создать аккаунт' },
  phone_label: { az: 'Telefon nömrəsi', en: 'Phone number', ru: 'Номер телефона' },
  email_label: { az: 'E-poçt', en: 'Email', ru: 'Эл. почта' },
  name_label: { az: 'Ad Soyad', en: 'Full name', ru: 'Имя Фамилия' },
  continue: { az: 'Davam et', en: 'Continue', ru: 'Продолжить' },
  or: { az: 'və ya', en: 'or', ru: 'или' },
  continue_with_google: { az: 'Google ilə davam et', en: 'Continue with Google', ru: 'Продолжить с Google' },
  continue_with_apple: { az: 'Apple ilə davam et', en: 'Continue with Apple', ru: 'Продолжить с Apple' },
  no_account: { az: 'Hesabın yoxdur?', en: "Don't have an account?", ru: 'Нет аккаунта?' },
  have_account: { az: 'Artıq hesabın var?', en: 'Already have an account?', ru: 'Уже есть аккаунт?' },
  sign_up: { az: 'Qeydiyyatdan keç', en: 'Sign up', ru: 'Зарегистрироваться' },
  sign_in: { az: 'Daxil ol', en: 'Log in', ru: 'Войти' },

  // Location
  location_title: { az: 'Yerini paylaş', en: 'Share your location', ru: 'Поделись своим местоположением' },
  location_body: { az: 'Sənə ən yaxın kursları göstərmək üçün məkanına ehtiyacımız var.', en: 'We need your location to show the nearest courses.', ru: 'Нам нужна ваша геолокация, чтобы показать ближайшие курсы.' },
  allow_location: { az: 'Yerimi paylaş', en: 'Allow location', ru: 'Разрешить геолокацию' },
  choose_manually: { az: 'Əraziyi özüm seçim', en: "I'll choose manually", ru: 'Выберу район вручную' },

  // Common
  search_placeholder: { az: 'Kurs, kateqoriya və ya ərazi axtar…', en: 'Search course, category or area…', ru: 'Поиск курса, категории или района…' },
  filters: { az: 'Filtrlər', en: 'Filters', ru: 'Фильтры' },
  apply: { az: 'Tətbiq et', en: 'Apply', ru: 'Применить' },
  clear: { az: 'Təmizlə', en: 'Clear', ru: 'Очистить' },
  map_view: { az: 'Xəritə', en: 'Map', ru: 'Карта' },
  list_view: { az: 'Siyahı', en: 'List', ru: 'Список' },
  search_this_area: { az: 'Bu ərazidə axtar', en: 'Search this area', ru: 'Искать в этом районе' },
  register_button: { az: 'Qeydiyyatdan keç', en: 'Register', ru: 'Записаться' },
  reserve_trial: { az: 'Pulsuz sınaq rezerv et', en: 'Reserve free trial', ru: 'Забронировать пробный урок' },
  save_favorite: { az: 'Seçilmişlərə əlavə et', en: 'Save to favorites', ru: 'В избранное' },
  compare: { az: 'Müqayisə et', en: 'Compare', ru: 'Сравнить' },
  report_issue: { az: 'Səhv məlumatı bildir', en: 'Report incorrect info', ru: 'Сообщить об ошибке' },
} as const;

export type TranslationKey = keyof typeof translations;
