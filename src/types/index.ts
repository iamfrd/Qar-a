export type Lang = 'az' | 'en' | 'ru';

export type CourseFormat = 'offline' | 'online' | 'hybrid';
export type LessonMode = 'individual' | 'group';
export type CourseLevel = 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'all';
export type DayPart = 'morning' | 'afternoon' | 'evening';
export type UserRole = 'student' | 'provider' | 'admin';
export type ProviderPlan = 'basic' | 'professional' | 'premium';

export interface LocalizedText {
  az: string;
  en: string;
  ru: string;
}

export interface Category {
  id: string;
  icon: string;
  color: string;
  name: LocalizedText;
  subcategories: LocalizedText[];
}

export interface Branch {
  id: string;
  providerId: string;
  name: string;
  area: string;
  address: string;
  lat: number;
  lng: number;
}

export interface Provider {
  id: string;
  name: string;
  logo: string;
  verified: boolean;
  approved: boolean;
  plan: ProviderPlan;
  phone: string;
  email: string;
  about: string;
  branchIds: string[];
  createdAt: string;
}

export interface TrialSlot {
  date: string; // YYYY-MM-DD
  times: string[]; // ["10:00","14:00"]
}

export interface Teacher {
  name: string;
  bio: string;
  experienceYears: number;
}

export interface FaqItem {
  q: LocalizedText;
  a: LocalizedText;
}

export interface Course {
  id: string;
  providerId: string;
  branchId: string;
  categoryId: string;
  subcategory: string;
  title: string;
  description: string;
  photos: string[]; // emoji or gradient keys used as visual placeholders
  price: number;
  discountPrice?: number;
  registrationFee: number;
  durationWeeks: number;
  startDate: string;
  lessonDays: string[]; // ['Bazar ertəsi', ...]
  lessonTime: string; // "18:00-19:30"
  dayPart: DayPart;
  format: CourseFormat;
  mode: LessonMode;
  maxGroupSize: number;
  ageGroup: string;
  level: CourseLevel;
  language: string;
  certificate: boolean;
  seatsTotal: number;
  seatsAvailable: number;
  freeTrial: boolean;
  trialSlots: TrialSlot[];
  rating: number;
  reviewCount: number;
  verifiedProvider: boolean;
  qargaExclusive: boolean;
  promoted: boolean;
  teacher: Teacher;
  faqs: FaqItem[];
  cancellationPolicy: string;
  status: 'active' | 'pending' | 'hidden' | 'rejected';
  views: number;
  clicks: number;
  createdAt: string;
}

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  verified: boolean;
  overall: number;
  teacherQuality: number;
  content: number;
  location: number;
  priceValue: number;
  communication: number;
  scheduleAccuracy: number;
  text: string;
  photos: string[];
  providerReply?: string;
  reported: boolean;
  createdAt: string;
}

export type TrialStatus = 'pending' | 'confirmed' | 'rejected' | 'rescheduled' | 'completed' | 'cancelled';

export interface TrialReservation {
  id: string;
  refNumber: string;
  userId: string;
  courseId: string;
  branchId: string;
  date: string;
  time: string;
  note: string;
  status: TrialStatus;
  createdAt: string;
}

export type RegistrationStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
export type PaymentStatus = 'paid' | 'pay_at_center' | 'partial' | 'pending';

export interface Registration {
  id: string;
  regNumber: string;
  userId: string;
  courseId: string;
  branchId: string;
  format: CourseFormat;
  mode: LessonMode;
  studentName: string;
  studentPhone: string;
  studentAge: string;
  promoCode?: string;
  lelekUsed: number;
  price: number;
  discount: number;
  finalPrice: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  lelekEarned: number;
  status: RegistrationStatus;
  createdAt: string;
}

export interface LelekTransaction {
  id: string;
  type: 'earn' | 'spend' | 'expire';
  amount: number;
  reason: string;
  createdAt: string;
  expiresAt?: string;
}

export interface ReferralRecord {
  id: string;
  code: string;
  invitedName: string;
  status: 'pending' | 'completed';
  rewardLelek: number;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  audience: UserRole;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  kind: 'info' | 'success' | 'warning' | 'reminder';
}

export interface SupportRequest {
  id: string;
  ticketNumber: string;
  userId: string;
  courseId?: string;
  category: string;
  description: string;
  evidenceNote: string;
  status: 'open' | 'in_review' | 'resolved';
  resolution?: string;
  createdAt: string;
}

export interface SavedSearch {
  id: string;
  label: string;
  query: string;
  filters: Partial<FilterState>;
  createdAt: string;
}

export interface FilterState {
  categoryId: string | null;
  subcategory: string | null;
  area: string | null;
  priceMin: number;
  priceMax: number;
  freeTrialOnly: boolean;
  dayPart: DayPart | null;
  format: CourseFormat | null;
  mode: LessonMode | null;
  ageGroup: string | null;
  level: CourseLevel | null;
  language: string | null;
  certificateOnly: boolean;
  minRating: number;
  verifiedOnly: boolean;
  qargaExclusiveOnly: boolean;
  availableSeatsOnly: boolean;
  query: string;
}

export interface AppUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  avatarEmoji: string;
  referralCode: string;
  createdAt: string;
  location: { lat: number; lng: number } | null;
  providerId?: string;
}

export interface ChatMessage {
  id: string;
  fromRole: 'student' | 'provider';
  text: string;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  userId: string;
  providerId: string;
  courseId: string;
  subject: string;
  messages: ChatMessage[];
  updatedAt: string;
}
