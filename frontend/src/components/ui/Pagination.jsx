import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-ink-100 px-5 py-3">
      <p className="text-xs text-ink-500">
        Page <span className="font-medium text-ink-700">{meta.page}</span> of{' '}
        <span className="font-medium text-ink-700">{meta.totalPages}</span> · {meta.total} total
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={!meta.hasPrevPage} onClick={() => onPageChange(meta.page - 1)}>
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <Button variant="secondary" size="sm" disabled={!meta.hasNextPage} onClick={() => onPageChange(meta.page + 1)}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
