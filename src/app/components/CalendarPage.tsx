import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { type Reservation } from '../data/mockData';
import { useFleet } from '../context/FleetContext';

interface CalendarPageProps {
  reservations: Reservation[];
}

export function CalendarPage({ reservations }: CalendarPageProps) {
  const { vehicles } = useFleet();
  const [monthOffset, setMonthOffset] = useState(0);

  const now = new Date();
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const blanks = Array.from({ length: firstDayOfMonth }, () => null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const allCells = [...blanks, ...days];

  const isToday = (day: number) => {
    return monthOffset === 0 && day === now.getDate();
  };

  const getReservationsForDay = (day: number | null) => {
    if (!day) return [];
    const dateCheck = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 12);
    return reservations.filter(res => {
      const start = new Date(res.startDate);
      const end = new Date(res.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return dateCheck >= start && dateCheck <= end && res.status === 'approved';
    });
  };

  const upcomingReservations = reservations
    .filter(res => {
      const start = new Date(res.startDate);
      return start >= now && res.status === 'approved';
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
            <CalendarIcon className="w-7 h-7" />
            Reservations Calendar
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMonthOffset(monthOffset - 1)}
              className="p-2 rounded-lg bg-[#0f1117] border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <span className="text-white font-medium min-w-[180px] text-center">{monthName}</span>
            <button
              onClick={() => setMonthOffset(monthOffset + 1)}
              className="p-2 rounded-lg bg-[#0f1117] border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            {monthOffset !== 0 && (
              <button
                onClick={() => setMonthOffset(0)}
                className="px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-600/50 text-blue-400 text-xs hover:bg-blue-600/30 transition-colors"
              >
                Today
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-gray-400 font-medium py-2 text-sm">{d}</div>
          ))}

          {allCells.map((day, idx) => {
            const dayRes = getReservationsForDay(day);
            const today = isToday(day as number);
            return (
              <div
                key={idx}
                className={`min-h-[110px] p-2 rounded-lg border transition-all ${
                  day
                    ? today
                      ? 'bg-blue-500/10 border-blue-500/50'
                      : 'bg-[#0f1117] border-gray-700 hover:border-gray-600'
                    : 'border-transparent'
                }`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-2 ${today ? 'text-blue-400' : 'text-white'}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayRes.slice(0, 3).map((res) => {
                        const vehicle = vehicles.find(v => v.id === res.vehicleId);
                        return (
                          <div
                            key={res.id}
                            className="bg-blue-600/20 border border-blue-600/40 rounded px-2 py-0.5 text-xs text-blue-400 truncate"
                            title={`${vehicle?.plate} – ${res.bookerName}`}
                          >
                            {vehicle?.plate}
                          </div>
                        );
                      })}
                      {dayRes.length > 3 && (
                        <div className="text-xs text-gray-500 px-2">+{dayRes.length - 3} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Upcoming Reservations</h3>
        {upcomingReservations.length === 0 ? (
          <p className="text-gray-400 text-sm">No upcoming approved reservations.</p>
        ) : (
          <div className="space-y-3">
            {upcomingReservations.map((res) => {
              const vehicle = vehicles.find(v => v.id === res.vehicleId);
              return (
                <div key={res.id} className="bg-[#0f1117] border border-gray-700 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500/10 p-3 rounded-lg">
                      <CalendarIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{vehicle?.model} ({vehicle?.plate})</p>
                      <p className="text-gray-400 text-sm">{res.bookerName} — {res.sector}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm">{new Date(res.startDate).toLocaleDateString('en-GB')}</p>
                    <p className="text-gray-400 text-xs">{new Date(res.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
