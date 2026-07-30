import clsx from 'clsx';

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-1 px-1">
      {steps.map((step, i) => (
        <div key={step} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={clsx(
              'w-full h-1.5 rounded-full',
              i <= current ? 'bg-ink-900' : 'bg-ink-100'
            )}
          />
          <span className={clsx('text-[10px] font-medium text-center leading-tight', i === current ? 'text-ink-900' : 'text-ink-400')}>
            {step}
          </span>
        </div>
      ))}
    </div>
  );
}
