import { useState } from 'react';
import toast from 'react-hot-toast';
import { usersApi } from '../../api/users.api';
import { getErrorMessage } from '../../api/axiosClient';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { ROLE_LABELS } from '../../utils/roles';
import { ROLES } from '../../utils/roles';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import Select from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/Badge';
import { GENERIC_STATUS_COLORS } from '../../utils/constants';

export default function UsersPage() {
  const { user } = useAuth();
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { items, meta, page, setPage, isLoading, refresh } = usePaginatedList(usersApi.list, {
    role: roleFilter || undefined,
    status: statusFilter || undefined,
  });

  async function handleStatusChange(id, status) {
    try {
      await usersApi.updateStatus(id, status);
      toast.success('User status updated successfully.');
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleRoleChange(id, role) {
    try {
      await usersApi.update(id, { role });
      toast.success('User role assigned successfully.');
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  const assignableRoles = Object.entries(ROLE_LABELS).filter(([value]) => value !== ROLES.SUPER_ADMIN);

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Role',
      render: (row) =>
        user?.role === ROLES.SUPER_ADMIN && row.id !== user.id ? (
          <Select
            value={row.role}
            onChange={(e) => handleRoleChange(row.id, e.target.value)}
            className="w-44"
            onClick={(e) => e.stopPropagation()}
          >
            {assignableRoles.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        ) : (
          ROLE_LABELS[row.role] || row.role
        ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} colorMap={GENERIC_STATUS_COLORS} /> },
    {
      key: 'actions',
      header: 'Update status',
      render: (row) => (
        <Select
          value={row.status}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          className="w-36"
          onClick={(e) => e.stopPropagation()}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </Select>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader title="Users" subtitle="Manage staff and patient accounts, roles, and access." />
      <div className="flex flex-wrap gap-3 border-b border-ink-100 px-5 py-3">
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="max-w-xs">
          <option value="">All roles</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-xs">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </Select>
      </div>
      {isLoading ? <Spinner /> : <Table columns={columns} rows={items} keyField="id" />}
      <Pagination meta={meta} onPageChange={setPage} />
    </Card>
  );
}
