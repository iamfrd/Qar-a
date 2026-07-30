import clsx from 'clsx';
import type { ReactNode } from 'react';

export function Chip({ active, onClick, children, icon }: { active?: boolean; onClick?: () => void; children: ReactNode; icon?: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-colors shrink-0',
        active ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-ink-700 border-ink-200 hover:border-ink-400'
      )}
    >
      {icon}
      {children}
    </button>
  );
}
