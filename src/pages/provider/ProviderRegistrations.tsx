import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useProviderScope } from './useProviderScope';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { formatAZN, formatDateAz } from '../../lib/utils';
import { useToast } from '../../components/Toast';
import type { RegistrationStatus } from '../../types';

const statusTone: Record<RegistrationStatus, 'gold' | 'teal' | 'coral' | 'neutral'> = {
  pending: 'gold', confirmed: 'teal', rejected: 'coral', cancelled: 'neutral', completed: 'teal',
};
const statusLabel: Record<RegistrationStatus, string> = {
  pending: 'Gözləyir', confirmed: 'Təsdiqləndi', rejected: 'Rədd edildi', cancelled: 'Ləğv edildi', completed: 'Tamamlandı',
};

export function ProviderRegistrations() {
  const { show } = useToast();
  const { myRegistrations, myCourses } = useProviderScope();
  const updateRegistrationStatus = useAppStore((s) => s.updateRegistrationStatus);
  const [filter, setFilter] = useState<RegistrationStatus | 'all'>('all');

  const courseTitle = (id: string) => myCourses.find((c) => c.id === id)?.title ?? 'Kurs';
  const filtered = filter === 'all' ? myRegistrations : myRegistrations.filter((r) => r.status === filter);

  return (
    <div className="p-5 max-w-4xl">
      <h1 className="text-xl font-bold text-ink-900 mb-4">Qeydiyyat tələbləri ({myRegistrations.length})</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${filter === f ? 'bg-ink-900 text-white border-ink-900' : 'border-ink-200 text-ink-600'}`}>
            {f === 'all' ? 'Hamısı' : statusLabel[f]}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {filtered.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-ink-100 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-ink-900">{r.studentName}</p>
                <Badge tone={statusTone[r.status]}>{statusLabel[r.status]}</Badge>
              </div>
              <p className="text-xs text-ink-400">{courseTitle(r.courseId)} • №{r.regNumber}</p>
              <div className="flex gap-3 text-xs text-ink-500 mt-1 flex-wrap">
                <a href={`tel:${r.studentPhone}`} className="underline">📞 {r.studentPhone}</a>
                <span>💰 {formatAZN(r.finalPrice)}</span>
                <span>🗓️ {formatDateAz(r.createdAt)}</span>
              </div>
            </div>
            {(r.status === 'confirmed' || r.status === 'pending') && (
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => { updateRegistrationStatus(r.id, 'completed'); show('Qeydiyyat tamamlandı olaraq qeyd edildi', 'success'); }}>Tamamlandı</Button>
                <Button size="sm" variant="ghost" onClick={() => { updateRegistrationStatus(r.id, 'cancelled'); show('Qeydiyyat ləğv edildi', 'info'); }}>Ləğv et</Button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-ink-400">Bu filtrə uyğun qeydiyyat yoxdur.</p>}
      </div>
    </div>
  );
}
