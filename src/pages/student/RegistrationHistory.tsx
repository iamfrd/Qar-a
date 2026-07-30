import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { TopBar } from '../../components/TopBar';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Sheet } from '../../components/Sheet';
import { formatAZN, formatDateAz } from '../../lib/utils';
import { useToast } from '../../components/Toast';
import type { TrialStatus, RegistrationStatus } from '../../types';

const trialStatusLabel: Record<TrialStatus, { label: string; tone: 'gold' | 'teal' | 'coral' | 'neutral' }> = {
  pending: { label: 'Gözləyir', tone: 'gold' },
  confirmed: { label: 'Təsdiqləndi', tone: 'teal' },
  rejected: { label: 'Rədd edildi', tone: 'coral' },
  rescheduled: { label: 'Təxirə salındı', tone: 'gold' },
  completed: { label: 'Baş tutdu', tone: 'teal' },
  cancelled: { label: 'Ləğv edildi', tone: 'neutral' },
};
const regStatusLabel: Record<RegistrationStatus, { label: string; tone: 'gold' | 'teal' | 'coral' | 'neutral' }> = {
  pending: { label: 'Gözləyir', tone: 'gold' },
  confirmed: { label: 'Təsdiqləndi', tone: 'teal' },
  rejected: { label: 'Rədd edildi', tone: 'coral' },
  cancelled: { label: 'Ləğv edildi', tone: 'neutral' },
  completed: { label: 'Tamamlandı', tone: 'teal' },
};

export function RegistrationHistory() {
  const navigate = useNavigate();
  const { show } = useToast();
  const [tab, setTab] = useState<'reg' | 'trial'>('reg');
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);

  const registrations = useAppStore((s) => s.registrations);
  const trials = useAppStore((s) => s.trialReservations);
  const courses = useAppStore((s) => s.courses);
  const updateRegistrationStatus = useAppStore((s) => s.updateRegistrationStatus);
  const updateTrialStatus = useAppStore((s) => s.updateTrialStatus);
  const rescheduleTrial = useAppStore((s) => s.rescheduleTrial);

  const courseTitle = (id: string) => courses.find((c) => c.id === id)?.title ?? 'Kurs';
  const rescheduleTrialData = trials.find((t) => t.id === rescheduleId);
  const rescheduleCourse = rescheduleTrialData ? courses.find((c) => c.id === rescheduleTrialData.courseId) : null;

  return (
    <div className="min-h-screen bg-ink-50 pb-6">
      <TopBar title="Qeydiyyat tarixçəsi" onBack={() => navigate('/app/profile')} />
      <div className="px-4">
        <div className="flex bg-ink-100 rounded-xl p-1 mb-4">
          <button onClick={() => setTab('reg')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${tab === 'reg' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-400'}`}>Qeydiyyatlar ({registrations.length})</button>
          <button onClick={() => setTab('trial')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${tab === 'trial' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-400'}`}>Sınaq dərsləri ({trials.length})</button>
        </div>

        {tab === 'reg' && (
          registrations.length === 0 ? <EmptyState title="Hələ qeydiyyatın yoxdur" /> : (
            <div className="flex flex-col gap-3">
              {registrations.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-ink-100 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-ink-900">{courseTitle(r.courseId)}</p>
                      <p className="text-xs text-ink-400">№{r.regNumber} • {formatDateAz(r.createdAt)}</p>
                    </div>
                    <Badge tone={regStatusLabel[r.status].tone}>{regStatusLabel[r.status].label}</Badge>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-ink-500">Yekun ödəniş</span>
                    <span className="font-semibold text-ink-900">{formatAZN(r.finalPrice)}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" fullWidth onClick={() => navigate(`/app/course/${r.courseId}`)}>Kursa bax</Button>
                    {r.status === 'confirmed' && (
                      <Button size="sm" variant="ghost" fullWidth onClick={() => { updateRegistrationStatus(r.id, 'cancelled'); show('Qeydiyyat ləğv edildi', 'info'); }}>Ləğv et</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'trial' && (
          trials.length === 0 ? <EmptyState title="Hələ sınaq dərsi rezervasiyan yoxdur" /> : (
            <div className="flex flex-col gap-3">
              {trials.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl border border-ink-100 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-ink-900">{courseTitle(t.courseId)}</p>
                      <p className="text-xs text-ink-400">№{t.refNumber} • {formatDateAz(t.date)}, {t.time}</p>
                    </div>
                    <Badge tone={trialStatusLabel[t.status].tone}>{trialStatusLabel[t.status].label}</Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" fullWidth onClick={() => navigate(`/app/course/${t.courseId}`)}>Kursa bax</Button>
                    {(t.status === 'pending' || t.status === 'confirmed') && (
                      <>
                        <Button size="sm" variant="ghost" fullWidth onClick={() => setRescheduleId(t.id)}>Təxirə sal</Button>
                        <Button size="sm" variant="ghost" fullWidth onClick={() => { updateTrialStatus(t.id, 'cancelled'); show('Rezervasiya ləğv edildi', 'info'); }}>Ləğv et</Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <Sheet open={!!rescheduleId} onClose={() => setRescheduleId(null)} title="Sınaq dərsini təxirə sal">
        {rescheduleCourse && (
          <div className="flex flex-col gap-2">
            {rescheduleCourse.trialSlots.flatMap((slot) => slot.times.map((tm) => ({ date: slot.date, time: tm }))).map((opt) => (
              <button
                key={`${opt.date}-${opt.time}`}
                onClick={() => { rescheduleTrial(rescheduleId!, opt.date, opt.time); setRescheduleId(null); show('Yeni tarix seçildi', 'success'); }}
                className="text-left px-4 py-3 rounded-xl border border-ink-200 hover:border-ink-900"
              >
                📅 {formatDateAz(opt.date)} • {opt.time}
              </button>
            ))}
          </div>
        )}
      </Sheet>
    </div>
  );
}
