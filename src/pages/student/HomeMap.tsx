import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { filterCourses, courseDistanceKm } from '../../lib/search';
import { CourseMap } from '../../components/CourseMap';
import { CourseCard } from '../../components/CourseCard';
import { Chip } from '../../components/Chip';
import { FilterSheet, activeFilterCount } from '../../components/FilterSheet';
import { EmptyState } from '../../components/EmptyState';
import { CrowMascot } from '../../components/CrowMascot';

export function HomeMap() {
  const navigate = useNavigate();
  const [view, setView] = useState<'map' | 'list'>('map');
  const [filterOpen, setFilterOpen] = useState(false);
  const courses = useAppStore((s) => s.courses);
  const categories = useAppStore((s) => s.categories);
  const filters = useAppStore((s) => s.filters);
  const setFilters = useAppStore((s) => s.setFilters);
  const currentUser = useAppStore((s) => s.currentUser);

  const filtered = useMemo(() => filterCourses(courses, filters), [courses, filters]);
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const da = courseDistanceKm(a, currentUser?.location ?? null) ?? 9999;
      const db = courseDistanceKm(b, currentUser?.location ?? null) ?? 9999;
      return da - db;
    });
  }, [filtered, currentUser?.location]);

  const count = activeFilterCount(filters);

  return (
    <div className="flex flex-col h-screen">
      <div className="px-3 pt-3 pb-2 bg-white border-b border-ink-100 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/app/search')}
            className="flex-1 flex items-center gap-2 bg-ink-100 rounded-full px-4 py-2.5 text-sm text-ink-400 text-left"
          >
            🔍 Kurs, kateqoriya və ya ərazi axtar…
          </button>
          <button onClick={() => setFilterOpen(true)} className="relative w-10 h-10 rounded-full bg-ink-900 text-white flex items-center justify-center shrink-0">
            ⚙️
            {count > 0 && <span className="absolute -top-1 -right-1 bg-gold-500 text-ink-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{count}</span>}
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 pb-1">
          <Chip active={!filters.categoryId} onClick={() => setFilters({ categoryId: null })}>Hamısı</Chip>
          {categories.slice(0, 10).map((c) => (
            <Chip key={c.id} active={filters.categoryId === c.id} onClick={() => setFilters({ categoryId: filters.categoryId === c.id ? null : c.id })} icon={<span>{c.icon}</span>}>
              {c.name.az}
            </Chip>
          ))}
        </div>
        <div className="flex bg-ink-100 rounded-full p-1 mt-3 w-fit mx-auto">
          <button onClick={() => setView('map')} className={`px-4 py-1.5 rounded-full text-xs font-semibold ${view === 'map' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-400'}`}>🗺️ Xəritə</button>
          <button onClick={() => setView('list')} className={`px-4 py-1.5 rounded-full text-xs font-semibold ${view === 'list' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-400'}`}>📋 Siyahı ({sorted.length})</button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        {view === 'map' ? (
          <CourseMap courses={filtered} height="100%" />
        ) : (
          <div className="h-full overflow-y-auto no-scrollbar px-3 py-3">
            {sorted.length === 0 ? (
              <EmptyState title="Bu filtrlərə uyğun kurs tapılmadı" body="Filtrləri dəyişməyi və ya Qarğa köməkçisindən istifadə etməyi sınayın." action={
                <button onClick={() => navigate('/app/crow')} className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <CrowMascot size={22} /> Qarğadan soruş
                </button>
              } />
            ) : (
              <div className="flex flex-col gap-3 pb-4">
                {sorted.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} />
    </div>
  );
}
