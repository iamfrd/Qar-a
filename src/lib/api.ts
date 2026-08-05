/**
 * API klienti.
 *
 * Bütün autoritar məlumat buradan gəlir. UI komponentləri statik seed
 * fayllarından (`src/data/mockData.ts`) birbaşa oxumamalıdır.
 *
 * Sessiya httpOnly cookie ilə saxlanılır — token JavaScript-dən görünmür,
 * rol və icazələr brauzerdə saxlanılmır.
 */

export interface ApiErrorBody {
  error: { code: string; message: string };
  requestId?: string;
}

export class ApiError extends Error {
  status: number;
  code: string;
  requestId?: string;

  constructor(status: number, code: string, message: string, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path.startsWith('/api') ? path : `/api${path}`, {
    credentials: 'same-origin',
    headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
    ...init,
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const body = json as ApiErrorBody;
    throw new ApiError(
      res.status,
      body?.error?.code ?? 'unknown',
      body?.error?.message ?? 'Gözlənilməz xəta baş verdi.',
      body?.requestId,
    );
  }
  return json as T;
}

const qs = (params: Record<string, unknown>) => {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '' || v === false) continue;
    s.set(k, String(v === true ? 1 : v));
  }
  const str = s.toString();
  return str ? `?${str}` : '';
};

// ------------------------------------------------------------------ tiplər

export interface OfferingSummary {
  offeringId: string;
  courseId: string;
  cohortId: string | null;
  title: string;
  description: string;
  subcategory: string;
  categoryId: string;
  provider: { id: string; name: string; verified: boolean };
  branch: { id: string; name: string; address: string; areaId: string | null; areaName: string | null; lat: number; lng: number };
  format: 'offline' | 'online' | 'hybrid';
  mode: 'individual' | 'group';
  level: string;
  language: string;
  ageGroup: string;
  certificate: boolean;
  priceMinor: number;
  discountPriceMinor: number | null;
  effectivePriceMinor: number;
  registrationFeeMinor: number;
  teacher: { name: string; bio: string; experienceYears: number };
  schedule: { startDate: string; durationWeeks: number; lessonDays: string[]; lessonTime: string; dayPart: string };
  seatsTotal: number;
  seatsAvailable: number;
  freeTrial: boolean;
  openTrialSlots: number;
  rating: number;
  reviewCount: number;
  qargaExclusive: boolean;
  /** Sponsorlu yerləşdirmə — UI-da mütləq görünən etiketlə göstərilməlidir. */
  promoted: boolean;
  lastConfirmedAt: string | null;
  cancellationPolicy: string;
  distanceKm: number | null;
  score?: number;
  scoreParts?: Record<string, number>;
}

export interface TrialSlot {
  id: string;
  startsAt: string;
  durationMin: number;
  capacity: number;
  booked: number;
  remaining: number;
}

export interface OfferingDetail extends OfferingSummary {
  trialSlots: TrialSlot[];
  reviews: Array<{ id: string; overall: number; text: string; createdAt: string; providerReply: string | null; userName: string }>;
  otherBranches: Array<{ offeringId: string; branchName: string; areaName: string | null; effectivePriceMinor: number }>;
}

