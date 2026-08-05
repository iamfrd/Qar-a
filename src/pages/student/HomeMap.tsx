import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../lib/api';
import type { AreaInfo, CategoryInfo, OfferingSummary } from '../../lib/api';
import { toSearchFilters } from '../../lib/filterAdapter';
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
  const filters = useAppStore((s) => s.filters);
  const setFilters = useAppStore((s) => s.setFilters);
  const currentUser = useAppStore((s) => s.currentUser);

  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [areas, setAreas] = useState<AreaInfo[]>([]);
  const [offerings, setOfferings] = useState<OfferingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bounds, setBounds] = useState<{ south: number; west: number; north: number; east: number } | null>(null);

  useEffect(() => {
    api.categories().then((res) => setCategories(res.categories)).catch(() => setCategories([]));
    api.areas().then((res) => setAreas(res.areas)).catch(() => setAreas([]));
  }, []);

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const loc = currentUser?.location ?? undefined;
    const searchFilters = toSearchFilters(filters, areas, {
      ...(bounds ? { bounds } : {}),
      ...(loc ? { lat: loc.lat, lng: loc.lng } : {}),
    });
    api.searchOfferings(searchFilters)
      .then((res) => { if (!cancelled) setOfferings(res.items); })
      .catch((e) => { if (!cancelled) setError(e?.message ?? 'Kurslar yüklənə bilmədi.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filters, areas, bounds, currentUser?.location]);

  const sorted = useMemo(() => {
    return [...offerings].sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
  }, [offerings]);

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
              {c.nameAz}
            </Chip>
          ))}
        </div>
        <div className="flex bg-ink-100 rounded-full p-1 mt-3 w-fit mx-auto">
          <button onClick={() => setView('map')} className={`px-4 py-1.5 rounded-full text-xs font-semibold ${view === 'map' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-400'}`}>🗺️ Xəritə</button>
          <button onClick={() => setView('list')} className={`px-4 py-1.5 rounded-full text-xs font-semibold ${view === 'list' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-400'}`}>📋 Siyahı ({sorted.length})</button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        {error ? (
          <div className="h-full flex items-center justify-center px-6">
            <EmptyState title="Kurslar yüklənmədi" body={error} action={
              <button onClick={() => setFilters({ ...filters })} className="text-sm font-semibold text-ink-900 underline">Yenidən cəhd et</button>
            } />
          </div>
        ) : loading ? (
          <div className="h-full flex items-center justify-center text-ink-400 text-sm">Kurslar yüklənir…</div>
        ) : view === 'map' ? (
          <CourseMap courses={offerings} categories={categories} height="100%" onSearchArea={setBounds} />
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
                  <CourseCard key={c.offeringId} course={c} category={categoryById.get(c.categoryId)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} categories={categories} areas={areas} />
    </div>
  );
}
