import { useState } from 'react';
import toast from 'react-hot-toast';
import { admissionsApi } from '../../api/admissions.api';
import { getErrorMessage } from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/roles';
import { WARDS } from '../../utils/constants';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input, { Field } from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';

const ADMISSION_STAFF = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.NURSE];
const CAN_DISCHARGE = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR];

export default function AdmissionActionsMenu({ admission, onChanged }) {
  const { user } = useAuth();
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isDischargeOpen, setIsDischargeOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({ ward: WARDS[0], room: '', bed: '' });
  const [dischargeSummary, setDischargeSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (admission.status !== 'admitted') return null;

  async function handleTransfer(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await admissionsApi.transfer(admission._id, transferForm);
      toast.success('Patient transferred successfully.');
      setIsTransferOpen(false);
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDischarge(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await admissionsApi.discharge(admission._id, dischargeSummary);
      toast.success('Patient discharged successfully.');
      setIsDischargeOpen(false);
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
      {ADMISSION_STAFF.includes(user?.role) && (
        <Button size="sm" variant="secondary" onClick={() => setIsTransferOpen(true)}>
          Transfer
        </Button>
      )}
      {CAN_DISCHARGE.includes(user?.role) && (
        <Button size="sm" variant="danger" onClick={() => setIsDischargeOpen(true)}>
          Discharge
        </Button>
      )}

      <Modal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} title="Transfer patient">
        <form id="transfer-form" onSubmit={handleTransfer} className="flex flex-col gap-4">
          <Field label="New ward" required>
            <Select required value={transferForm.ward} onChange={(e) => setTransferForm({ ...transferForm, ward: e.target.value })}>
              {WARDS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Room" required>
              <Input required value={transferForm.room} onChange={(e) => setTransferForm({ ...transferForm, room: e.target.value })} />
            </Field>
            <Field label="Bed" required>
              <Input required value={transferForm.bed} onChange={(e) => setTransferForm({ ...transferForm, bed: e.target.value })} />
            </Field>
          </div>
        </form>
        <div className="mt-2 flex justify-end gap-2 border-t border-ink-100 pt-4">
          <Button variant="secondary" onClick={() => setIsTransferOpen(false)} type="button">
            Cancel
          </Button>
          <Button type="submit" form="transfer-form" isLoading={isSubmitting}>
            Confirm transfer
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isDischargeOpen} onClose={() => setIsDischargeOpen(false)} title="Discharge patient">
        <form id="discharge-form" onSubmit={handleDischarge} className="flex flex-col gap-4">
          <Field label="Discharge summary">
            <Textarea rows={4} value={dischargeSummary} onChange={(e) => setDischargeSummary(e.target.value)} />
          </Field>
        </form>
        <div className="mt-2 flex justify-end gap-2 border-t border-ink-100 pt-4">
          <Button variant="secondary" onClick={() => setIsDischargeOpen(false)} type="button">
            Cancel
          </Button>
          <Button variant="danger" type="submit" form="discharge-form" isLoading={isSubmitting}>
            Confirm discharge
          </Button>
        </div>
      </Modal>
    </div>
  );
}
