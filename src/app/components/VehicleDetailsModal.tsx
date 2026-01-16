import { X, Calendar, MapPin, User, CheckCircle, Clock } from 'lucide-react';
import { type Vehicle, type Reservation } from '../data/mockData';

interface VehicleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  reservations: Reservation[];
  dateRange: { start: string; end: string };
}

export function VehicleDetailsModal({ isOpen, onClose, vehicle, reservations, dateRange }: VehicleDetailsModalProps) {
  if (!isOpen || !vehicle) return null;

  // Find reservations for this vehicle in the date range
  const vehicleReservations = reservations.filter(res => {
    if (res.vehicleId !== vehicle.id) return false;
    
    const resStart = new Date(res.startDate);
    const resEnd = new Date(res.endDate);
    const rangeStart = new Date(dateRange.start);
    const rangeEnd = new Date(dateRange.end);
    
    return (resStart <= rangeEnd && resEnd >= rangeStart) && res.status === 'approved';
  });

  const isAvailable = vehicleReservations.length === 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1d29] border border-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-1">{vehicle.model}</h2>
            <p className="text-gray-400 font-mono">{vehicle.plate}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Vehicle Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#0f1117] border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className="text-white font-medium capitalize">{vehicle.status}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#0f1117] border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-500/10 p-2 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white font-medium">{vehicle.currentLocation || 'Unknown'}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#0f1117] border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-orange-500/10 p-2 rounded-lg">
                  <Car className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Type</p>
                  <p className="text-white font-medium">{vehicle.type}</p>
                </div>
              </div>
            </div>

            {vehicle.lastUser && (
              <div className="bg-[#0f1117] border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-500/10 p-2 rounded-lg">
                    <User className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Last User</p>
                    <p className="text-white font-medium">{vehicle.lastUser}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date Range Status */}
          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-white font-semibold mb-4">
              Status for {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
            </h3>

            {isAvailable ? (
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="text-green-500 font-medium">Available</p>
                  <p className="text-green-400/80 text-sm">This vehicle is available for the selected date range</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="text-red-500 font-medium">Booked</p>
                    <p className="text-red-400/80 text-sm">This vehicle has {vehicleReservations.length} booking(s) in the selected range</p>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-3">
                  {vehicleReservations.map((reservation) => (
                    <div key={reservation.id} className="bg-[#0f1117] border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-white font-medium mb-1">{reservation.bookerName}</p>
                          <p className="text-gray-400 text-sm">{reservation.sector}</p>
                          {reservation.project && (
                            <p className="text-blue-400 text-sm mt-1">{reservation.project}</p>
                          )}
                        </div>
                        <div className="bg-green-500/10 px-3 py-1 rounded-full">
                          <p className="text-green-500 text-xs font-medium">Approved</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-500">Start</p>
                          <p className="text-white">{new Date(reservation.startDate).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">End</p>
                          <p className="text-white">{new Date(reservation.endDate).toLocaleString()}</p>
                        </div>
                      </div>

                      {reservation.approvedBy && (
                        <div className="pt-3 border-t border-gray-700">
                          <p className="text-gray-400 text-sm">
                            Approved by: <span className="text-white">{reservation.approvedBy}</span>
                            {reservation.approvedAt && (
                              <span className="text-gray-500"> on {new Date(reservation.approvedAt).toLocaleString()}</span>
                            )}
                          </p>
                        </div>
                      )}

                      {reservation.notes && (
                        <div className="pt-3 border-t border-gray-700 mt-3">
                          <p className="text-gray-500 text-sm">Notes:</p>
                          <p className="text-gray-300 text-sm mt-1">{reservation.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Car({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
    </svg>
  );
}
