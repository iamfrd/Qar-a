import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppUser, Course, Provider, Branch, Category, Review, TrialReservation, TrialStatus,
  Registration, LelekTransaction, ReferralRecord, NotificationItem, SupportRequest,
  SavedSearch, MessageThread, ChatMessage, UserRole, FilterState, CourseFormat, LessonMode,
} from '../types';
import { courses as seedCourses, providers as seedProviders, branches as seedBranches, reviews as seedReviews } from '../data/mockData';
import { categories as seedCategories } from '../data/categories';
import { randomRef, uid } from '../lib/utils';

const demoStudent: AppUser = {
  id: 'u-student-demo', name: 'Vüsal Məmmədov', phone: '+994 55 111 22 33', email: 'vusal@example.com',
  role: 'student', avatarEmoji: '🧑', referralCode: 'VUSAL2026', createdAt: '2026-01-15', location: null,
};
const demoProvider: AppUser = {
  id: 'u-provider-demo', name: 'LinguaBaku Admin', phone: '+994 50 123 45 67', email: 'info@linguabaku.az',
  role: 'provider', avatarEmoji: '🏢', referralCode: 'LINGUA01', createdAt: '2024-02-10', location: null, providerId: 'p-lingua',
};
const demoAdmin: AppUser = {
  id: 'u-admin-demo', name: 'Platforma Admini', phone: '+994 12 000 00 00', email: 'admin@qarga.az',
  role: 'admin', avatarEmoji: '🛡️', referralCode: 'ADMIN01', createdAt: '2023-01-01', location: null,
};

export const defaultFilters: FilterState = {
  categoryId: null, subcategory: null, area: null, priceMin: 0, priceMax: 400,
  freeTrialOnly: false, dayPart: null, format: null, mode: null, ageGroup: null,
  level: null, language: null, certificateOnly: false, minRating: 0, verifiedOnly: false,
  qargaExclusiveOnly: false, availableSeatsOnly: false, query: '',
};

interface AppState {
  currentUser: AppUser | null;
  users: AppUser[];
  courses: Course[];
  providers: Provider[];
  branches: Branch[];
  categories: Category[];
  reviews: Review[];
  favorites: string[];
  compareIds: string[];
  trialReservations: TrialReservation[];
  registrations: Registration[];
  lelekTransactions: LelekTransaction[];
  referrals: ReferralRecord[];
  notifications: NotificationItem[];
  supportRequests: SupportRequest[];
  savedSearches: SavedSearch[];
  messageThreads: MessageThread[];
  filters: FilterState;
  hasOnboarded: boolean;
  hasLocationPermission: boolean;

  // auth
  loginAsRole: (role: UserRole) => void;
  registerStudent: (name: string, phone: string, email: string) => void;
  logout: () => void;
  setHasOnboarded: (v: boolean) => void;
  setLocationPermission: (v: boolean, coords?: { lat: number; lng: number }) => void;

  // filters
  setFilters: (patch: Partial<FilterState>) => void;
  resetFilters: () => void;

  // favorites & compare
  toggleFavorite: (courseId: string) => void;
  toggleCompare: (courseId: string) => { ok: boolean; message?: string };
  clearCompare: () => void;

  // trial
  bookTrial: (input: { courseId: string; branchId: string; date: string; time: string; note: string }) => TrialReservation;
  updateTrialStatus: (id: string, status: TrialStatus) => void;
  rescheduleTrial: (id: string, date: string, time: string) => void;

  // registration
  createRegistration: (input: {
    courseId: string; branchId: string; format: CourseFormat; mode: LessonMode;
    studentName: string; studentPhone: string; studentAge: string;
    promoCode?: string; lelekUsed: number; paymentMethod: string;
  }) => Registration;
  updateRegistrationStatus: (id: string, status: Registration['status']) => void;

  // reviews
  addReview: (courseId: string, ratings: { overall: number; teacherQuality: number; content: number; location: number; priceValue: number; communication: number; scheduleAccuracy: number }, text: string) => { ok: boolean; message?: string };
  respondToReview: (reviewId: string, reply: string) => void;
  reportReview: (reviewId: string) => void;
  clearReviewReport: (reviewId: string) => void;
  removeReview: (reviewId: string) => void;
  canReview: (courseId: string) => boolean;

  // lelek
  addLelek: (type: 'earn' | 'spend' | 'expire', amount: number, reason: string) => void;
  lelekBalance: () => number;

