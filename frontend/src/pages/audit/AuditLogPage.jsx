import { useState } from 'react';
import { auditApi } from '../../api/audit.api';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { formatDateTime } from '../../utils/formatters';
import Card, { CardHeader } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import Input from '../../components/ui/Input';
import { IdChip, Badge } from '../../components/ui/Badge';

export default function AuditLogPage() {
  const [actionFilter, setActionFilter] = useState('');
  const { items, meta, page, setPage, isLoading } = usePaginatedList(auditApi.search, {
    action: actionFilter || undefined,
  });

  const columns = [
    { key: 'action', header: 'Action', render: (row) => <Badge color="blue">{row.action}</Badge> },
    { key: 'resourceType', header: 'Resource', render: (row) => row.resourceType },
    { key: 'resourceId', header: 'Resource ID', render: (row) => (row.resourceId ? <IdChip>{String(row.resourceId).slice(-8)}</IdChip> : '—') },
    { key: 'actor', header: 'Actor', render: (row) => (row.actorId ? `${row.actorId.name} (${row.actorId.role})` : 'System') },
    { key: 'createdAt', header: 'Timestamp', render: (row) => formatDateTime(row.createdAt) },
  ];

  return (
    <Card>
      <CardHeader title="Audit Log" subtitle="Immutable record of sensitive security and business actions." />
      <div className="border-b border-ink-100 px-5 py-3">
        <Input
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          placeholder="Filter by action, e.g. patient.create"
          className="max-w-sm"
        />
      </div>
      {isLoading ? <Spinner /> : <Table columns={columns} rows={items} />}
      <Pagination meta={meta} onPageChange={setPage} />
    </Card>
  );
}
