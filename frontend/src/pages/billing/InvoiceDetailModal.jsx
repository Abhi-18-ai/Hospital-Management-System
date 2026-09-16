import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { billingApi } from '../../api/billing.api';
import { getErrorMessage } from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/roles';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { PAYMENT_METHODS } from '../../utils/constants';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input, { Field } from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Spinner from '../../components/ui/Spinner';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { INVOICE_STATUS_COLORS, GENERIC_STATUS_COLORS } from '../../utils/constants';

const CAN_RECORD_PAYMENT = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.ACCOUNTANT, ROLES.RECEPTIONIST];
const CAN_REFUND = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.ACCOUNTANT];

export default function InvoiceDetailModal({ invoiceId, onClose, onChanged }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'cash', reference: '' });
  const [refundReasons, setRefundReasons] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!invoiceId) return;
    loadInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  function loadInvoice() {
    setIsLoading(true);
    billingApi
      .getInvoiceById(invoiceId)
      .then((res) => setData(res.data.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }

  if (!invoiceId) return null;

  const outstanding = data ? data.invoice.total - data.invoice.amountPaid : 0;

  async function handleRecordPayment(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await billingApi.recordPayment(invoiceId, { ...paymentForm, amount: Number(paymentForm.amount) });
      toast.success('Payment recorded successfully.');
      setPaymentForm({ amount: '', method: 'cash', reference: '' });
      loadInvoice();
      onChanged();
    } catch (err) {
      // Surfaces PAYMENT_EXCEEDS_BALANCE if the amount is too high.
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRefund(paymentId) {
    const reason = refundReasons[paymentId];
    if (!reason) {
      toast.error('Please enter a reason before refunding.');
      return;
    }
    try {
      await billingApi.refundPayment(paymentId, reason);
      toast.success('Payment refunded successfully.');
      loadInvoice();
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <Modal isOpen={!!invoiceId} onClose={onClose} title="Invoice details" size="lg">
      {isLoading || !data ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm font-semibold text-ink-800">{data.invoice.invoiceNumber}</p>
              <p className="text-sm text-ink-500">
                {data.invoice.patientId?.firstName} {data.invoice.patientId?.lastName} · {formatDateTime(data.invoice.issuedAt)}
              </p>
            </div>
            <StatusBadge value={data.invoice.status} colorMap={INVOICE_STATUS_COLORS} />
          </div>

          <div className="rounded-lg border border-ink-100">
            {data.invoice.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between border-b border-ink-100 px-3 py-2 text-sm last:border-b-0">
                <span className="text-ink-700">
                  {item.description} × {item.quantity}
                </span>
                <span className="font-medium text-ink-800">{formatCurrency(item.amount)}</span>
              </div>
            ))}
            <div className="flex flex-col gap-1 bg-ink-50 px-3 py-3 text-sm">
              <div className="flex justify-between text-ink-500">
                <span>Subtotal</span>
                <span>{formatCurrency(data.invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-500">
                <span>Discount</span>
                <span>-{formatCurrency(data.invoice.discount)}</span>
              </div>
              <div className="flex justify-between text-ink-500">
                <span>Tax</span>
                <span>{formatCurrency(data.invoice.tax)}</span>
              </div>
              <div className="flex justify-between border-t border-ink-200 pt-1 text-base font-bold text-ink-900">
                <span>Total</span>
                <span>{formatCurrency(data.invoice.total)}</span>
              </div>
              <div className="flex justify-between text-status-green">
                <span>Paid</span>
                <span>{formatCurrency(data.invoice.amountPaid)}</span>
              </div>
              {outstanding > 0 && (
                <div className="flex justify-between font-medium text-status-red">
                  <span>Outstanding</span>
                  <span>{formatCurrency(outstanding)}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-ink-800">Payment history</h4>
            {data.payments.length > 0 ? (
              <div className="divide-y divide-ink-100 rounded-lg border border-ink-100">
                {data.payments.map((p) => (
                  <div key={p._id} className="flex items-center justify-between px-3 py-2.5 text-sm">
                    <div>
                      <p className="font-medium text-ink-700">
                        {formatCurrency(p.amount)} · <span className="capitalize">{p.method.replace('_', ' ')}</span>
                      </p>
                      <p className="text-ink-400">{formatDateTime(p.paidAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge color={p.status === 'refunded' ? 'slate' : p.status === 'success' ? 'green' : 'red'}>{p.status}</Badge>
                      {p.status === 'success' && CAN_REFUND.includes(user?.role) && (
                        <div className="flex items-center gap-1">
                          <input
                            placeholder="Refund reason"
                            className="w-32 rounded-md border border-ink-200 px-2 py-1 text-xs"
                            value={refundReasons[p._id] || ''}
                            onChange={(e) => setRefundReasons({ ...refundReasons, [p._id]: e.target.value })}
                          />
                          <Button size="sm" variant="danger" onClick={() => handleRefund(p._id)}>
                            Refund
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-400">No payments recorded yet.</p>
            )}
          </div>

          {outstanding > 0 && CAN_RECORD_PAYMENT.includes(user?.role) && (
            <form onSubmit={handleRecordPayment} className="rounded-lg border border-ink-100 p-4">
              <h4 className="mb-3 text-sm font-semibold text-ink-800">Record payment</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Amount (₹)" required>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={outstanding}
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  />
                </Field>
                <Field label="Method" required>
                  <Select
                    required
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m.replace('_', ' ')}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Reference">
                  <Input
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  />
                </Field>
              </div>
              <Button type="submit" size="sm" className="mt-3" isLoading={isSubmitting}>
                Record payment
              </Button>
            </form>
          )}
        </div>
      )}
    </Modal>
  );
}
