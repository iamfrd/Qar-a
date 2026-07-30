import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CrowMascot } from './CrowMascot';

interface ToastItem {
  id: number;
  message: string;
  tone: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  show: (message: string, tone?: ToastItem['tone']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, tone: ToastItem['tone'] = 'info') => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[min(92vw,380px)] pointer-events-none">
        {items.map((item) => (
          <div
            key={item.id}
            className="animate-fade-in-up pointer-events-auto flex items-center gap-2 rounded-2xl bg-ink-900 text-white px-4 py-3 shadow-lg text-sm"
          >
            {item.tone === 'success' ? (
              <CrowMascot size={28} mood="happy" />
            ) : item.tone === 'error' ? (
              <span className="text-lg">⚠️</span>
            ) : (
              <CrowMascot size={28} mood="default" />
            )}
            <span className="flex-1">{item.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