  // referral
  addReferral: (invitedName: string) => void;
  completeReferral: (id: string) => void;

  // notifications
  addNotification: (audience: UserRole, title: string, body: string, kind?: NotificationItem['kind']) => void;
  markNotificationRead: (id: string) => void;

  // support
  createSupportRequest: (input: { category: string; description: string; evidenceNote: string; courseId?: string }) => SupportRequest;
  resolveSupportRequest: (id: string, resolution: string) => void;

  // saved searches
  addSavedSearch: (label: string, query: string, filters: Partial<FilterState>) => void;
  removeSavedSearch: (id: string) => void;

  // messages
  sendMessage: (input: { courseId: string; providerId: string; subject: string; text: string; fromRole: 'student' | 'provider'; threadId?: string }) => void;

  // provider actions
  addCourse: (course: Omit<Course, 'id' | 'rating' | 'reviewCount' | 'views' | 'clicks' | 'status' | 'createdAt'>) => void;
  updateCourse: (id: string, patch: Partial<Course>) => void;
  setCourseStatus: (id: string, status: Course['status']) => void;
  addBranch: (branch: Omit<Branch, 'id'>) => void;

  // admin actions
  approveProvider: (id: string) => void;
  rejectProvider: (id: string) => void;
  addCategory: (cat: Category) => void;
  hideCategory: (id: string) => void;
  suspendUser: (id: string) => void;

  resetDemoData: () => void;
}

