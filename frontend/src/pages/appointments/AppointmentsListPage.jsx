import { useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentsApi } from '../../api/appointments.api';
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
import { StatusBadge } from '../../components/ui/Badge';
import { APPOINTMENT_STATUS_COLORS } from '../../utils/constants';
import AppointmentCreateModal from './AppointmentCreateModal';
import AppointmentActionsMenu from './AppointmentActionsMenu';

const CAN_BOOK = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT];

export default function AppointmentsListPage() {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const { items, meta, page, setPage, isLoading, refresh } = usePaginatedList(appointmentsApi.list, {
    status: statusFilter || undefined,
  });

  const columns = [
    { key: 'patient', header: 'Patient', render: (row) => `${row.patientId?.firstName} ${row.patientId?.lastName}` },
    { key: 'doctor', header: 'Doctor', render: (row) => `Dr. ${row.doctorId?.firstName} ${row.doctorId?.lastName}` },
    { key: 'department', header: 'Department', render: (row) => row.departmentId?.name || '—' },
    { key: 'startAt', header: 'Scheduled for', render: (row) => formatDateTime(row.startAt) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} colorMap={APPOINTMENT_STATUS_COLORS} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => <AppointmentActionsMenu appointment={row} onChanged={refresh} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader
          title="Appointments"
          subtitle="Book, track, and manage patient appointments."
          actions={
            CAN_BOOK.includes(user?.role) && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" /> Book appointment
              </Button>
            )
          }
        />
        <div className="border-b border-ink-100 px-5 py-3">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-xs">
            <option value="">All statuses</option>
            {['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'].map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </div>

        {isLoading ? <Spinner /> : <Table columns={columns} rows={items} />}
        <Pagination meta={meta} onPageChange={setPage} />
      </Card>

      <AppointmentCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          setIsCreateOpen(false);
          refresh();
          toast.success('Appointment booked successfully.');
        }}
        onError={(err) => toast.error(getErrorMessage(err))}
      />
    </div>
  );
}
