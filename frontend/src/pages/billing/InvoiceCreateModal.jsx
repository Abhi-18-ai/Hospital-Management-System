import { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { billingApi } from '../../api/billing.api';
import { patientsApi } from '../../api/patients.api';
import { formatCurrency } from '../../utils/formatters';
import Modal from '../../components/ui/Modal';
import Input, { Field } from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';

const EMPTY_ITEM = { description: '', quantity: 1, unitPrice: '' };

export default function InvoiceCreateModal({ isOpen, onClose, onCreated, onError }) {
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState([]);
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    patientsApi.list({ limit: 100 }).then((res) => setPatients(res.data.data));
  }, [isOpen]);

  function updateItem(index, field, value) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  const subtotal = items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
  const total = subtotal - Number(discount || 0) + Number(tax || 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await billingApi.createInvoice({
        patientId,
        items: items.map((it) => ({
          description: it.description,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
        })),
        discount: Number(discount || 0),
        tax: Number(tax || 0),
        notes,
      });
      setPatientId('');
      setItems([{ ...EMPTY_ITEM }]);
      setDiscount(0);
      setTax(0);
      setNotes('');
      onCreated();
    } catch (err) {
      onError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create invoice" size="lg">
      <form id="invoice-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Patient" required>
          <Select required value={patientId} onChange={(e) => setPatientId(e.target.value)}>
            <option value="">Select patient…</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.firstName} {p.lastName} ({p.mrn})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Line items" required>
          <div className="flex flex-col gap-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  required
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(i, 'description', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min="1"
                  required
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                  className="w-20"
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="Unit price"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(i, 'unitPrice', e.target.value)}
                  className="w-28"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                    className="rounded-md p-2 text-ink-400 hover:bg-ink-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-fit"
              onClick={() => setItems((prev) => [...prev, { ...EMPTY_ITEM }])}
            >
              <Plus className="h-3.5 w-3.5" /> Add item
            </Button>
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Discount (₹)">
            <Input type="number" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </Field>
          <Field label="Tax (₹)">
            <Input type="number" min="0" step="0.01" value={tax} onChange={(e) => setTax(e.target.value)} />
          </Field>
        </div>

        <Field label="Notes">
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>

        <div className="flex justify-end rounded-lg bg-ink-50 px-4 py-3 text-sm">
          <div className="text-right">
            <p className="text-ink-500">Subtotal: {formatCurrency(subtotal)}</p>
            <p className="mt-1 text-base font-bold text-ink-900">Total: {formatCurrency(total)}</p>
          </div>
        </div>
      </form>
      <div className="mt-2 flex justify-end gap-2 border-t border-ink-100 pt-4">
        <Button variant="secondary" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button type="submit" form="invoice-form" isLoading={isSubmitting}>
          Create invoice
        </Button>
      </div>
    </Modal>
  );
}
