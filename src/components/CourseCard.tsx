import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { getCategory } from '../data/categories';
import { getBranch } from '../data/mockData';
import { formatAZN, formatDistance } from '../lib/utils';
import { courseDistanceKm } from '../lib/search';
import { RatingStars } from './RatingStars';
import { Badge } from './Badge';
import { useToast } from './Toast';
import type { Course } from '../types';

export function CourseCard({ course, dense = false }: { course: Course; dense?: boolean }) {
  const navigate = useNavigate();
  const { show } = useToast();
  const favorites = useAppStore((s) => s.favorites);
  const compareIds = useAppStore((s) => s.compareIds);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const toggleCompare = useAppStore((s) => s.toggleCompare);
  const currentUser = useAppStore((s) => s.currentUser);

  const category = getCategory(course.categoryId);
  const branch = getBranch(course.branchId);
  const distance = courseDistanceKm(course, currentUser?.location ?? null);
  const isFav = favorites.includes(course.id);
  const isComparing = compareIds.includes(course.id);

  return (
    <div
      className="bg-white rounded-2xl border border-ink-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/app/course/${course.id}`)}
    >
      <div className="flex">
        <div
          className="w-24 sm:w-28 shrink-0 flex items-center justify-center text-3xl"
          style={{ background: `${category?.color}1a` }}
        >
          {course.photos[0] ?? category?.icon}
        </div>
        <div className="flex-1 min-w-0 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold" style={{ color: category?.color }}>{category?.name.az}</p>
              <h3 className="font-bold text-ink-900 truncate leading-snug">{course.title}</h3>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(course.id); show(isFav ? 'Seçilmişlərdən çıxarıldı' : 'Seçilmişlərə əlavə edildi', 'success'); }}
              className="shrink-0 text-lg"
              aria-label="Seçilmişlərə əlavə et"
            >
              {isFav ? '❤️' : '🤍'}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <RatingStars rating={course.rating} reviewCount={course.reviewCount} />
            {distance !== null && <span className="text-xs text-ink-400">• {formatDistance(distance)}</span>}
            {branch && !dense && <span className="text-xs text-ink-400 truncate">• {branch.area}</span>}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {course.qargaExclusive && <Badge tone="gold">Qarğa endirimi</Badge>}
            {course.freeTrial && <Badge tone="teal">Pulsuz sınaq</Badge>}
            {course.verifiedProvider && <Badge tone="neutral">✓ Təsdiqlənmiş</Badge>}
            {course.seatsAvailable <= 3 && course.seatsAvailable > 0 && <Badge tone="coral">{course.seatsAvailable} yer qalıb</Badge>}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-1.5">
              {course.discountPrice ? (
                <>
                  <span className="font-bold text-ink-900">{formatAZN(course.discountPrice)}</span>
                  <span className="text-xs text-ink-400 line-through">{formatAZN(course.price)}</span>
                </>
              ) : (
                <span className="font-bold text-ink-900">{formatAZN(course.price)}</span>
              )}
              <span className="text-xs text-ink-400">/ay</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const res = toggleCompare(course.id);
                if (!res.ok) show(res.message ?? 'Xəta baş verdi', 'error');
                else show(isComparing ? 'Müqayisədən çıxarıldı' : 'Müqayisəyə əlavə edildi', 'success');
              }}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isComparing ? 'bg-ink-900 text-white border-ink-900' : 'border-ink-200 text-ink-600'}`}
            >
              {isComparing ? '✓ Müqayisədə' : 'Müqayisə et'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
