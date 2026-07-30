import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useProviderScope } from './useProviderScope';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Sheet';
import { formatDateAz } from '../../lib/utils';
import { useToast } from '../../components/Toast';
import type { TrialStatus } from '../../types';

const statusTone: Record<TrialStatus, 'gold' | 'teal' | 'coral' | 'neutral'> = {
  pending: 'gold', confirmed: 'teal', rejected: 'coral', rescheduled: 'gold', completed: 'teal', cancelled: 'neutral',
};
const statusLabel: Record<TrialStatus, string> = {
  pending: 'Gözləyir', confirmed: 'Təsdiqləndi', rejected: 'Rədd edildi', rescheduled: 'Təxirə salındı', completed: 'Baş tutdu', cancelled: 'Ləğv edildi',
};

export function ProviderTrials() {
  const { show } = useToast();
  const { myTrials, myCourses } = useProviderScope();
  const updateTrialStatus = useAppStore((s) => s.updateTrialStatus);
  const rescheduleTrial = useAppStore((s) => s.rescheduleTrial);
  const [suggestId, setSuggestId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const courseTitle = (id: string) => myCourses.find((c) => c.id === id)?.title ?? 'Kurs';

  const submitSuggestion = () => {
    if (!suggestId || !newDate || !newTime) return;
    rescheduleTrial(suggestId, newDate, newTime);
    setSuggestId(null);
    show('Yeni vaxt təklif edildi', 'success');
  };

  return (
    <div className="p-5 max-w-4xl">
      <h1 className="text-xl font-bold text-ink-900 mb-4">Sınaq dərsi tələbləri ({myTrials.length})</h1>
      <div className="flex flex-col gap-3">
        {myTrials.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border border-ink-100 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-ink-900">{courseTitle(t.courseId)}</p>
                <Badge tone={statusTone[t.status]}>{statusLabel[t.status]}</Badge>
              </div>
              <p className="text-xs text-ink-500 mt-1">📅 {formatDateAz(t.date)} • {t.time} — №{t.refNumber}</p>
              {t.note && <p className="text-xs text-ink-400 mt-1">Qeyd: {t.note}</p>}
            </div>
            {t.status === 'pending' && (
              <div className="flex gap-2 shrink-0 flex-wrap">
                <Button size="sm" onClick={() => { updateTrialStatus(t.id, 'confirmed'); show('Sınaq dərsi təsdiqləndi', 'success'); }}>Təsdiqlə</Button>
                <Button size="sm" variant="outline" onClick={() => setSuggestId(t.id)}>Başqa vaxt təklif et</Button>
                <Button size="sm" variant="ghost" onClick={() => { updateTrialStatus(t.id, 'rejected'); show('Sınaq dərsi rədd edildi', 'info'); }}>Rədd et</Button>
              </div>
            )}
          </div>
        ))}
        {myTrials.length === 0 && <p className="text-sm text-ink-400">Hələ sınaq dərsi tələbi yoxdur.</p>}
      </div>

      <Modal open={!!suggestId} onClose={() => setSuggestId(null)}>
        <h3 className="font-bold text-lg text-ink-900 mb-3">Başqa vaxt təklif et</h3>
        <div className="flex gap-2 mb-3">
          <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="flex-1 rounded-xl border border-ink-200 px-3 py-2 text-sm" />
          <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="flex-1 rounded-xl border border-ink-200 px-3 py-2 text-sm" />
        </div>
        <Button fullWidth onClick={submitSuggestion}>Təklifi göndər</Button>
      </Modal>
    </div>
  );
}
