import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { CourseCard } from '../../components/CourseCard';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';

export function Favorites() {
  const navigate = useNavigate();
  const favorites = useAppStore((s) => s.favorites);
  const courses = useAppStore((s) => s.courses);
  const compareIds = useAppStore((s) => s.compareIds);

  const favCourses = courses.filter((c) => favorites.includes(c.id));

  return (
    <div className="min-h-screen bg-ink-50 pb-4">
      <div className="px-4 pt-5 pb-2 flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink-900">Seçilmişlər</h1>
        {compareIds.length > 0 && (
          <button onClick={() => navigate('/app/compare')} className="text-sm font-semibold text-ink-900">⚖️ Müqayisə ({compareIds.length})</button>
        )}
      </div>
      <div className="px-4">
        {favCourses.length === 0 ? (
          <EmptyState title="Hələ seçilmiş kursun yoxdur" body="Bəyəndiyin kursları ürək işarəsinə basaraq buraya əlavə et." action={<Button onClick={() => navigate('/app/map')}>Kursları kəşf et</Button>} />
        ) : (
          <div className="flex flex-col gap-3">
            {favCourses.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}
