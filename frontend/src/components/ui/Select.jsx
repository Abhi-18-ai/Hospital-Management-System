import clsx from '../../utils/clsx';

export default function Select({ className = '', error, children, ...rest }) {
  return (
    <select
      className={clsx(
        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink-900',
        'focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
        error ? 'border-status-red' : 'border-ink-200',
        className
      )}
      {...rest}
    >
      {children}
    </select>
  );
}
