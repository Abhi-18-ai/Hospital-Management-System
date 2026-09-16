import { useEffect, useState } from 'react';
import { admissionsApi } from '../../api/admissions.api';
import { patientsApi } from '../../api/patients.api';
import { doctorsApi } from '../../api/doctors.api';
import { WARDS } from '../../utils/constants';
import Modal from '../../components/ui/Modal';
import Input, { Field } from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';

const EMPTY_FORM = { patientId: '', doctorId: '', ward: WARDS[0], room: '', bed: '', reason: '' };

export default function AdmitPatientModal({ isOpen, onClose, onCreated, onError }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    patientsApi.list({ limit: 100 }).then((res) => setPatients(res.data.data));
    doctorsApi.list({ limit: 100, status: 'active' }).then((res) => setDoctors(res.data.data));
  }, [isOpen]);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await admissionsApi.admit(form);
      setForm(EMPTY_FORM);
      onCreated();
    } catch (err) {
      // Surfaces BED_OCCUPIED or PATIENT_ALREADY_ADMITTED from the backend.
      onError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Admit patient" size="lg">
      <form id="admit-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Patient" required className="sm:col-span-2">
          <Select required value={form.patientId} onChange={update('patientId')}>
            <option value="">Select patient…</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.firstName} {p.lastName} ({p.mrn})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Attending doctor" required className="sm:col-span-2">
          <Select required value={form.doctorId} onChange={update('doctorId')}>
            <option value="">Select doctor…</option>
            {doctors.map((d) => (
              <option key={d._id} value={d._id}>
                Dr. {d.firstName} {d.lastName}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Ward" required>
          <Select required value={form.ward} onChange={update('ward')}>
            {WARDS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Room" required>
            <Input required value={form.room} onChange={update('room')} placeholder="101" />
          </Field>
          <Field label="Bed" required>
            <Input required value={form.bed} onChange={update('bed')} placeholder="A" />
          </Field>
        </div>
        <Field label="Reason for admission" className="sm:col-span-2">
          <Textarea rows={2} value={form.reason} onChange={update('reason')} />
        </Field>
      </form>
      <div className="mt-2 flex justify-end gap-2 border-t border-ink-100 pt-4">
        <Button variant="secondary" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button type="submit" form="admit-form" isLoading={isSubmitting}>
          Admit patient
        </Button>
      </div>
    </Modal>
  );
}
