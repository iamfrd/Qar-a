import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { formatDistance } from '../lib/utils';
import { formatMinor } from '../lib/api';
import type { CategoryInfo, OfferingSummary } from '../lib/api';
import { RatingStars } from './RatingStars';
import { Badge } from './Badge';
import { CategoryIcon, Icon } from './Icon';
import { useToast } from './Toast';

export function CourseCard({ course, category, dense = false }: { course: OfferingSummary; category?: CategoryInfo; dense?: boolean }) {
  const navigate = useNavigate();
  const { show } = useToast();
  const favorites = useAppStore((s) => s.favorites);
  const compareIds = useAppStore((s) => s.compareIds);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const toggleCompare = useAppStore((s) => s.toggleCompare);

  const categoryColor = category?.color ?? '#111827';
  const categoryName = category?.nameAz ?? course.subcategory;
  const distance = course.distanceKm;
  const isFav = favorites.includes(course.offeringId);
  const isComparing = compareIds.includes(course.offeringId);

  return (
    <div
      className="card-lift bg-white rounded-2xl border border-ink-100 overflow-hidden cursor-pointer"
      onClick={() => navigate(`/app/course/${course.offeringId}`)}
    >
      {course.promoted && (
        <div className="bg-gold-100 px-3 py-1 flex items-center gap-1.5">
          <Icon.tag size={12} className="text-gold-600" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-gold-600">Sponsorlu</span>
        </div>
      )}
      <div className="flex">
        <div
          className="w-24 sm:w-28 shrink-0 flex items-center justify-center"
          style={{ background: `${categoryColor}14`, color: categoryColor }}
        >
          <CategoryIcon categoryId={course.categoryId} size={30} strokeWidth={1.6} />
        </div>
        <div className="flex-1 min-w-0 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold" style={{ color: categoryColor }}>{categoryName}</p>
              <h3 className="font-bold text-ink-900 truncate leading-snug">{course.title}</h3>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(course.offeringId); show(isFav ? 'Seçilmişlərdən çıxarıldı' : 'Seçilmişlərə əlavə edildi', 'success'); }}
              className={`shrink-0 tap p-1 -m-1 rounded-full ${isFav ? 'text-coral-500 animate-pop' : 'text-ink-300 hover:text-coral-500'}`}
              aria-label={isFav ? 'Seçilmişlərdən çıxar' : 'Seçilmişlərə əlavə et'}
              aria-pressed={isFav}
            >
              {isFav ? <Icon.heartFull size={20} /> : <Icon.heart size={20} />}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <RatingStars rating={course.rating} reviewCount={course.reviewCount} />
            {distance !== null && distance !== undefined && <span className="text-xs text-ink-400">• {formatDistance(distance)}</span>}
            {!dense && course.branch.areaName && <span className="text-xs text-ink-400 truncate">• {course.branch.areaName}</span>}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {course.freeTrial && <Badge tone="teal"><Icon.check size={11} />Pulsuz sınaq</Badge>}
            {course.qargaExclusive && <Badge tone="gold">Qarğa endirimi</Badge>}
            {course.seatsAvailable <= 3 && course.seatsAvailable > 0 && <Badge tone="coral">{course.seatsAvailable} yer qalıb</Badge>}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-1.5">
              {course.discountPriceMinor ? (
                <>
                  <span className="font-bold text-ink-900">{formatMinor(course.discountPriceMinor)}</span>
                  <span className="text-xs text-ink-400 line-through">{formatMinor(course.priceMinor)}</span>
                </>
              ) : (
                <span className="font-bold text-ink-900">{formatMinor(course.priceMinor)}</span>
              )}
              <span className="text-xs text-ink-400">/ay</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const res = toggleCompare(course.offeringId);
                if (!res.ok) show(res.message ?? 'Xəta baş verdi', 'error');
                else show(isComparing ? 'Müqayisədən çıxarıldı' : 'Müqayisəyə əlavə edildi', 'success');
              }}
              className={`tap text-xs font-semibold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${isComparing ? 'bg-ink-900 text-white border-ink-900' : 'border-ink-200 text-ink-600 hover:border-ink-400'}`}
            >
              {isComparing && <Icon.check size={12} />}
              {isComparing ? 'Müqayisədə' : 'Müqayisə et'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
