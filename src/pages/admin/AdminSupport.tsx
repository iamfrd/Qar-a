import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getCourse } from '../../data/mockData';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Sheet';
import { formatDateAz } from '../../lib/utils';
import { useToast } from '../../components/Toast';

const resolutionOptions = [
  'Alternativ kurs təklif edildi',
  'Yeni sınaq dərsi planlaşdırıldı',
  'Qeydiyyat başqa filiala köçürüldü',
  'Platforma krediti verildi',
  'Tam geri ödəmə həyata keçirildi',
];

export function AdminSupport() {
  const { show } = useToast();
  const requests = useAppStore((s) => s.supportRequests);
  const resolveSupportRequest = useAppStore((s) => s.resolveSupportRequest);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [resolution, setResolution] = useState(resolutionOptions[0]);

  const submit = () => {
    if (!activeId) return;
    resolveSupportRequest(activeId, resolution);
    show('Müraciət həll edildi', 'success');
    setActiveId(null);
  };

  return (
    <div className="p-5 max-w-4xl">
      <h1 className="text-xl font-bold text-ink-900 mb-4">Dəstək və mübahisələr ({requests.length})</h1>
      <div className="flex flex-col gap-3">
        {requests.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-ink-100 p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="font-bold text-ink-900">№{r.ticketNumber} • {r.category}</p>
              <Badge tone={r.status === 'resolved' ? 'teal' : r.status === 'in_review' ? 'gold' : 'coral'}>
                {r.status === 'resolved' ? 'Həll edilib' : r.status === 'in_review' ? 'Baxılır' : 'Açıq'}
              </Badge>
            </div>
            {r.courseId && <p className="text-xs text-ink-400 mt-0.5">Kurs: {getCourse(r.courseId)?.title}</p>}
            <p className="text-sm text-ink-600 mt-1">{r.description}</p>
            {r.evidenceNote && <p className="text-xs text-ink-400 mt-1">Qeyd: {r.evidenceNote}</p>}
            <p className="text-[11px] text-ink-400 mt-1">{formatDateAz(r.createdAt)}</p>
            {r.resolution ? (
              <p className="text-xs text-teal-700 bg-teal-100 rounded-lg p-2 mt-2">✓ {r.resolution}</p>
            ) : (
              <Button size="sm" className="mt-2" onClick={() => setActiveId(r.id)}>Həll et</Button>
            )}
          </div>
        ))}
        {requests.length === 0 && <p className="text-sm text-ink-400">Hələ dəstək müraciəti yoxdur.</p>}
      </div>

      <Modal open={!!activeId} onClose={() => setActiveId(null)}>
        <h3 className="font-bold text-lg text-ink-900 mb-3">Müraciəti həll et</h3>
        <div className="flex flex-col gap-2 mb-4">
          {resolutionOptions.map((o) => (
            <button key={o} onClick={() => setResolution(o)} className={`text-left px-3 py-2.5 rounded-xl border ${resolution === o ? 'border-ink-900 bg-ink-50' : 'border-ink-200'}`}>{o}</button>
          ))}
        </div>
        <Button fullWidth onClick={submit}>Təsdiqlə və bildir</Button>
      </Modal>
    </div>
  );
}
