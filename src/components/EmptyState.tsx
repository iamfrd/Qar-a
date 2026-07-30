import type { ReactNode } from 'react';
import { CrowMascot } from './CrowMascot';

export function EmptyState({ title, body, action, mood = 'thinking' }: { title: string; body?: string; action?: ReactNode; mood?: 'default' | 'thinking' | 'sleeping' }) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-6">
      <CrowMascot size={72} mood={mood} />
      <h3 className="font-bold text-ink-900 mt-3">{title}</h3>
      {body && <p className="text-sm text-ink-500 mt-1 max-w-xs">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
