import { useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { billingApi } from '../../api/billing.api';
import { getErrorMessage } from '../../api/axiosClient';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/roles';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { IdChip, StatusBadge } from '../../components/ui/Badge';
import { INVOICE_STATUS_COLORS } from '../../utils/constants';
import Card, { CardHeader } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import InvoiceCreateModal from './InvoiceCreateModal';
import InvoiceDetailModal from './InvoiceDetailModal';

const CAN_CREATE = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.ACCOUNTANT, ROLES.RECEPTIONIST];

export default function InvoicesPage() {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  const { items, meta, page, setPage, isLoading, refresh } = usePaginatedList(billingApi.listInvoices, {});

  const columns = [
    { key: 'invoiceNumber', header: 'Invoice #', render: (row) => <IdChip>{row.invoiceNumber}</IdChip> },
    { key: 'patient', header: 'Patient', render: (row) => `${row.patientId?.firstName} ${row.patientId?.lastName}` },
    { key: 'total', header: 'Total', render: (row) => formatCurrency(row.total) },
    { key: 'amountPaid', header: 'Paid', render: (row) => formatCurrency(row.amountPaid) },
    { key: 'issuedAt', header: 'Issued', render: (row) => formatDate(row.issuedAt) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} colorMap={INVOICE_STATUS_COLORS} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader
          title="Billing"
          subtitle="Invoices, payments, and refunds."
          actions={
            CAN_CREATE.includes(user?.role) && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" /> Create invoice
              </Button>
            )
          }
        />
        {isLoading ? (
          <Spinner />
        ) : (
          <Table columns={columns} rows={items} onRowClick={(row) => setSelectedInvoiceId(row._id)} />
        )}
        <Pagination meta={meta} onPageChange={setPage} />
      </Card>

      <InvoiceCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          setIsCreateOpen(false);
          refresh();
          toast.success('Invoice created successfully.');
        }}
        onError={(err) => toast.error(getErrorMessage(err))}
      />

      <InvoiceDetailModal invoiceId={selectedInvoiceId} onClose={() => setSelectedInvoiceId(null)} onChanged={refresh} />
    </div>
  );
}
