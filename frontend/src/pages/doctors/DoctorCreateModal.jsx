import { useEffect, useState } from 'react';
import { doctorsApi } from '../../api/doctors.api';
import { departmentsApi } from '../../api/departments.api';
import { usersApi } from '../../api/users.api';
import Modal from '../../components/ui/Modal';
import Input, { Field } from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

const EMPTY_FORM = {
  userId: '',
  firstName: '',
  lastName: '',
  departmentId: '',
  specialization: '',
  licenseNumber: '',
  consultationFee: 0,
};

export default function DoctorCreateModal({ isOpen, onClose, onCreated, onError }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [departments, setDepartments] = useState([]);
  const [doctorUsers, setDoctorUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    departmentsApi.list({ limit: 100, status: 'active' }).then((res) => setDepartments(res.data.data));
    // Users with the 'doctor' role who don't have a doctor profile yet must first
    // be created via /users (staff accounts are provisioned by an admin).
    usersApi.list({ limit: 100, role: 'doctor', status: 'active' }).then((res) => setDoctorUsers(res.data.data));
  }, [isOpen]);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await doctorsApi.create({ ...form, consultationFee: Number(form.consultationFee) });
      setForm(EMPTY_FORM);
      onCreated();
    } catch (err) {
      onError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add doctor profile" size="lg">
      <form id="doctor-create-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Linked user account" required hint="Must already exist with the 'doctor' role (create via Users)." className="sm:col-span-2">
          <Select required value={form.userId} onChange={update('userId')}>
            <option value="">Select a user…</option>
            {doctorUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="First name" required>
          <Input required value={form.firstName} onChange={update('firstName')} />
        </Field>
        <Field label="Last name" required>
          <Input required value={form.lastName} onChange={update('lastName')} />
        </Field>
        <Field label="Department" required>
          <Select required value={form.departmentId} onChange={update('departmentId')}>
            <option value="">Select department…</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Specialization" required>
          <Input required value={form.specialization} onChange={update('specialization')} placeholder="Cardiology" />
        </Field>
        <Field label="License number" required>
          <Input required value={form.licenseNumber} onChange={update('licenseNumber')} />
        </Field>
        <Field label="Consultation fee (₹)">
          <Input type="number" min="0" value={form.consultationFee} onChange={update('consultationFee')} />
        </Field>
      </form>

      <div className="mt-2 flex justify-end gap-2 border-t border-ink-100 pt-4">
        <Button variant="secondary" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button type="submit" form="doctor-create-form" isLoading={isSubmitting}>
          Create profile
        </Button>
      </div>
    </Modal>
  );
}
