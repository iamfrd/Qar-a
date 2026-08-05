import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Sheet } from './Sheet';
import { Chip } from './Chip';
import { Button } from './Button';
import { useAppStore, defaultFilters } from '../store/useAppStore';
import { api } from '../lib/api';
import type { AreaInfo, CategoryInfo } from '../lib/api';
import type { CourseFormat, CourseLevel, DayPart, LessonMode } from '../types';

const dayPartOptions: { id: DayPart; label: string }[] = [
  { id: 'morning', label: '🌅 Səhər' },
  { id: 'afternoon', label: '🌤️ Gündüz' },
  { id: 'evening', label: '🌙 Axşam' },
];
const formatOptions: { id: CourseFormat; label: string }[] = [
  { id: 'offline', label: 'Oflayn' },
  { id: 'online', label: 'Onlayn' },
  { id: 'hybrid', label: 'Hibrid' },
];
const modeOptions: { id: LessonMode; label: string }[] = [
  { id: 'group', label: 'Qrup' },
  { id: 'individual', label: 'Fərdi' },
];
const levelOptions: { id: CourseLevel; label: string }[] = [
  { id: 'beginner', label: 'Başlanğıc' },
  { id: 'elementary', label: 'Elementary' },
  { id: 'intermediate', label: 'Orta' },
  { id: 'advanced', label: 'İrəli' },
];

