import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { getCategory } from '../../data/categories';
import { getBranch, getProvider } from '../../data/mockData';
import { courseDistanceKm } from '../../lib/search';
import { formatAZN, formatDistance } from '../../lib/utils';
import { TopBar } from '../../components/TopBar';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { RatingStars } from '../../components/RatingStars';

export function Compare() {
  const navigate = useNavigate();
  const compareIds = useAppStore((s) => s.compareIds);
  const courses = useAppStore((s) => s.courses);
  const currentUser = useAppStore((s) => s.currentUser);
  const toggleCompare = useAppStore((s) => s.toggleCompare);

  const selected = compareIds.map((id) => courses.find((c) => c.id === id)).filter(Boolean) as typeof courses;

  if (selected.length === 0) {
    return (
      <div className="min-h-screen bg-ink-50">
        <TopBar title="Müqayisə" onBack={() => navigate('/app/map')} />
        <EmptyState title="Müqayisə üçün kurs seçilməyib" body="Kurslara baxarkən 'Müqayisə et' düyməsinə basaraq buraya əlavə edə bilərsən (maks. 3 kurs)." action={<Button onClick={() => navigate('/app/map')}>Kursları kəşf et</Button>} />
      </div>
    );
  }

  const withMeta = selected.map((c) => ({
    course: c,
    distance: courseDistanceKm(c, currentUser?.location ?? null),
    price: c.discountPrice ?? c.price,
    branch: getBranch(c.branchId),
    provider: getProvider(c.providerId),
    category: getCategory(c.categoryId),
  }));

  const cheapestId = [...withMeta].sort((a, b) => a.price - b.price)[0]?.course.id;
  const closestId = withMeta.some((m) => m.distance !== null) ? [...withMeta].filter((m) => m.distance !== null).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))[0]?.course.id : null;
  const highestRatedId = [...withMeta].sort((a, b) => b.course.rating - a.course.rating)[0]?.course.id;

  const rows: { label: string; render: (m: typeof withMeta[number]) => ReactNode }[] = [
    { label: 'Kateqoriya', render: (m) => `${m.category?.icon} ${m.category?.name.az}` },
    { label: 'Filial / ərazi', render: (m) => `${m.branch?.area}` },
    { label: 'Məsafə', render: (m) => (m.distance !== null ? formatDistance(m.distance) : '—') },
    { label: 'Qiymət', render: (m) => (
        <span className="flex items-center gap-1">
          {formatAZN(m.price)}{m.course.id === cheapestId && <span title="Ən sərfəli">🏆</span>}
        </span>
      ) },
    { label: 'Endirimsiz qiymət', render: (m) => (m.course.discountPrice ? formatAZN(m.course.price) : '—') },
    { label: 'Müddət', render: (m) => `${m.course.durationWeeks} həftə` },
    { label: 'Cədvəl', render: (m) => `${m.course.lessonDays.join(', ')}, ${m.course.lessonTime}` },
    { label: 'Format', render: (m) => (m.course.format === 'offline' ? 'Oflayn' : m.course.format === 'online' ? 'Onlayn' : 'Hibrid') },
    { label: 'Qrup ölçüsü', render: (m) => (m.course.mode === 'group' ? `Maks. ${m.course.maxGroupSize}` : 'Fərdi') },
    { label: 'Müəllim', render: (m) => m.course.teacher.name },
    { label: 'Reytinq', render: (m) => (
        <span className="flex items-center gap-1">
          <RatingStars rating={m.course.rating} reviewCount={m.course.reviewCount} />{m.course.id === highestRatedId && <span title="Ən yüksək reytinq">🏆</span>}
        </span>
      ) },
    { label: 'Pulsuz sınaq', render: (m) => (m.course.freeTrial ? '✅ Var' : '❌ Yoxdur') },
    { label: 'Sertifikat', render: (m) => (m.course.certificate ? '✅ Var' : '❌ Yoxdur') },
    { label: 'Boş yer', render: (m) => `${m.course.seatsAvailable}/${m.course.seatsTotal}` },
    { label: 'Qarğa endirimi', render: (m) => (m.course.qargaExclusive ? '✅ Var' : '❌ Yoxdur') },
    { label: 'Ləğvetmə şərtləri', render: (m) => m.course.cancellationPolicy },
  ];

  return (
    <div className="min-h-screen bg-ink-50 pb-6">
      <TopBar title={`Müqayisə (${selected.length}/3)`} onBack={() => navigate('/app/map')} />
      <div className="overflow-x-auto px-3">
        <table className="w-full border-separate border-spacing-y-0 min-w-[560px]">
          <thead>
            <tr>
              <th className="w-32" />
              {withMeta.map((m) => (
                <th key={m.course.id} className="p-2 text-left align-top">
                  <div className="bg-white rounded-2xl border border-ink-100 p-3 relative">
                    <button onClick={() => toggleCompare(m.course.id)} className="absolute top-2 right-2 text-ink-300" aria-label="Sil">✕</button>
                    <p className="text-sm font-bold text-ink-900 pr-4">{m.course.title}</p>
                    {m.course.id === closestId && <span className="text-[10px] text-teal-600 font-semibold">📍 Ən yaxın</span>}
                    <Button size="sm" fullWidth className="mt-2" onClick={() => navigate(`/app/register/${m.course.id}`)}>Qeydiyyat</Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : 'bg-ink-50'}>
                <td className="p-2.5 text-xs font-bold text-ink-400 align-top">{row.label}</td>
                {withMeta.map((m) => (
                  <td key={m.course.id} className="p-2.5 text-sm text-ink-700 align-top">{row.render(m)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
