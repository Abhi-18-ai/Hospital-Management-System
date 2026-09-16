import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { laboratoryApi } from '../../api/laboratory.api';
import { getErrorMessage } from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/roles';
import { formatDateTime } from '../../utils/formatters';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import { StatusBadge } from '../../components/ui/Badge';
import { LAB_ORDER_STATUS_COLORS, GENERIC_STATUS_COLORS } from '../../utils/constants';

const LAB_STAFF = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.LAB_TECHNICIAN];
const CAN_VERIFY = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR];

const NEXT_STATUS = {
  ordered: 'sample_collected',
  sample_collected: 'in_progress',
};

export default function LabOrderDetailModal({ orderId, onClose, onChanged }) {
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultInputs, setResultInputs] = useState({});

  useEffect(() => {
    if (!orderId) return;
    setIsLoading(true);
    laboratoryApi
      .getOrderById(orderId)
      .then((res) => setOrder(res.data.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  if (!orderId) return null;

  async function advanceStatus() {
    try {
      const res = await laboratoryApi.updateOrderStatus(orderId, NEXT_STATUS[order.status]);
      setOrder(res.data.data);
      onChanged();
      toast.success('Lab order status updated.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleSubmitResults() {
    const results = order.tests.map((testName) => ({
      testName,
      values: { result: resultInputs[testName] || '' },
    }));
    try {
      const res = await laboratoryApi.submitResults(orderId, results);
      setOrder(res.data.data);
      onChanged();
      toast.success('Results submitted for verification.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleVerify(resultId, decision) {
    try {
      const res = await laboratoryApi.verifyResult(resultId, decision);
      setOrder(res.data.data);
      onChanged();
      toast.success(decision === 'verify' ? 'Result verified and released to patient.' : 'Result rejected.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <Modal isOpen={!!orderId} onClose={onClose} title="Lab order details" size="lg">
      {isLoading || !order ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-ink-800">
                {order.patientId?.firstName} {order.patientId?.lastName}
              </p>
              <p className="text-sm text-ink-400">Ordered {formatDateTime(order.orderedAt)}</p>
            </div>
            <StatusBadge value={order.status} colorMap={LAB_ORDER_STATUS_COLORS} />
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-ink-800">Tests ordered</h4>
            <ul className="list-inside list-disc text-sm text-ink-600">
              {order.tests.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>

          {LAB_STAFF.includes(user?.role) && NEXT_STATUS[order.status] && (
            <Button variant="secondary" onClick={advanceStatus} className="w-fit">
              Mark as {NEXT_STATUS[order.status].replace('_', ' ')}
            </Button>
          )}

          {LAB_STAFF.includes(user?.role) && ['sample_collected', 'in_progress'].includes(order.status) && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-ink-800">Submit results</h4>
              <div className="flex flex-col gap-2">
                {order.tests.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <span className="w-40 shrink-0 text-sm text-ink-600">{t}</span>
                    <input
                      className="flex-1 rounded-lg border border-ink-200 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      placeholder="Result value"
                      value={resultInputs[t] || ''}
                      onChange={(e) => setResultInputs({ ...resultInputs, [t]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              <Button size="sm" className="mt-3" onClick={handleSubmitResults}>
                Submit results
              </Button>
            </div>
          )}

          {order.results?.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-ink-800">Results</h4>
              <div className="divide-y divide-ink-100 rounded-lg border border-ink-100">
                {order.results.map((r) => (
                  <div key={r._id} className="flex items-center justify-between px-3 py-2.5 text-sm">
                    <div>
                      <p className="font-medium text-ink-700">{r.testName}</p>
                      <p className="text-ink-500">{JSON.stringify(r.values)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge value={r.status} colorMap={GENERIC_STATUS_COLORS} />
                      {r.status === 'submitted' && CAN_VERIFY.includes(user?.role) && (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => handleVerify(r._id, 'verify')}>
                            Verify
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleVerify(r._id, 'reject')}>
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
