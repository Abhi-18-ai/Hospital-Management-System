import { useState } from 'react';
import toast from 'react-hot-toast';
import { appointmentsApi } from '../../api/appointments.api';
import { getErrorMessage } from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/roles';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Field } from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';

const CAN_CHECK_IN = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.NURSE];
const CAN_RESCHEDULE = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR];
const CAN_CANCEL = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT, ROLES.DOCTOR];

export default function AppointmentActionsMenu({ appointment, onChanged }) {
  const { user } = useAuth();
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [newTimes, setNewTimes] = useState({ startAt: '', endAt: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isActive = ['scheduled', 'checked_in', 'in_progress'].includes(appointment.status);
  if (!isActive) return null;

  async function handleCheckIn(e) {
    e.stopPropagation();
    try {
      await appointmentsApi.checkIn(appointment._id);
      toast.success('Patient checked in.');
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleCancel(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await appointmentsApi.cancel(appointment._id, reason);
      toast.success('Appointment cancelled.');
      setIsCancelOpen(false);
      onChanged();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReschedule(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await appointmentsApi.reschedule(appointment._id, {
        startAt: new Date(newTimes.startAt).toISOString(),
        endAt: new Date(newTimes.endAt).toISOString(),
      });
      toast.success('Appointment rescheduled.');
      setIsRescheduleOpen(false);
      onChanged();
    } catch (err) {
      // Surfaces APPOINTMENT_CONFLICT if the new slot overlaps another booking.
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
      {appointment.status === 'scheduled' && CAN_CHECK_IN.includes(user?.role) && (
        <Button size="sm" variant="secondary" onClick={handleCheckIn}>
          Check in
        </Button>
      )}
      {CAN_RESCHEDULE.includes(user?.role) && (
        <Button size="sm" variant="secondary" onClick={() => setIsRescheduleOpen(true)}>
          Reschedule
        </Button>
      )}
      {CAN_CANCEL.includes(user?.role) && (
        <Button size="sm" variant="danger" onClick={() => setIsCancelOpen(true)}>
          Cancel
        </Button>
      )}

      <Modal isOpen={isCancelOpen} onClose={() => setIsCancelOpen(false)} title="Cancel appointment">
        <form id="cancel-form" onSubmit={handleCancel} className="flex flex-col gap-4">
          <Field label="Reason for cancellation">
            <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        </form>
        <div className="mt-2 flex justify-end gap-2 border-t border-ink-100 pt-4">
          <Button variant="secondary" onClick={() => setIsCancelOpen(false)} type="button">
            Keep appointment
          </Button>
          <Button variant="danger" type="submit" form="cancel-form" isLoading={isSubmitting}>
            Confirm cancellation
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isRescheduleOpen} onClose={() => setIsRescheduleOpen(false)} title="Reschedule appointment">
        <form id="reschedule-form" onSubmit={handleReschedule} className="flex flex-col gap-4">
          <Field label="New start time" required>
            <input
              type="datetime-local"
              required
              value={newTimes.startAt}
              onChange={(e) => setNewTimes({ ...newTimes, startAt: e.target.value })}
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </Field>
          <Field label="New end time" required>
            <input
              type="datetime-local"
              required
              value={newTimes.endAt}
              onChange={(e) => setNewTimes({ ...newTimes, endAt: e.target.value })}
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </Field>
        </form>
        <div className="mt-2 flex justify-end gap-2 border-t border-ink-100 pt-4">
          <Button variant="secondary" onClick={() => setIsRescheduleOpen(false)} type="button">
            Cancel
          </Button>
          <Button type="submit" form="reschedule-form" isLoading={isSubmitting}>
            Confirm new time
          </Button>
        </div>
      </Modal>
    </div>
  );
}
