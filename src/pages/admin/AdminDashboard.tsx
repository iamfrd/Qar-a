import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { formatAZN } from '../../lib/utils';
import { Badge } from '../../components/Badge';
import { Icon } from '../../components/Icon';

export function AdminDashboard() {
  const navigate = useNavigate();
  const providers = useAppStore((s) => s.providers);
  const courses = useAppStore((s) => s.courses);
  const registrations = useAppStore((s) => s.registrations);
  const trials = useAppStore((s) => s.trialReservations);
  const supportRequests = useAppStore((s) => s.supportRequests);
  const users = useAppStore((s) => s.users);
  const reviews = useAppStore((s) => s.reviews);

  const pendingProviders = providers.filter((p) => !p.approved).length;
  const pendingCourses = courses.filter((c) => c.status === 'pending').length;
  const openSupport = supportRequests.filter((s) => s.status !== 'resolved').length;
  const revenue = registrations.reduce((s, r) => s + r.finalPrice, 0);
  const reportedReviews = reviews.filter((r) => r.reported).length;

  return (
    <div className="p-5 max-w-5xl">
      <h1 className="text-xl font-bold text-ink-900 mb-1">Platforma icmalı</h1>
      <p className="text-sm text-ink-500 mb-5">Qarğa platformasının ümumi vəziyyəti</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="İstifadəçilər" value={users.length} icon={<Icon.users size={20} />} tone="info" i={0} />
        <Stat label="Provayderlər" value={providers.length} icon={<Icon.building size={20} />} tone="info" i={1} />
        <Stat label="Kurslar" value={courses.length} icon={<Icon.book size={20} />} tone="neutral" i={2} />
        <Stat label="Qeydiyyatlar" value={registrations.length} icon={<Icon.receipt size={20} />} tone="neutral" i={3} />
        <Stat label="Sınaq dərsləri" value={trials.length} icon={<Icon.calendar size={20} />} tone="neutral" i={4} />
        <Stat label="Təxmini gəlir" value={formatAZN(revenue)} icon={<Icon.coin size={20} />} tone="money" i={5} />
        <Stat label="Bildirilən rəylər" value={reportedReviews} icon={<Icon.flag size={20} />} tone={reportedReviews > 0 ? 'alert' : 'neutral'} i={6} />
        <Stat label="Açıq dəstək tələbi" value={openSupport} icon={<Icon.lifebuoy size={20} />} tone={openSupport > 0 ? 'alert' : 'neutral'} i={7} />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <AlertCard title="Provayder təsdiqi gözlənilir" count={pendingProviders} onClick={() => navigate('/admin/providers')} tone="coral" />
        <AlertCard title="Kurs təsdiqi gözlənilir" count={pendingCourses} onClick={() => navigate('/admin/courses')} tone="gold" />
        <AlertCard title="Açıq dəstək müraciəti" count={openSupport} onClick={() => navigate('/admin/support')} tone="teal" />
      </div>
    </div>
  );
}

/**
 * Rəng mənanı daşıyır, bəzək deyil: diqqət tələb edən göstərici qırmızı,
 * maliyyə yaşıl, ümumi say mavi, qalanı neytral qalır.
 */
const STAT_TONES = {
  info:    { box: 'bg-[#eaf2fd] border-transparent', icon: 'text-[#1d4ed8]', value: 'text-[#17357a]', label: 'text-[#3560b8]' },
  money:   { box: 'bg-teal-100 border-transparent',  icon: 'text-teal-700',  value: 'text-teal-700',  label: 'text-teal-600' },
  alert:   { box: 'bg-coral-100 border-transparent', icon: 'text-coral-500', value: 'text-[#a13a30]', label: 'text-coral-500' },
  neutral: { box: 'bg-white border-ink-100',         icon: 'text-ink-400',   value: 'text-ink-900',   label: 'text-ink-500' },
} as const;

function Stat({ label, value, icon, tone = 'neutral', i = 0 }:
  { label: string; value: string | number; icon: ReactNode; tone?: keyof typeof STAT_TONES; i?: number }) {
  const t = STAT_TONES[tone];
  return (
    <div
      className={`rounded-2xl border p-4 animate-rise ${t.box}`}
      style={{ animationDelay: `${i * 45}ms` }}
    >
      <span className={t.icon}>{icon}</span>
      <p className={`text-2xl font-bold mt-1 tabular-nums ${t.value}`}>{value}</p>
      <p className={`text-xs ${t.label}`}>{label}</p>
    </div>
  );
}

function AlertCard({ title, count, onClick, tone }: { title: string; count: number; onClick: () => void; tone: 'coral' | 'gold' | 'teal' }) {
  return (
    <button onClick={onClick} className="bg-white rounded-2xl border border-ink-100 p-4 text-left hover:border-ink-300">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink-800">{title}</p>
        <Badge tone={tone}>{count}</Badge>
      </div>
      <p className="text-xs text-ink-400 mt-1">Baxmaq üçün klikləyin →</p>
    </button>
  );
}
