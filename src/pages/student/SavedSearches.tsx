import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { TopBar } from '../../components/TopBar';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';
import { formatDateAz } from '../../lib/utils';

export function SavedSearches() {
  const navigate = useNavigate();
  const { show } = useToast();
  const savedSearches = useAppStore((s) => s.savedSearches);
  const removeSavedSearch = useAppStore((s) => s.removeSavedSearch);
  const setFilters = useAppStore((s) => s.setFilters);

  return (
    <div className="min-h-screen bg-ink-50 pb-6">
      <TopBar title="Yadda saxlanılan axtarışlar" onBack={() => navigate('/app/profile')} />
      <div className="px-4">
        {savedSearches.length === 0 ? (
          <EmptyState title="Yadda saxlanılan axtarış yoxdur" body="Axtarış nəticələrində 'Axtarışı yadda saxla' düyməsindən istifadə et." action={<Button onClick={() => navigate('/app/search')}>Axtarışa keç</Button>} />
        ) : (
          <div className="flex flex-col gap-2">
            {savedSearches.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border border-ink-100 p-3">
                <p className="text-sm font-semibold text-ink-800">{s.label}</p>
                <p className="text-xs text-ink-400 mt-0.5">{formatDateAz(s.createdAt)}</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" fullWidth onClick={() => { setFilters(s.filters); navigate('/app/map'); show('Filtrlər tətbiq edildi', 'success'); }}>Tətbiq et</Button>
                  <Button size="sm" variant="ghost" onClick={() => removeSavedSearch(s.id)}>Sil</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
