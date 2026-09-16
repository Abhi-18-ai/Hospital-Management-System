import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientsApi } from '../../api/patients.api';
import { getErrorMessage } from '../../api/axiosClient';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/roles';
import { formatDate } from '../../utils/formatters';
import Card, { CardHeader } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { IdChip, StatusBadge } from '../../components/ui/Badge';
import { GENERIC_STATUS_COLORS } from '../../utils/constants';
import PatientCreateModal from './PatientCreateModal';

const CAN_REGISTER = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST];

export default function PatientsListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { items, meta, page, setPage, isLoading, refresh } = usePaginatedList(patientsApi.list, { search });

  async function handleCreated() {
    setIsCreateOpen(false);
    refresh();
    toast.success('Patient registered successfully.');
  }

  const columns = [
    { key: 'mrn', header: 'MRN', render: (row) => <IdChip>{row.mrn}</IdChip> },
    { key: 'name', header: 'Name', render: (row) => `${row.firstName} ${row.lastName}` },
    { key: 'gender', header: 'Gender', render: (row) => <span className="capitalize">{row.gender}</span> },
    { key: 'dob', header: 'Date of birth', render: (row) => formatDate(row.dateOfBirth) },
    { key: 'phone', header: 'Phone', render: (row) => row.contact?.phone || '—' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} colorMap={GENERIC_STATUS_COLORS} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader
          title="Patients"
          subtitle="Search and manage registered patients."
          actions={
            CAN_REGISTER.includes(user?.role) && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" /> Register patient
              </Button>
            )
          }
        />
        <div className="border-b border-ink-100 px-5 py-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, MRN, or phone…"
              className="pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <Table columns={columns} rows={items} onRowClick={(row) => navigate(`/patients/${row._id}`)} />
        )}
        <Pagination meta={meta} onPageChange={setPage} />
      </Card>

      <PatientCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleCreated}
        onError={(err) => toast.error(getErrorMessage(err))}
      />
    </div>
  );
}
