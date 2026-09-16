import { useState } from 'react';
import { Plus, BedDouble } from 'lucide-react';
import toast from 'react-hot-toast';
import { admissionsApi } from '../../api/admissions.api';
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
import { StatusBadge } from '../../components/ui/Badge';
import { ADMISSION_STATUS_COLORS } from '../../utils/constants';
import AdmitPatientModal from './AdmitPatientModal';
import AdmissionActionsMenu from './AdmissionActionsMenu';
import BedsAvailabilityModal from './BedsAvailabilityModal';

const ADMISSION_STAFF = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE];

export default function AdmissionsPage() {
  const { user } = useAuth();
  const [isAdmitOpen, setIsAdmitOpen] = useState(false);
  const [isBedsOpen, setIsBedsOpen] = useState(false);

  const { items, meta, page, setPage, isLoading, refresh } = usePaginatedList(admissionsApi.list, {});

  const columns = [
    { key: 'patient', header: 'Patient', render: (row) => `${row.patientId?.firstName} ${row.patientId?.lastName}` },
    { key: 'doctor', header: 'Attending', render: (row) => `Dr. ${row.doctorId?.firstName} ${row.doctorId?.lastName}` },
    { key: 'location', header: 'Location', render: (row) => `${row.ward} / ${row.room} / ${row.bed}` },
    { key: 'admittedAt', header: 'Admitted', render: (row) => formatDate(row.admittedAt) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} colorMap={ADMISSION_STATUS_COLORS} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => <AdmissionActionsMenu admission={row} onChanged={refresh} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader
          title="Admissions"
          subtitle="Ward, room, and bed management."
          actions={
            ADMISSION_STAFF.includes(user?.role) && (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setIsBedsOpen(true)}>
                  <BedDouble className="h-4 w-4" /> Bed availability
                </Button>
                <Button onClick={() => setIsAdmitOpen(true)}>
                  <Plus className="h-4 w-4" /> Admit patient
                </Button>
              </div>
            )
          }
        />
        {isLoading ? <Spinner /> : <Table columns={columns} rows={items} />}
        <Pagination meta={meta} onPageChange={setPage} />
      </Card>

      <AdmitPatientModal
        isOpen={isAdmitOpen}
        onClose={() => setIsAdmitOpen(false)}
        onCreated={() => {
          setIsAdmitOpen(false);
          refresh();
          toast.success('Patient admitted successfully.');
        }}
        onError={(err) => toast.error(getErrorMessage(err))}
      />

      <BedsAvailabilityModal isOpen={isBedsOpen} onClose={() => setIsBedsOpen(false)} />
    </div>
  );
}
