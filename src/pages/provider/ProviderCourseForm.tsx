import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useProviderScope } from './useProviderScope';
import { TextInput, TextArea } from '../../components/FormField';
import { Chip } from '../../components/Chip';
import { Button } from '../../components/Button';
import { TopBar } from '../../components/TopBar';
import { useToast } from '../../components/Toast';
import type { CourseFormat, CourseLevel, DayPart, LessonMode, TrialSlot } from '../../types';

const ALL_DAYS = ['Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə', 'Bazar'];
const PHOTO_ICONS = ['📘', '🎨', '💻', '🎵', '🏋️', '🍳', '🚗', '💄', '🖌️', '📈', '🧮', '🗣️'];

export function ProviderCourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const { providerId, myBranches } = useProviderScope();
  const categories = useAppStore((s) => s.categories);
  const courses = useAppStore((s) => s.courses);
  const addCourse = useAppStore((s) => s.addCourse);
  const updateCourse = useAppStore((s) => s.updateCourse);

  const existing = id ? courses.find((c) => c.id === id) : undefined;
  const isEdit = !!existing;

  const [branchId, setBranchId] = useState(existing?.branchId ?? myBranches[0]?.id ?? '');
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? categories[0]?.id ?? '');
  const [subcategory, setSubcategory] = useState(existing?.subcategory ?? '');
  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [photo, setPhoto] = useState(existing?.photos[0] ?? PHOTO_ICONS[0]);
  const [price, setPrice] = useState(existing?.price ?? 100);
  const [discountPrice, setDiscountPrice] = useState(existing?.discountPrice ?? 0);
  const [registrationFee, setRegistrationFee] = useState(existing?.registrationFee ?? 0);
  const [durationWeeks, setDurationWeeks] = useState(existing?.durationWeeks ?? 8);
  const [startDate, setStartDate] = useState(existing?.startDate ?? new Date().toISOString().slice(0, 10));
  const [lessonDays, setLessonDays] = useState<string[]>(existing?.lessonDays ?? []);
  const [lessonTime, setLessonTime] = useState(existing?.lessonTime ?? '18:00-19:30');
  const [dayPart, setDayPart] = useState<DayPart>(existing?.dayPart ?? 'evening');
  const [format, setFormat] = useState<CourseFormat>(existing?.format ?? 'offline');
  const [mode, setMode] = useState<LessonMode>(existing?.mode ?? 'group');
  const [maxGroupSize, setMaxGroupSize] = useState(existing?.maxGroupSize ?? 10);
  const [ageGroup, setAgeGroup] = useState(existing?.ageGroup ?? '16+ yaş');
  const [level, setLevel] = useState<CourseLevel>(existing?.level ?? 'beginner');
  const [language, setLanguage] = useState(existing?.language ?? 'Azərbaycan dili');
  const [certificate, setCertificate] = useState(existing?.certificate ?? false);
  const [seatsTotal, setSeatsTotal] = useState(existing?.seatsTotal ?? 10);
  const [freeTrial, setFreeTrial] = useState(existing?.freeTrial ?? true);
  const [trialSlots, setTrialSlots] = useState<TrialSlot[]>(existing?.trialSlots ?? []);
  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('');
  const [teacherName, setTeacherName] = useState(existing?.teacher.name ?? '');
  const [teacherBio, setTeacherBio] = useState(existing?.teacher.bio ?? '');
  const [qargaExclusive, setQargaExclusive] = useState(existing?.qargaExclusive ?? false);
  const [cancellationPolicy, setCancellationPolicy] = useState(existing?.cancellationPolicy ?? 'Dərslər başlamazdan 48 saat əvvəl ləğv etdikdə tam geri ödəmə.');

  const category = categories.find((c) => c.id === categoryId);

  const toggleDay = (d: string) => setLessonDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  const addSlot = () => {
    if (!slotDate || !slotTime) return;
    setTrialSlots((prev) => {
      const existingSlot = prev.find((s) => s.date === slotDate);
      if (existingSlot) return prev.map((s) => (s.date === slotDate ? { ...s, times: [...new Set([...s.times, slotTime])] } : s));
      return [...prev, { date: slotDate, times: [slotTime] }];
    });
    setSlotTime('');
  };

  const submit = () => {
    if (!title.trim() || !branchId || !description.trim()) { show('Zəhmət olmasa əsas sahələri doldurun', 'error'); return; }
    const payload = {
      providerId, branchId, categoryId, subcategory: subcategory || category?.subcategories[0]?.az || '',
      title, description, photos: [photo], price, discountPrice: discountPrice || undefined, registrationFee,
      durationWeeks, startDate, lessonDays, lessonTime, dayPart, format, mode, maxGroupSize, ageGroup, level,
      language, certificate, seatsTotal, seatsAvailable: existing?.seatsAvailable ?? seatsTotal, freeTrial, trialSlots,
      verifiedProvider: existing?.verifiedProvider ?? false, qargaExclusive, promoted: existing?.promoted ?? false,
      teacher: { name: teacherName, bio: teacherBio, experienceYears: existing?.teacher.experienceYears ?? 1 },
      faqs: existing?.faqs ?? [], cancellationPolicy,
    };
    if (isEdit && existing) {
      updateCourse(existing.id, payload);
      show('Dəyişikliklər admin təsdiqinə göndərildi', 'success');
    } else {
      addCourse(payload);
      show('Kurs admin təsdiqinə göndərildi', 'success');
    }
    navigate('/provider/courses');
  };

  return (
    <div className="pb-10">
      <TopBar title={isEdit ? 'Kursu redaktə et' : 'Yeni kurs'} onBack={() => navigate('/provider/courses')} />
      <div className="p-5 max-w-2xl">
        <label className="block mb-3">
          <span className="block text-sm font-semibold text-ink-800 mb-1">Filial</span>
          <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm">
            {myBranches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>

        <label className="block mb-3">
          <span className="block text-sm font-semibold text-ink-800 mb-1">Kateqoriya</span>
          <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSubcategory(''); }} className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name.az}</option>)}
          </select>
        </label>

        <label className="block mb-3">
          <span className="block text-sm font-semibold text-ink-800 mb-1">Alt kateqoriya</span>
          <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm">
            {category?.subcategories.map((sc) => <option key={sc.az} value={sc.az}>{sc.az}</option>)}
          </select>
        </label>

        <TextInput label="Kurs adı" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextArea label="Təsvir" value={description} onChange={(e) => setDescription(e.target.value)} />

        <div className="mb-3">
          <span className="block text-sm font-semibold text-ink-800 mb-1">Örtük ikonu</span>
          <div className="flex flex-wrap gap-2">
            {PHOTO_ICONS.map((p) => (
              <button key={p} onClick={() => setPhoto(p)} className={`w-10 h-10 rounded-xl border text-lg flex items-center justify-center ${photo === p ? 'border-ink-900 bg-ink-50' : 'border-ink-200'}`}>{p}</button>
            ))}
          </div>
          <p className="text-xs text-ink-400 mt-1">Şəkil/video yükləmə istehsalat versiyasında bulud yaddaşı ilə əlavə olunacaq.</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <TextInput label="Qiymət (₼)" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          <TextInput label="Qarğa qiyməti (₼)" type="number" value={discountPrice} onChange={(e) => setDiscountPrice(Number(e.target.value))} />
          <TextInput label="Qeydiyyat haqqı (₼)" type="number" value={registrationFee} onChange={(e) => setRegistrationFee(Number(e.target.value))} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <TextInput label="Müddət (həftə)" type="number" value={durationWeeks} onChange={(e) => setDurationWeeks(Number(e.target.value))} />
          <TextInput label="Başlanğıc tarixi" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        <div className="mb-3">
          <span className="block text-sm font-semibold text-ink-800 mb-1">Dərs günləri</span>
          <div className="flex flex-wrap gap-2">
            {ALL_DAYS.map((d) => <Chip key={d} active={lessonDays.includes(d)} onClick={() => toggleDay(d)}>{d}</Chip>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <TextInput label="Dərs saatı" value={lessonTime} onChange={(e) => setLessonTime(e.target.value)} placeholder="18:00-19:30" />
          <label className="block mb-3">
            <span className="block text-sm font-semibold text-ink-800 mb-1">Gün vaxtı</span>
            <select value={dayPart} onChange={(e) => setDayPart(e.target.value as DayPart)} className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm">
              <option value="morning">Səhər</option>
              <option value="afternoon">Gündüz</option>
              <option value="evening">Axşam</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="block mb-3">
            <span className="block text-sm font-semibold text-ink-800 mb-1">Format</span>
            <select value={format} onChange={(e) => setFormat(e.target.value as CourseFormat)} className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm">
              <option value="offline">Oflayn</option>
              <option value="online">Onlayn</option>
              <option value="hybrid">Hibrid</option>
            </select>
          </label>
          <label className="block mb-3">
            <span className="block text-sm font-semibold text-ink-800 mb-1">Dərs növü</span>
            <select value={mode} onChange={(e) => setMode(e.target.value as LessonMode)} className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm">
              <option value="group">Qrup</option>
              <option value="individual">Fərdi</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {mode === 'group' && <TextInput label="Maks. qrup ölçüsü" type="number" value={maxGroupSize} onChange={(e) => setMaxGroupSize(Number(e.target.value))} />}
          <TextInput label="Yaş qrupu" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="block mb-3">
            <span className="block text-sm font-semibold text-ink-800 mb-1">Səviyyə</span>
            <select value={level} onChange={(e) => setLevel(e.target.value as CourseLevel)} className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm">
              <option value="beginner">Başlanğıc</option>
              <option value="elementary">Elementary</option>
              <option value="intermediate">Orta</option>
              <option value="advanced">İrəli</option>
              <option value="all">Bütün səviyyələr</option>
            </select>
          </label>
          <TextInput label="Tədris dili" value={language} onChange={(e) => setLanguage(e.target.value)} />
        </div>

        <TextInput label="Ümumi yer sayı" type="number" value={seatsTotal} onChange={(e) => setSeatsTotal(Number(e.target.value))} />

        <div className="flex flex-wrap gap-2 mb-3">
          <Chip active={certificate} onClick={() => setCertificate(!certificate)}>🎓 Sertifikat verilir</Chip>
          <Chip active={freeTrial} onClick={() => setFreeTrial(!freeTrial)}>🎁 Pulsuz sınaq dərsi</Chip>
          <Chip active={qargaExclusive} onClick={() => setQargaExclusive(!qargaExclusive)}>🐦‍⬛ Qarğa endirimi təklif et</Chip>
        </div>

        {freeTrial && (
          <div className="mb-3">
            <span className="block text-sm font-semibold text-ink-800 mb-1">Sınaq dərsi tarixləri</span>
            <div className="flex gap-2 mb-2">
              <input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} className="flex-1 rounded-xl border border-ink-200 px-3 py-2 text-sm" />
              <input type="time" value={slotTime} onChange={(e) => setSlotTime(e.target.value)} className="flex-1 rounded-xl border border-ink-200 px-3 py-2 text-sm" />
              <button onClick={addSlot} className="bg-ink-900 text-white px-3 rounded-xl text-sm font-semibold">Əlavə et</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {trialSlots.map((s) => (
                <span key={s.date} className="text-xs px-2.5 py-1 rounded-full bg-teal-100 text-teal-700 font-medium">{s.date} • {s.times.join(', ')}</span>
              ))}
            </div>
          </div>
        )}

        <TextInput label="Müəllim adı" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} />
        <TextArea label="Müəllim haqqında" value={teacherBio} onChange={(e) => setTeacherBio(e.target.value)} />
        <TextArea label="Ləğvetmə / geri ödəmə qaydaları" value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value)} />

        <Button fullWidth onClick={submit}>{isEdit ? 'Dəyişiklikləri göndər' : 'Kursu admin təsdiqinə göndər'}</Button>
        <p className="text-xs text-ink-400 text-center mt-2">Yeni kurslar və redaktələr yayımlanmazdan əvvəl Qarğa admin komandası tərəfindən yoxlanılır.</p>
      </div>
    </div>
  );
}
