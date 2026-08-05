/**
 * `FilterState` (UI-da saxlanılan, AZN vahidiylə) ilə `SearchFilters`
 * (`api.ts`, qəpiklə) arasında körpü.
 *
 * Diqqət: FilterState.priceMin/priceMax AZN-lədir (məs. 150), amma backend
 * qəpiklə gözləyir (məs. 15000). Bu fərqi unudub birbaşa göndərmək filtri
 * səssizcə sındırar — ona görə çevrilmə yalnız burda, bir yerdə olur.
 */
import type { FilterState } from '../types';
import type { AreaInfo, SearchFilters } from './api';

export function toSearchFilters(
  filters: Partial<FilterState>,
  areas: AreaInfo[] = [],
  extra: Partial<SearchFilters> = {},
): SearchFilters {
  const areaId = filters.area ? areas.find((a) => a.name === filters.area)?.id : undefined;
  return {
    q: filters.query || undefined,
    categoryId: filters.categoryId ?? undefined,
    subcategory: filters.subcategory ?? undefined,
    areaId,
    format: filters.format ?? undefined,
    mode: filters.mode ?? undefined,
    level: filters.level ?? undefined,
    ageGroup: filters.ageGroup ?? undefined,
    language: filters.language ?? undefined,
    dayPart: filters.dayPart ?? undefined,
    // AZN → qəpik
    priceMin: filters.priceMin && filters.priceMin > 0 ? Math.round(filters.priceMin * 100) : undefined,
    priceMax: filters.priceMax != null && filters.priceMax < 400 ? Math.round(filters.priceMax * 100) : undefined,
    minRating: filters.minRating || undefined,
    certificate: filters.certificateOnly || undefined,
    verifiedOnly: filters.verifiedOnly || undefined,
    qargaExclusiveOnly: filters.qargaExclusiveOnly || undefined,
    availableSeatsOnly: filters.availableSeatsOnly || undefined,
    freeTrialOnly: filters.freeTrialOnly || undefined,
    perPage: 60,
    ...extra,
  };
}
