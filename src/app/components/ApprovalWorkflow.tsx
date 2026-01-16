import { Check, X, Clock } from 'lucide-react';
import { type Reservation } from '../data/mockData';
import { vehicles, currentUser } from '../data/mockData';

interface ApprovalWorkflowProps {
  pendingReservations: Reservation[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ApprovalWorkflow({ pendingReservations, onApprove, onReject }: ApprovalWorkflowProps) {
  if (pendingReservations.length === 0) {
    return (
      <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold text-lg mb-4">Pending Approvals</h3>
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No pending reservations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Pending Approvals</h3>
        <span className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-sm">
          {pendingReservations.length} pending
        </span>
      </div>

      <div className="space-y-4">
        {pendingReservations.map((reservation) => {
          const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
          
          return (
            <div
              key={reservation.id}
              className="bg-[#0f1117] border border-gray-700 rounded-lg p-4 hover:border-blue-500/50 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-orange-500/20 p-2 rounded-lg">
                      <Clock className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{reservation.bookerName}</h4>
                      <p className="text-gray-400 text-sm">{reservation.sector}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Vehicle:</span>
                      <p className="text-white mt-1">{vehicle?.model} ({vehicle?.plate})</p>
                    </div>
                    {reservation.project && (
                      <div>
                        <span className="text-gray-500">Project:</span>
                        <p className="text-blue-400 mt-1">{reservation.project}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Start:</span>
                      <p className="text-white mt-1">
                        {new Date(reservation.startDate).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">End:</span>
                      <p className="text-white mt-1">
                        {new Date(reservation.endDate).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {reservation.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <span className="text-gray-500 text-sm">Notes:</span>
                      <p className="text-gray-300 text-sm mt-1">{reservation.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onApprove(reservation.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(reservation.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}