import { useNavigate } from 'react-router-dom';
import { useProviderScope } from './useProviderScope';
import { Badge } from '../../components/Badge';
import { formatAZN, formatDateAz } from '../../lib/utils';

const planLabel = { basic: 'Basic', professional: 'Professional', premium: 'Premium' };

export function ProviderDashboard() {
  const navigate = useNavigate();
  const { provider, myCourses, myBranches, myRegistrations, myTrials, myReviews } = useProviderScope();

  const totalViews = myCourses.reduce((s, c) => s + c.views, 0);
  const totalClicks = myCourses.reduce((s, c) => s + c.clicks, 0);
  const pendingTrials = myTrials.filter((t) => t.status === 'pending').length;
  const pendingRegs = myRegistrations.filter((r) => r.status === 'pending').length;
  const completedRegs = myRegistrations.filter((r) => r.status === 'confirmed' || r.status === 'completed').length;
  const revenue = myRegistrations.filter((r) => r.status !== 'cancelled' && r.status !== 'rejected').reduce((s, r) => s + r.finalPrice, 0);

  const recentActivity = [
    ...myRegistrations.slice(0, 5).map((r) => ({ type: 'Qeydiyyat', text: `${r.studentName} qeydiyyatdan keçdi`, date: r.createdAt })),
    ...myTrials.slice(0, 5).map((t) => ({ type: 'Sınaq dərsi', text: `Yeni sınaq dərsi tələbi (${t.date})`, date: t.createdAt })),
    ...myReviews.slice(0, 5).map((r) => ({ type: 'Rəy', text: `${r.userName} rəy yazdı (${r.overall}★)`, date: r.createdAt })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  return (
    <div className="p-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Xoş gəldin, {provider?.name}</h1>
          <p className="text-sm text-ink-500">Biznes hesabınızın ümumi vəziyyəti</p>
        </div>
        <Badge tone={provider?.plan === 'premium' ? 'gold' : provider?.plan === 'professional' ? 'teal' : 'neutral'} size="md">
          {planLabel[provider?.plan ?? 'basic']} plan
        </Badge>
        {!provider?.approved && <Badge tone="coral" size="md">Təsdiq gözlənilir</Badge>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Aktiv kurslar" value={String(myCourses.filter((c) => c.status === 'active').length)} icon="📚" />
        <Stat label="Filiallar" value={String(myBranches.length)} icon="📍" />
        <Stat label="Profil baxışları" value={String(totalViews)} icon="👁️" />
        <Stat label="Klik sayı" value={String(totalClicks)} icon="🖱️" />
        <Stat label="Gözləyən qeydiyyat" value={String(pendingRegs)} icon="🧾" onClick={() => navigate('/provider/registrations')} />
        <Stat label="Gözləyən sınaq tələbi" value={String(pendingTrials)} icon="🗓️" onClick={() => navigate('/provider/trials')} />
        <Stat label="Tamamlanan qeydiyyat" value={String(completedRegs)} icon="✅" />
        <Stat label="Təxmini gəlir" value={formatAZN(revenue)} icon="💰" />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-2xl border border-ink-100 p-4">
          <h2 className="font-bold text-ink-900 mb-3">Son fəaliyyət</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-ink-400">Hələ fəaliyyət yoxdur.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex justify-between text-sm border-b border-ink-50 pb-2 last:border-0">
                  <span><Badge tone="neutral">{a.type}</Badge> <span className="ml-1 text-ink-700">{a.text}</span></span>
                  <span className="text-ink-400 text-xs">{formatDateAz(a.date)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-ink-100 p-4">
          <h2 className="font-bold text-ink-900 mb-3">Tez keçidlər</h2>
          <div className="grid grid-cols-2 gap-2">
            <QuickLink icon="➕" label="Yeni kurs əlavə et" onClick={() => navigate('/provider/courses/new')} />
            <QuickLink icon="📍" label="Filial əlavə et" onClick={() => navigate('/provider/branches')} />
            <QuickLink icon="🏷️" label="Endirim yarat" onClick={() => navigate('/provider/offers')} />
            <QuickLink icon="📈" label="Analitikaya bax" onClick={() => navigate('/provider/analytics')} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon, onClick }: { label: string; value: string; icon: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="bg-white rounded-2xl border border-ink-100 p-4 text-left hover:border-ink-300 transition-colors">
      <span className="text-xl">{icon}</span>
      <p className="text-2xl font-bold text-ink-900 mt-1">{value}</p>
      <p className="text-xs text-ink-400">{label}</p>
    </button>
  );
}

function QuickLink({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 bg-ink-50 rounded-xl py-3 text-center hover:bg-ink-100">
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-semibold text-ink-700">{label}</span>
    </button>
  );
}
