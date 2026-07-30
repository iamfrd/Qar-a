import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; footer?: ReactNode }) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-t-3xl max-h-[86vh] flex flex-col animate-fade-in-up">
        <div className="mx-auto mt-2 w-10 h-1.5 rounded-full bg-ink-200" />
        {title && (
          <div className="flex items-center justify-between px-5 pt-3 pb-2">
            <h2 className="font-bold text-lg text-ink-900">{title}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-ink-100 text-ink-500" aria-label="Bağla">✕</button>
          </div>
        )}
        <div className="overflow-y-auto px-5 pb-4 flex-1 no-scrollbar">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-ink-100 pb-[calc(env(safe-area-inset-bottom)+12px)]">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export function Modal({ open, onClose, children, size = 'md' }: { open: boolean; onClose: () => void; children: ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  if (!open) return null;
  const widths = { sm: 'max-w-xs', md: 'max-w-md', lg: 'max-w-lg' };
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white w-full ${widths[size]} rounded-3xl p-6 animate-fade-in-up max-h-[90vh] overflow-y-auto no-scrollbar`}>
        {children}
      </div>
    </div>,
    document.body
  );
}
