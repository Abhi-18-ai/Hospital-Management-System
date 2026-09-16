import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { admissionsApi } from '../../api/admissions.api';
import { getErrorMessage } from '../../api/axiosClient';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import clsx from '../../utils/clsx';

export default function BedsAvailabilityModal({ isOpen, onClose }) {
  const [wards, setWards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    admissionsApi
      .bedsAvailability()
      .then((res) => setWards(res.data.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bed availability" size="lg">
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-5">
          {wards.map((ward) => (
            <div key={ward.ward}>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-ink-800">{ward.ward}</h4>
                <span className="text-xs text-ink-500">
                  {ward.availableBeds} / {ward.totalBeds} available
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ward.rooms.map((room) => (
                  <div key={room.room} className="rounded-lg border border-ink-100 p-2.5">
                    <p className="mb-1.5 text-xs font-medium text-ink-500">Room {room.room}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {room.beds.map((bed) => (
                        <span
                          key={bed.bed}
                          className={clsx(
                            'flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold',
                            bed.occupied ? 'bg-status-redBg text-status-red' : 'bg-status-greenBg text-status-green'
                          )}
                          title={bed.occupied ? 'Occupied' : 'Available'}
                        >
                          {bed.bed}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
