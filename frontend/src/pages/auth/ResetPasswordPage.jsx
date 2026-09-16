import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Cross, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth.api';
import { getErrorMessage } from '../../api/axiosClient';
import Input, { Field } from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // A real email link would carry ?token=..., but the token is also shown
  // directly in the dev-mode response on the previous screen, so it's kept
  // editable here rather than locked to a read-only URL param.
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword({ token: token.trim(), newPassword });
      toast.success('Password reset successfully. Please log in.');
      navigate('/login', { replace: true });
    } catch (err) {
      // Surfaces RESET_TOKEN_INVALID from the backend if the token is
      // wrong, already used, or expired (tokens expire after JWT_RESET_EXPIRES_IN).
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500">
            <Cross className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink-900">Set a new password</h1>
            <p className="text-sm text-ink-500">Paste your reset token and choose a new password.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-ink-200 bg-white p-6 shadow-card">
          <div className="flex flex-col gap-4">
            <Field label="Reset token" required hint="From your reset email, or the dev-mode screen.">
              <Textarea
                required
                rows={2}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste the token here…"
                className="font-mono text-xs"
              />
            </Field>

            <Field label="New password" required hint="At least 8 characters, with uppercase, lowercase, and a number.">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-400 hover:text-ink-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Field label="Confirm new password" required>
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </Field>

            <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
              Reset password
            </Button>
          </div>
        </form>

        <Link
          to="/login"
          className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
