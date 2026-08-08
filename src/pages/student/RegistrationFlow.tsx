import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { api, ApiError, formatMinor } from '../../lib/api';
import type { OfferingDetail, Registration } from '../../lib/api';
import { formatDateAz, uid } from '../../lib/utils';
import { TopBar } from '../../components/TopBar';
import { Stepper } from '../../components/Stepper';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/FormField';
import { Chip } from '../../components/Chip';
import { CrowMascot } from '../../components/CrowMascot';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { useToast } from '../../components/Toast';

const STEPS = ['Kurs', 'Tələbə', 'Endirim', 'Şərtlər', 'Ödəniş', 'Təsdiq'];
// Yalnız "Mərkəzdə ödə" işlək üsuldur. Kart/Apple Pay/Google Pay real ödəniş
// inteqrasiyası olmadığı üçün söndürülüb — brauzerdə saxta "ödənilib" statusu yaradılmır.
// Server də `payment_method`-u həmişə 'pay_at_center' kimi saxlayır (server/schema.sql).
const PAYMENT_METHODS = [
  { id: 'pay_at_center', label: 'Kursda ödəniş', enabled: true },
  { id: 'card', label: 'Kart ödənişi', enabled: false },
  { id: 'apple_pay', label: 'Apple Pay', enabled: false },
  { id: 'google_pay', label: 'Google Pay', enabled: false },
];

/**
 * MÜVƏQQƏTİ KÖRPÜ (texniki borc): `:courseId` marşrut parametri bu ekrana
 * hazırda köhnə mock kurs ID-si kimi gəlir, çünki `CourseDetail.tsx` hələ
 * server kataloquna keçməyib (yalnız xəritə/axtarış artıq `OfferingSummary`
 * işlədir, bax `src/components/CourseCard.tsx`). `server/seed.mjs` hər mock
 * kursu `off-<courseId>` ID-li təklifə çevirir — bu, YALNIZ development seed
 * konvensiyasıdır və real provayder tərəfindən yaradılan kurslara aid deyil.
 *
 * Əsl `cohortId` bu prefiksdən HEÇ VAXT özümüz qurulmur — server-in
 * `OfferingDetail` cavabından oxunur, ona görə qeydiyyat sorğusuna gedən
 * `cohortId` həmişə serverin təsdiqlədiyi qiymətdir. Amma təklifi TAPMAQ üçün
 * istifadə olunan `off-` prefiksi qırılğandır: `CourseDetail.tsx` server
 * kataloquna keçəndə (və ya provayderlər öz kurslarını yaradanda) bu körpü
 * artıq işləməyəcək və əvəzinə marşrut birbaşa `offeringId` daşımalıdır.
 */
function legacyOfferingId(courseId: string) {
  return `off-${courseId}`;
}

/** Serverin qeydiyyat statusu token-ləri (`server/booking.mjs` REG_TRANSITIONS). */
const REGISTRATION_STATUS_LABELS: Record<string, string> = {
  submitted: 'Göndərildi, provayderin baxışını gözləyir',
  provider_review: 'Provayder yoxlayır',
  confirmed: 'Təsdiqləndi',
  completed: 'Tamamlandı',
  cancelled: 'Ləğv edildi',
  rejected: 'Rədd edildi',
  disputed: 'Mübahisəli',
  refunded: 'Geri ödənildi',
};

