import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cross, ArrowLeft, MailCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth.api';
import { getErrorMessage } from '../../api/axiosClient';
import Input, { Field } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { IdChip } from '../../components/ui/Badge';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // The backend only ever returns this outside production, as a developer
  // convenience so the reset flow can be tested without wiring up real email
  // delivery. In production the response never contains it -- the token is
  // only ever delivered through the notification/email channel.
  const [devResetToken, setDevResetToken] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await authApi.forgotPassword({ email });
      setDevResetToken(res.data?.data?.resetToken || null);
      setIsSubmitted(true);
    } catch (err) {
      // The backend intentionally responds the same way whether or not the
      // email exists, to avoid leaking account existence -- so a thrown
      // error here means something genuinely went wrong (validation, rate
      // limit), not "email not found".
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
            <h1 className="text-xl font-bold text-ink-900">Reset your password</h1>
            <p className="text-sm text-ink-500">We'll send you instructions by email.</p>
          </div>
        </div>

        <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-card">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="Email address" required>
                <Input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@hospital.local"
                  autoComplete="email"
                />
              </Field>
              <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
                Send reset instructions
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-status-greenBg">
                <MailCheck className="h-5 w-5 text-status-green" />
              </div>
              <p className="text-sm text-ink-700">
                If an account exists for <span className="font-medium">{email}</span>, password reset instructions
                have been sent.
              </p>

              {devResetToken && (
                <div className="mt-2 w-full rounded-lg border border-status-amberBg bg-status-amberBg/60 p-3 text-left">
                  <p className="mb-1.5 text-xs font-semibold text-status-amber">
                    Development mode only — this token is never returned in production:
                  </p>
                  <IdChip>{devResetToken}</IdChip>
                  <Link
                    to={`/reset-password?token=${encodeURIComponent(devResetToken)}`}
                    className="mt-2 block text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    Continue to reset password →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

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
