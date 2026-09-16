import { useState } from 'react';
import { pharmacyApi } from '../../api/pharmacy.api';
import Modal from '../../components/ui/Modal';
import Input, { Field } from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const EMPTY_FORM = { name: '', genericName: '', category: '', unit: '', reorderLevel: 10 };

export default function MedicineCreateModal({ isOpen, onClose, onCreated, onError }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await pharmacyApi.createMedicine({ ...form, reorderLevel: Number(form.reorderLevel) });
      setForm(EMPTY_FORM);
      onCreated();
    } catch (err) {
      onError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add medicine">
      <form id="medicine-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Name" required>
          <Input required value={form.name} onChange={update('name')} placeholder="Paracetamol" />
        </Field>
        <Field label="Generic name">
          <Input value={form.genericName} onChange={update('genericName')} />
        </Field>
        <Field label="Category">
          <Input value={form.category} onChange={update('category')} placeholder="Analgesic" />
        </Field>
        <Field label="Unit" required hint="e.g. tablet, ml, vial">
          <Input required value={form.unit} onChange={update('unit')} />
        </Field>
        <Field label="Reorder level">
          <Input type="number" min="0" value={form.reorderLevel} onChange={update('reorderLevel')} />
        </Field>
      </form>
      <div className="mt-2 flex justify-end gap-2 border-t border-ink-100 pt-4">
        <Button variant="secondary" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button type="submit" form="medicine-form" isLoading={isSubmitting}>
          Create medicine
        </Button>
      </div>
    </Modal>
  );
}
