import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getProvider } from '../../data/mockData';
import { getCategory } from '../../data/categories';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { formatAZN } from '../../lib/utils';
import { useToast } from '../../components/Toast';
import type { Course } from '../../types';

const statusTone = { active: 'teal', pending: 'gold', hidden: 'neutral', rejected: 'coral' } as const;
const statusLabel: Record<Course['status'], string> = { active: 'Aktiv', pending: 'Təsdiq gözləyir', hidden: 'Gizli', rejected: 'Rədd edilib' };

export function AdminCourses() {
  const { show } = useToast();
  const courses = useAppStore((s) => s.courses);
  const setCourseStatus = useAppStore((s) => s.setCourseStatus);
  const [filter, setFilter] = useState<Course['status'] | 'all'>('all');

  const filtered = filter === 'all' ? courses : courses.filter((c) => c.status === filter);

  return (
    <div className="p-5 max-w-5xl">
      <h1 className="text-xl font-bold text-ink-900 mb-4">Kurs siyahısı ({courses.length})</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all', 'pending', 'active', 'hidden', 'rejected'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${filter === f ? 'bg-ink-900 text-white border-ink-900' : 'border-ink-200 text-ink-600'}`}>
            {f === 'all' ? 'Hamısı' : statusLabel[f]}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {filtered.map((c) => {
          const provider = getProvider(c.providerId);
          const category = getCategory(c.categoryId);
          return (
            <div key={c.id} className="bg-white rounded-2xl border border-ink-100 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${category?.color}1a` }}>{c.photos[0] ?? category?.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-ink-900">{c.title}</p>
                  <Badge tone={statusTone[c.status]}>{statusLabel[c.status]}</Badge>
                </div>
                <p className="text-xs text-ink-400">{provider?.name} • {category?.name.az} • {formatAZN(c.discountPrice ?? c.price)}/ay</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {c.status === 'pending' && (
                  <>
                    <Button size="sm" onClick={() => { setCourseStatus(c.id, 'active'); show('Kurs təsdiqləndi və yayımlandı', 'success'); }}>Təsdiqlə</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setCourseStatus(c.id, 'rejected'); show('Kurs rədd edildi', 'info'); }}>Rədd et</Button>
                  </>
                )}
                {c.status === 'active' && (
                  <Button size="sm" variant="ghost" onClick={() => { setCourseStatus(c.id, 'hidden'); show('Kurs gizlədildi', 'info'); }}>Gizlət</Button>
                )}
                {(c.status === 'hidden' || c.status === 'rejected') && (
                  <Button size="sm" variant="outline" onClick={() => { setCourseStatus(c.id, 'active'); show('Kurs aktivləşdirildi', 'success'); }}>Aktivləşdir</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
