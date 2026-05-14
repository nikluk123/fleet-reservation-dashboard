import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useVacation } from '../../context/VacationContext';
import { type VacationRequest } from '../../data/vacationTypes';

export function VacationCalendarPage() {
  const { vacationRequests, currentUser } = useVacation();
  const [monthOffset, setMonthOffset] = useState(0);

  const isAdmin = currentUser.vacationRole === 'admin';
  const isSectorAdmin = currentUser.vacationRole === 'sector_admin';

  const visibleRequests = vacationRequests.filter(r => {
    if (r.status === 'rejected') return false;
    if (isAdmin) return true;
    if (isSectorAdmin) return r.sector === currentUser.sector;
    return true;
  });

  const now = new Date();
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthName = viewDate.toLocaleDateString('sr-Latn-RS', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

  let firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const blanks = Array.from({ length: firstDayOfMonth }, () => null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const allCells = [...blanks, ...days];

  const isToday = (day: number) => monthOffset === 0 && day === now.getDate();

  const isWeekend = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day).getDay();
    return d === 0 || d === 6;
  };

  const getRequestsForDay = (day: number | null): VacationRequest[] => {
    if (!day) return [];
    const yy = viewDate.getFullYear();
    const mm = String(viewDate.getMonth() + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${yy}-${mm}-${dd}`;
    return visibleRequests.filter(r => r.startDate <= dateStr && r.endDate >= dateStr);
  };

  const upcoming = visibleRequests
    .filter(r => r.status === 'approved' && r.startDate >= now.toISOString().split('T')[0])
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 10);

  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { dateStyle: 'medium' });

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
            <CalendarIcon className="w-7 h-7 text-green-400" />
            Leave Calendar
            {isSectorAdmin && !isAdmin && (
              <span className="text-sm font-normal text-gray-400">— {currentUser.sector}</span>
            )}
          </h2>
          <div className="flex items-center gap-3">
            <button onClick={() => setMonthOffset(monthOffset - 1)} className="p-2 rounded-lg bg-[#0f1117] border border-gray-700 hover:bg-gray-800 transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <span className="text-white font-medium min-w-[180px] text-center capitalize">{monthName}</span>
            <button onClick={() => setMonthOffset(monthOffset + 1)} className="p-2 rounded-lg bg-[#0f1117] border border-gray-700 hover:bg-gray-800 transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            {monthOffset !== 0 && (
              <button onClick={() => setMonthOffset(0)} className="px-3 py-1.5 rounded-lg bg-green-600/20 border border-green-600/50 text-green-400 text-xs hover:bg-green-600/30 transition-colors">
                Today
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className={`text-center font-medium py-2 text-sm ${d === 'Sat' || d === 'Sun' ? 'text-gray-600' : 'text-gray-400'}`}>{d}</div>
          ))}

          {allCells.map((day, idx) => {
            const requests = getRequestsForDay(day);
            const today = day ? isToday(day) : false;
            const weekend = day ? isWeekend(day) : false;

            return (
              <div
                key={idx}
                className={`min-h-[110px] p-2 rounded-lg border transition-all ${
                  !day
                    ? 'border-transparent'
                    : today
                    ? 'bg-green-500/10 border-green-500/50'
                    : weekend
                    ? 'bg-gray-800/20 border-gray-800'
                    : 'bg-[#0f1117] border-gray-700 hover:border-gray-600'
                }`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-2 ${today ? 'text-green-400' : weekend ? 'text-gray-600' : 'text-white'}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {requests.slice(0, 3).map(req => (
                        <div
                          key={req.id}
                          className={`rounded px-2 py-0.5 text-xs truncate border ${
                            req.status === 'pending'
                              ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                              : 'bg-green-600/20 border-green-600/40 text-green-400'
                          }`}
                          title={`${req.employeeName} — ${req.sector} (${req.status})`}
                        >
                          {req.employeeName.split(' ')[0]}{req.status === 'pending' ? ' ?' : ''}
                        </div>
                      ))}
                      {requests.length > 3 && (
                        <div className="text-xs text-gray-500 px-2">+{requests.length - 3} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-green-600/20 border border-green-600/40 rounded" />
            <span className="text-gray-400 text-xs">Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-orange-500/20 border border-orange-500/40 rounded" />
            <span className="text-gray-400 text-xs">Pending</span>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Upcoming Approved Vacations</h3>
        {upcoming.length === 0 ? (
          <p className="text-gray-400 text-sm">No upcoming approved vacations.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map(req => (
              <div key={req.id} className="bg-[#0f1117] border border-gray-700 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-green-500/10 p-3 rounded-lg">
                    <span className="text-xl">🏖️</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{req.employeeName}</p>
                    <p className="text-gray-400 text-sm">{req.sector} · {req.daysCount} days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm">{fmt(req.startDate)}</p>
                  <p className="text-gray-400 text-xs">→ {fmt(req.endDate)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
