import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useProviderScope } from './useProviderScope';
import { getCategory } from '../../data/categories';
import { getBranch } from '../../data/mockData';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { formatAZN } from '../../lib/utils';
import { useToast } from '../../components/Toast';

const statusTone = { active: 'teal', pending: 'gold', hidden: 'neutral', rejected: 'coral' } as const;
const statusLabel = { active: 'Aktiv', pending: 'Təsdiq gözləyir', hidden: 'Gizlədilib', rejected: 'Rədd edilib' };

export function ProviderCourses() {
  const navigate = useNavigate();
  const { show } = useToast();
  const { myCourses } = useProviderScope();
  const setCourseStatus = useAppStore((s) => s.setCourseStatus);

  return (
    <div className="p-5 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-ink-900">Kurslarım ({myCourses.length})</h1>
        <Button size="sm" onClick={() => navigate('/provider/courses/new')}>+ Yeni kurs</Button>
      </div>
      <div className="flex flex-col gap-3">
        {myCourses.map((c) => {
          const category = getCategory(c.categoryId);
          const branch = getBranch(c.branchId);
          return (
            <div key={c.id} className="bg-white rounded-2xl border border-ink-100 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${category?.color}1a` }}>{c.photos[0] ?? category?.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-ink-900">{c.title}</p>
                  <Badge tone={statusTone[c.status]}>{statusLabel[c.status]}</Badge>
                </div>
                <p className="text-xs text-ink-400">{category?.name.az} • {branch?.name}</p>
                <div className="flex gap-3 text-xs text-ink-500 mt-1">
                  <span>{formatAZN(c.discountPrice ?? c.price)}/ay</span>
                  <span>👁️ {c.views}</span>
                  <span>💺 {c.seatsAvailable}/{c.seatsTotal}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => navigate(`/provider/courses/${c.id}/edit`)}>Redaktə et</Button>
                {c.status === 'active' ? (
                  <Button size="sm" variant="ghost" onClick={() => { setCourseStatus(c.id, 'hidden'); show('Kurs gizlədildi', 'info'); }}>Gizlət</Button>
                ) : c.status === 'hidden' ? (
                  <Button size="sm" variant="ghost" onClick={() => { setCourseStatus(c.id, 'active'); show('Kurs aktivləşdirildi', 'success'); }}>Aktivləşdir</Button>
                ) : null}
              </div>
            </div>
          );
        })}
        {myCourses.length === 0 && <p className="text-sm text-ink-400">Hələ kurs əlavə etməmisiniz.</p>}
      </div>
    </div>
  );
}