export function FilterSheet({
  open,
  onClose,
  categories,
  areas,
}: {
  open: boolean;
  onClose: () => void;
  categories: CategoryInfo[];
  areas: AreaInfo[];
}) {
  const filters = useAppStore((s) => s.filters);
  const setFilters = useAppStore((s) => s.setFilters);
  const resetFilters = useAppStore((s) => s.resetFilters);

  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);

  // Yaş qrupu / alt kateqoriya siyahısı bazadan gəlməlidir — mock kursların
  // sabit siyahısı yerinə, açıq olanda bir dəfə cari kataloqdan çəkilir.
  useEffect(() => {
    if (!open || ageGroups.length > 0) return;
    api.searchOfferings({ perPage: 60 }).then((res) => {
      setAgeGroups(Array.from(new Set(res.items.map((c) => c.ageGroup).filter(Boolean))));
    }).catch(() => {
      // Filtr seçimləri optional bəzəkdir — uğursuz olsa filtri boş saxla, çökmə.
    });
  }, [open, ageGroups.length]);

  useEffect(() => {
    if (!filters.categoryId) { setSubcategories([]); return; }
    api.searchOfferings({ categoryId: filters.categoryId, perPage: 60 }).then((res) => {
      setSubcategories(Array.from(new Set(res.items.map((c) => c.subcategory).filter(Boolean))));
    }).catch(() => setSubcategories([]));
  }, [filters.categoryId]);

  const categoryChips = useMemo(() => categories, [categories]);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Filtrlər"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" fullWidth onClick={() => resetFilters()}>Təmizlə</Button>
          <Button fullWidth onClick={onClose}>Tətbiq et</Button>
        </div>
      }
    >
      <FilterSection title="Kateqoriya">
        <div className="flex flex-wrap gap-2">
          <Chip active={!filters.categoryId} onClick={() => setFilters({ categoryId: null, subcategory: null })}>Hamısı</Chip>
          {categoryChips.map((c) => (
            <Chip key={c.id} active={filters.categoryId === c.id} onClick={() => setFilters({ categoryId: c.id, subcategory: null })} icon={<span>{c.icon}</span>}>
              {c.nameAz}
            </Chip>
          ))}
        </div>
      </FilterSection>

      {filters.categoryId && subcategories.length > 0 && (
        <FilterSection title="Alt kateqoriya">
          <div className="flex flex-wrap gap-2">
            <Chip active={!filters.subcategory} onClick={() => setFilters({ subcategory: null })}>Hamısı</Chip>
            {subcategories.map((sc) => (
              <Chip key={sc} active={filters.subcategory === sc} onClick={() => setFilters({ subcategory: sc })}>{sc}</Chip>
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Ərazi / metro">
        <div className="flex flex-wrap gap-2">
          <Chip active={!filters.area} onClick={() => setFilters({ area: null })}>Hamısı</Chip>
          {areas.map((a) => (
            <Chip key={a.id} active={filters.area === a.name} onClick={() => setFilters({ area: a.name })}>{a.name}</Chip>
          ))}
        </div>
      </FilterSection>

      <FilterSection title={`Qiymət: ${filters.priceMin} ₼ – ${filters.priceMax} ₼`}>
        <div className="flex items-center gap-3">
          <input type="range" min={0} max={400} step={10} value={filters.priceMax} onChange={(e) => setFilters({ priceMax: Number(e.target.value) })} className="w-full accent-ink-900" />
        </div>
      </FilterSection>

      <FilterSection title="Gün vaxtı">
        <div className="flex flex-wrap gap-2">
          <Chip active={!filters.dayPart} onClick={() => setFilters({ dayPart: null })}>Hamısı</Chip>
          {dayPartOptions.map((o) => (
            <Chip key={o.id} active={filters.dayPart === o.id} onClick={() => setFilters({ dayPart: filters.dayPart === o.id ? null : o.id })}>{o.label}</Chip>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Format">
        <div className="flex flex-wrap gap-2">
          <Chip active={!filters.format} onClick={() => setFilters({ format: null })}>Hamısı</Chip>
          {formatOptions.map((o) => (
            <Chip key={o.id} active={filters.format === o.id} onClick={() => setFilters({ format: filters.format === o.id ? null : o.id })}>{o.label}</Chip>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Dərs növü">
        <div className="flex flex-wrap gap-2">
          <Chip active={!filters.mode} onClick={() => setFilters({ mode: null })}>Hamısı</Chip>
          {modeOptions.map((o) => (
            <Chip key={o.id} active={filters.mode === o.id} onClick={() => setFilters({ mode: filters.mode === o.id ? null : o.id })}>{o.label}</Chip>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Səviyyə">
        <div className="flex flex-wrap gap-2">
          <Chip active={!filters.level} onClick={() => setFilters({ level: null })}>Hamısı</Chip>
          {levelOptions.map((o) => (
            <Chip key={o.id} active={filters.level === o.id} onClick={() => setFilters({ level: filters.level === o.id ? null : o.id })}>{o.label}</Chip>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Yaş qrupu">
        <div className="flex flex-wrap gap-2">
          <Chip active={!filters.ageGroup} onClick={() => setFilters({ ageGroup: null })}>Hamısı</Chip>
          {ageGroups.map((ag) => (
            <Chip key={ag} active={filters.ageGroup === ag} onClick={() => setFilters({ ageGroup: filters.ageGroup === ag ? null : ag })}>{ag}</Chip>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Reytinq">
        <div className="flex flex-wrap gap-2">
          {[0, 3, 4, 4.5].map((r) => (
            <Chip key={r} active={filters.minRating === r} onClick={() => setFilters({ minRating: r })}>{r === 0 ? 'Hamısı' : `${r}+ ⭐`}</Chip>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Digər">
        <div className="flex flex-wrap gap-2">
          <Chip active={filters.freeTrialOnly} onClick={() => setFilters({ freeTrialOnly: !filters.freeTrialOnly })}>🎁 Pulsuz sınaq</Chip>
          <Chip active={filters.certificateOnly} onClick={() => setFilters({ certificateOnly: !filters.certificateOnly })}>🎓 Sertifikat</Chip>
          <Chip active={filters.verifiedOnly} onClick={() => setFilters({ verifiedOnly: !filters.verifiedOnly })}>✓ Təsdiqlənmiş</Chip>
          <Chip active={filters.qargaExclusiveOnly} onClick={() => setFilters({ qargaExclusiveOnly: !filters.qargaExclusiveOnly })}>🐦‍⬛ Qarğa endirimi</Chip>
          <Chip active={filters.availableSeatsOnly} onClick={() => setFilters({ availableSeatsOnly: !filters.availableSeatsOnly })}>💺 Yer var</Chip>
        </div>
      </FilterSection>
    </Sheet>
  );
}

export function activeFilterCount(filters: typeof defaultFilters) {
  let count = 0;
  if (filters.categoryId) count++;
  if (filters.subcategory) count++;
  if (filters.area) count++;
  if (filters.priceMax < 400) count++;
  if (filters.freeTrialOnly) count++;
  if (filters.dayPart) count++;
  if (filters.format) count++;
  if (filters.mode) count++;
  if (filters.ageGroup) count++;
  if (filters.level) count++;
  if (filters.certificateOnly) count++;
  if (filters.minRating) count++;
  if (filters.verifiedOnly) count++;
  if (filters.qargaExclusiveOnly) count++;
  if (filters.availableSeatsOnly) count++;
  return count;
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-2">{title}</p>
      {children}
    </div>
  );
}
