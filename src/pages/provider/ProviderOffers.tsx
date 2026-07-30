import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useProviderScope } from './useProviderScope';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/FormField';
import { formatAZN } from '../../lib/utils';
import { useToast } from '../../components/Toast';

export function ProviderOffers() {
  const { show } = useToast();
  const { myCourses } = useProviderScope();
  const updateCourse = useAppStore((s) => s.updateCourse);
  const [drafts, setDrafts] = useState<Record<string, number>>({});

  const applyDiscount = (courseId: string, price: number) => {
    const discount = drafts[courseId];
    if (!discount || discount <= 0 || discount >= price) { show('Düzgün endirim qiyməti daxil edin', 'error'); return; }
    updateCourse(courseId, { discountPrice: discount, qargaExclusive: true });
    show('Qarğa-exclusive endirim admin təsdiqinə göndərildi', 'success');
  };

  const removeDiscount = (courseId: string) => {
    updateCourse(courseId, { discountPrice: undefined, qargaExclusive: false });
    show('Endirim ləğv edildi', 'info');
  };

  return (
    <div className="p-5 max-w-3xl">
      <h1 className="text-xl font-bold text-ink-900 mb-1">Endirimlər və kampaniyalar</h1>
      <p className="text-sm text-ink-500 mb-4">Kurslarınıza Qarğa-exclusive endirim təyin edərək daha çox tələbə cəlb edin.</p>
      <div className="flex flex-col gap-3">
        {myCourses.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-ink-100 p-4">
            <p className="font-bold text-ink-900">{c.title}</p>
            <p className="text-xs text-ink-400 mb-2">Standart qiymət: {formatAZN(c.price)}</p>
            {c.discountPrice ? (
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-teal-600">🐦‍⬛ Qarğa qiyməti: {formatAZN(c.discountPrice)}</p>
                <Button size="sm" variant="ghost" onClick={() => removeDiscount(c.id)}>Endirimi ləğv et</Button>
              </div>
            ) : (
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <TextInput label="Qarğa qiyməti (₼)" type="number" value={drafts[c.id] ?? ''} onChange={(e) => setDrafts((d) => ({ ...d, [c.id]: Number(e.target.value) }))} />
                </div>
                <Button size="sm" onClick={() => applyDiscount(c.id, c.price)}>Təyin et</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
