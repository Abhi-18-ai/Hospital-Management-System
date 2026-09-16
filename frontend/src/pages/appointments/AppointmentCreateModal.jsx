import { useEffect, useState } from 'react';
import { appointmentsApi } from '../../api/appointments.api';
import { patientsApi } from '../../api/patients.api';
import { doctorsApi } from '../../api/doctors.api';
import { departmentsApi } from '../../api/departments.api';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/roles';
import { toDateTimeLocalInput } from '../../utils/formatters';
import Modal from '../../components/ui/Modal';
import Input, { Field } from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';

const EMPTY_FORM = { patientId: '', doctorId: '', departmentId: '', startAt: '', endAt: '', reason: '' };

export default function AppointmentCreateModal({ isOpen, onClose, onCreated, onError }) {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [patientProfile, setPatientProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (user?.role === ROLES.PATIENT) {
      patientsApi.getMine().then((res) => {
        const profile = res.data.data;
        setPatientProfile(profile);
        setForm((current) => ({ ...current, patientId: profile._id }));
      }).catch(onError);
    } else {
      patientsApi.list({ limit: 100 }).then((res) => setPatients(res.data.data));
    }
    doctorsApi.list({ limit: 100, status: 'active' }).then((res) => setDoctors(res.data.data));
    departmentsApi.list({ limit: 100, status: 'active' }).then((res) => setDepartments(res.data.data));
  }, [isOpen, user?.role, onError]);

  function update(field) {
    return (e) => {
      const value = e.target.value;
      if (field === 'doctorId') {
        const doctor = doctors.find((d) => d._id === value);
        setForm((f) => ({ ...f, doctorId: value, departmentId: doctor?.departmentId?._id || doctor?.departmentId || f.departmentId }));
      } else {
        setForm((f) => ({ ...f, [field]: value }));
      }
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await appointmentsApi.create({
        ...form,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
      });
      setForm(EMPTY_FORM);
      onCreated();
    } catch (err) {
      // Conflict errors (APPOINTMENT_CONFLICT) surface here with a clear
      // message from the backend -- the form stays open so the user can
      // just pick a different time rather than losing their input.
      onError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book appointment" size="lg">
      <form id="appt-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {user?.role === ROLES.PATIENT ? (
          <Field label="Patient" required className="sm:col-span-2">
            <Input
              value={patientProfile ? `${patientProfile.firstName} ${patientProfile.lastName} (${patientProfile.mrn})` : 'Loading profile…'}
              readOnly
            />
          </Field>
        ) : (
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
        )}
        <Field label="Doctor" required className="sm:col-span-2">
          <Select required value={form.doctorId} onChange={update('doctorId')}>
            <option value="">Select doctor…</option>
            {doctors.map((d) => (
              <option key={d._id} value={d._id}>
                Dr. {d.firstName} {d.lastName} — {d.specialization}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Department" required className="sm:col-span-2">
          <Select required value={form.departmentId} onChange={update('departmentId')}>
            <option value="">Select department…</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Start time" required>
          <input
            type="datetime-local"
            required
            value={form.startAt}
            onChange={update('startAt')}
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </Field>
        <Field label="End time" required>
          <input
            type="datetime-local"
            required
            value={form.endAt}
            onChange={update('endAt')}
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </Field>
        <Field label="Reason for visit" className="sm:col-span-2">
          <Textarea rows={2} value={form.reason} onChange={update('reason')} />
        </Field>
      </form>

      <div className="mt-2 flex justify-end gap-2 border-t border-ink-100 pt-4">
        <Button variant="secondary" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button type="submit" form="appt-form" isLoading={isSubmitting}>
          Book appointment
        </Button>
      </div>
    </Modal>
  );
}
