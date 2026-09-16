import { useState } from 'react';
import { Plus, Package, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { pharmacyApi } from '../../api/pharmacy.api';
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
import { Badge } from '../../components/ui/Badge';
import clsx from '../../utils/clsx';
import MedicineCreateModal from './MedicineCreateModal';
import BatchCreateModal from './BatchCreateModal';
import DispenseModal from './DispenseModal';

const PHARMACY_STAFF = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.PHARMACIST];
const TABS = ['Medicines', 'Stock', 'Low Stock'];

export default function PharmacyPage() {
  const { user } = useAuth();
  const isPharmacyStaff = PHARMACY_STAFF.includes(user?.role);
  const [activeTab, setActiveTab] = useState('Medicines');
  const [modals, setModals] = useState({ medicine: false, batch: false, dispense: false });

  const medicinesQuery = usePaginatedList(pharmacyApi.searchMedicines, {}, [activeTab === 'Medicines']);
  const stockQuery = usePaginatedList(pharmacyApi.stockView, {}, [activeTab === 'Stock']);
  const lowStockQuery = usePaginatedList(pharmacyApi.lowStock, {}, [activeTab === 'Low Stock']);

  function refreshAll() {
    medicinesQuery.refresh();
    stockQuery.refresh();
    lowStockQuery.refresh();
  }

  const medicineColumns = [
    { key: 'name', header: 'Name' },
    { key: 'genericName', header: 'Generic name', render: (r) => r.genericName || '—' },
    { key: 'category', header: 'Category', render: (r) => r.category || '—' },
    { key: 'unit', header: 'Unit' },
    { key: 'reorderLevel', header: 'Reorder level' },
    { key: 'status', header: 'Status', render: (r) => <Badge color={r.status === 'active' ? 'green' : 'slate'}>{r.status}</Badge> },
  ];

  const stockColumns = [
    { key: 'medicine', header: 'Medicine', render: (r) => r.medicineId?.name },
    { key: 'batchNo', header: 'Batch No.' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'unitCost', header: 'Unit cost', render: (r) => `₹${r.unitCost}` },
    { key: 'expiryDate', header: 'Expiry date', render: (r) => formatDate(r.expiryDate) },
  ];

  const lowStockColumns = [
    { key: 'name', header: 'Medicine', render: (r) => r.medicine.name },
    { key: 'unit', header: 'Unit', render: (r) => r.medicine.unit },
    {
      key: 'qty',
      header: 'Remaining vs. reorder level',
      render: (r) => (
        <span className="flex items-center gap-1.5 font-medium text-status-red">
          <AlertTriangle className="h-3.5 w-3.5" />
          {r.totalQuantity} / {r.medicine.reorderLevel}
        </span>
      ),
    },
  ];

  const activeQuery = activeTab === 'Medicines' ? medicinesQuery : activeTab === 'Stock' ? stockQuery : lowStockQuery;
  const activeColumns = activeTab === 'Medicines' ? medicineColumns : activeTab === 'Stock' ? stockColumns : lowStockColumns;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader
          title="Pharmacy"
          subtitle="Medicine catalog, stock batches, and dispensing."
          actions={
            isPharmacyStaff && (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setModals({ ...modals, medicine: true })}>
                  <Plus className="h-4 w-4" /> Medicine
                </Button>
                <Button variant="secondary" onClick={() => setModals({ ...modals, batch: true })}>
                  <Package className="h-4 w-4" /> Stock batch
                </Button>
                <Button onClick={() => setModals({ ...modals, dispense: true })}>Dispense</Button>
              </div>
            )
          }
        />

        <div className="flex gap-1 overflow-x-auto border-b border-ink-100 px-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors',
                activeTab === tab ? 'border-brand-500 text-brand-600' : 'border-transparent text-ink-500 hover:text-ink-800'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeQuery.isLoading ? (
          <Spinner />
        ) : (
          <Table
            columns={activeColumns}
            rows={activeQuery.items}
            keyField={activeTab === 'Low Stock' ? undefined : '_id'}
            emptyMessage={activeTab === 'Low Stock' ? 'All medicines are above their reorder level.' : 'No records found.'}
          />
        )}
        <Pagination meta={activeQuery.meta} onPageChange={activeQuery.setPage} />
      </Card>

      <MedicineCreateModal
        isOpen={modals.medicine}
        onClose={() => setModals({ ...modals, medicine: false })}
        onCreated={() => {
          setModals({ ...modals, medicine: false });
          refreshAll();
          toast.success('Medicine created successfully.');
        }}
        onError={(err) => toast.error(getErrorMessage(err))}
      />
      <BatchCreateModal
        isOpen={modals.batch}
        onClose={() => setModals({ ...modals, batch: false })}
        onCreated={() => {
          setModals({ ...modals, batch: false });
          refreshAll();
          toast.success('Stock batch added successfully.');
        }}
        onError={(err) => toast.error(getErrorMessage(err))}
      />
      <DispenseModal
        isOpen={modals.dispense}
        onClose={() => setModals({ ...modals, dispense: false })}
        onDispensed={() => {
          setModals({ ...modals, dispense: false });
          refreshAll();
          toast.success('Medicine dispensed successfully.');
        }}
        onError={(err) => toast.error(getErrorMessage(err))}
      />
    </div>
  );
}
