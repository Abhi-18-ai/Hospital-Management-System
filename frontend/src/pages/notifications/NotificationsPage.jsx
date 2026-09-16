import { Bell, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationsApi } from '../../api/notifications.api';
import { getErrorMessage } from '../../api/axiosClient';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { formatDateTime } from '../../utils/formatters';
import Card, { CardHeader } from '../../components/ui/Card';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import clsx from '../../utils/clsx';

export default function NotificationsPage() {
  const { items, meta, page, setPage, isLoading, refresh } = usePaginatedList(notificationsApi.list, {});

  async function handleMarkAsRead(id) {
    try {
      await notificationsApi.markAsRead(id);
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <Card>
      <CardHeader title="Notifications" subtitle={meta ? `${meta.unreadCount ?? 0} unread` : ''} />
      {isLoading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="You're all caught up." />
      ) : (
        <div className="divide-y divide-ink-100">
          {items.map((n) => (
            <div
              key={n._id}
              className={clsx('flex items-start justify-between gap-4 px-5 py-4', !n.readAt && 'bg-brand-50/40')}
            >
              <div>
                <div className="flex items-center gap-2">
                  {!n.readAt && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                  <p className="text-sm font-medium text-ink-800">{n.title}</p>
                </div>
                <p className="mt-0.5 text-sm text-ink-500">{n.message}</p>
                <p className="mt-1 text-xs text-ink-400">{formatDateTime(n.createdAt)}</p>
              </div>
              {!n.readAt && (
                <Button size="sm" variant="secondary" onClick={() => handleMarkAsRead(n._id)}>
                  <CheckCheck className="h-3.5 w-3.5" /> Mark read
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      <Pagination meta={meta} onPageChange={setPage} />
    </Card>
  );
}
