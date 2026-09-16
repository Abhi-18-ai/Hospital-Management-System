import { useEffect, useState } from 'react';
import { pharmacyApi } from '../../api/pharmacy.api';
import Modal from '../../components/ui/Modal';
import Input, { Field } from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

const EMPTY_FORM = { medicineId: '', batchNo: '', expiryDate: '', quantity: '', unitCost: '' };

export default function BatchCreateModal({ isOpen, onClose, onCreated, onError }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [medicines, setMedicines] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    pharmacyApi.searchMedicines({ limit: 100, status: 'active' }).then((res) => setMedicines(res.data.data));
  }, [isOpen]);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await pharmacyApi.createBatch({
        ...form,
        quantity: Number(form.quantity),
        unitCost: Number(form.unitCost),
      });
      setForm(EMPTY_FORM);
      onCreated();
    } catch (err) {
      onError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add stock batch">
      <form id="batch-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Medicine" required>
          <Select required value={form.medicineId} onChange={update('medicineId')}>
            <option value="">Select medicine…</option>
            {medicines.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.unit})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Batch number" required>
          <Input required value={form.batchNo} onChange={update('batchNo')} />
        </Field>
        <Field label="Expiry date" required>
          <Input type="date" required value={form.expiryDate} onChange={update('expiryDate')} />
        </Field>
        <Field label="Quantity" required>
          <Input type="number" min="1" required value={form.quantity} onChange={update('quantity')} />
        </Field>
        <Field label="Unit cost (₹)" required>
          <Input type="number" min="0" step="0.01" required value={form.unitCost} onChange={update('unitCost')} />
        </Field>
      </form>
      <div className="mt-2 flex justify-end gap-2 border-t border-ink-100 pt-4">
        <Button variant="secondary" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button type="submit" form="batch-form" isLoading={isSubmitting}>
          Add batch
        </Button>
      </div>
    </Modal>
  );
}
