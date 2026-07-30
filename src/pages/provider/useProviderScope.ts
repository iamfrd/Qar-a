import { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';

export function useProviderScope() {
  const currentUser = useAppStore((s) => s.currentUser);
  const courses = useAppStore((s) => s.courses);
  const branches = useAppStore((s) => s.branches);
  const registrations = useAppStore((s) => s.registrations);
  const trialReservations = useAppStore((s) => s.trialReservations);
  const reviews = useAppStore((s) => s.reviews);
  const providers = useAppStore((s) => s.providers);

  const providerId = currentUser?.providerId ?? '';
  const provider = providers.find((p) => p.id === providerId);
  const myCourses = useMemo(() => courses.filter((c) => c.providerId === providerId), [courses, providerId]);
  const myCourseIds = useMemo(() => new Set(myCourses.map((c) => c.id)), [myCourses]);
  const myBranches = useMemo(() => branches.filter((b) => b.providerId === providerId), [branches, providerId]);
  const myRegistrations = useMemo(() => registrations.filter((r) => myCourseIds.has(r.courseId)), [registrations, myCourseIds]);
  const myTrials = useMemo(() => trialReservations.filter((t) => myCourseIds.has(t.courseId)), [trialReservations, myCourseIds]);
  const myReviews = useMemo(() => reviews.filter((r) => myCourseIds.has(r.courseId)), [reviews, myCourseIds]);

  return { providerId, provider, myCourses, myBranches, myRegistrations, myTrials, myReviews };
}
