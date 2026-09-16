import { Loader2 } from 'lucide-react';
import clsx from '../../utils/clsx';

export default function Spinner({ className = '', label = 'Loading…' }) {
  return (
    <div className={clsx('flex items-center justify-center gap-2 py-12 text-ink-400', className)}>
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
