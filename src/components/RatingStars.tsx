import { Icon } from './Icon';

export function RatingStars({ rating, reviewCount, size = 'sm' }: { rating: number; reviewCount?: number; size?: 'sm' | 'md' }) {
  if (rating <= 0) {
    return <span className={size === 'sm' ? 'text-xs text-ink-400' : 'text-sm text-ink-400'}>Hələ rəy yoxdur</span>;
  }
  return (
    <span className={`inline-flex items-center gap-1 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      <Icon.starFull size={size === 'sm' ? 13 : 15} className="text-gold-500" />
      <span className="font-semibold text-ink-800 tabular-nums">{rating.toFixed(1)}</span>
      {typeof reviewCount === 'number' && <span className="text-ink-400 tabular-nums">({reviewCount})</span>}
    </span>
  );
}
