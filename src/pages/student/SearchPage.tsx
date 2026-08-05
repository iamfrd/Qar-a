import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { parseNaturalLanguage } from '../../lib/search';
import { api } from '../../lib/api';
import type { AreaInfo, CategoryInfo, OfferingSummary } from '../../lib/api';
import { toSearchFilters } from '../../lib/filterAdapter';
import { CourseCard } from '../../components/CourseCard';
import { EmptyState } from '../../components/EmptyState';
import { TopBar } from '../../components/TopBar';
import { useToast } from '../../components/Toast';

const EXAMPLES = [
  'Gənclik metrosu yaxınlığında ingilis dili kursu',
  'IELTS kursları 150 AZN-dən aşağı',
  'Həftə sonu başlanğıc səviyyə proqramlaşdırma',
  'Nizami yaxınlığında riyaziyyat müəllimi',
];

export function SearchPage() {
  const navigate = useNavigate();
  const { show } = useToast();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const filters = useAppStore((s) => s.filters);
  const setFilters = useAppStore((s) => s.setFilters);
  const addSavedSearch = useAppStore((s) => s.addSavedSearch);

  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [areas, setAreas] = useState<AreaInfo[]>([]);
  const [results, setResults] = useState<OfferingSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.categories().then((res) => setCategories(res.categories)).catch(() => setCategories([]));
    api.areas().then((res) => setAreas(res.areas)).catch(() => setAreas([]));
  }, []);

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const runSearch = (q: string) => {
    setQuery(q);
    setSubmitted(true);
    // parseNaturalLanguage `Category[]` (name.az) formatında gözləyir, API isə
    // `nameAz` sahəsi qaytarır — burda kiçik uyğunlaşdırma lazımdır.
    const categoriesForParser = categories.map((c) => ({
      id: c.id, icon: c.icon, color: c.color,
      name: { az: c.nameAz, en: c.nameEn, ru: c.nameRu },
      subcategories: [],
    }));
    const { filters: parsed, matchedTerms } = parseNaturalLanguage(q, categoriesForParser, areas);
    const nextFilters = { ...parsed, query: parsed.categoryId || parsed.area ? '' : q };
    setFilters(nextFilters);
    if (matchedTerms.length) {
      show(`Anladım: ${matchedTerms.join(', ')}`, 'success');
    }

    setLoading(true);
    setError(null);
    api.searchOfferings(toSearchFilters({ ...filters, ...nextFilters }, areas))
      .then((res) => setResults(res.items))
      .catch((e) => setError(e?.message ?? 'Axtarış uğursuz oldu.'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <TopBar title="Axtarış" onBack={() => navigate('/app/map')} />
      <div className="p-4">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch(query)}
            placeholder="Məsələn: Gənclikdə axşam ingilis dili"
            className="flex-1 rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none focus:border-ink-900"
          />
          <button onClick={() => runSearch(query)} className="bg-ink-900 text-white px-4 rounded-xl font-semibold text-sm">Axtar</button>
        </div>

        {!submitted && (
          <div className="mt-5">
            <p className="text-xs font-bold text-ink-400 uppercase mb-2">Nümunə axtarışlar</p>
            <div className="flex flex-col gap-2">
              {EXAMPLES.map((ex) => (
                <button key={ex} onClick={() => runSearch(ex)} className="text-left text-sm px-3 py-2.5 rounded-xl bg-white border border-ink-100 text-ink-700 hover:border-ink-300">
                  💬 {ex}
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-ink-400 uppercase mt-5 mb-2">Kateqoriyalar</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.slice(0, 8).map((c) => (
                <button key={c.id} onClick={() => { setFilters({ categoryId: c.id }); runSearch(c.nameAz); }} className="flex items-center gap-2 text-left text-sm px-3 py-2.5 rounded-xl bg-white border border-ink-100">
                  <span>{c.icon}</span>
                  <span className="truncate">{c.nameAz}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {submitted && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-ink-500">{loading ? 'Axtarılır…' : `${results.length} nəticə tapıldı`}</p>
              <button
                onClick={() => { addSavedSearch(query || 'Axtarış', query, filters); show('Axtarış yadda saxlanıldı', 'success'); }}
                className="text-xs font-semibold text-ink-900"
              >
                💾 Axtarışı yadda saxla
              </button>
            </div>
            {error ? (
              <EmptyState title="Axtarış uğursuz oldu" body={error} />
            ) : loading ? (
              <div className="text-sm text-ink-400 py-6 text-center">Kurslar yüklənir…</div>
            ) : results.length === 0 ? (
              <EmptyState title="Nəticə tapılmadı" body="Başqa açar sözlərlə cəhd edin və ya Qarğa köməkçisindən istifadə edin." />
            ) : (
              <div className="flex flex-col gap-3">
                {results.map((c) => <CourseCard key={c.offeringId} course={c} category={categoryById.get(c.categoryId)} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
