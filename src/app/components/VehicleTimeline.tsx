import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { type Vehicle, type Reservation } from '../data/mockData';

interface VehicleTimelineProps {
  vehicles: Vehicle[];
  reservations: Reservation[];
}

export function VehicleTimeline({ vehicles, reservations }: VehicleTimelineProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [hoveredReservation, setHoveredReservation] = useState<string | null>(null);

  const getWeekDates = (offset: number): Date[] => {
    const now = new Date();
    const dow = now.getDay();
    const mondayDiff = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayDiff + offset * 7);
    monday.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(weekOffset);

  const getReservationForDate = (vehicleId: string, date: Date): Reservation | null => {
    const dateStr = date.toISOString().split('T')[0];
    return reservations.find(res => {
      if (res.vehicleId !== vehicleId) return false;
      if (res.status === 'rejected') return false;
      const start = new Date(res.startDate).toISOString().split('T')[0];
      const end = new Date(res.endDate).toISOString().split('T')[0];
      return start <= dateStr && end >= dateStr;
    }) ?? null;
  };

  const getCellStyle = (reservation: Reservation | null) => {
    if (!reservation) return 'bg-green-500/10 border-green-500/20 hover:bg-green-500/20';
    if (reservation.status === 'approved') return 'bg-red-500/20 border-red-500/40';
    if (reservation.status === 'pending') return 'bg-orange-500/20 border-orange-500/40';
    return 'bg-gray-500/10 border-gray-500/30';
  };

  const isToday = (date: Date) => {
    const now = new Date();
    return date.toDateString() === now.toDateString();
  };

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
          <span className="text-gray-400 text-sm px-3 min-w-[140px] text-center">
            {weekDates[0].toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} –{' '}
            {weekDates[6].toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="p-2 rounded-lg bg-[#0f1117] border border-gray-700 hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-600/50 text-blue-400 text-xs hover:bg-blue-600/30 transition-colors"
            >
              Today
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-gray-400 text-sm font-medium px-3">Vehicle</div>
            {weekDates.map((date, idx) => (
              <div key={idx} className="text-center">
                <div className="text-gray-400 text-xs">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className={`text-sm font-medium ${isToday(date) ? 'text-blue-400' : 'text-white'}`}>
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                {isToday(date) && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mx-auto mt-0.5" />}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="grid grid-cols-8 gap-2">
                <div className="flex flex-col justify-center bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2">
                  <div className="text-white text-sm font-medium truncate">{vehicle.model}</div>
                  <div className="text-gray-400 text-xs truncate font-mono">{vehicle.plate}</div>
                </div>

                {weekDates.map((date, idx) => {
                  const reservation = getReservationForDate(vehicle.id, date);
                  const isHovered = hoveredReservation === reservation?.id;

                  return (
                    <div
                      key={idx}
                      className="relative"
                      onMouseEnter={() => reservation && setHoveredReservation(reservation.id)}
                      onMouseLeave={() => setHoveredReservation(null)}
                    >
                      <div className={`h-14 rounded-lg border transition-all cursor-default ${getCellStyle(reservation)}`}>
                        {reservation && (
                          <div className="flex items-center justify-center h-full">
                            <div className={`w-2 h-2 rounded-full ${reservation.status === 'approved' ? 'bg-red-500' : 'bg-orange-500'}`} />
                          </div>
                        )}
                      </div>

                      {reservation && isHovered && (
                        <div className="absolute z-20 top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl min-w-[210px] pointer-events-none">
                          <div className="text-white text-sm font-medium mb-0.5">{reservation.bookerName}</div>
                          <div className="text-gray-400 text-xs mb-0.5">{reservation.sector}</div>
                          {reservation.project && (
                            <div className="text-blue-400 text-xs mb-1">{reservation.project}</div>
                          )}
                          <div className={`text-xs mt-1 font-medium ${reservation.status === 'approved' ? 'text-red-400' : 'text-orange-400'}`}>
                            {reservation.status === 'approved' ? 'Approved' : 'Pending approval'}
                          </div>
                          <div className="text-gray-500 text-xs mt-1 border-t border-gray-700 pt-1">
                            {new Date(reservation.startDate).toLocaleDateString('en-GB')} – {new Date(reservation.endDate).toLocaleDateString('en-GB')}
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
              <div className="w-4 h-4 bg-green-500/10 border border-green-500/20 rounded" />
              <span className="text-gray-400 text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500/20 border border-red-500/40 rounded" />
              <span className="text-gray-400 text-sm">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500/20 border border-orange-500/40 rounded" />
              <span className="text-gray-400 text-sm">Pending approval</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
