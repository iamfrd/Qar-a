import type { Course, FilterState, DayPart, CourseFormat, CourseLevel } from '../types';
import type { Category } from '../types';
import type { Area } from '../data/areas';
import { getBranch } from '../data/mockData';
import { haversineKm } from './utils';

export function courseMatchesFilters(course: Course, filters: FilterState, branchArea?: string): boolean {
  if (course.status !== 'active') return false;
  if (filters.categoryId && course.categoryId !== filters.categoryId) return false;
  if (filters.subcategory && course.subcategory !== filters.subcategory) return false;
  if (filters.area && branchArea !== filters.area) return false;
  const effectivePrice = course.discountPrice ?? course.price;
  if (effectivePrice < filters.priceMin || effectivePrice > filters.priceMax) return false;
  if (filters.freeTrialOnly && !course.freeTrial) return false;
  if (filters.dayPart && course.dayPart !== filters.dayPart) return false;
  if (filters.format && course.format !== filters.format) return false;
  if (filters.mode && course.mode !== filters.mode) return false;
  if (filters.ageGroup && course.ageGroup !== filters.ageGroup) return false;
  if (filters.level && course.level !== filters.level && course.level !== 'all') return false;
  if (filters.language && !course.language.toLowerCase().includes(filters.language.toLowerCase())) return false;
  if (filters.certificateOnly && !course.certificate) return false;
  if (filters.minRating && course.rating < filters.minRating) return false;
  if (filters.verifiedOnly && !course.verifiedProvider) return false;
  if (filters.qargaExclusiveOnly && !course.qargaExclusive) return false;
  if (filters.availableSeatsOnly && course.seatsAvailable <= 0) return false;
  if (filters.query) {
    const q = filters.query.toLowerCase();
    const hay = `${course.title} ${course.description} ${course.subcategory}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export function filterCourses(courses: Course[], filters: FilterState) {
  return courses.filter((c) => {
    const branch = getBranch(c.branchId);
    return courseMatchesFilters(c, filters, branch?.area);
  });
}

export function courseDistanceKm(course: Course, userLoc: { lat: number; lng: number } | null) {
  if (!userLoc) return null;
  const branch = getBranch(course.branchId);
  if (!branch) return null;
  return haversineKm(userLoc.lat, userLoc.lng, branch.lat, branch.lng);
}

const DAY_PART_KEYWORDS: Record<DayPart, string[]> = {
  morning: ['səhər', 'sübh'],
  afternoon: ['gündüz', 'günorta'],
  evening: ['axşam'],
};

const FORMAT_KEYWORDS: Record<CourseFormat, string[]> = {
  online: ['onlayn', 'online', 'uzaqdan'],
  offline: ['oflayn', 'üzbəüz', 'yerində'],
  hybrid: ['hibrid', 'qarışıq'],
};

const LEVEL_KEYWORDS: Record<CourseLevel, string[]> = {
  beginner: ['başlanğıc', 'sıfırdan', 'yeni başlayan'],
  elementary: ['elementary'],
  intermediate: ['orta səviyyə', 'orta'],
  advanced: ['irəli', 'yuxarı səviyyə', 'ileri'],
  all: [],
};

export interface ParsedQuery {
  filters: Partial<FilterState>;
  matchedTerms: string[];
}

export function parseNaturalLanguage(query: string, categories: Category[], areas: Area[]): ParsedQuery {
  const q = query.toLowerCase();
  const filters: Partial<FilterState> = {};
  const matched: string[] = [];

  for (const cat of categories) {
    const names = [cat.name.az.toLowerCase(), cat.id.replace(/-/g, ' ')];
    if (names.some((n) => q.includes(n.split(' ')[0]))) {
      filters.categoryId = cat.id;
      matched.push(cat.name.az);
      break;
    }
  }

  for (const area of areas) {
    if (q.includes(area.name.toLowerCase())) {
      filters.area = area.name;
      matched.push(area.name);
      break;
    }
  }

  const priceMatch = q.match(/(\d+)\s*(azn|manat|₼)/);
  const underMatch = q.match(/(altında|aşağı|az)[^\d]*(\d+)/) ?? q.match(/(\d+)[^\d]*(altında|aşağı)/);
  if (priceMatch) {
    filters.priceMax = Number(priceMatch[1]);
    matched.push(`${priceMatch[1]} AZN-ə qədər`);
  } else if (underMatch) {
    const num = underMatch[2] && !isNaN(Number(underMatch[2])) ? underMatch[2] : underMatch[1];
    filters.priceMax = Number(num);
    matched.push(`${num} AZN-ə qədər`);
  }

  if (q.includes('pulsuz sınaq') || q.includes('pulsuz dərs') || q.includes('trial')) {
    filters.freeTrialOnly = true;
    matched.push('pulsuz sınaq dərsi');
  }

  if (q.includes('həftə sonu') || q.includes('şənbə') || q.includes('bazar')) {
    matched.push('həftə sonu');
  }

  for (const [part, words] of Object.entries(DAY_PART_KEYWORDS) as [DayPart, string[]][]) {
    if (words.some((w) => q.includes(w))) {
      filters.dayPart = part;
      matched.push(part === 'evening' ? 'axşam saatları' : part === 'morning' ? 'səhər saatları' : 'gündüz saatları');
      break;
    }
  }

  for (const [format, words] of Object.entries(FORMAT_KEYWORDS) as [CourseFormat, string[]][]) {
    if (words.some((w) => q.includes(w))) {
      filters.format = format;
      matched.push(format);
      break;
    }
  }

  for (const [level, words] of Object.entries(LEVEL_KEYWORDS) as [CourseLevel, string[]][]) {
    if (words.length && words.some((w) => q.includes(w))) {
      filters.level = level;
      matched.push(level);
      break;
    }
  }

  if (q.includes('qrup')) filters.mode = 'group';
  if (q.includes('fərdi') || q.includes('individual')) filters.mode = 'individual';
  if (q.includes('sertifikat')) filters.certificateOnly = true;
  if (q.includes('endirim') || q.includes('exclusive') || q.includes('qarğa')) filters.qargaExclusiveOnly = true;

  return { filters, matchedTerms: matched };
}
