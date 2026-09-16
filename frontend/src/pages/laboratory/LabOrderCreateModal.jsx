import { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { laboratoryApi } from '../../api/laboratory.api';
import { patientsApi } from '../../api/patients.api';
import { doctorsApi } from '../../api/doctors.api';
import Modal from '../../components/ui/Modal';
import { Field } from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';

export default function LabOrderCreateModal({ isOpen, onClose, onCreated, onError }) {
  const [form, setForm] = useState({ patientId: '', doctorId: '', priority: 'routine', notes: '' });
  const [tests, setTests] = useState(['']);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    patientsApi.list({ limit: 100 }).then((res) => setPatients(res.data.data));
    doctorsApi.list({ limit: 100, status: 'active' }).then((res) => setDoctors(res.data.data));
  }, [isOpen]);

  function updateTest(index, value) {
    setTests((t) => t.map((test, i) => (i === index ? value : test)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await laboratoryApi.createOrder({ ...form, tests: tests.filter(Boolean) });
      setForm({ patientId: '', doctorId: '', priority: 'routine', notes: '' });
      setTests(['']);
      onCreated();
    } catch (err) {
      onError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create lab order" size="lg">
      <form id="lab-order-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Patient" required>
            <Select required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
              <option value="">Select patient…</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName} ({p.mrn})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Ordering doctor" required>
            <Select required value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
              <option value="">Select doctor…</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  Dr. {d.firstName} {d.lastName}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Priority">
          <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="routine">Routine</option>
            <option value="urgent">Urgent</option>
            <option value="stat">STAT</option>
          </Select>
        </Field>

        <Field label="Tests" required>
          <div className="flex flex-col gap-2">
            {tests.map((test, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  required
                  value={test}
                  onChange={(e) => updateTest(i, e.target.value)}
                  placeholder="e.g. Complete Blood Count"
                />
                {tests.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setTests((t) => t.filter((_, idx) => idx !== i))}
                    className="rounded-md p-2 text-ink-400 hover:bg-ink-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={() => setTests((t) => [...t, ''])} className="w-fit">
              <Plus className="h-3.5 w-3.5" /> Add test
            </Button>
          </div>
        </Field>

        <Field label="Notes">
          <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>
      </form>

      <div className="mt-2 flex justify-end gap-2 border-t border-ink-100 pt-4">
        <Button variant="secondary" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button type="submit" form="lab-order-form" isLoading={isSubmitting}>
          Create order
        </Button>
      </div>
    </Modal>
  );
}
