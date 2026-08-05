import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { getCategory } from '../../data/categories';
import { getBranch } from '../../data/mockData';
import { courseDistanceKm } from '../../lib/search';
import { formatAZN, formatDistance } from '../../lib/utils';
import { CrowMascot } from '../../components/CrowMascot';
import { CourseCard } from '../../components/CourseCard';
import { Button } from '../../components/Button';
import { courseToOfferingSummary, mockCategoryToInfo } from '../../lib/legacyCourseAdapter';
import type { Course, CourseFormat, CourseLevel, DayPart, LessonMode } from '../../types';

interface Answers {
  categoryId: string | null;
  area: string | null;
  budget: number | null;
  dayPart: DayPart | null;
  format: CourseFormat | null;
  mode: LessonMode | null;
  level: CourseLevel | null;
  certificate: boolean | null;
}

interface TranscriptEntry {
  from: 'crow' | 'user';
  text: string;
}

const budgetOptions = [80, 120, 180, 250, 400];

export function CrowAssistant() {
  const courses = useAppStore((s) => s.courses);
  const categories = useAppStore((s) => s.categories);
  const areasList = useMemo(() => Array.from(new Set(courses.map((c) => getBranch(c.branchId)?.area).filter(Boolean))) as string[], [courses]);
  const currentUser = useAppStore((s) => s.currentUser);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ categoryId: null, area: null, budget: null, dayPart: null, format: null, mode: null, level: null, certificate: null });
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([
    { from: 'crow', text: 'Salam! Mən Qarğayam 🐦‍⬛ Sənə ən uyğun kursu tapmağa kömək edəcəyəm. Hansı kursu axtarırsan?' },
  ]);
  const [thinking, setThinking] = useState(false);
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [transcript, thinking, done]);

  const questions = [
    { id: 'category', text: 'Hansı kursu axtarırsan?' },
    { id: 'area', text: 'Hansı ərazi sənin üçün əlverişlidir?' },
    { id: 'budget', text: 'Aylıq büdcən nə qədərdir?' },
    { id: 'dayPart', text: 'Hansı vaxtlar sənə uyğundur?' },
    { id: 'format', text: 'Onlayn, oflayn yoxsa hibrid formatı üstün tutursan?' },
    { id: 'mode', text: 'Fərdi yoxsa qrup dərslərini seçirsən?' },
    { id: 'level', text: 'Hazırkı səviyyən nədir?' },
    { id: 'certificate', text: 'Sertifikat almaq sənin üçün vacibdir?' },
  ] as const;

  const pushAnswer = (label: string, patch: Partial<Answers>) => {
    setTranscript((t) => [...t, { from: 'user', text: label }]);
    setAnswers((a) => ({ ...a, ...patch }));
    const next = step + 1;
    if (next < questions.length) {
      setTimeout(() => {
        setTranscript((t) => [...t, { from: 'crow', text: questions[next].text }]);
        setStep(next);
      }, 350);
    } else {
      setThinking(true);
      setTimeout(() => {
        setThinking(false);
        setDone(true);
      }, 900);
    }
  };

  const skip = () => {
    const next = step + 1;
    if (next < questions.length) {
      setTranscript((t) => [...t, { from: 'user', text: 'Fərq etməz' }, { from: 'crow', text: questions[next].text }]);
      setStep(next);
    } else {
      setTranscript((t) => [...t, { from: 'user', text: 'Fərq etməz' }]);
      setThinking(true);
      setTimeout(() => { setThinking(false); setDone(true); }, 900);
    }
  };

  const results = useMemo(() => {
    if (!done) return [];
    let pool = courses.filter((c) => c.status === 'active');
    const tryFilter = (list: Course[]) => list.filter((c) => {
      if (answers.categoryId && c.categoryId !== answers.categoryId) return false;
      if (answers.area && getBranch(c.branchId)?.area !== answers.area) return false;
      if (answers.budget && (c.discountPrice ?? c.price) > answers.budget) return false;
      if (answers.dayPart && c.dayPart !== answers.dayPart) return false;
      if (answers.format && c.format !== answers.format) return false;
      if (answers.mode && c.mode !== answers.mode) return false;
      if (answers.level && c.level !== answers.level && c.level !== 'all') return false;
      if (answers.certificate && !c.certificate) return false;
      return true;
    });

    let strict = tryFilter(pool);
    if (strict.length < 3) {
      const relaxed = { ...answers, certificate: null };
      strict = pool.filter((c) => {
        if (relaxed.categoryId && c.categoryId !== relaxed.categoryId) return false;
        if (relaxed.area && getBranch(c.branchId)?.area !== relaxed.area) return false;
        if (relaxed.budget && (c.discountPrice ?? c.price) > relaxed.budget * 1.15) return false;
        if (relaxed.dayPart && c.dayPart !== relaxed.dayPart) return false;
        if (relaxed.format && c.format !== relaxed.format) return false;
        if (relaxed.mode && c.mode !== relaxed.mode) return false;
        return true;
      });
    }
    if (strict.length < 3) {
      strict = pool.filter((c) => (!answers.categoryId || c.categoryId === answers.categoryId));
    }
    if (strict.length === 0) strict = pool;
    return strict;
  }, [done, courses, answers]);

  const scored = useMemo(() => {
    return results.map((c) => {
      const distance = courseDistanceKm(c, currentUser?.location ?? null);
      const price = c.discountPrice ?? c.price;
      const score = c.rating * 2 - (distance ?? 5) * 0.25 - price / 150 + (c.freeTrial ? 0.6 : 0) + (c.qargaExclusive ? 0.6 : 0);
      return { course: c, distance, price, score };
    }).sort((a, b) => b.score - a.score);
  }, [results, currentUser?.location]);

  const closest = useMemo(() => [...scored].filter((s) => s.distance !== null).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))[0], [scored]);
  const cheapest = useMemo(() => [...scored].sort((a, b) => a.price - b.price)[0], [scored]);
  const highestRated = useMemo(() => [...scored].sort((a, b) => b.course.rating - a.course.rating)[0], [scored]);
  const bestTrial = useMemo(() => scored.find((s) => s.course.freeTrial), [scored]);
  const bestDiscount = useMemo(() => scored.find((s) => s.course.qargaExclusive), [scored]);
  const bestOverall = scored[0];

  const explain = (item: typeof scored[number]) => {
    const parts: string[] = [];
    if (item.distance !== null) parts.push(`məkanından ${formatDistance(item.distance)} məsafədədir`);
    if (answers.budget) parts.push(item.price <= answers.budget ? 'aylıq büdcənə uyğundur' : 'büdcəndən bir az yuxarıdır, amma ən yaxın uyğun seçimdir');
    if (answers.dayPart && item.course.dayPart === answers.dayPart) parts.push('seçdiyin vaxt aralığında dərslər var');
    if (item.course.freeTrial) parts.push('pulsuz sınaq dərsi təklif edir');
    if (item.course.qargaExclusive) parts.push('Qarğa-exclusive endirimi var');
    if (item.course.rating >= 4.5) parts.push(`${item.course.rating} ulduzla yüksək qiymətləndirilib`);
    return `Bu kurs ${parts.join(', ')}.`;
  };

  const restart = () => {
    setStep(0);
    setAnswers({ categoryId: null, area: null, budget: null, dayPart: null, format: null, mode: null, level: null, certificate: null });
    setTranscript([{ from: 'crow', text: 'Yaxşı, yenidən başlayaq! Hansı kursu axtarırsan?' }]);
    setDone(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-ink-50">
      <div className="bg-ink-900 text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <CrowMascot size={40} mood={thinking ? 'thinking' : 'happy'} />
        <div>
          <p className="font-bold">Qarğa Köməkçisi</p>
          <p className="text-xs text-ink-300">Sən kurs axtarma, Qarğa tapsın</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 no-scrollbar">
        {transcript.map((entry, i) => (
          <div key={i} className={`flex ${entry.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${entry.from === 'user' ? 'bg-ink-900 text-white rounded-br-sm' : 'bg-white text-ink-900 rounded-bl-sm shadow-sm'}`}>
              {entry.text}
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm px-4 py-3 flex items-center gap-2">
              <CrowMascot size={24} mood="thinking" animated />
              <span className="text-sm text-ink-500">Ən uyğun kursları axtarıram…</span>
            </div>
          </div>
        )}

        {!done && !thinking && (
          <div className="mt-2">
            {questions[step].id === 'category' && (
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button key={c.id} onClick={() => pushAnswer(c.name.az, { categoryId: c.id })} className="px-3 py-2 rounded-full bg-white border border-ink-200 text-sm flex items-center gap-1.5">
                    <span>{c.icon}</span>{c.name.az}
                  </button>
                ))}
              </div>
            )}
            {questions[step].id === 'area' && (
              <div className="flex flex-wrap gap-2">
                {areasList.map((a) => (
                  <button key={a} onClick={() => pushAnswer(a, { area: a })} className="px-3 py-2 rounded-full bg-white border border-ink-200 text-sm">📍 {a}</button>
                ))}
              </div>
            )}
            {questions[step].id === 'budget' && (
              <div className="flex flex-wrap gap-2">
                {budgetOptions.map((b) => (
                  <button key={b} onClick={() => pushAnswer(`${b} ₼-ə qədər`, { budget: b })} className="px-3 py-2 rounded-full bg-white border border-ink-200 text-sm">{formatAZN(b)}-ə qədər</button>
                ))}
              </div>
            )}
            {questions[step].id === 'dayPart' && (
              <div className="flex flex-wrap gap-2">
                {[{ id: 'morning', label: '🌅 Səhər' }, { id: 'afternoon', label: '🌤️ Gündüz' }, { id: 'evening', label: '🌙 Axşam' }].map((o) => (
                  <button key={o.id} onClick={() => pushAnswer(o.label, { dayPart: o.id as DayPart })} className="px-3 py-2 rounded-full bg-white border border-ink-200 text-sm">{o.label}</button>
                ))}
              </div>
            )}
            {questions[step].id === 'format' && (
              <div className="flex flex-wrap gap-2">
                {[{ id: 'offline', label: 'Oflayn' }, { id: 'online', label: 'Onlayn' }, { id: 'hybrid', label: 'Hibrid' }].map((o) => (
                  <button key={o.id} onClick={() => pushAnswer(o.label, { format: o.id as CourseFormat })} className="px-3 py-2 rounded-full bg-white border border-ink-200 text-sm">{o.label}</button>
                ))}
              </div>
            )}
            {questions[step].id === 'mode' && (
              <div className="flex flex-wrap gap-2">
                {[{ id: 'group', label: 'Qrup' }, { id: 'individual', label: 'Fərdi' }].map((o) => (
                  <button key={o.id} onClick={() => pushAnswer(o.label, { mode: o.id as LessonMode })} className="px-3 py-2 rounded-full bg-white border border-ink-200 text-sm">{o.label}</button>
                ))}
              </div>
            )}
            {questions[step].id === 'level' && (
              <div className="flex flex-wrap gap-2">
                {[{ id: 'beginner', label: 'Başlanğıc' }, { id: 'intermediate', label: 'Orta' }, { id: 'advanced', label: 'İrəli' }].map((o) => (
                  <button key={o.id} onClick={() => pushAnswer(o.label, { level: o.id as CourseLevel })} className="px-3 py-2 rounded-full bg-white border border-ink-200 text-sm">{o.label}</button>
                ))}
              </div>
            )}
            {questions[step].id === 'certificate' && (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => pushAnswer('Bəli', { certificate: true })} className="px-3 py-2 rounded-full bg-white border border-ink-200 text-sm">✅ Bəli</button>
                <button onClick={() => pushAnswer('Xeyr', { certificate: false })} className="px-3 py-2 rounded-full bg-white border border-ink-200 text-sm">❌ Xeyr</button>
              </div>
            )}
            <button onClick={skip} className="text-xs text-ink-400 mt-2 underline">Fərq etməz, keç</button>
          </div>
        )}

        {done && (
          <div className="flex flex-col gap-4 mt-2">
            {bestOverall && (
              <RecommendationBlock title="🏆 Ən uyğun seçim" item={bestOverall} explain={explain} />
            )}
            <div className="grid grid-cols-2 gap-2">
              {closest && <MiniPick label="📍 Ən yaxın" item={closest} />}
              {cheapest && <MiniPick label="💰 Ən sərfəli" item={cheapest} />}
              {highestRated && <MiniPick label="⭐ Ən yüksək reytinq" item={highestRated} />}
              {bestTrial && <MiniPick label="🎁 Pulsuz sınaqla" item={bestTrial} />}
              {bestDiscount && <MiniPick label="🐦‍⬛ Qarğa endirimi ilə" item={bestDiscount} />}
            </div>

            <div>
              <p className="text-xs font-bold text-ink-400 uppercase mb-2">Bütün tövsiyələr ({scored.length})</p>
              <div className="flex flex-col gap-3">
                {scored.slice(0, 8).map((s) => <CourseCard key={s.course.id} course={courseToOfferingSummary(s.course)} category={mockCategoryToInfo(getCategory(s.course.categoryId))} />)}
              </div>
            </div>

            <Button variant="outline" onClick={restart}>🔄 Yenidən sorğu ver</Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface ScoredCourse { course: Course; distance: number | null; price: number; score: number }

function RecommendationBlock({ title, item, explain }: { title: string; item: ScoredCourse; explain: (i: ScoredCourse) => string }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gold-300">
      <p className="text-xs font-bold text-gold-600 mb-2">{title}</p>
      <CourseCard course={courseToOfferingSummary(item.course)} category={mockCategoryToInfo(getCategory(item.course.categoryId))} dense />
      <p className="text-xs text-ink-500 mt-2 italic">🐦‍⬛ "{explain(item)}"</p>
      <Button size="sm" className="mt-2" fullWidth onClick={() => navigate(`/app/course/${item.course.id}`)}>Kursu gör</Button>
    </div>
  );
}

function MiniPick({ label, item }: { label: string; item: ScoredCourse }) {
  const navigate = useNavigate();
  const category = getCategory(item.course.categoryId);
  return (
    <button onClick={() => navigate(`/app/course/${item.course.id}`)} className="bg-white rounded-xl p-2.5 text-left border border-ink-100">
      <p className="text-[10px] font-bold text-ink-400 uppercase">{label}</p>
      <p className="text-xs font-semibold text-ink-900 truncate mt-0.5">{category?.icon} {item.course.title}</p>
      <p className="text-xs text-ink-500">{formatAZN(item.course.discountPrice ?? item.course.price)}</p>
    </button>
  );
}
