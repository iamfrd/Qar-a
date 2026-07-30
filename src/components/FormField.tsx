import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

interface FieldMeta {
  label?: string;
  hint?: string;
  error?: string;
}

export function FieldWrap({ label, hint, error, children }: FieldMeta & { children: ReactNode }) {
  return (
    <label className="block mb-3">
      {label && <span className="block text-sm font-semibold text-ink-800 mb-1">{label}</span>}
      {children}
      {hint && !error && <span className="block text-xs text-ink-400 mt-1">{hint}</span>}
      {error && <span className="block text-xs text-coral-500 mt-1">{error}</span>}
    </label>
  );
}

export function TextInput({ label, hint, error, className, ...rest }: FieldMeta & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldWrap label={label} hint={hint} error={error}>
      <input
        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-ink-900 ${error ? 'border-coral-500' : 'border-ink-200'} ${className ?? ''}`}
        {...rest}
      />
    </FieldWrap>
  );
}

export function TextArea({ label, hint, error, className, ...rest }: FieldMeta & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldWrap label={label} hint={hint} error={error}>
      <textarea
        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-ink-900 min-h-[90px] resize-none ${error ? 'border-coral-500' : 'border-ink-200'} ${className ?? ''}`}
        {...rest}
      />
    </FieldWrap>
  );
}
