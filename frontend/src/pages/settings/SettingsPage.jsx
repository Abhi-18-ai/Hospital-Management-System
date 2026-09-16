import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth.api';
import { getErrorMessage } from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../utils/roles';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Input, { Field } from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      // The backend revokes every existing session on a successful password
      // change (a real security measure, not just UI theater), so the
      // person must sign back in here regardless of what this screen does.
      toast.success('Password changed successfully. Please sign in again.');
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      // Surfaces INVALID_CURRENT_PASSWORD or SAME_PASSWORD from the backend.
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader title="Account" subtitle="Your profile information." />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-ink-400">Name</p>
            <p className="mt-0.5 text-sm text-ink-800">{user?.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-ink-400">Email</p>
            <p className="mt-0.5 text-sm text-ink-800">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-ink-400">Role</p>
            <p className="mt-0.5 text-sm text-ink-800">{ROLE_LABELS[user?.role] || user?.role}</p>
          </div>
        </CardBody>
      </Card>

      <Card className="max-w-lg">
        <CardHeader title="Change password" subtitle="You'll be signed out on every device after this." />
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Current password" required>
              <Input
                type="password"
                required
                autoComplete="current-password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              />
            </Field>
            <Field label="New password" required hint="At least 8 characters, with uppercase, lowercase, and a number.">
              <Input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              />
            </Field>
            <Field label="Confirm new password" required>
              <Input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </Field>
            <Button type="submit" isLoading={isSubmitting} className="w-fit">
              <KeyRound className="h-4 w-4" /> Update password
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
