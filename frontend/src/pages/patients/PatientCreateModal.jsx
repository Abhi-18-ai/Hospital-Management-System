import { useState } from 'react';
import { patientsApi } from '../../api/patients.api';
import Modal from '../../components/ui/Modal';
import Input, { Field } from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'male',
  bloodGroup: 'unknown',
  phone: '',
  email: '',
  address: '',
};

export default function PatientCreateModal({ isOpen, onClose, onCreated, onError }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await patientsApi.create({
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        contact: { phone: form.phone, email: form.email || undefined, address: form.address },
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
    <Modal isOpen={isOpen} onClose={onClose} title="Register new patient" size="lg">
      <form id="patient-create-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="First name" required>
          <Input required value={form.firstName} onChange={update('firstName')} />
        </Field>
        <Field label="Last name" required>
          <Input required value={form.lastName} onChange={update('lastName')} />
        </Field>
        <Field label="Date of birth" required>
          <Input type="date" required value={form.dateOfBirth} onChange={update('dateOfBirth')} />
        </Field>
        <Field label="Gender" required>
          <Select required value={form.gender} onChange={update('gender')}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
        </Field>
        <Field label="Blood group">
          <Select value={form.bloodGroup} onChange={update('bloodGroup')}>
            {['unknown', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Phone number" required>
          <Input required value={form.phone} onChange={update('phone')} placeholder="+91 98765 43210" />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={update('email')} />
        </Field>
        <Field label="Address" className="sm:col-span-2">
          <Textarea rows={2} value={form.address} onChange={update('address')} />
        </Field>
      </form>

      <div className="mt-2 flex justify-end gap-2 border-t border-ink-100 pt-4">
        <Button variant="secondary" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button type="submit" form="patient-create-form" isLoading={isSubmitting}>
          Register patient
        </Button>
      </div>
    </Modal>
  );
}
