import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { formatAZN } from '../../lib/utils';
import { Badge } from '../../components/Badge';

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
        <Stat label="İstifadəçilər" value={users.length} icon="👥" />
        <Stat label="Provayderlər" value={providers.length} icon="🏢" />
        <Stat label="Kurslar" value={courses.length} icon="📚" />
        <Stat label="Qeydiyyatlar" value={registrations.length} icon="🧾" />
        <Stat label="Sınaq dərsləri" value={trials.length} icon="🗓️" />
        <Stat label="Təxmini gəlir" value={formatAZN(revenue)} icon="💰" />
        <Stat label="Bildirilən rəylər" value={reportedReviews} icon="🚩" />
        <Stat label="Açıq dəstək tələbi" value={openSupport} icon="🛟" />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <AlertCard title="Provayder təsdiqi gözlənilir" count={pendingProviders} onClick={() => navigate('/admin/providers')} tone="coral" />
        <AlertCard title="Kurs təsdiqi gözlənilir" count={pendingCourses} onClick={() => navigate('/admin/courses')} tone="gold" />
        <AlertCard title="Açıq dəstək müraciəti" count={openSupport} onClick={() => navigate('/admin/support')} tone="teal" />
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 p-4">
      <span className="text-xl">{icon}</span>
      <p className="text-2xl font-bold text-ink-900 mt-1">{value}</p>
      <p className="text-xs text-ink-400">{label}</p>
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
