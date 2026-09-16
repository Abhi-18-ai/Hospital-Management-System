import { useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorsApi } from '../../api/doctors.api';
import { getErrorMessage } from '../../api/axiosClient';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/roles';
import Card, { CardHeader } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { GENERIC_STATUS_COLORS } from '../../utils/constants';
import DoctorCreateModal from './DoctorCreateModal';

const CAN_CREATE = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN];

export default function DoctorsListPage() {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { items, meta, page, setPage, isLoading, refresh } = usePaginatedList(doctorsApi.list, {});

  const columns = [
    { key: 'name', header: 'Name', render: (row) => `Dr. ${row.firstName} ${row.lastName}` },
    { key: 'specialization', header: 'Specialization' },
    { key: 'department', header: 'Department', render: (row) => row.departmentId?.name || '—' },
    { key: 'fee', header: 'Consultation Fee', render: (row) => `₹${row.consultationFee}` },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} colorMap={GENERIC_STATUS_COLORS} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader
          title="Doctors"
          subtitle="Browse doctor profiles, specializations, and schedules."
          actions={
            CAN_CREATE.includes(user?.role) && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" /> Add doctor
              </Button>
            )
          }
        />
        {isLoading ? <Spinner /> : <Table columns={columns} rows={items} />}
        <Pagination meta={meta} onPageChange={setPage} />
      </Card>

      <DoctorCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          setIsCreateOpen(false);
          refresh();
          toast.success('Doctor profile created successfully.');
        }}
        onError={(err) => toast.error(getErrorMessage(err))}
      />
    </div>
  );
}
