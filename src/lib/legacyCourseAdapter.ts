/**
 * Müvəqqəti körpü: `CourseCard` / `CourseMap` indi `api.ts`-in `OfferingSummary`
 * formasını gözləyir (kəşf axını real backend-ə keçdi). Amma bəzi ekranlar
 * (CrowAssistant, Favorites, CourseDetail) hələ köhnə `Course` mock formasını
 * `useAppStore`-dan oxuyur — onların öz backend miqrasiyası növbəti mərhələdədir.
 *
 * Bu fayl YALNız o ekranların bu paylaşılan komponentlərə ötürdüyü tək obyekti
 * çevirir ki, build sınmasın. Ekranların öz məlumat mənbəyini DƏYİŞMİR.
 */
import type { Category, Course } from '../types';
import { getBranch } from '../data/mockData';
import type { CategoryInfo, OfferingSummary } from './api';

export function courseToOfferingSummary(course: Course): OfferingSummary {
  const branch = getBranch(course.branchId);
  return {
    offeringId: course.id,
    courseId: course.id,
    cohortId: null,
    title: course.title,
    description: course.description,
    subcategory: course.subcategory,
    categoryId: course.categoryId,
    provider: { id: course.providerId, name: '', verified: course.verifiedProvider },
    branch: {
      id: course.branchId,
      name: branch?.name ?? '',
      address: branch?.address ?? '',
      areaId: null,
      areaName: branch?.area ?? null,
      lat: branch?.lat ?? 0,
      lng: branch?.lng ?? 0,
    },
    format: course.format,
    mode: course.mode,
    level: course.level,
    language: course.language,
    ageGroup: course.ageGroup,
    certificate: course.certificate,
    priceMinor: Math.round(course.price * 100),
    discountPriceMinor: course.discountPrice != null ? Math.round(course.discountPrice * 100) : null,
    effectivePriceMinor: Math.round((course.discountPrice ?? course.price) * 100),
    registrationFeeMinor: Math.round(course.registrationFee * 100),
    teacher: course.teacher,
    schedule: {
      startDate: course.startDate,
      durationWeeks: course.durationWeeks,
      lessonDays: course.lessonDays,
      lessonTime: course.lessonTime,
      dayPart: course.dayPart,
    },
    seatsTotal: course.seatsTotal,
    seatsAvailable: course.seatsAvailable,
    freeTrial: course.freeTrial,
    openTrialSlots: course.trialSlots.length,
    rating: course.rating,
    reviewCount: course.reviewCount,
    qargaExclusive: course.qargaExclusive,
    promoted: course.promoted,
    lastConfirmedAt: null,
    cancellationPolicy: course.cancellationPolicy,
    distanceKm: null,
  };
}

export function mockCategoryToInfo(category?: Category): CategoryInfo | undefined {
  if (!category) return undefined;
  return {
    id: category.id,
    nameAz: category.name.az,
    nameEn: category.name.en,
    nameRu: category.name.ru,
    icon: category.icon,
    color: category.color,
  };
}
