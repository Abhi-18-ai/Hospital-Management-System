import clsx from '../../utils/clsx';

export function Field({ label, hint, error, required, children, className = '' }) {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-ink-700">
          {label}
          {required && <span className="ml-0.5 text-status-red">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-ink-400">{hint}</p>}
      {error && <p className="text-xs font-medium text-status-red">{error}</p>}
    </div>
  );
}

export default function Input({ className = '', error, ...rest }) {
  return (
    <input
      className={clsx(
        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400',
        'focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
        error ? 'border-status-red' : 'border-ink-200',
        className
      )}
      {...rest}
    />
  );
}
