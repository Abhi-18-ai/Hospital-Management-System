import { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { prescriptionsApi } from '../../api/prescriptions.api';
import { doctorsApi } from '../../api/doctors.api';
import Modal from '../../components/ui/Modal';
import Input, { Field } from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';

const EMPTY_ITEM = { medicineName: '', dosage: '', frequency: '', durationDays: 5, instructions: '' };

export default function PrescriptionCreateModal({ isOpen, onClose, onCreated, onError, patientId }) {
  const [doctorId, setDoctorId] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    doctorsApi.list({ limit: 100, status: 'active' }).then((res) => setDoctors(res.data.data));
  }, [isOpen]);

  function updateItem(index, field, value) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await prescriptionsApi.create({
        patientId,
        doctorId,
        items: items.map((it) => ({ ...it, durationDays: Number(it.durationDays) })),
        notes,
      });
      setItems([{ ...EMPTY_ITEM }]);
      setNotes('');
      onCreated();
    } catch (err) {
      onError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New prescription" size="lg">
      <form id="prescription-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Doctor" required>
          <Select required value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            <option value="">Select doctor…</option>
            {doctors.map((d) => (
              <option key={d._id} value={d._id}>
                Dr. {d.firstName} {d.lastName}
              </option>
            ))}
          </Select>
        </Field>
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-ink-100 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase text-ink-400">Item {i + 1}</p>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                  className="rounded-md p-1 text-ink-400 hover:bg-ink-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Medicine" required>
                <Input required value={item.medicineName} onChange={(e) => updateItem(i, 'medicineName', e.target.value)} />
              </Field>
              <Field label="Dosage" required>
                <Input required value={item.dosage} onChange={(e) => updateItem(i, 'dosage', e.target.value)} placeholder="500mg" />
              </Field>
              <Field label="Frequency" required>
                <Input
                  required
                  value={item.frequency}
                  onChange={(e) => updateItem(i, 'frequency', e.target.value)}
                  placeholder="twice daily"
                />
              </Field>
              <Field label="Duration (days)" required>
                <Input
                  type="number"
                  min="1"
                  required
                  value={item.durationDays}
                  onChange={(e) => updateItem(i, 'durationDays', e.target.value)}
                />
              </Field>
              <Field label="Instructions" className="sm:col-span-2">
                <Input value={item.instructions} onChange={(e) => updateItem(i, 'instructions', e.target.value)} placeholder="Take after food" />
              </Field>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-fit"
          onClick={() => setItems((prev) => [...prev, { ...EMPTY_ITEM }])}
        >
          <Plus className="h-3.5 w-3.5" /> Add another medicine
        </Button>

        <Field label="Notes">
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
      </form>
      <div className="mt-2 flex justify-end gap-2 border-t border-ink-100 pt-4">
        <Button variant="secondary" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button type="submit" form="prescription-form" isLoading={isSubmitting}>
          Save prescription
        </Button>
      </div>
    </Modal>
  );
}
