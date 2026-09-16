import { useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { laboratoryApi } from '../../api/laboratory.api';
import { getErrorMessage } from '../../api/axiosClient';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/roles';
import { formatDateTime } from '../../utils/formatters';
import Card, { CardHeader } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { LAB_ORDER_STATUS_COLORS } from '../../utils/constants';
import LabOrderCreateModal from './LabOrderCreateModal';
import LabOrderDetailModal from './LabOrderDetailModal';

const CAN_ORDER = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR];

export default function LabOrdersPage() {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { items, meta, page, setPage, isLoading, refresh } = usePaginatedList(laboratoryApi.listOrders, {
    status: statusFilter || undefined,
  });

  const columns = [
    { key: 'patient', header: 'Patient', render: (row) => `${row.patientId?.firstName} ${row.patientId?.lastName}` },
    { key: 'doctor', header: 'Ordered by', render: (row) => `Dr. ${row.doctorId?.firstName} ${row.doctorId?.lastName}` },
    { key: 'tests', header: 'Tests', render: (row) => row.tests.join(', ') },
    { key: 'priority', header: 'Priority', render: (row) => <Badge color={row.priority === 'stat' ? 'red' : row.priority === 'urgent' ? 'amber' : 'slate'}>{row.priority}</Badge> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} colorMap={LAB_ORDER_STATUS_COLORS} /> },
    { key: 'orderedAt', header: 'Ordered at', render: (row) => formatDateTime(row.orderedAt) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader
          title="Laboratory Orders"
          subtitle="Track lab orders from request through verified results."
          actions={
            CAN_ORDER.includes(user?.role) && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" /> New lab order
              </Button>
            )
          }
        />
        <div className="border-b border-ink-100 px-5 py-3">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-xs">
            <option value="">All statuses</option>
            {['ordered', 'sample_collected', 'in_progress', 'result_submitted', 'verified', 'cancelled'].map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <Table columns={columns} rows={items} onRowClick={(row) => setSelectedOrderId(row._id)} />
        )}
        <Pagination meta={meta} onPageChange={setPage} />
      </Card>

      <LabOrderCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          setIsCreateOpen(false);
          refresh();
          toast.success('Lab order created successfully.');
        }}
        onError={(err) => toast.error(getErrorMessage(err))}
      />

      <LabOrderDetailModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        onChanged={refresh}
      />
    </div>
  );
}
