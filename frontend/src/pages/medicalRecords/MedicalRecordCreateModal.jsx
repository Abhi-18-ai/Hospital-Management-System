import { useEffect, useState } from 'react';
import { medicalRecordsApi } from '../../api/medicalRecords.api';
import { doctorsApi } from '../../api/doctors.api';
import Modal from '../../components/ui/Modal';
import Input, { Field } from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';

const EMPTY_FORM = {
  doctorId: '',
  chiefComplaint: '',
  diagnoses: '',
  notes: '',
  temperatureC: '',
  heartRateBpm: '',
  bloodPressure: '',
  spo2: '',
};

export default function MedicalRecordCreateModal({ isOpen, onClose, onCreated, onError, patientId }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [doctors, setDoctors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    doctorsApi.list({ limit: 100, status: 'active' }).then((res) => setDoctors(res.data.data));
  }, [isOpen]);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await medicalRecordsApi.create({
        patientId,
        doctorId: form.doctorId,
        chiefComplaint: form.chiefComplaint,
        diagnoses: form.diagnoses
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean),
        notes: form.notes,
        vitals: {
          temperatureC: form.temperatureC ? Number(form.temperatureC) : undefined,
          heartRateBpm: form.heartRateBpm ? Number(form.heartRateBpm) : undefined,
          bloodPressure: form.bloodPressure || undefined,
          spo2: form.spo2 ? Number(form.spo2) : undefined,
        },
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
    <Modal isOpen={isOpen} onClose={onClose} title="New clinical record" size="lg">
      <form id="record-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Doctor" required>
          <Select required value={form.doctorId} onChange={update('doctorId')}>
            <option value="">Select doctor…</option>
            {doctors.map((d) => (
              <option key={d._id} value={d._id}>
                Dr. {d.firstName} {d.lastName}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Chief complaint">
          <Input value={form.chiefComplaint} onChange={update('chiefComplaint')} placeholder="e.g. Persistent cough" />
        </Field>
        <Field label="Diagnoses" hint="Comma-separated">
          <Input value={form.diagnoses} onChange={update('diagnoses')} placeholder="e.g. Bronchitis, Mild fever" />
        </Field>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Temp (°C)">
            <Input type="number" step="0.1" value={form.temperatureC} onChange={update('temperatureC')} />
          </Field>
          <Field label="Heart rate">
            <Input type="number" value={form.heartRateBpm} onChange={update('heartRateBpm')} />
          </Field>
          <Field label="Blood pressure">
            <Input value={form.bloodPressure} onChange={update('bloodPressure')} placeholder="120/80" />
          </Field>
          <Field label="SpO2 (%)">
            <Input type="number" value={form.spo2} onChange={update('spo2')} />
          </Field>
        </div>

        <Field label="Clinical notes">
          <Textarea rows={4} value={form.notes} onChange={update('notes')} />
        </Field>
      </form>
      <div className="mt-2 flex justify-end gap-2 border-t border-ink-100 pt-4">
        <Button variant="secondary" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button type="submit" form="record-form" isLoading={isSubmitting}>
          Save record
        </Button>
      </div>
    </Modal>
  );
}
