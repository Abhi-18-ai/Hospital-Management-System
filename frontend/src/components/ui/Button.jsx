import { Loader2 } from 'lucide-react';
import clsx from '../../utils/clsx';

const VARIANTS = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500 disabled:bg-brand-300',
  secondary: 'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50 disabled:text-ink-300',
  danger: 'bg-status-red text-white hover:bg-red-800 disabled:bg-red-300',
  ghost: 'text-ink-600 hover:bg-ink-100 disabled:text-ink-300',
};

const SIZES = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      disabled={isLoading || rest.disabled}
      {...rest}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