export interface SearchResult {
  items: OfferingSummary[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}

export interface SearchFilters {
  q?: string;
  categoryId?: string;
  subcategory?: string;
  providerId?: string;
  areaId?: string;
  format?: string;
  mode?: string;
  level?: string;
  ageGroup?: string;
  language?: string;
  dayPart?: string;
  startsAfter?: string;
  /** Qəpiklə. */
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
  radiusKm?: number;
  certificate?: boolean;
  verifiedOnly?: boolean;
  qargaExclusiveOnly?: boolean;
  availableSeatsOnly?: boolean;
  freeTrialOnly?: boolean;
  sort?: 'relevance' | 'price' | 'rating' | 'distance' | 'startDate';
  page?: number;
  perPage?: number;
  bounds?: { south: number; west: number; north: number; east: number };
  lat?: number;
  lng?: number;
}

export interface CategoryInfo {
  id: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  icon: string;
  color: string;
}

export interface AreaInfo {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface SessionUser {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  role: string;
  referralCode: string;
  providerIds: string[];
}

// ------------------------------------------------------------------ metodlar

export const api = {
  health: () => request<{ ok: boolean }>('/health'),

  areas: () => request<{ areas: AreaInfo[] }>('/areas'),
  categories: () => request<{ categories: CategoryInfo[] }>('/categories'),

  searchOfferings: (f: SearchFilters = {}) => {
    const { bounds, ...rest } = f;
    return request<SearchResult>(`/offerings${qs({ ...rest, ...(bounds ?? {}) })}`);
  },
  offering: (offeringId: string, loc?: { lat: number; lng: number }) =>
    request<OfferingDetail>(`/offerings/${encodeURIComponent(offeringId)}${qs(loc ?? {})}`),

  providers: () => request<{ providers: Array<{ id: string; name: string; logo: string; about: string; plan: string; verificationStatus: string }> }>('/providers'),
  provider: (id: string) => request<Record<string, unknown>>(`/providers/${encodeURIComponent(id)}`),

  // kimlik
  requestOtp: (phone: string) => request<{ sent: boolean; expiresInSec: number; devCode?: string }>('/auth/otp', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyOtp: (phone: string, code: string) => request<{ user: SessionUser }>('/auth/verify', { method: 'POST', body: JSON.stringify({ phone, code }) }),
  logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
  me: () => request<{ user: SessionUser | null }>('/auth/me'),
  updateMe: (patch: { name?: string; email?: string }) => request<{ user: SessionUser }>('/auth/me', { method: 'PATCH', body: JSON.stringify(patch) }),

  // sınaq dərsi
  bookTrial: (slotId: string, note = '', idempotencyKey?: string) =>
    request<{ reservation: Record<string, unknown>; replayed: boolean }>('/trials', { method: 'POST', body: JSON.stringify({ slotId, note, idempotencyKey }) }),
  myTrials: () => request<{ trials: Array<Record<string, unknown>> }>('/trials'),
  trialHistory: (id: string) => request<{ history: Array<{ status: string; note: string; at: string }> }>(`/trials/${encodeURIComponent(id)}/history`),
  setTrialStatus: (id: string, status: string, extra: { note?: string; proposedSlotId?: string } = {}) =>
    request<Record<string, unknown>>(`/trials/${encodeURIComponent(id)}/status`, { method: 'POST', body: JSON.stringify({ status, ...extra }) }),

  // qeydiyyat
  createRegistration: (input: { cohortId: string; studentName: string; studentPhone: string; studentAge?: string; promoCode?: string; idempotencyKey?: string }) =>
    request<{ registration: Record<string, unknown>; replayed: boolean }>('/registrations', { method: 'POST', body: JSON.stringify(input) }),
  myRegistrations: () => request<{ registrations: Array<Record<string, unknown>> }>('/registrations'),
  registrationHistory: (id: string) => request<{ history: Array<{ status: string; note: string; at: string }> }>(`/registrations/${encodeURIComponent(id)}/history`),
  setRegistrationStatus: (id: string, status: string, note = '') =>
    request<Record<string, unknown>>(`/registrations/${encodeURIComponent(id)}/status`, { method: 'POST', body: JSON.stringify({ status, note }) }),

  // rəy
  canReview: (courseId: string) => request<{ canReview: boolean }>(`/courses/${encodeURIComponent(courseId)}/can-review`),
  submitReview: (courseId: string, ratings: Record<string, number>, text = '') =>
    request<Record<string, unknown>>('/reviews', { method: 'POST', body: JSON.stringify({ courseId, ratings, text }) }),

  // provayder
  providerTrials: (providerId: string) => request<{ trials: Array<Record<string, unknown>> }>(`/provider/${encodeURIComponent(providerId)}/trials`),
  providerRegistrations: (providerId: string) => request<{ registrations: Array<Record<string, unknown>> }>(`/provider/${encodeURIComponent(providerId)}/registrations`),

  // admin
  adminOverview: () => request<Record<string, number>>('/admin/overview'),
  adminAudit: (limit = 50) => request<{ entries: Array<Record<string, unknown>> }>(`/admin/audit${qs({ limit })}`),
};

/** Qəpik → görüntü üçün AZN. Hesablamalar həmişə qəpiklə aparılır. */
export const minorToAzn = (minor: number) => minor / 100;
export const formatMinor = (minor: number) => `${(minor / 100).toFixed(minor % 100 === 0 ? 0 : 2)} ₼`;
