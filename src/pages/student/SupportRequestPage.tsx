import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { TopBar } from '../../components/TopBar';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { TextArea } from '../../components/FormField';
import { Badge } from '../../components/Badge';
import { CrowMascot } from '../../components/CrowMascot';
import { useToast } from '../../components/Toast';
import { formatDateAz } from '../../lib/utils';

const categories = [
  { id: 'price_changed', label: 'Qiymət dəyişdi' },
  { id: 'schedule_unavailable', label: 'Cədvəl uyğun deyil' },
  { id: 'location_wrong', label: 'Məkan səhvdir' },
  { id: 'trial_not_provided', label: 'Sınaq dərsi verilmədi' },
  { id: 'no_response', label: 'Provayder cavab vermir' },
  { id: 'course_not_started', label: 'Kurs elan olunduğu kimi başlamadı' },
  { id: 'other', label: 'Digər' },
];

export function SupportRequestPage() {
  const navigate = useNavigate();
  const { show } = useToast();
  const [category, setCategory] = useState(categories[0].id);
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  const createSupportRequest = useAppStore((s) => s.createSupportRequest);
  const requests = useAppStore((s) => s.supportRequests);

  const submit = () => {
    if (!description.trim()) { show('Zəhmət olmasa problemi izah edin', 'error'); return; }
    createSupportRequest({ category, description, evidenceNote: evidence });
    setDescription('');
    setEvidence('');
  };

  return (
    <div className="min-h-screen bg-ink-50 pb-6">
      <TopBar title="Qarğa Dəstək" onBack={() => navigate('/app/profile')} />
      <div className="px-4">
        <div className="flex items-center gap-2 bg-teal-100 text-teal-700 rounded-xl p-3 text-xs mb-4">
          <CrowMascot size={28} />
          <span>Qarğa Qeydiyyat Qoruması ilə platform vasitəsilə etdiyin qeydiyyatlarda yaranan problemlərə görə dəstək ala bilərsən.</span>
        </div>

        <p className="text-sm font-semibold text-ink-800 mb-2">Problemin növü</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((c) => (
            <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>{c.label}</Chip>
          ))}
        </div>

        <TextArea label="Problemi izah et" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Nə baş verdi?" />
        <TextArea label="Əlavə qeyd / sübut (istəyə bağlı)" value={evidence} onChange={(e) => setEvidence(e.target.value)} placeholder="Ekran görüntüsü linki, əlavə detallar..." />
        <Button fullWidth onClick={submit}>Müraciəti göndər</Button>

        <h2 className="font-bold text-ink-900 mt-6 mb-2">Müraciətlərim</h2>
        <div className="flex flex-col gap-2">
          {requests.length === 0 && <p className="text-sm text-ink-400">Hələ müraciətin yoxdur.</p>}
          {requests.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-ink-100 p-3">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-ink-800">№{r.ticketNumber}</p>
                <Badge tone={r.status === 'resolved' ? 'teal' : r.status === 'in_review' ? 'gold' : 'neutral'}>
                  {r.status === 'resolved' ? 'Həll edildi' : r.status === 'in_review' ? 'Baxılır' : 'Açıq'}
                </Badge>
              </div>
              <p className="text-xs text-ink-500 mt-1">{r.description}</p>
              {r.resolution && <p className="text-xs text-teal-700 bg-teal-100 rounded-lg p-2 mt-2">✓ {r.resolution}</p>}
              <p className="text-[11px] text-ink-400 mt-1">{formatDateAz(r.createdAt)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
