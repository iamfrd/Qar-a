import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getCourse } from '../../data/mockData';
import { RatingStars } from '../../components/RatingStars';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { formatDateAz } from '../../lib/utils';
import { useToast } from '../../components/Toast';

export function AdminReviews() {
  const { show } = useToast();
  const reviews = useAppStore((s) => s.reviews);
  const clearReviewReport = useAppStore((s) => s.clearReviewReport);
  const removeReview = useAppStore((s) => s.removeReview);
  const [onlyReported, setOnlyReported] = useState(false);

  const list = onlyReported ? reviews.filter((r) => r.reported) : reviews;

  return (
    <div className="p-5 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-ink-900">Rəy moderasiyası ({reviews.length})</h1>
        <button onClick={() => setOnlyReported(!onlyReported)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${onlyReported ? 'bg-coral-500 text-white border-coral-500' : 'border-ink-200 text-ink-600'}`}>
          🚩 Yalnız bildirilənlər ({reviews.filter((r) => r.reported).length})
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {list.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-ink-100 p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-ink-900">{r.userName}</p>
              {r.verified && <Badge tone="teal">✓ Təsdiqlənmiş</Badge>}
              {r.reported && <Badge tone="coral">🚩 Bildirilib</Badge>}
            </div>
            <p className="text-xs text-ink-400">{getCourse(r.courseId)?.title} • {formatDateAz(r.createdAt)}</p>
            <RatingStars rating={r.overall} />
            <p className="text-sm text-ink-600 mt-1">{r.text}</p>
            <div className="flex gap-2 mt-2">
              {r.reported && <Button size="sm" variant="outline" onClick={() => { clearReviewReport(r.id); show('Bildiriş təmizləndi', 'success'); }}>Bildirişi təmizlə</Button>}
              <Button size="sm" variant="ghost" onClick={() => { removeReview(r.id); show('Rəy silindi', 'info'); }}>Rəyi sil</Button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm text-ink-400">Bu filtrə uyğun rəy yoxdur.</p>}
      </div>
    </div>
  );
}
