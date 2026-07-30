import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export function TopBar({ title, right, onBack, transparent }: { title?: string; right?: ReactNode; onBack?: () => void; transparent?: boolean }) {
  const navigate = useNavigate();
  return (
    <header className={`sticky top-0 z-30 flex items-center gap-2 px-3 py-3 ${transparent ? '' : 'bg-white border-b border-ink-100'}`}>
      <button
        onClick={() => (onBack ? onBack() : navigate(-1))}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-ink-100 text-ink-700 shrink-0"
        aria-label="Geri"
      >
        ←
      </button>
      <h1 className="flex-1 font-bold text-ink-900 truncate">{title}</h1>
      {right}
    </header>
  );
}
