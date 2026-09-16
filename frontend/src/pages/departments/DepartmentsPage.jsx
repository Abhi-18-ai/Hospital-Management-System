import { useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { departmentsApi } from '../../api/departments.api';
import { getErrorMessage } from '../../api/axiosClient';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/roles';
import Card, { CardHeader } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input, { Field } from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { IdChip, StatusBadge } from '../../components/ui/Badge';
import { GENERIC_STATUS_COLORS } from '../../utils/constants';

const CAN_MANAGE = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN];
const EMPTY_FORM = { name: '', code: '', description: '' };

export default function DepartmentsPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { items, meta, page, setPage, isLoading, refresh } = usePaginatedList(departmentsApi.list, {});

  function openCreate() {
    setEditingDept(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  }

  function openEdit(dept) {
    setEditingDept(dept);
    setForm({ name: dept.name, code: dept.code, description: dept.description || '' });
    setIsModalOpen(true);
  }

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingDept) {
        await departmentsApi.update(editingDept._id, form);
        toast.success('Department updated successfully.');
      } else {
        await departmentsApi.create(form);
        toast.success('Department created successfully.');
      }
      setIsModalOpen(false);
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const columns = [
    { key: 'code', header: 'Code', render: (row) => <IdChip>{row.code}</IdChip> },
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description', render: (row) => row.description || '—' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} colorMap={GENERIC_STATUS_COLORS} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader
          title="Departments"
          subtitle="The hospital's department catalog."
          actions={
            CAN_MANAGE.includes(user?.role) && (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Add department
              </Button>
            )
          }
        />
        {isLoading ? (
          <Spinner />
        ) : (
          <Table columns={columns} rows={items} onRowClick={CAN_MANAGE.includes(user?.role) ? openEdit : undefined} />
        )}
        <Pagination meta={meta} onPageChange={setPage} />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDept ? 'Edit department' : 'Add department'}>
        <form id="dept-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Name" required>
            <Input required value={form.name} onChange={update('name')} />
          </Field>
          <Field label="Code" required hint="Short unique code, e.g. CARD">
            <Input required value={form.code} onChange={update('code')} />
          </Field>
          <Field label="Description">
            <Textarea rows={3} value={form.description} onChange={update('description')} />
          </Field>
        </form>
        <div className="mt-2 flex justify-end gap-2 border-t border-ink-100 pt-4">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
            Cancel
          </Button>
          <Button type="submit" form="dept-form" isLoading={isSubmitting}>
            {editingDept ? 'Save changes' : 'Create department'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
