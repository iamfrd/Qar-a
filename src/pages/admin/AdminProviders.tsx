import { useAppStore } from '../../store/useAppStore';
import { coursesByProvider, branchesByProvider } from '../../data/mockData';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';

const planTone = { basic: 'neutral', professional: 'teal', premium: 'gold' } as const;

export function AdminProviders() {
  const { show } = useToast();
  const providers = useAppStore((s) => s.providers);
  const approveProvider = useAppStore((s) => s.approveProvider);
  const rejectProvider = useAppStore((s) => s.rejectProvider);

  return (
    <div className="p-5 max-w-5xl">
      <h1 className="text-xl font-bold text-ink-900 mb-4">Provayderlər ({providers.length})</h1>
      <div className="flex flex-col gap-3">
        {providers.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-ink-100 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-ink-50 flex items-center justify-center text-2xl shrink-0">{p.logo}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-ink-900">{p.name}</p>
                <Badge tone={planTone[p.plan]}>{p.plan}</Badge>
                {p.verified && <Badge tone="teal">✓ Təsdiqlənmiş</Badge>}
                {p.approved ? <Badge tone="neutral">Aktiv</Badge> : <Badge tone="coral">Gözləyir</Badge>}
              </div>
              <p className="text-xs text-ink-500 mt-1">{p.about}</p>
              <p className="text-xs text-ink-400 mt-1">{p.phone} • {p.email} • {branchesByProvider(p.id).length} filial • {coursesByProvider(p.id).length} kurs</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {!p.approved ? (
                <Button size="sm" onClick={() => { approveProvider(p.id); show(`${p.name} təsdiqləndi`, 'success'); }}>Təsdiqlə</Button>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => { rejectProvider(p.id); show(`${p.name} təsdiqi ləğv edildi`, 'info'); }}>Təsdiqi ləğv et</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
