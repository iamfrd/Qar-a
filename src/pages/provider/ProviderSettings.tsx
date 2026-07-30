import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useProviderScope } from './useProviderScope';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';

const plans = [
  { id: 'basic', name: 'Basic', price: '0 ₼/ay', features: ['Məhdud sayda kurs elanı', 'Əsas profil', 'Qeydiyyat tələbləri', 'Əsas statistika'] },
  { id: 'professional', name: 'Professional', price: '49 ₼/ay', features: ['Daha çox kurs elanı', 'Sınaq dərsi planlaması', 'Ətraflı analitika', 'Xüsusi təkliflər', 'Rəy idarəetməsi', 'Prioritet dəstək'] },
  { id: 'premium', name: 'Premium', price: '99 ₼/ay', features: ['Xəritədə önə çıxarılma', 'Axtarışda üstün mövqe', 'Qabaqcıl analitika', 'Limitsiz elan', 'Kampaniya alətləri', 'Fərdi provayder səhifəsi'] },
];

export function ProviderSettings() {
  const navigate = useNavigate();
  const { provider } = useProviderScope();
  const logout = useAppStore((s) => s.logout);

  return (
    <div className="p-5 max-w-3xl">
      <h1 className="text-xl font-bold text-ink-900 mb-4">Tənzimləmələr</h1>

      <div className="bg-white rounded-2xl border border-ink-100 p-4 mb-4">
        <h2 className="font-bold text-ink-900 mb-2">Biznes profili</h2>
        <Row label="Ad" value={provider?.name ?? ''} />
        <Row label="Telefon" value={provider?.phone ?? ''} />
        <Row label="E-poçt" value={provider?.email ?? ''} />
        <Row label="Haqqında" value={provider?.about ?? ''} />
        <div className="flex gap-2 mt-2">
          {provider?.verified && <Badge tone="teal">✓ Təsdiqlənmiş</Badge>}
          {provider?.approved ? <Badge tone="neutral">Hesab aktivdir</Badge> : <Badge tone="coral">Admin təsdiqi gözlənilir</Badge>}
        </div>
      </div>

      <h2 className="font-bold text-ink-900 mb-2">Abunəlik planı</h2>
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        {plans.map((p) => (
          <div key={p.id} className={`bg-white rounded-2xl border p-4 ${provider?.plan === p.id ? 'border-ink-900 ring-2 ring-ink-900/10' : 'border-ink-100'}`}>
            <div className="flex items-center justify-between">
              <p className="font-bold text-ink-900">{p.name}</p>
              {provider?.plan === p.id && <Badge tone="gold">Cari plan</Badge>}
            </div>
            <p className="text-sm text-ink-500 mb-2">{p.price}</p>
            <ul className="text-xs text-ink-600 flex flex-col gap-1 mb-3">
              {p.features.map((f) => <li key={f}>✓ {f}</li>)}
            </ul>
            {provider?.plan !== p.id && <Button size="sm" fullWidth variant="outline">Bu plana keç</Button>}
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={() => { logout(); navigate('/login'); }}>Çıxış et</Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-ink-400">{label}</span>
      <span className="text-ink-800 font-medium text-right max-w-[65%]">{value}</span>
    </div>
  );
}
