import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { getBranch } from '../../data/mockData';
import { formatDateAz } from '../../lib/utils';
import { TopBar } from '../../components/TopBar';
import { Stepper } from '../../components/Stepper';
import { Button } from '../../components/Button';
import { TextInput, TextArea } from '../../components/FormField';
import { CrowMascot } from '../../components/CrowMascot';
import { useToast } from '../../components/Toast';
import type { TrialReservation } from '../../types';

const STEPS = ['Tarix', 'Saat', 'Əlaqə', 'Təsdiq'];

export function TrialBooking() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const courses = useAppStore((s) => s.courses);
  const currentUser = useAppStore((s) => s.currentUser);
  const bookTrial = useAppStore((s) => s.bookTrial);

  const course = courses.find((c) => c.id === courseId);
  const [step, setStep] = useState(0);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState(currentUser?.name ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [note, setNote] = useState('');
  const [result, setResult] = useState<TrialReservation | null>(null);

  if (!course) return <div className="p-6">Kurs tapılmadı.</div>;
  const branch = getBranch(course.branchId);

  const confirm = () => {
    if (!date || !time) return;
    const res = bookTrial({ courseId: course.id, branchId: course.branchId, date, time, note });
    setResult(res);
    setStep(3);
    show('Sınaq dərsi rezervasiyası göndərildi!', 'success');
  };

  if (result) {
    return (
      <div className="min-h-screen bg-ink-50 pb-8">
        <TopBar title="Rezervasiya təsdiqləndi" onBack={() => navigate('/app/map')} />
        <div className="px-4 flex flex-col items-center text-center pt-4">
          <CrowMascot size={72} mood="happy" />
          <h1 className="font-bold text-lg text-ink-900 mt-3">Sınaq dərsiniz rezerv olundu!</h1>
          <p className="text-sm text-ink-500 mt-1">Referans nömrəniz: <span className="font-bold text-ink-900">{result.refNumber}</span></p>

          <div className="bg-white rounded-2xl border border-ink-100 p-4 mt-4 w-full text-left">
            <Row label="Kurs" value={course.title} />
            <Row label="Tarix" value={formatDateAz(result.date)} />
            <Row label="Saat" value={result.time} />
            <Row label="Filial" value={`${branch?.name}, ${branch?.address}`} />
            <Row label="Status" value="Provayderin təsdiqini gözləyir" />
          </div>

          {branch && (
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-ink-900 mt-3">
              🧭 Xəritədə istiqamətlərə bax
            </a>
          )}

          <div className="flex gap-2 w-full mt-5">
            <Button variant="outline" fullWidth onClick={() => navigate('/app/history')}>Rezervasiyalarım</Button>
            <Button fullWidth onClick={() => navigate('/app/support')}>Dəstək</Button>
          </div>
          <p className="text-xs text-ink-400 mt-4">Dərsdən 1 gün əvvəl sizə xatırlatma bildirişi göndəriləcək. Rezervasiyanı istənilən vaxt "Qeydiyyat tarixçəm" bölməsindən ləğv və ya təxirə sala bilərsiniz.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50 pb-8">
      <TopBar title="Sınaq dərsi rezervasiyası" />
      <div className="px-4 pb-3">
        <Stepper steps={STEPS} current={step} />
      </div>
      <div className="px-4">
        <p className="font-bold text-ink-900 mb-3">{course.title}</p>

        {step === 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-ink-500 mb-1">Mövcud tarixlərdən birini seçin:</p>
            {course.trialSlots.map((slot) => (
              <button key={slot.date} onClick={() => { setDate(slot.date); setStep(1); }} className={`text-left px-4 py-3 rounded-xl border ${date === slot.date ? 'border-ink-900 bg-ink-50' : 'border-ink-200'}`}>
                📅 {formatDateAz(slot.date)}
              </button>
            ))}
          </div>
        )}

        {step === 1 && date && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-ink-500 mb-1">{formatDateAz(date)} tarixi üçün saat seçin:</p>
            <div className="flex flex-wrap gap-2">
              {course.trialSlots.find((s) => s.date === date)?.times.map((tm) => (
                <button key={tm} onClick={() => { setTime(tm); setStep(2); }} className={`px-4 py-2.5 rounded-xl border font-semibold ${time === tm ? 'border-ink-900 bg-ink-50' : 'border-ink-200'}`}>{tm}</button>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-fit mt-2" onClick={() => setStep(0)}>← Tarixi dəyiş</Button>
          </div>
        )}

        {step === 2 && (
          <div>
            <TextInput label="Ad Soyad" value={name} onChange={(e) => setName(e.target.value)} />
            <TextInput label="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
            <TextArea label="Qeyd (istəyə bağlı)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Əlavə sual və ya qeydiniz..." />
            <Button fullWidth onClick={confirm} disabled={!name || !phone}>Rezervasiyanı təsdiqlə</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-ink-50 last:border-0">
      <span className="text-xs text-ink-400">{label}</span>
      <span className="text-sm font-semibold text-ink-800 text-right max-w-[65%]">{value}</span>
    </div>
  );
}