export function RegistrationFlow() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const currentUser = useAppStore((s) => s.currentUser);

  const [step, setStep] = useState(0);

  const [offering, setOffering] = useState<OfferingDetail | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);

  const [name, setName] = useState(currentUser?.name ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [age, setAge] = useState('');
  const [promo, setPromo] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [payment, setPayment] = useState('pay_at_center');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reg, setReg] = useState<Registration | null>(null);
  const [replayed, setReplayed] = useState(false);

  // Eyni qeydiyyat cəhdi üçün sabit qalır (məs. şəbəkə xətasından sonra
  // "Yenidən cəhd et" düyməsi eyni açarla göndərir) ki, server təsadüfən
  // iki dəfə qeydiyyat yaratmasın.
  const [idempotencyKey] = useState(() => `idem-reg-${Date.now().toString(36)}-${uid()}`);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    setLoadState('loading');
    setLoadError(null);
    api.offering(legacyOfferingId(courseId))
      .then((detail) => {
        if (cancelled) return;
        setOffering(detail);
        setLoadState('ready');
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadError(e instanceof ApiError ? e.message : 'Kurs məlumatı yüklənə bilmədi. İnternet bağlantınızı yoxlayın.');
        setLoadState('error');
      });
    return () => { cancelled = true; };
  }, [courseId, retryTick]);

  if (!courseId) {
    return (
      <div className="min-h-screen bg-ink-50 pb-8">
        <TopBar title="Qeydiyyat" onBack={() => navigate('/app/map')} />
        <EmptyState title="Kurs tapılmadı" body="Qeydiyyat üçün kurs seçilməyib." />
      </div>
    );
  }

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen bg-ink-50 pb-8">
        <TopBar title="Qeydiyyat" />
        <div className="px-4 pt-10 text-center text-sm text-ink-400">Kurs məlumatı yüklənir…</div>
      </div>
    );
  }

  if (loadState === 'error' || !offering) {
    return (
      <div className="min-h-screen bg-ink-50 pb-8">
        <TopBar title="Qeydiyyat" onBack={() => navigate('/app/map')} />
        <EmptyState
          title="Kurs məlumatı yüklənmədi"
          body={loadError ?? 'Naməlum xəta baş verdi.'}
          action={<Button onClick={() => setRetryTick((t) => t + 1)}>Yenidən cəhd et</Button>}
        />
      </div>
    );
  }

  const estimatedTotalMinor = offering.effectivePriceMinor + offering.registrationFeeMinor;
  const canSubmit = agreed && !!name.trim() && !!phone.trim() && !!offering.cohortId;

  const submit = () => {
    if (!offering.cohortId) {
      setSubmitError('Bu kurs üçün aktiv qrup tapılmadı, ona görə qeydiyyat göndərilə bilmir.');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    api.createRegistration({
      cohortId: offering.cohortId,
      studentName: name,
      studentPhone: phone,
      studentAge: age || undefined,
      promoCode: promo.trim() || undefined,
      idempotencyKey,
    })
      .then((res) => {
        if (!mountedRef.current) return;
        setReg(res.registration);
        setReplayed(res.replayed);
        setStep(5);
        show(res.replayed ? 'Bu qeydiyyat artıq göndərilib.' : 'Qeydiyyatınız tamamlandı!', 'success');
      })
      .catch((e) => {
        if (!mountedRef.current) return;
        const message = e instanceof ApiError ? e.message : 'Qeydiyyat göndərilmədi. İnternet bağlantınızı yoxlayıb yenidən cəhd edin.';
        setSubmitError(message);
        show(message, 'error');
      })
      .finally(() => {
        if (mountedRef.current) setSubmitting(false);
      });
  };

  if (reg) {
    return (
      <div className="min-h-screen bg-ink-50 pb-8">
        <TopBar title="Qeydiyyat təsdiqləndi" onBack={() => navigate('/app/map')} />
        <div className="px-4 flex flex-col items-center text-center pt-4">
          <CrowMascot size={72} mood="happy" />
          <h1 className="font-bold text-lg text-ink-900 mt-3">
            {replayed ? 'Bu qeydiyyat artıq göndərilib' : 'Təbriklər, qeydiyyatınız tamamlandı!'}
          </h1>
          <p className="text-sm text-ink-500 mt-1">Qeydiyyat №<span className="font-bold text-ink-900">{reg.ref}</span></p>

          <div className="bg-white rounded-2xl border border-ink-100 p-4 mt-4 w-full text-left">
            <Row label="Kurs" value={offering.title} />
            <Row label="Filial" value={offering.branch.name} />
            <Row label="Cədvəl" value={`${offering.schedule.lessonDays.join(', ')} • ${offering.schedule.lessonTime}`} />
            <Row label="Qiymət" value={formatMinor(reg.price_minor)} />
            {reg.registration_fee_minor > 0 && <Row label="Qeydiyyat haqqı" value={formatMinor(reg.registration_fee_minor)} />}
            {reg.discount_minor > 0 && <Row label="Endirim" value={`-${formatMinor(reg.discount_minor)}`} />}
            <Row label="Yekun ödəniş" value={formatMinor(reg.final_price_minor)} />
            <Row label="Ödəniş statusu" value="Kursda ödəniləcək" />
            <Row label="Status" value={REGISTRATION_STATUS_LABELS[reg.status] ?? reg.status} />
          </div>

          {reg.promo_message && (
            <div className="bg-ink-100 text-ink-600 rounded-xl p-3 text-xs mt-3 text-left">
              {reg.promo_message}
            </div>
          )}

          <div className="bg-teal-100 text-teal-700 rounded-xl p-3 text-xs mt-3 text-left flex items-start gap-2">
            <Icon.shield size={16} className="shrink-0 mt-0.5" />
            <span><b>Qarğa Qeydiyyat Qoruması</b> aktivdir: qiymət, cədvəl və ya məkan dəyişərsə, dəstək komandamıza müraciət edə bilərsiniz.</span>
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
              <p className="font-bold text-ink-900">{offering.title}</p>
              <p className="text-xs text-ink-500 mt-1">{offering.provider.name} • {offering.branch.name}</p>
              <Row label="Cədvəl" value={`${offering.schedule.lessonDays.join(', ')} • ${offering.schedule.lessonTime}`} />
              <Row label="Format" value={offering.format === 'offline' ? 'Oflayn' : offering.format === 'online' ? 'Onlayn' : 'Hibrid'} />
              <Row label="Başlanğıc tarixi" value={formatDateAz(offering.schedule.startDate)} />
              <Row label="Qiymət" value={formatMinor(offering.effectivePriceMinor) + '/ay'} />
            </div>
            <Button fullWidth className="mt-4" onClick={() => setStep(1)}>Davam et</Button>
          </div>
        )}

        {step === 1 && (
          <div>
            <TextInput label="Tələbənin adı" value={name} onChange={(e) => setName(e.target.value)} />
            <TextInput label="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
            <TextInput label="Yaş" value={age} onChange={(e) => setAge(e.target.value)} inputMode="numeric" placeholder={offering.ageGroup} />
            <Button fullWidth disabled={!name || !phone} onClick={() => setStep(2)}>Davam et</Button>
          </div>
        )}

        {step === 2 && (
          <div>
            <TextInput
              label="Promo kod (istəyə bağlı)"
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="Məs: QARGA10"
              hint="Promo kodunun etibarlılığı qeydiyyat təsdiqlənərkən server tərəfindən yoxlanılır."
            />
            <div className="bg-ink-50 rounded-xl p-3 text-sm mb-3">
              <div className="flex justify-between"><span>Əsas qiymət</span><span>{formatMinor(offering.effectivePriceMinor)}</span></div>
              {offering.registrationFeeMinor > 0 && (
                <div className="flex justify-between"><span>Qeydiyyat haqqı</span><span>{formatMinor(offering.registrationFeeMinor)}</span></div>
              )}
              <div className="flex justify-between font-bold border-t border-ink-200 mt-1 pt-1">
                <span>Təxmini yekun</span><span>{formatMinor(estimatedTotalMinor)}</span>
              </div>
              <p className="text-[11px] text-ink-400 mt-1">Yekun məbləğ qeydiyyat təsdiqləndikdən sonra serverdən gələn qəbzdə göstərilir.</p>
            </div>
            <Button fullWidth onClick={() => setStep(3)}>Davam et</Button>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="bg-white rounded-2xl border border-ink-100 p-4 text-sm text-ink-600 mb-3">
              <p className="font-bold text-ink-900 mb-1">Kurs şərtləri</p>
              <p>{offering.cancellationPolicy}</p>
            </div>
            <div className="bg-teal-100 text-teal-700 rounded-xl p-3 text-xs mb-3 flex items-start gap-2">
              <Icon.shield size={16} className="shrink-0 mt-0.5" />
              <span>Qarğa Qeydiyyat Qoruması ilə qiymət, cədvəl və ya məkan dəyişikliyi zamanı dəstək alacaqsınız.</span>
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
              <span>Mərkəzdə ödəniləcək təxmini məbləğ</span><span>{formatMinor(estimatedTotalMinor)}</span>
            </div>
            {submitError && (
              <div className="bg-coral-100 text-coral-500 rounded-xl p-3 text-sm mb-4" role="alert">{submitError}</div>
            )}
            <Button fullWidth onClick={submit} disabled={!canSubmit || submitting}>
              {submitting ? 'Göndərilir…' : 'Qeydiyyatı təsdiqlə'}
            </Button>
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
