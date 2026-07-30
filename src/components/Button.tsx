import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: ReactNode;
}

const variants = {
  primary: 'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950 disabled:bg-ink-300',
  secondary: 'bg-gold-500 text-ink-950 hover:bg-gold-400 active:bg-gold-600 disabled:bg-ink-200',
  ghost: 'bg-transparent text-ink-900 hover:bg-ink-100 active:bg-ink-200',
  outline: 'bg-white text-ink-900 border border-ink-200 hover:bg-ink-50 active:bg-ink-100',
  danger: 'bg-coral-500 text-white hover:bg-red-600',
};

const sizes = {
  sm: 'text-sm px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
  lg: 'text-base px-5 py-3.5 rounded-2xl gap-2',
};

export function Button({ variant = 'primary', size = 'md', fullWidth, icon, className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-semibold transition-colors disabled:cursor-not-allowed select-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
