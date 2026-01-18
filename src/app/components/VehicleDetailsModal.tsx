import { X, Calendar, MapPin, User, CheckCircle, Clock, Car } from 'lucide-react';  // Dodali smo Car ovde
import { type Vehicle, type Reservation } from '../data/mockData';
import { useEffect, useState } from 'react';
import { getReservations } from '../../lib/queries'; // ako @ ne radi, promeni u '../../lib/queries'

interface VehicleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  reservations: Reservation[]; // ovo je mock prop – mi fetch-ujemo prave
  dateRange: { start: string; end: string };
}

export function VehicleDetailsModal({ isOpen, onClose, vehicle, dateRange }: VehicleDetailsModalProps) {
  const [displayReservations, setDisplayReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    async function fetchReservations() {
      const realReservations = await getReservations();

      // Mapiramo rezervacije da pašu uz Reservation type
      const mappedReservations = realReservations.map((r: any) => ({
        ...r,
        id: r.id,
        vehicleId: r.vehicle_id,
        bookerId: r.booker_id,
        projectId: r.project_id,
        startDate: r.start_date,
        endDate: r.end_date,
        notes: r.notes || '',
        status: r.status,
        approvedBy: r.approved_by || null,
        approvedAt: r.approved_at || null,
        bookerName: 'Nepoznat korisnik',  // kasnije join sa profiles
        sector: 'Nepoznat sektor',
        project: r.project_name || 'Bez projekta',
      }));

      setDisplayReservations(mappedReservations as Reservation[]);
    }
    if (isOpen) {
      fetchReservations();
    }
  }, [isOpen]);

  if (!isOpen || !vehicle) return null;

  // Filter rezervacija za ovo vozilo u dateRange-u
  const vehicleReservations = displayReservations.filter(res => {
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
                  <p className="text-gray-400 text-sm">Lokacija</p>
                  <p className="text-white font-medium">{vehicle.currentLocation || 'Nepoznato'}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#0f1117] border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-orange-500/10 p-2 rounded-lg">
                  <Car className="w-5 h-5 text-orange-500" />  {/* Sad koristimo lucide Car ikonu */}
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Tip</p>
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
                    <p className="text-gray-400 text-sm">Poslednji korisnik</p>
                    <p className="text-white font-medium">{vehicle.lastUser}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date Range Status */}
          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-white font-semibold mb-4">
              Status za {new Date(dateRange.start).toLocaleDateString('sr-RS')} - {new Date(dateRange.end).toLocaleDateString('sr-RS')}
            </h3>

            {isAvailable ? (
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="text-green-500 font-medium">Dostupno</p>
                  <p className="text-green-400/80 text-sm">Vozilo je slobodno u izabranom periodu</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="text-red-500 font-medium">Rezervisano</p>
                    <p className="text-red-400/80 text-sm">Vozilo ima {vehicleReservations.length} rezervacija(u) u periodu</p>
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
                          <p className="text-green-500 text-xs font-medium">Odobreno</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-500">Početak</p>
                          <p className="text-white">{new Date(reservation.startDate).toLocaleString('sr-RS')}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Kraj</p>
                          <p className="text-white">{new Date(reservation.endDate).toLocaleString('sr-RS')}</p>
                        </div>
                      </div>

                      {reservation.approvedBy && (
                        <div className="pt-3 border-t border-gray-700">
                          <p className="text-gray-400 text-sm">
                            Odobrio: <span className="text-white">{reservation.approvedBy}</span>
                            {reservation.approvedAt && (
                              <span className="text-gray-500"> {new Date(reservation.approvedAt).toLocaleString('sr-RS')}</span>
                            )}
                          </p>
                        </div>
                      )}

                      {reservation.notes && (
                        <div className="pt-3 border-t border-gray-700 mt-3">
                          <p className="text-gray-500 text-sm">Napomene:</p>
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