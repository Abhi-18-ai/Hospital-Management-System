import clsx from '../../utils/clsx';

/**
 * Simple declarative table.
 * columns: [{ key, header, render?: (row) => node, className? }]
 */
export default function Table({ columns, rows, keyField = '_id', onRowClick, emptyMessage = 'No records found.' }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
        <p className="text-sm font-medium text-ink-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
            {columns.map((col) => (
              <th key={col.key} className={clsx('whitespace-nowrap px-4 py-3 font-medium', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {rows.map((row) => (
            <tr
              key={row[keyField] || row.id}
              className={clsx('transition-colors', onRowClick && 'cursor-pointer hover:bg-brand-50/50')}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className={clsx('whitespace-nowrap px-4 py-3 text-ink-700', col.className)}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
