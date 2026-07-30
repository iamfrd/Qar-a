import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useProviderScope } from './useProviderScope';
import { RatingStars } from '../../components/RatingStars';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { TextArea } from '../../components/FormField';
import { formatDateAz } from '../../lib/utils';
import { useToast } from '../../components/Toast';

export function ProviderReviews() {
  const { show } = useToast();
  const { myReviews, myCourses } = useProviderScope();
  const respondToReview = useAppStore((s) => s.respondToReview);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const courseTitle = (id: string) => myCourses.find((c) => c.id === id)?.title ?? 'Kurs';

  return (
    <div className="p-5 max-w-3xl">
      <h1 className="text-xl font-bold text-ink-900 mb-4">Rəylər ({myReviews.length})</h1>
      <div className="flex flex-col gap-3">
        {myReviews.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-ink-100 p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-ink-900">{r.userName}</p>
              {r.verified && <Badge tone="teal">✓ Təsdiqlənmiş</Badge>}
              {r.reported && <Badge tone="coral">🚩 Bildirilib</Badge>}
            </div>
            <p className="text-xs text-ink-400">{courseTitle(r.courseId)} • {formatDateAz(r.createdAt)}</p>
            <RatingStars rating={r.overall} />
            <p className="text-sm text-ink-600 mt-1">{r.text}</p>
            {r.providerReply ? (
              <div className="bg-ink-50 rounded-xl p-2.5 mt-2">
                <p className="text-xs font-semibold text-ink-700">Cavabınız:</p>
                <p className="text-xs text-ink-600">{r.providerReply}</p>
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <div className="flex-1">
                  <TextArea value={replyDrafts[r.id] ?? ''} onChange={(e) => setReplyDrafts((d) => ({ ...d, [r.id]: e.target.value }))} placeholder="Rəyə cavab yazın..." />
                </div>
              </div>
            )}
            {!r.providerReply && (
              <Button size="sm" onClick={() => { if (replyDrafts[r.id]?.trim()) { respondToReview(r.id, replyDrafts[r.id]); show('Cavabınız göndərildi', 'success'); } }}>Cavabla</Button>
            )}
          </div>
        ))}
        {myReviews.length === 0 && <p className="text-sm text-ink-400">Hələ rəy yoxdur.</p>}
      </div>
    </div>
  );
}
