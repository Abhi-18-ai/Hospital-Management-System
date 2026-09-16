import clsx from '../../utils/clsx';
import { titleCase } from '../../utils/formatters';

const COLOR_MAP = {
  green: 'bg-status-greenBg text-status-green',
  amber: 'bg-status-amberBg text-status-amber',
  red: 'bg-status-redBg text-status-red',
  blue: 'bg-status-blueBg text-status-blue',
  slate: 'bg-status-slateBg text-status-slate',
};

/** Status pill. Pass `color` directly, or `colorMap` + `value` to derive it. */
export function Badge({ children, color = 'slate', className = '' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        COLOR_MAP[color] || COLOR_MAP.slate,
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ value, colorMap = {} }) {
  const color = colorMap[value] || 'slate';
  return <Badge color={color}>{titleCase(value)}</Badge>;
}

export function IdChip({ children }) {
  return <span className="id-chip">{children}</span>;
}

export default Badge;
