import type { ReactNode } from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: ReactNode;
  tone?: 'gold' | 'teal' | 'ink' | 'coral' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

const tones = {
  gold: 'bg-gold-100 text-gold-600',
  teal: 'bg-teal-100 text-teal-700',
  ink: 'bg-ink-900 text-white',
  coral: 'bg-coral-100 text-coral-500',
  neutral: 'bg-ink-100 text-ink-600',
};

export function Badge({ children, tone = 'neutral', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap',
        tones[tone],
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        className
      )}
    >
      {children}
    </span>
  );
}

export function VerifiedBadge({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <Badge tone="teal" size={size}>
      ✓ Təsdiqlənmiş
    </Badge>
  );
}

export function QargaExclusiveBadge({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <Badge tone="gold" size={size}>
      🐦‍⬛ Qarğa endirimi
    </Badge>
  );
}
