import { useAppStore } from '../../store/useAppStore';
import { formatDateAz } from '../../lib/utils';
import { Badge } from '../../components/Badge';

export function AdminLoyalty() {
  const transactions = useAppStore((s) => s.lelekTransactions);
  const referrals = useAppStore((s) => s.referrals);

  const earned = transactions.filter((t) => t.type === 'earn').reduce((s, t) => s + t.amount, 0);
  const spent = transactions.filter((t) => t.type === 'spend').reduce((s, t) => s + t.amount, 0);
  const completedReferrals = referrals.filter((r) => r.status === 'completed').length;

  return (
    <div className="p-5 max-w-4xl">
      <h1 className="text-xl font-bold text-ink-900 mb-4">Lələk və Referral sistemi</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Ümumi qazanılan Lələk" value={earned} icon="🪶" />
        <Stat label="İstifadə olunan Lələk" value={spent} icon="💳" />
        <Stat label="Dəvətlər" value={referrals.length} icon="🎁" />
        <Stat label="Tamamlanan dəvətlər" value={completedReferrals} icon="✅" />
      </div>

      <h2 className="font-bold text-ink-900 mb-2">Lələk əməliyyatları</h2>
      <div className="bg-white rounded-2xl border border-ink-100 overflow-x-auto mb-6">
        <table className="w-full text-sm min-w-[520px]">
          <thead><tr className="text-left text-xs text-ink-400 border-b border-ink-100"><th className="p-3">Səbəb</th><th className="p-3">Növ</th><th className="p-3">Məbləğ</th><th className="p-3">Tarix</th></tr></thead>
          <tbody>
            {transactions.slice(0, 20).map((t) => (
              <tr key={t.id} className="border-b border-ink-50 last:border-0">
                <td className="p-3">{t.reason}</td>
                <td className="p-3"><Badge tone={t.type === 'earn' ? 'teal' : 'coral'}>{t.type === 'earn' ? 'Qazanılıb' : 'İstifadə'}</Badge></td>
                <td className="p-3">{t.amount} 🪶</td>
                <td className="p-3 text-xs text-ink-400">{formatDateAz(t.createdAt)}</td>
              </tr>
            ))}
            {transactions.length === 0 && <tr><td className="p-3 text-ink-400" colSpan={4}>Hələ əməliyyat yoxdur.</td></tr>}
          </tbody>
        </table>
      </div>

      <h2 className="font-bold text-ink-900 mb-2">Referral qeydləri</h2>
      <div className="bg-white rounded-2xl border border-ink-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead><tr className="text-left text-xs text-ink-400 border-b border-ink-100"><th className="p-3">Kod</th><th className="p-3">Dəvət edilən</th><th className="p-3">Status</th><th className="p-3">Mükafat</th></tr></thead>
          <tbody>
            {referrals.map((r) => (
              <tr key={r.id} className="border-b border-ink-50 last:border-0">
                <td className="p-3 font-mono text-xs">{r.code}</td>
                <td className="p-3">{r.invitedName}</td>
                <td className="p-3"><Badge tone={r.status === 'completed' ? 'teal' : 'gold'}>{r.status === 'completed' ? 'Tamamlanıb' : 'Gözləyir'}</Badge></td>
                <td className="p-3">{r.rewardLelek} 🪶</td>
              </tr>
            ))}
            {referrals.length === 0 && <tr><td className="p-3 text-ink-400" colSpan={4}>Hələ referral qeydi yoxdur.</td></tr>}
          </tbody>
        </table>
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
