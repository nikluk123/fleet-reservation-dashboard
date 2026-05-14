import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useVacation } from '../../context/VacationContext';
import { type VacationRequest } from '../../data/vacationTypes';

export function VacationTimeline() {
  const { employees, vacationRequests } = useVacation();
  const [weekOffset, setWeekOffset] = useState(0);
  const [hoveredRequest, setHoveredRequest] = useState<string | null>(null);

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

  const toLocalDateStr = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const getRequestForDate = (employeeId: string, date: Date): VacationRequest | null => {
    const dateStr = toLocalDateStr(date);
    return vacationRequests.find(r => {
      if (r.employeeId !== employeeId) return false;
      if (r.status === 'rejected') return false;
      return r.startDate <= dateStr && r.endDate >= dateStr;
    }) ?? null;
  };

  const getCellStyle = (req: VacationRequest | null) => {
    if (!req) return 'bg-green-500/10 border-green-500/20 hover:bg-green-500/20';
    if (req.status === 'approved') return 'bg-orange-500/20 border-orange-500/40';
    if (req.status === 'pending') return 'bg-blue-500/20 border-blue-500/40';
    return 'bg-gray-500/10 border-gray-500/30';
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();
  const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

  return (
    <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Vacation Timeline</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset(weekOffset - 1)} className="p-2 rounded-lg bg-[#0f1117] border border-gray-700 hover:bg-gray-800 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
          <span className="text-gray-400 text-sm px-3 min-w-[140px] text-center">
            {weekDates[0].toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} –{' '}
            {weekDates[6].toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-2 rounded-lg bg-[#0f1117] border border-gray-700 hover:bg-gray-800 transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 rounded-lg bg-green-600/20 border border-green-600/50 text-green-400 text-xs hover:bg-green-600/30 transition-colors">
              Today
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-gray-400 text-sm font-medium px-3">Employee</div>
            {weekDates.map((date, idx) => (
              <div key={idx} className={`text-center ${isWeekend(date) ? 'opacity-40' : ''}`}>
                <div className="text-gray-400 text-xs">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className={`text-sm font-medium ${isToday(date) ? 'text-green-400' : 'text-white'}`}>
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                {isToday(date) && <div className="w-1.5 h-1.5 bg-green-500 rounded-full mx-auto mt-0.5" />}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {employees.map(emp => (
              <div key={emp.id} className="grid grid-cols-8 gap-2">
                <div className="flex flex-col justify-center bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2">
                  <div className="text-white text-sm font-medium truncate">{emp.name}</div>
                  <div className="text-gray-500 text-xs truncate">{emp.sector}</div>
                </div>

                {weekDates.map((date, idx) => {
                  const req = getRequestForDate(emp.id, date);
                  const isHovered = hoveredRequest === req?.id;
                  const weekend = isWeekend(date);

                  return (
                    <div
                      key={idx}
                      className="relative"
                      onMouseEnter={() => req && setHoveredRequest(req.id)}
                      onMouseLeave={() => setHoveredRequest(null)}
                    >
                      <div className={`h-14 rounded-lg border transition-all cursor-default ${weekend ? 'bg-gray-800/30 border-gray-800' : getCellStyle(req)}`}>
                        {req && !weekend && (
                          <div className="flex items-center justify-center h-full">
                            <div className={`w-2 h-2 rounded-full ${req.status === 'approved' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                          </div>
                        )}
                      </div>

                      {req && isHovered && (
                        <div className={`absolute z-20 top-full mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl min-w-[200px] pointer-events-none ${idx >= 4 ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}>
                          <div className="text-white text-sm font-medium mb-0.5">{req.employeeName}</div>
                          <div className="text-gray-400 text-xs mb-1">{req.sector}</div>
                          <div className="text-gray-300 text-xs">{req.daysCount} working days</div>
                          <div className={`text-xs mt-1 font-medium ${req.status === 'approved' ? 'text-orange-400' : 'text-blue-400'}`}>
                            {req.status === 'approved' ? 'On vacation' : 'Pending approval'}
                          </div>
                          <div className="text-gray-500 text-xs mt-1 border-t border-gray-700 pt-1">
                            {req.startDate} → {req.endDate}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500/10 border border-green-500/20 rounded" />
              <span className="text-gray-400 text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500/20 border border-orange-500/40 rounded" />
              <span className="text-gray-400 text-sm">On Vacation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/40 rounded" />
              <span className="text-gray-400 text-sm">Pending Approval</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800/30 border border-gray-800 rounded" />
              <span className="text-gray-400 text-sm">Weekend</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