const initialDynamicState = {
  currentUser: null as AppUser | null,
  users: [demoStudent, demoProvider, demoAdmin],
  courses: seedCourses,
  providers: seedProviders,
  branches: seedBranches,
  categories: seedCategories,
  reviews: seedReviews,
  favorites: [] as string[],
  compareIds: [] as string[],
  trialReservations: [] as TrialReservation[],
  registrations: [] as Registration[],
  lelekTransactions: [] as LelekTransaction[],
  referrals: [] as ReferralRecord[],
  notifications: [] as NotificationItem[],
  supportRequests: [] as SupportRequest[],
  savedSearches: [] as SavedSearch[],
  messageThreads: [] as MessageThread[],
  filters: defaultFilters,
  hasOnboarded: false,
  hasLocationPermission: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialDynamicState,

      loginAsRole: (role) => {
        const map: Record<UserRole, AppUser> = { student: demoStudent, provider: demoProvider, admin: demoAdmin };
        const existing = get().users.find((u) => u.role === role && u.id === map[role].id) ?? map[role];
        set({ currentUser: existing });
      },

      registerStudent: (name, phone, email) => {
        const id = uid();
        const user: AppUser = {
          id, name, phone, email, role: 'student', avatarEmoji: '🙂',
          referralCode: `${name.split(' ')[0]?.toUpperCase().slice(0, 6) || 'QARGA'}${Math.floor(Math.random() * 900 + 100)}`,
          createdAt: new Date().toISOString().slice(0, 10), location: null,
        };
        set((s) => ({ users: [...s.users, user], currentUser: user }));
        get().addLelek('earn', 50, 'Xoş gəldin bonusu');
        get().addNotification('student', 'Xoş gəlmisən, Qarğaya! 🐦‍⬛', 'Hesabın yaradıldı və 50 Lələk xalı qazandın.', 'success');
      },

      logout: () => set({ currentUser: null }),
      setHasOnboarded: (v) => set({ hasOnboarded: v }),
      setLocationPermission: (v, coords) => {
        set({ hasLocationPermission: v });
        if (coords && get().currentUser) {
          set((s) => ({ currentUser: s.currentUser ? { ...s.currentUser, location: coords } : s.currentUser }));
        }
      },

      setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
      resetFilters: () => set({ filters: defaultFilters }),

      toggleFavorite: (courseId) => set((s) => ({
        favorites: s.favorites.includes(courseId) ? s.favorites.filter((id) => id !== courseId) : [...s.favorites, courseId],
      })),

      toggleCompare: (courseId) => {
        const s = get();
        if (s.compareIds.includes(courseId)) {
          set({ compareIds: s.compareIds.filter((id) => id !== courseId) });
          return { ok: true };
        }
        if (s.compareIds.length >= 3) {
          return { ok: false, message: 'Eyni anda maksimum 3 kursu müqayisə edə bilərsiniz.' };
        }
        set({ compareIds: [...s.compareIds, courseId] });
        return { ok: true };
      },
      clearCompare: () => set({ compareIds: [] }),

      bookTrial: ({ courseId, branchId, date, time, note }) => {
        const user = get().currentUser;
        const reservation: TrialReservation = {
          id: uid(), refNumber: randomRef('SN'), userId: user?.id ?? 'guest', courseId, branchId, date, time, note,
          status: 'pending', createdAt: new Date().toISOString(),
        };
        set((s) => ({ trialReservations: [reservation, ...s.trialReservations] }));
        get().addNotification('student', 'Sınaq dərsi rezervasiyası qəbul edildi', `${date} tarixinə, saat ${time} üçün müraciətiniz göndərildi.`, 'info');
        const course = get().courses.find((c) => c.id === courseId);
        if (course) get().addNotification('provider', 'Yeni sınaq dərsi tələbi', `${course.title} üçün yeni sınaq dərsi tələbi var.`, 'info');
        return reservation;
      },
      updateTrialStatus: (id, status) => {
        set((s) => ({ trialReservations: s.trialReservations.map((t) => (t.id === id ? { ...t, status } : t)) }));
        if (status === 'confirmed') get().addNotification('student', 'Sınaq dərsi təsdiqləndi', 'Sınaq dərsiniz təsdiqləndi, xatırlatma alacaqsınız.', 'success');
        if (status === 'rejected') get().addNotification('student', 'Sınaq dərsi ləğv edildi', 'Təəssüf ki, kurs mərkəzi bu sınaq dərsini təsdiqləyə bilmədi.', 'warning');
      },
      rescheduleTrial: (id, date, time) => {
        set((s) => ({ trialReservations: s.trialReservations.map((t) => (t.id === id ? { ...t, date, time, status: 'rescheduled' } : t)) }));
        get().addNotification('student', 'Sınaq dərsi təxirə salındı', `Yeni tarix: ${date}, saat ${time}.`, 'info');
      },

      createRegistration: (input) => {
        const course = get().courses.find((c) => c.id === input.courseId);
        const basePrice = course?.discountPrice ?? course?.price ?? 0;
        const promoDiscount = input.promoCode?.trim().toUpperCase() === 'QARGA10' ? Math.round(basePrice * 0.1) : 0;
        const lelekDiscount = Math.min(input.lelekUsed, basePrice - promoDiscount, get().lelekBalance());
        const discount = promoDiscount + lelekDiscount;
        const finalPrice = Math.max(0, basePrice - discount);
        const lelekEarned = Math.round(finalPrice * 0.05);
        const reg: Registration = {
          id: uid(), regNumber: randomRef('QR'), userId: get().currentUser?.id ?? 'guest', courseId: input.courseId,
          branchId: input.branchId, format: input.format, mode: input.mode, studentName: input.studentName,
          studentPhone: input.studentPhone, studentAge: input.studentAge, promoCode: input.promoCode, lelekUsed: lelekDiscount,
          price: basePrice, discount, finalPrice, paymentMethod: input.paymentMethod,
          // Brauzer heç vaxt ödənişi "paid" kimi işarələmir. Real ödəniş yalnız
          // server tərəfdə təsdiqlənmiş webhook-dan sonra bu statusu ala bilər.
          paymentStatus: 'pay_at_center',
          lelekEarned, status: 'confirmed', createdAt: new Date().toISOString(),
        };
        set((s) => ({
          registrations: [reg, ...s.registrations],
          courses: s.courses.map((c) => (c.id === input.courseId ? { ...c, seatsAvailable: Math.max(0, c.seatsAvailable - 1) } : c)),
        }));
        if (lelekDiscount > 0) get().addLelek('spend', lelekDiscount, `${course?.title ?? 'Kurs'} qeydiyyatında endirim`);
        get().addLelek('earn', lelekEarned, `${course?.title ?? 'Kurs'} qeydiyyatı üçün bonus`);
        get().addNotification('student', 'Qeydiyyat təsdiqləndi', `${course?.title ?? ''} kursuna qeydiyyatınız qəbul edildi. Qeydiyyat №${reg.regNumber}`, 'success');
        if (course) get().addNotification('provider', 'Yeni qeydiyyat', `${course.title} üçün yeni tələbə qeydiyyatı: ${input.studentName}`, 'info');
        return reg;
      },
      updateRegistrationStatus: (id, status) => {
        set((s) => ({ registrations: s.registrations.map((r) => (r.id === id ? { ...r, status } : r)) }));
      },

      canReview: (courseId) => {
        const uidCur = get().currentUser?.id;
        if (!uidCur) return false;
        const hasReg = get().registrations.some((r) => r.userId === uidCur && r.courseId === courseId);
        const hasTrial = get().trialReservations.some((t) => t.userId === uidCur && t.courseId === courseId);
        const alreadyReviewed = get().reviews.some((r) => r.userId === uidCur && r.courseId === courseId);
        return (hasReg || hasTrial) && !alreadyReviewed;
      },

      addReview: (courseId, ratings, text) => {
        if (!get().canReview(courseId)) {
          return { ok: false, message: 'Yalnız sınaq dərsi və ya qeydiyyatı olan istifadəçilər rəy yaza bilər.' };
        }
        const user = get().currentUser!;
        const review: Review = {
          id: uid(), courseId, userId: user.id, userName: user.name, verified: true, ...ratings, text, photos: [], reported: false,
          createdAt: new Date().toISOString(),
        };
        set((s) => {
          const updatedReviews = [review, ...s.reviews];
          const courseReviews = updatedReviews.filter((r) => r.courseId === courseId);
          const avg = courseReviews.reduce((sum, r) => sum + r.overall, 0) / courseReviews.length;
          return {
            reviews: updatedReviews,
            courses: s.courses.map((c) => (c.id === courseId ? { ...c, rating: Math.round(avg * 10) / 10, reviewCount: courseReviews.length } : c)),
          };
        });
        get().addLelek('earn', 15, 'Təsdiqlənmiş rəy üçün bonus');
        get().addNotification('provider', 'Yeni rəy', `${user.name} kurs haqqında rəy yazdı.`, 'info');
        return { ok: true };
      },
      respondToReview: (reviewId, reply) => {
        set((s) => ({ reviews: s.reviews.map((r) => (r.id === reviewId ? { ...r, providerReply: reply } : r)) }));
      },
      reportReview: (reviewId) => {
        set((s) => ({ reviews: s.reviews.map((r) => (r.id === reviewId ? { ...r, reported: true } : r)) }));
      },
      clearReviewReport: (reviewId) => {
        set((s) => ({ reviews: s.reviews.map((r) => (r.id === reviewId ? { ...r, reported: false } : r)) }));
      },
      removeReview: (reviewId) => {
        set((s) => {
          const target = s.reviews.find((r) => r.id === reviewId);
          const updatedReviews = s.reviews.filter((r) => r.id !== reviewId);
          if (!target) return { reviews: updatedReviews };
          const courseReviews = updatedReviews.filter((r) => r.courseId === target.courseId);
          const avg = courseReviews.length ? courseReviews.reduce((sum, r) => sum + r.overall, 0) / courseReviews.length : 0;
          return {
            reviews: updatedReviews,
            courses: s.courses.map((c) => (c.id === target.courseId ? { ...c, rating: Math.round(avg * 10) / 10, reviewCount: courseReviews.length } : c)),
          };
        });
      },

      addLelek: (type, amount, reason) => {
        const tx: LelekTransaction = {
          id: uid(), type, amount, reason, createdAt: new Date().toISOString(),
          expiresAt: type === 'earn' ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString().slice(0, 10) : undefined,
        };
        set((s) => ({ lelekTransactions: [tx, ...s.lelekTransactions] }));
      },
      lelekBalance: () => {
        return get().lelekTransactions.reduce((sum, t) => sum + (t.type === 'earn' ? t.amount : -t.amount), 0);
      },

      addReferral: (invitedName) => {
        const user = get().currentUser;
        const rec: ReferralRecord = { id: uid(), code: user?.referralCode ?? 'QARGA', invitedName, status: 'pending', rewardLelek: 30, createdAt: new Date().toISOString() };
        set((s) => ({ referrals: [rec, ...s.referrals] }));
      },
      completeReferral: (id) => {
        set((s) => ({ referrals: s.referrals.map((r) => (r.id === id ? { ...r, status: 'completed' } : r)) }));
        const rec = get().referrals.find((r) => r.id === id);
        if (rec) {
          get().addLelek('earn', rec.rewardLelek, `Dəvət etdiyiniz ${rec.invitedName} qeydiyyatdan keçdi`);
          get().addNotification('student', 'Dəvət mükafatı qazandın!', `${rec.invitedName} qeydiyyatdan keçdi, ${rec.rewardLelek} Lələk qazandın.`, 'success');
        }
      },

      addNotification: (audience, title, body, kind = 'info') => {
        const n: NotificationItem = { id: uid(), audience, title, body, read: false, createdAt: new Date().toISOString(), kind };
        set((s) => ({ notifications: [n, ...s.notifications] }));
      },
      markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),

      createSupportRequest: (input) => {
        const req: SupportRequest = {
          id: uid(), ticketNumber: randomRef('SP'), userId: get().currentUser?.id ?? 'guest', courseId: input.courseId,
          category: input.category, description: input.description, evidenceNote: input.evidenceNote, status: 'open', createdAt: new Date().toISOString(),
        };
        set((s) => ({ supportRequests: [req, ...s.supportRequests] }));
        get().addNotification('student', 'Dəstək müraciəti qeydə alındı', `Bilet №${req.ticketNumber}. Komandamız tezliklə sizinlə əlaqə saxlayacaq.`, 'info');
        return req;
      },
      resolveSupportRequest: (id, resolution) => {
        set((s) => ({ supportRequests: s.supportRequests.map((r) => (r.id === id ? { ...r, status: 'resolved', resolution } : r)) }));
        const req = get().supportRequests.find((r) => r.id === id);
        if (req) get().addNotification('student', 'Dəstək müraciətiniz həll olundu', resolution, 'success');
      },

      addSavedSearch: (label, query, filters) => {
        const s: SavedSearch = { id: uid(), label, query, filters, createdAt: new Date().toISOString() };
        set((st) => ({ savedSearches: [s, ...st.savedSearches] }));
      },
      removeSavedSearch: (id) => set((s) => ({ savedSearches: s.savedSearches.filter((x) => x.id !== id) })),

      sendMessage: ({ courseId, providerId, subject, text, fromRole, threadId }) => {
        const user = get().currentUser;
        const msg: ChatMessage = { id: uid(), fromRole, text, createdAt: new Date().toISOString() };
        set((s) => {
          if (threadId) {
            return { messageThreads: s.messageThreads.map((t) => (t.id === threadId ? { ...t, messages: [...t.messages, msg], updatedAt: msg.createdAt } : t)) };
          }
          const thread: MessageThread = { id: uid(), userId: user?.id ?? 'guest', providerId, courseId, subject, messages: [msg], updatedAt: msg.createdAt };
          return { messageThreads: [thread, ...s.messageThreads] };
        });
        get().addNotification('provider', 'Yeni mesaj', subject, 'info');
      },

      addCourse: (course) => {
        const provider = get().currentUser;
        const newCourse: Course = {
          ...course, id: uid(), rating: 0, reviewCount: 0, views: 0, clicks: 0,
          status: 'pending', createdAt: new Date().toISOString(),
        };
        set((s) => ({ courses: [newCourse, ...s.courses] }));
        get().addNotification('admin', 'Yeni kurs təsdiq gözləyir', `${newCourse.title} admin təsdiqinə göndərildi.`, 'info');
        void provider;
      },
      updateCourse: (id, patch) => {
        set((s) => ({ courses: s.courses.map((c) => (c.id === id ? { ...c, ...patch, status: 'pending' } : c)) }));
        get().addNotification('admin', 'Kurs redaktəsi təsdiq gözləyir', `Kurs yeniləndi və yenidən yoxlama gözləyir.`, 'info');
      },
      setCourseStatus: (id, status) => set((s) => ({ courses: s.courses.map((c) => (c.id === id ? { ...c, status } : c)) })),
      addBranch: (branch) => {
        const b: Branch = { ...branch, id: uid() };
        set((s) => ({ branches: [...s.branches, b] }));
      },

      approveProvider: (id) => {
        set((s) => ({ providers: s.providers.map((p) => (p.id === id ? { ...p, approved: true } : p)) }));
        get().addNotification('provider', 'Hesabınız təsdiqləndi', 'Qarğa platformasında biznes hesabınız təsdiqləndi.', 'success');
      },
      rejectProvider: (id) => set((s) => ({ providers: s.providers.map((p) => (p.id === id ? { ...p, approved: false } : p)) })),

      addCategory: (cat) => set((s) => ({ categories: [...s.categories, cat] })),
      hideCategory: (id) => set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      suspendUser: (id) => set((s) => ({ users: s.users.filter((u) => u.id !== id) })),

      resetDemoData: () => set({ ...initialDynamicState }),
    }),
    {
      name: 'qarga-storage',
      version: 1,
    }
  )
);
