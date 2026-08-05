import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { getCategory } from '../../data/categories';
import { getBranch, getProvider } from '../../data/mockData';
import { courseDistanceKm } from '../../lib/search';
import { formatAZN, formatDateAz, formatDistance } from '../../lib/utils';
import { TopBar } from '../../components/TopBar';
import { Badge, VerifiedBadge, QargaExclusiveBadge } from '../../components/Badge';
import { RatingStars } from '../../components/RatingStars';
import { Button } from '../../components/Button';
import { CourseMap } from '../../components/CourseMap';
import { Modal } from '../../components/Sheet';
import { TextArea } from '../../components/FormField';
import { useToast } from '../../components/Toast';
import { courseToOfferingSummary, mockCategoryToInfo } from '../../lib/legacyCourseAdapter';

export function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const courses = useAppStore((s) => s.courses);
  const reviewsAll = useAppStore((s) => s.reviews);
  const currentUser = useAppStore((s) => s.currentUser);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const toggleCompare = useAppStore((s) => s.toggleCompare);
  const compareIds = useAppStore((s) => s.compareIds);
  const createSupportRequest = useAppStore((s) => s.createSupportRequest);
  const canReview = useAppStore((s) => s.canReview);
  const sendMessage = useAppStore((s) => s.sendMessage);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [messageText, setMessageText] = useState('');

  const course = courses.find((c) => c.id === id);
  const reviews = useMemo(() => (course ? reviewsAll.filter((r) => r.courseId === course.id) : []), [course, reviewsAll]);

  if (!course) {
    return (
      <div className="p-6 text-center">
        <p>Kurs tapılmadı.</p>
        <Button className="mt-3" onClick={() => navigate('/app/map')}>Xəritəyə qayıt</Button>
      </div>
    );
  }

  const category = getCategory(course.categoryId);
  const branch = getBranch(course.branchId);
  const provider = getProvider(course.providerId);
  const distance = courseDistanceKm(course, currentUser?.location ?? null);
  const isFav = favorites.includes(course.id);
  const isComparing = compareIds.includes(course.id);

  const submitContact = () => {
    if (!messageText.trim()) { show('Zəhmət olmasa sualınızı yazın', 'error'); return; }
    sendMessage({ courseId: course.id, providerId: course.providerId, subject: `${course.title} haqqında sual`, text: messageText, fromRole: 'student' });
    setContactOpen(false);
    setMessageText('');
    show('Mesajınız göndərildi', 'success');
  };

  const submitReport = () => {
    if (!reportText.trim()) { show('Zəhmət olmasa təsviri yazın', 'error'); return; }
    createSupportRequest({ category: 'incorrect_info', description: reportText, evidenceNote: '', courseId: course.id });
    setReportOpen(false);
    setReportText('');
    show('Bildirişiniz üçün təşəkkürlər, komandamız yoxlayacaq', 'success');
  };

  return (
    <div className="min-h-screen bg-ink-50 pb-28">
      <TopBar
        title=""
        transparent
        right={
          <button
            onClick={() => { toggleFavorite(course.id); show(isFav ? 'Seçilmişlərdən çıxarıldı' : 'Seçilmişlərə əlavə edildi', 'success'); }}
            className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow"
          >
            {isFav ? '❤️' : '🤍'}
          </button>
        }
      />

      <div className="flex gap-2 px-4 overflow-x-auto no-scrollbar">
        {course.photos.length ? course.photos.map((p, i) => (
          <div key={i} className="w-24 h-24 rounded-2xl shrink-0 flex items-center justify-center text-4xl" style={{ background: `${category?.color}1a` }}>{p}</div>
        )) : (
          <div className="w-24 h-24 rounded-2xl shrink-0 flex items-center justify-center text-4xl" style={{ background: `${category?.color}1a` }}>{category?.icon}</div>
        )}
      </div>

      <div className="px-4 mt-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold" style={{ color: category?.color }}>{category?.icon} {category?.name.az} • {course.subcategory}</span>
        </div>
        <h1 className="text-xl font-bold text-ink-900 mt-1">{course.title}</h1>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-sm text-ink-600">{provider?.name}</span>
          {course.verifiedProvider && <VerifiedBadge />}
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <RatingStars rating={course.rating} reviewCount={course.reviewCount} size="md" />
          {distance !== null && <span className="text-sm text-ink-500">• {formatDistance(distance)}</span>}
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {course.qargaExclusive && <QargaExclusiveBadge size="md" />}
          {course.freeTrial && <Badge tone="teal" size="md">🎁 Pulsuz sınaq dərsi</Badge>}
          {course.certificate && <Badge tone="neutral" size="md">🎓 Sertifikat</Badge>}
          <Badge tone={course.seatsAvailable > 3 ? 'neutral' : 'coral'} size="md">💺 {course.seatsAvailable}/{course.seatsTotal} yer</Badge>
        </div>

        <p className="text-sm text-ink-600 mt-4 leading-relaxed">{course.description}</p>

        <div className="bg-white rounded-2xl border border-ink-100 p-4 mt-4">
          <div className="flex items-baseline justify-between">
            <div>
              {course.discountPrice ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-ink-900">{formatAZN(course.discountPrice)}</span>
                  <span className="text-sm text-ink-400 line-through">{formatAZN(course.price)}</span>
                </div>
              ) : (
                <span className="text-2xl font-bold text-ink-900">{formatAZN(course.price)}</span>
              )}
              <p className="text-xs text-ink-400">aylıq • qeydiyyat haqqı {course.registrationFee > 0 ? formatAZN(course.registrationFee) : 'yoxdur'}</p>
            </div>
            <span className="text-xs text-ink-400 text-right">{course.durationWeeks} həftə<br />başlanğıc: {formatDateAz(course.startDate)}</span>
          </div>
        </div>

        <InfoGrid course={course} />

        <Section title="Filial və məkan">
          <p className="text-sm font-semibold text-ink-800">{branch?.name}</p>
          <p className="text-xs text-ink-500">{branch?.address}, {branch?.area}</p>
          <div className="rounded-2xl overflow-hidden border border-ink-100 mt-2" style={{ height: 180 }}>
            <CourseMap courses={[courseToOfferingSummary(course)]} categories={category ? [mockCategoryToInfo(category)!] : []} height="100%" />
          </div>
          {branch && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-ink-900 mt-2"
            >
              🧭 İstiqamətləri göstər
            </a>
          )}
        </Section>

        <Section title="Müəllim">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-ink-100 flex items-center justify-center text-xl">👤</div>
            <div>
              <p className="text-sm font-semibold text-ink-900">{course.teacher.name}</p>
              <p className="text-xs text-ink-500">{course.teacher.bio}</p>
            </div>
          </div>
        </Section>

        <Section title="Sualın var?">
          <button onClick={() => setContactOpen(true)} className="w-full flex items-center justify-between bg-white border border-ink-100 rounded-xl px-4 py-3">
            <span className="text-sm font-semibold text-ink-800">💬 Provayderə mesaj göndər</span>
            <span className="text-ink-300">→</span>
          </button>
        </Section>

        {course.freeTrial && course.trialSlots.length > 0 && (
          <Section title="Pulsuz sınaq dərsi">
            <div className="flex flex-wrap gap-2">
              {course.trialSlots.map((slot) => (
                <span key={slot.date} className="text-xs px-2.5 py-1 rounded-full bg-teal-100 text-teal-700 font-medium">
                  {formatDateAz(slot.date)} • {slot.times.join(', ')}
                </span>
              ))}
            </div>
          </Section>
        )}

        <Section title={`Rəylər (${reviews.length})`}>
          {reviews.length === 0 ? (
            <p className="text-sm text-ink-400">Hələ rəy yoxdur. İlk rəyi sən yaz!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-ink-100 pb-3 last:border-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink-900">{r.userName}</p>
                    {r.verified && <Badge tone="teal">✓ Təsdiqlənmiş tələbə</Badge>}
                  </div>
                  <RatingStars rating={r.overall} />
                  <p className="text-sm text-ink-600 mt-1">{r.text}</p>
                  {r.providerReply && (
                    <div className="bg-ink-50 rounded-xl p-2.5 mt-2">
                      <p className="text-xs font-semibold text-ink-700">Kurs mərkəzinin cavabı:</p>
                      <p className="text-xs text-ink-600">{r.providerReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {canReview(course.id) && (
            <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate(`/app/review/${course.id}`)}>✍️ Rəy yaz</Button>
          )}
        </Section>

        {course.faqs.length > 0 && (
          <Section title="Tez-tez verilən suallar">
            <div className="flex flex-col gap-2">
              {course.faqs.map((f, i) => (
                <div key={i} className="border border-ink-100 rounded-xl overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-3 py-2.5 text-sm font-semibold text-ink-800 flex justify-between items-center">
                    {f.q.az} <span>{openFaq === i ? '−' : '+'}</span>
                  </button>
                  {openFaq === i && <p className="px-3 pb-2.5 text-sm text-ink-600">{f.a.az}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section title="Ləğvetmə və geri ödəmə qaydaları">
          <p className="text-sm text-ink-600">{course.cancellationPolicy}</p>
        </Section>

        <Section title="Qarğa Qeydiyyat Qoruması">
          <p className="text-sm text-ink-600">Bu kurs Qarğa vasitəsilə qeydiyyatdan keçdiyiniz üçün qiymət, cədvəl və ya məkan dəyişikliklərinə qarşı qorunursunuz. Problem yaranarsa, Qarğa dəstək komandası sizin adınıza həll yolu tapacaq.</p>
        </Section>

        <button onClick={() => setReportOpen(true)} className="text-xs text-ink-400 underline mt-4 mb-2">🚩 Səhv məlumatı bildir</button>
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-ink-100 p-3 z-30">
        <div className="mx-auto max-w-lg flex gap-2">
          <button
            onClick={() => { const r = toggleCompare(course.id); show(r.ok ? (isComparing ? 'Müqayisədən çıxarıldı' : 'Müqayisəyə əlavə edildi') : (r.message ?? ''), r.ok ? 'success' : 'error'); }}
            className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${isComparing ? 'bg-ink-900 border-ink-900 text-white' : 'border-ink-200 text-ink-600'}`}
            aria-label="Müqayisə et"
          >
            ⚖️
          </button>
          {course.freeTrial && (
            <Button variant="outline" fullWidth onClick={() => navigate(`/app/trial/${course.id}`)}>Sınaq rezerv et</Button>
          )}
          <Button fullWidth onClick={() => navigate(`/app/register/${course.id}`)}>Qeydiyyatdan keç</Button>
        </div>
      </div>

      <Modal open={contactOpen} onClose={() => setContactOpen(false)}>
        <h3 className="font-bold text-lg text-ink-900 mb-1">Provayderə mesaj göndər</h3>
        <p className="text-sm text-ink-500 mb-3">Telefon nömrənizi paylaşmadan sualınızı dərhal göndərə bilərsiniz.</p>
        <TextArea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Məsələn: Qrupda hələ yer varmı?" />
        <Button fullWidth onClick={submitContact}>Göndər</Button>
      </Modal>

      <Modal open={reportOpen} onClose={() => setReportOpen(false)}>
        <h3 className="font-bold text-lg text-ink-900 mb-1">Səhv məlumatı bildir</h3>
        <p className="text-sm text-ink-500 mb-3">Bu kursda hansı məlumat yanlışdır? (qiymət, cədvəl, məkan və s.)</p>
        <TextArea value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder="Məsələn: Qiymət elandan fərqlidir…" />
        <Button fullWidth onClick={submitReport}>Göndər</Button>
      </Modal>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-5">
      <h2 className="font-bold text-ink-900 mb-2">{title}</h2>
      {children}
    </div>
  );
}

function InfoGrid({ course }: { course: import('../../types').Course }) {
  const rows: [string, string][] = [
    ['Cədvəl', `${course.lessonDays.join(', ')} • ${course.lessonTime}`],
    ['Format', course.format === 'offline' ? 'Oflayn' : course.format === 'online' ? 'Onlayn' : 'Hibrid'],
    ['Dərs növü', course.mode === 'group' ? `Qrup (maks. ${course.maxGroupSize})` : 'Fərdi'],
    ['Yaş qrupu', course.ageGroup],
    ['Səviyyə', course.level === 'all' ? 'Bütün səviyyələr' : course.level],
    ['Dil', course.language],
  ];
  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {rows.map(([label, value]) => (
        <div key={label} className="bg-white rounded-xl border border-ink-100 p-2.5">
          <p className="text-[10px] font-bold text-ink-400 uppercase">{label}</p>
          <p className="text-sm font-semibold text-ink-800 mt-0.5">{value}</p>
        </div>
      ))}
    </div>
  );
}
