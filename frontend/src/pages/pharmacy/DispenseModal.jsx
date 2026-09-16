import { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { pharmacyApi } from '../../api/pharmacy.api';
import { patientsApi } from '../../api/patients.api';
import Modal from '../../components/ui/Modal';
import { Field } from '../../components/ui/Input';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

export default function DispenseModal({ isOpen, onClose, onDispensed, onError }) {
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [items, setItems] = useState([{ medicineId: '', quantity: 1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    patientsApi.list({ limit: 100 }).then((res) => setPatients(res.data.data));
    pharmacyApi.searchMedicines({ limit: 100, status: 'active' }).then((res) => setMedicines(res.data.data));
  }, [isOpen]);

  function updateItem(index, field, value) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await pharmacyApi.dispense({
        patientId,
        items: items.map((it) => ({ medicineId: it.medicineId, quantity: Number(it.quantity) })),
      });
      setPatientId('');
      setItems([{ medicineId: '', quantity: 1 }]);
      onDispensed();
    } catch (err) {
      // Surfaces INSUFFICIENT_STOCK from the backend's FEFO allocation
      // transaction if the requested quantity isn't available.
      onError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dispense medicine" size="lg">
      <form id="dispense-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
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

        <Field label="Items" required>
          <div className="flex flex-col gap-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <Select
                  required
                  value={item.medicineId}
                  onChange={(e) => updateItem(i, 'medicineId', e.target.value)}
                  className="flex-1"
                >
                  <option value="">Select medicine…</option>
                  {medicines.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.unit})
                    </option>
                  ))}
                </Select>
                <Input
                  type="number"
                  min="1"
                  required
                  value={item.quantity}
                  onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                  className="w-24"
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
              onClick={() => setItems((prev) => [...prev, { medicineId: '', quantity: 1 }])}
            >
              <Plus className="h-3.5 w-3.5" /> Add item
            </Button>
          </div>
        </Field>
      </form>
      <div className="mt-2 flex justify-end gap-2 border-t border-ink-100 pt-4">
        <Button variant="secondary" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button type="submit" form="dispense-form" isLoading={isSubmitting}>
          Dispense
        </Button>
      </div>
    </Modal>
  );
}
