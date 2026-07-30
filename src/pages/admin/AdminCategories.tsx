import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/FormField';
import { Modal } from '../../components/Sheet';
import { useToast } from '../../components/Toast';

const COLORS = ['#2563eb', '#dc2626', '#7c3aed', '#0d9488', '#db2777', '#ea580c', '#16a34a', '#334155'];
const ICONS = ['📚', '🎯', '🧩', '🌟', '🛠️', '🎬', '🧬', '📷'];

export function AdminCategories() {
  const { show } = useToast();
  const categories = useAppStore((s) => s.categories);
  const courses = useAppStore((s) => s.courses);
  const addCategory = useAppStore((s) => s.addCategory);
  const hideCategory = useAppStore((s) => s.hideCategory);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);

  const courseCount = (id: string) => courses.filter((c) => c.categoryId === id).length;

  const submit = () => {
    if (!name.trim()) { show('Kateqoriya adını daxil edin', 'error'); return; }
    addCategory({ id: name.toLowerCase().replace(/\s+/g, '-'), icon, color, name: { az: name, en: name, ru: name }, subcategories: [] });
    show('Kateqoriya əlavə edildi', 'success');
    setOpen(false);
    setName('');
  };

  return (
    <div className="p-5 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-ink-900">Kateqoriyalar ({categories.length})</h1>
        <Button size="sm" onClick={() => setOpen(true)}>+ Kateqoriya əlavə et</Button>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {categories.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-ink-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${c.color}1a` }}>{c.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink-900 truncate">{c.name.az}</p>
              <p className="text-xs text-ink-400">{courseCount(c.id)} kurs • {c.subcategories.length} alt kateqoriya</p>
            </div>
            <button onClick={() => hideCategory(c.id)} className="text-ink-300 hover:text-coral-500 text-sm" aria-label="Gizlət">✕</button>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h3 className="font-bold text-lg text-ink-900 mb-3">Yeni kateqoriya</h3>
        <TextInput label="Ad (AZ)" value={name} onChange={(e) => setName(e.target.value)} />
        <p className="text-sm font-semibold text-ink-800 mb-1">İkon</p>
        <div className="flex gap-2 mb-3 flex-wrap">
          {ICONS.map((i) => <button key={i} onClick={() => setIcon(i)} className={`w-9 h-9 rounded-lg border text-lg ${icon === i ? 'border-ink-900' : 'border-ink-200'}`}>{i}</button>)}
        </div>
        <p className="text-sm font-semibold text-ink-800 mb-1">Rəng</p>
        <div className="flex gap-2 mb-4 flex-wrap">
          {COLORS.map((c) => <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-ink-900' : 'border-transparent'}`} style={{ background: c }} />)}
        </div>
        <Button fullWidth onClick={submit}>Əlavə et</Button>
      </Modal>
    </div>
  );
}
