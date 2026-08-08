import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { getBranch, getProvider } from '../../data/mockData';
import { formatAZN, formatDateAz } from '../../lib/utils';
import { TopBar } from '../../components/TopBar';
import { Stepper } from '../../components/Stepper';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/FormField';
import { Chip } from '../../components/Chip';
import { CrowMascot } from '../../components/CrowMascot';
import { useToast } from '../../components/Toast';
import type { Registration } from '../../types';

const STEPS = ['Kurs', 'Tələbə', 'Endirim', 'Şərtlər', 'Ödəniş', 'Təsdiq'];
// Yalnız "Mərkəzdə ödə" işlək üsuldur. Kart/Apple Pay/Google Pay real ödəniş
// inteqrasiyası olmadığı üçün söndürülüb — brauzerdə saxta "ödənilib" statusu yaradılmır.
const PAYMENT_METHODS = [
  { id: 'pay_at_center', label: 'Kursda ödəniş', enabled: true },
  { id: 'card', label: 'Kart ödənişi', enabled: false },
  { id: 'apple_pay', label: 'Apple Pay', enabled: false },
  { id: 'google_pay', label: 'Google Pay', enabled: false },
];

export function RegistrationFlow() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const courses = useAppStore((s) => s.courses);
  const currentUser = useAppStore((s) => s.currentUser);
  const createRegistration = useAppStore((s) => s.createRegistration);

  const course = courses.find((c) => c.id === courseId);
  const [step, setStep] = useState(0);
  const [name, setName] = useState(currentUser?.name ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [age, setAge] = useState('');
  const [promo, setPromo] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [payment, setPayment] = useState('pay_at_center');
  const [reg, setReg] = useState<Registration | null>(null);

  if (!course) return <div className="p-6">Kurs tapılmadı.</div>;
  const branch = getBranch(course.branchId);
  const provider = getProvider(course.providerId);
  const basePrice = course.discountPrice ?? course.price;
  const promoValid = promo.trim().toUpperCase() === 'QARGA10';
  const promoDiscount = promoValid ? Math.round(basePrice * 0.1) : 0;
  const finalPrice = Math.max(0, basePrice - promoDiscount);

  const submit = () => {
    const r = createRegistration({
      courseId: course.id, branchId: course.branchId, format: course.format, mode: course.mode,
      studentName: name, studentPhone: phone, studentAge: age, promoCode: promo || undefined,
      lelekUsed: 0, paymentMethod: payment,
    });
    setReg(r);
    setStep(5);
    show('Qeydiyyatınız tamamlandı!', 'success');
  };

  if (reg) {
    return (
      <div className="min-h-screen bg-ink-50 pb-8">
        <TopBar title="Qeydiyyat təsdiqləndi" onBack={() => navigate('/app/map')} />
        <div className="px-4 flex flex-col items-center text-center pt-4">
          <CrowMascot size={72} mood="happy" />
          <h1 className="font-bold text-lg text-ink-900 mt-3">Təbriklər, qeydiyyatınız tamamlandı!</h1>
          <p className="text-sm text-ink-500 mt-1">Qeydiyyat №<span className="font-bold text-ink-900">{reg.regNumber}</span></p>

          <div className="bg-white rounded-2xl border border-ink-100 p-4 mt-4 w-full text-left">
            <Row label="Kurs" value={course.title} />
            <Row label="Filial" value={`${branch?.name}`} />
            <Row label="Cədvəl" value={`${course.lessonDays.join(', ')} • ${course.lessonTime}`} />
            <Row label="Qiymət" value={formatAZN(reg.price)} />
            {reg.discount > 0 && <Row label="Endirim" value={`-${formatAZN(reg.discount)}`} />}
            <Row label="Yekun ödəniş" value={formatAZN(reg.finalPrice)} />
            <Row label="Ödəniş statusu" value="Kursda ödəniləcək" />
            <Row label="Provayder əlaqəsi" value={provider?.phone ?? ''} />
          </div>

          <div className="bg-teal-100 text-teal-700 rounded-xl p-3 text-xs mt-3 text-left">
            🛡️ <b>Qarğa Qeydiyyat Qoruması</b> aktivdir: qiymət, cədvəl və ya məkan dəyişərsə, dəstək komandamıza müraciət edə bilərsiniz.
          </div>

          <div className="flex gap-2 w-full mt-5">
            <Button variant="outline" fullWidth onClick={() => navigate('/app/history')}>Qeydiyyatlarım</Button>
            <Button fullWidth onClick={() => navigate('/app/map')}>Xəritəyə qayıt</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50 pb-8">
      <TopBar title="Qeydiyyat" />
      <div className="px-4 pb-3">
        <Stepper steps={STEPS} current={step} />
      </div>
      <div className="px-4">
        {step === 0 && (
          <div>
            <div className="bg-white rounded-2xl border border-ink-100 p-4">
              <p className="font-bold text-ink-900">{course.title}</p>
              <p className="text-xs text-ink-500 mt-1">{provider?.name} • {branch?.name}</p>
              <Row label="Cədvəl" value={`${course.lessonDays.join(', ')} • ${course.lessonTime}`} />
              <Row label="Format" value={course.format === 'offline' ? 'Oflayn' : course.format === 'online' ? 'Onlayn' : 'Hibrid'} />
              <Row label="Başlanğıc tarixi" value={formatDateAz(course.startDate)} />
              <Row label="Qiymət" value={formatAZN(basePrice) + '/ay'} />
            </div>
            <Button fullWidth className="mt-4" onClick={() => setStep(1)}>Davam et</Button>
          </div>
        )}

        {step === 1 && (
          <div>
            <TextInput label="Tələbənin adı" value={name} onChange={(e) => setName(e.target.value)} />
            <TextInput label="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
            <TextInput label="Yaş" value={age} onChange={(e) => setAge(e.target.value)} inputMode="numeric" placeholder={course.ageGroup} />
            <Button fullWidth disabled={!name || !phone} onClick={() => setStep(2)}>Davam et</Button>
          </div>
        )}

        {step === 2 && (
          <div>
            <TextInput label="Promo kod (istəyə bağlı)" value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Məs: QARGA10" hint="QARGA10 kodu ilə 10% əlavə endirim qazanın" />
            {/*
              Lələk xallarını burada xərcləmək mümkün deyil: balans yalnız brauzerdə saxlanılır,
              serverdə heç bir Lələk qeydi aparılmır. Sürüşdürücü istifadəçiyə real olmayan
              endirim göstərirdi — mərkəzdə ödəniləcək məbləğ isə dəyişmirdi.
            */}
            <div className="bg-ink-50 rounded-xl p-3 text-sm mb-3 mt-3">
              <div className="flex justify-between"><span>Əsas qiymət</span><span>{formatAZN(basePrice)}</span></div>
              {promoDiscount > 0 && <div className="flex justify-between text-teal-600"><span>Promo endirim</span><span>-{formatAZN(promoDiscount)}</span></div>}
              <div className="flex justify-between font-bold border-t border-ink-200 mt-1 pt-1"><span>Yekun</span><span>{formatAZN(finalPrice)}</span></div>
            </div>
            <p className="text-xs text-ink-500 mb-3">🪶 Lələk xalları ilə endirim hazırlanır — hazırda qeydiyyatda istifadə edilə bilmir.</p>
            <Button fullWidth onClick={() => setStep(3)}>Davam et</Button>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="bg-white rounded-2xl border border-ink-100 p-4 text-sm text-ink-600 mb-3">
              <p className="font-bold text-ink-900 mb-1">Kurs şərtləri</p>
              <p>{course.cancellationPolicy}</p>
            </div>
            <div className="bg-teal-100 text-teal-700 rounded-xl p-3 text-xs mb-3">
              🛡️ Qarğa Qeydiyyat Qoruması ilə qiymət, cədvəl və ya məkan dəyişikliyi zamanı dəstək alacaqsınız.
            </div>
            <label className="flex items-start gap-2 mb-4">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
              <span className="text-sm text-ink-700">Kurs şərtlərini və Qarğa istifadə qaydalarını qəbul edirəm.</span>
            </label>
            <Button fullWidth disabled={!agreed} onClick={() => setStep(4)}>Davam et</Button>
          </div>
        )}

        {step === 4 && (
          <div>
            <p className="text-sm font-semibold text-ink-800 mb-2">Ödəniş üsulunu seçin</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {PAYMENT_METHODS.map((m) => (
                <Chip
                  key={m.id}
                  active={payment === m.id}
                  disabled={!m.enabled}
                  title={m.enabled ? undefined : 'Onlayn ödəniş hələ aktiv deyil'}
                  onClick={m.enabled ? () => setPayment(m.id) : undefined}
                >
                  {m.label}{m.enabled ? '' : ' — tezliklə'}
                </Chip>
              ))}
            </div>
            <p className="text-xs text-ink-500 mb-4">Onlayn ödəniş hələ aktiv deyil. Qeydiyyat sorğusu göndərilir, məbləği kurs mərkəzində ödəyirsiniz.</p>
            <div className="bg-ink-50 rounded-xl p-3 text-sm mb-4 flex justify-between font-bold">
              <span>Mərkəzdə ödəniləcək məbləğ</span><span>{formatAZN(finalPrice)}</span>
            </div>
            <Button fullWidth onClick={submit}>Qeydiyyatı təsdiqlə</Button>
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
      <span className="text-sm font-semibold text-ink-800 text-right max-w-[60%]">{value}</span>
    </div>
  );
}
