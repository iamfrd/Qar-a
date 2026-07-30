import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { TopBar } from '../../components/TopBar';
import { Button } from '../../components/Button';
import { TextArea } from '../../components/FormField';
import { useToast } from '../../components/Toast';

const criteria = [
  { key: 'overall', label: 'Ümumi təəssürat' },
  { key: 'teacherQuality', label: 'Müəllimin keyfiyyəti' },
  { key: 'content', label: 'Kurs məzmunu' },
  { key: 'location', label: 'Məkan' },
  { key: 'priceValue', label: 'Qiymət / dəyər' },
  { key: 'communication', label: 'Ünsiyyət' },
  { key: 'scheduleAccuracy', label: 'Cədvələ uyğunluq' },
] as const;

export function ReviewSubmit() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const courses = useAppStore((s) => s.courses);
  const addReview = useAppStore((s) => s.addReview);
  const course = courses.find((c) => c.id === courseId);

  type RatingKey = typeof criteria[number]['key'];
  const [ratings, setRatings] = useState<Record<RatingKey, number>>({
    overall: 5, teacherQuality: 5, content: 5, location: 5, priceValue: 5, communication: 5, scheduleAccuracy: 5,
  });
  const [text, setText] = useState('');

  if (!course) return <div className="p-6">Kurs tapılmadı.</div>;

  const submit = () => {
    const res = addReview(course.id, ratings, text);
    if (!res.ok) { show(res.message ?? 'Xəta baş verdi', 'error'); return; }
    show('Rəyiniz üçün təşəkkürlər! 15 Lələk qazandınız.', 'success');
    navigate(`/app/course/${course.id}`);
  };

  return (
    <div className="min-h-screen bg-ink-50 pb-6">
      <TopBar title="Rəy yaz" />
      <div className="px-4">
        <p className="font-bold text-ink-900">{course.title}</p>
        <div className="flex flex-col gap-3 mt-4">
          {criteria.map((c) => (
            <div key={c.key} className="bg-white rounded-xl border border-ink-100 p-3">
              <p className="text-sm font-semibold text-ink-800 mb-1.5">{c.label}</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setRatings((r) => ({ ...r, [c.key]: n }))} className="text-xl">
                    {n <= ratings[c.key] ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <TextArea label="Şərh (istəyə bağlı)" value={text} onChange={(e) => setText(e.target.value)} placeholder="Təcrübəni bölüş…" />
        </div>
        <p className="text-xs text-ink-400 mb-3">✓ Bu rəy "Təsdiqlənmiş tələbə" nişanı ilə dərc olunacaq, çünki siz bu kursa qeydiyyatdan keçmisiniz və ya sınaq dərsi almısınız.</p>
        <Button fullWidth onClick={submit}>Rəyi göndər</Button>
      </div>
    </div>
  );
}
