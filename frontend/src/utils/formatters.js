import { format, parseISO } from 'date-fns';

export function formatDate(value, pattern = 'dd MMM yyyy') {
  if (!value) return '—';
  try {
    const date = typeof value === 'string' ? parseISO(value) : value;
    return format(date, pattern);
  } catch {
    return '—';
  }
}

export function formatDateTime(value) {
  return formatDate(value, 'dd MMM yyyy, h:mm a');
}

export function formatCurrency(value) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}

export function toDateTimeLocalInput(value) {
  if (!value) return '';
  const date = typeof value === 'string' ? parseISO(value) : value;
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}

export function titleCase(value) {
  if (!value) return '';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
