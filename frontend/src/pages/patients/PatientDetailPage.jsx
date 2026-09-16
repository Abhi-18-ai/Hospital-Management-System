import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, AlertCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientsApi } from '../../api/patients.api';
import { getErrorMessage } from '../../api/axiosClient';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/roles';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { IdChip, StatusBadge } from '../../components/ui/Badge';
import { GENERIC_STATUS_COLORS, APPOINTMENT_STATUS_COLORS, PRESCRIPTION_STATUS_COLORS } from '../../utils/constants';
import clsx from '../../utils/clsx';
import MedicalRecordCreateModal from '../medicalRecords/MedicalRecordCreateModal';
import PrescriptionCreateModal from '../prescriptions/PrescriptionCreateModal';

const TABS = ['Overview', 'Appointments', 'Medical Records', 'Prescriptions'];

const CAN_ADD_CLINICAL = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR];

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

  function loadHistory() {
    patientsApi.getHistory(id).then((res) => setHistory(res.data.data));
  }

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    Promise.all([patientsApi.getById(id), patientsApi.getHistory(id)])
      .then(([patientRes, historyRes]) => {
        if (cancelled) return;
        setPatient(patientRes.data.data);
        setHistory(historyRes.data.data);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => !cancelled && setIsLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) return <Spinner label="Loading patient…" />;
  if (!patient) return null;

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => navigate('/patients')}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800"
      >
        <ArrowLeft className="h-4 w-4" /> Back to patients
      </button>

      <Card>
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-ink-900">
                {patient.firstName} {patient.lastName}
              </h2>
              <StatusBadge value={patient.status} colorMap={GENERIC_STATUS_COLORS} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-ink-500">
              <IdChip>{patient.mrn}</IdChip>
              <span className="capitalize">{patient.gender}</span>
              <span>DOB {formatDate(patient.dateOfBirth)}</span>
              <span>Blood group: {patient.bloodGroup}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-sm text-ink-600">
            {patient.contact?.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-ink-400" /> {patient.contact.phone}
              </span>
            )}
            {patient.contact?.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-ink-400" /> {patient.contact.email}
              </span>
            )}
            {patient.contact?.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-ink-400" /> {patient.contact.address}
              </span>
            )}
          </div>
        </CardBody>
        {patient.allergies?.length > 0 && (
          <div className="flex items-center gap-2 border-t border-ink-100 bg-status-redBg px-5 py-2.5 text-sm text-status-red">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Allergies: {patient.allergies.join(', ')}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex gap-1 overflow-x-auto border-b border-ink-100 px-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors',
                activeTab === tab ? 'border-brand-500 text-brand-600' : 'border-transparent text-ink-500 hover:text-ink-800'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <CardBody>
          {activeTab === 'Overview' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-semibold text-ink-800">Emergency contact</h4>
                {patient.emergencyContact?.name ? (
                  <div className="text-sm text-ink-600">
                    <p>{patient.emergencyContact.name}</p>
                    <p className="text-ink-400">{patient.emergencyContact.relationship}</p>
                    <p>{patient.emergencyContact.phone}</p>
                  </div>
                ) : (
                  <p className="text-sm text-ink-400">No emergency contact on file.</p>
                )}
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold text-ink-800">Recent admissions</h4>
                {history?.admissions?.length > 0 ? (
                  <ul className="space-y-1 text-sm text-ink-600">
                    {history.admissions.slice(0, 3).map((a) => (
                      <li key={a._id}>
                        {a.ward} / {a.room} / {a.bed} — {formatDate(a.admittedAt)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-ink-400">No admission history.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Appointments' && (
            <div className="divide-y divide-ink-100">
              {history?.appointments?.length > 0 ? (
                history.appointments.map((a) => (
                  <div key={a._id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium text-ink-800">Dr. {a.doctorId?.firstName} {a.doctorId?.lastName}</p>
                      <p className="text-ink-400">{formatDateTime(a.startAt)}</p>
                    </div>
                    <StatusBadge value={a.status} colorMap={APPOINTMENT_STATUS_COLORS} />
                  </div>
                ))
              ) : (
                <p className="py-6 text-sm text-ink-400">No appointments yet.</p>
              )}
            </div>
          )}

          {activeTab === 'Medical Records' && (
            <div className="flex flex-col gap-3">
              {CAN_ADD_CLINICAL.includes(user?.role) && (
                <Button size="sm" className="w-fit" onClick={() => setIsRecordModalOpen(true)}>
                  <Plus className="h-3.5 w-3.5" /> New record
                </Button>
              )}
              <div className="divide-y divide-ink-100">
                {history?.medicalRecords?.length > 0 ? (
                  history.medicalRecords.map((r) => (
                    <div key={r._id} className="py-3 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-ink-800">{r.chiefComplaint || 'Clinical encounter'}</p>
                        <span className="text-ink-400">{formatDate(r.encounterAt)}</span>
                      </div>
                      {r.diagnoses?.length > 0 && <p className="mt-1 text-ink-500">Diagnoses: {r.diagnoses.join(', ')}</p>}
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-sm text-ink-400">No medical records yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Prescriptions' && (
            <div className="flex flex-col gap-3">
              {CAN_ADD_CLINICAL.includes(user?.role) && (
                <Button size="sm" className="w-fit" onClick={() => setIsPrescriptionModalOpen(true)}>
                  <Plus className="h-3.5 w-3.5" /> New prescription
                </Button>
              )}
              <div className="divide-y divide-ink-100">
                {history?.prescriptions?.length > 0 ? (
                  history.prescriptions.map((p) => (
                    <div key={p._id} className="py-3 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-ink-800">{p.items?.length} item(s)</p>
                        <StatusBadge value={p.status} colorMap={PRESCRIPTION_STATUS_COLORS} />
                      </div>
                      <p className="mt-1 text-ink-500">{p.items?.map((i) => i.medicineName).join(', ')}</p>
                      <p className="text-ink-400">{formatDate(p.issuedAt)}</p>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-sm text-ink-400">No prescriptions yet.</p>
                )}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <MedicalRecordCreateModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        patientId={id}
        onCreated={() => {
          setIsRecordModalOpen(false);
          loadHistory();
          toast.success('Medical record saved successfully.');
        }}
        onError={(err) => toast.error(getErrorMessage(err))}
      />

      <PrescriptionCreateModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        patientId={id}
        onCreated={() => {
          setIsPrescriptionModalOpen(false);
          loadHistory();
          toast.success('Prescription saved successfully.');
        }}
        onError={(err) => toast.error(getErrorMessage(err))}
      />
    </div>
  );
}
