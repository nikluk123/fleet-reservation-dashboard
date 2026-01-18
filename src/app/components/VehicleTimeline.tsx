import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { type Vehicle, type Reservation } from '../data/mockData';
import { getVehicles, getReservations } from '../../lib/queries'; // ako @ ne radi, promeni u '../../lib/queries'

interface VehicleTimelineProps {
  vehicles: Vehicle[];
  reservations: Reservation[];
}

export function VehicleTimeline({}: VehicleTimelineProps) {
  const [displayVehicles, setDisplayVehicles] = useState<Vehicle[]>([]);
  const [displayReservations, setDisplayReservations] = useState<Reservation[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  
  useEffect(() => {
    async function fetchData() {
      const realVehicles = await getVehicles();
      const realReservations = await getReservations();

      // Mapiramo vozila (isto kao ranije)
      const mappedVehicles = realVehicles.map((v: any) => ({
        ...v,
        currentLocation: v.location || null,
        lastUser: null,
      }));

      // Mapiramo rezervacije da pašu uz Reservation type (prilagodi ako treba polja)
      const mappedReservations = realReservations.map((r: any) => ({
        ...r,
        vehicleId: r.vehicle_id,
        startDate: r.start_date,
        endDate: r.end_date,
        bookerName: r.booker_name || 'Nepoznat',  // ako imaš join sa profiles, ovde će biti ime
        sector: r.sector || '',
        project: r.project || '',
        // dodaj ostala polja po potrebi (approvedBy itd.)
      }));

      setDisplayVehicles(mappedVehicles as Vehicle[]);
      setDisplayReservations(mappedReservations as Reservation[]);
    }
    fetchData();
  }, []);

  const getWeekDates = (offset: number) => {
    const baseDate = new Date(); // današnji datum (možeš promeniti u fiksni ako hoćeš)
    const startDate = new Date(baseDate);
    startDate.setDate(baseDate.getDate() + (offset * 7));
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(weekOffset);
  
  const isVehicleBookedOnDate = (vehicleId: string, date: Date): Reservation | null => {
    const dateStr = date.toISOString().split('T')[0];
    
    const reservation = displayReservations.find(res => {
      if (res.vehicleId !== vehicleId) return false;
      
      const startDate = new Date(res.startDate).toISOString().split('T')[0];
      const endDate = new Date(res.endDate).toISOString().split('T')[0];
      
      return startDate <= dateStr && endDate >= dateStr && res.status === 'approved';
    });
    
    return reservation || null;
  };

  const getStatusColor = (reservation: Reservation | null) => {
    if (!reservation) return 'bg-green-500/20 border-green-500/50';
    if (reservation.status === 'approved') return 'bg-red-500/20 border-red-500/50';
    if (reservation.status === 'pending') return 'bg-orange-500/20 border-orange-500/50';
    return 'bg-gray-500/20 border-gray-500/50';
  };

  const getStatusText = (reservation: Reservation | null) => {
    if (!reservation) return 'Available';
    if (reservation.status === 'approved') return 'Booked';
    if (reservation.status === 'pending') return 'Pending';
    return 'Unavailable';
  };

  const [hoveredReservation, setHoveredReservation] = useState<string | null>(null);

  return (
    <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Vehicle Availability Timeline</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="p-2 rounded-lg bg-[#0f1117] border border-gray-700 hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
          <span className="text-gray-400 text-sm px-4">
            {weekDates[0].toLocaleDateString('sr-RS', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('sr-RS', { month: 'short', day: 'numeric' })}
          </span>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="p-2 rounded-lg bg-[#0f1117] border border-gray-700 hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-gray-400 text-sm font-medium">Vehicle</div>
            {weekDates.map((date, idx) => (
              <div key={idx} className="text-center">
                <div className="text-gray-400 text-xs">{date.toLocaleDateString('sr-RS', { weekday: 'short' })}</div>
                <div className="text-white text-sm font-medium">{date.toLocaleDateString('sr-RS', { month: 'short', day: 'numeric' })}</div>
              </div>
            ))}
          </div>

          {/* Timeline Grid */}
          <div className="space-y-2">
            {displayVehicles.map((vehicle) => (
              <div key={vehicle.id} className="grid grid-cols-8 gap-2">
                <div className="flex flex-col justify-center bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2">
                  <div className="text-white text-sm font-medium truncate">{vehicle.model}</div>
                  <div className="text-gray-400 text-xs truncate">{vehicle.plate}</div>
                </div>
                
                {weekDates.map((date, idx) => {
                  const reservation = isVehicleBookedOnDate(vehicle.id, date);
                  const isHovered = hoveredReservation === reservation?.id;
                  
                  return (
                    <div
                      key={idx}
                      className="relative"
                      onMouseEnter={() => reservation && setHoveredReservation(reservation.id)}
                      onMouseLeave={() => setHoveredReservation(null)}
                    >
                      <div
                        className={`h-14 rounded-lg border transition-all ${getStatusColor(reservation)}`}
                      >
                        {reservation && (
                          <div className="flex items-center justify-center h-full">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                      
                      {/* Tooltip */}
                      {reservation && isHovered && (
                        <div className="absolute z-10 top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl min-w-[200px]">
                          <div className="text-white text-sm font-medium mb-1">{reservation.bookerName || 'Nepoznat korisnik'}</div>
                          <div className="text-gray-400 text-xs mb-1">{reservation.sector || ''}</div>
                          {reservation.project && (
                            <div className="text-blue-400 text-xs mb-1">{reservation.project}</div>
                          )}
                          <div className="text-gray-500 text-xs mt-2">
                            {new Date(reservation.startDate).toLocaleDateString('sr-RS')} - {new Date(reservation.endDate).toLocaleDateString('sr-RS')}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500/10 border border-green-500/30 rounded"></div>
              <span className="text-gray-400 text-sm">Dostupno</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500/20 border border-red-500/50 rounded"></div>
              <span className="text-gray-400 text-sm">Rezervisano</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500/20 border border-orange-500/50 rounded"></div>
              <span className="text-gray-400 text-sm">Na čekanju</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}