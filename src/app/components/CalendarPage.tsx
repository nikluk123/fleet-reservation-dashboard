import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { type Reservation } from '../data/mockData';
import { useFleet } from '../context/FleetContext';

interface CalendarPageProps {
  reservations: Reservation[];
}

export function CalendarPage({ reservations }: CalendarPageProps) {
  const { vehicles } = useFleet();
  const [currentMonth, setCurrentMonth] = useState(0); // offset from current month
  
  const getMonthData = (monthOffset: number) => {
    const today = new Date(2026, 0, 11); // Jan 11, 2026
    const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    return targetDate;
  };

  const currentDate = getMonthData(currentMonth);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Get days in month
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getReservationsForDay = (day: number | null) => {
    if (!day) return [];
    
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    return reservations.filter(res => {
      const start = new Date(res.startDate);
      const end = new Date(res.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      dateToCheck.setHours(12, 0, 0, 0);
      
      return dateToCheck >= start && dateToCheck <= end && res.status === 'approved';
    });
  };

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
              onClick={() => setCurrentMonth(currentMonth - 1)}
              className="p-2 rounded-lg bg-[#0f1117] border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <span className="text-white font-medium min-w-[200px] text-center">{monthName}</span>
            <button
              onClick={() => setCurrentMonth(currentMonth + 1)}
              className="p-2 rounded-lg bg-[#0f1117] border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-gray-400 font-medium py-2 text-sm">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, idx) => {
            const dayReservations = getReservationsForDay(day);
            const isToday = day === 11 && currentMonth === 0;
            
            return (
              <div
                key={idx}
                className={`min-h-[120px] p-2 rounded-lg border transition-all ${
                  day
                    ? isToday
                      ? 'bg-blue-500/10 border-blue-500/50'
                      : 'bg-[#0f1117] border-gray-700 hover:border-gray-600'
                    : 'border-transparent'
                }`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-500' : 'text-white'}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayReservations.slice(0, 3).map((res) => {
                        const vehicle = vehicles.find(v => v.id === res.vehicleId);
                        return (
                          <div
                            key={res.id}
                            className="bg-blue-600/20 border border-blue-600/50 rounded px-2 py-1 text-xs text-blue-400 truncate"
                            title={`${vehicle?.plate} - ${res.bookerName}`}
                          >
                            {vehicle?.plate}
                          </div>
                        );
                      })}
                      {dayReservations.length > 3 && (
                        <div className="text-xs text-gray-500 px-2">
                          +{dayReservations.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Upcoming Reservations</h3>
        <div className="space-y-3">
          {reservations.filter(res => {
            const start = new Date(res.startDate);
            const today = new Date(2026, 0, 11);
            return start >= today && res.status === 'approved';
          }).slice(0, 5).map((res) => {
            const vehicle = vehicles.find(v => v.id === res.vehicleId);
            return (
              <div key={res.id} className="bg-[#0f1117] border border-gray-700 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500/10 p-3 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{vehicle?.model} ({vehicle?.plate})</p>
                    <p className="text-gray-400 text-sm">{res.bookerName} - {res.sector}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm">
                    {new Date(res.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {new Date(res.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}