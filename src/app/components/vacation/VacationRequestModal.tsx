import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { useVacation } from '../../context/VacationContext';
import { countWorkingDays } from '../../data/vacationTypes';
import { type Employee } from '../../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function VacationRequestModal({ isOpen, onClose }: Props) {
  const { currentUser, employees, vacationRequests, submitRequest, getRemainingDays } = useVacation();

  const isAdmin = currentUser.vacationRole === 'admin';

  const [selectedEmployee, setSelectedEmployee] = useState<Employee>(currentUser);
  const [employeeSearch, setEmployeeSearch] = useState(currentUser.name);
  const [showDropdown, setShowDropdown] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const remaining = getRemainingDays(selectedEmployee.id);

  const daysCount = startDate && endDate && endDate >= startDate
    ? countWorkingDays(startDate, endDate)
    : 0;

  const hasOverlap = startDate && endDate
    ? vacationRequests.some(r =>
        r.employeeId === selectedEmployee.id &&
        r.status !== 'rejected' &&
        r.startDate <= endDate &&
        r.endDate >= startDate
      )
    : false;

  const insufficientDays = daysCount > remaining;
  const canSubmit = daysCount > 0 && !hasOverlap && !insufficientDays;

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    e.email.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedEmployee(currentUser);
      setEmployeeSearch(currentUser.name);
      setStartDate('');
      setEndDate('');
      setNotes('');
      setShowDropdown(false);
    }
  }, [isOpen]);

  const handleEmployeeSelect = (emp: Employee) => {
    setSelectedEmployee(emp);
    setEmployeeSearch(emp.name);
    setShowDropdown(false);
    setStartDate('');
    setEndDate('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    await submitRequest({
      employeeId:   selectedEmployee.id,
      employeeName: selectedEmployee.name,
      sector:       selectedEmployee.sector,
      startDate,
      endDate,
      daysCount,
      notes: notes.trim() || undefined,
    });
    setSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-app-surface border border-app-line rounded-2xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-app-line">
          <h2 className="text-2xl font-semibold text-white">New Vacation Request</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-app-hover transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Employee selector */}
          <div className="relative">
            <label className="block text-gray-400 text-sm mb-2">Employee *</label>
            {isAdmin ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={employeeSearch}
                    onChange={e => { setEmployeeSearch(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search employees..."
                    className="w-full bg-app-bg border border-app-line-muted rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  />
                </div>
                {showDropdown && filteredEmployees.length > 0 && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                    <div className="absolute z-20 w-full mt-1 bg-app-surface border border-app-line-muted rounded-lg shadow-xl max-h-52 overflow-y-auto">
                      {filteredEmployees.map(emp => (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => handleEmployeeSelect(emp)}
                          className="w-full text-left px-4 py-3 hover:bg-app-hover transition-colors border-b border-app-line last:border-b-0"
                        >
                          <div className="text-white font-medium">{emp.name}</div>
                          <div className="text-gray-400 text-xs">{emp.sector} · {getRemainingDays(emp.id)} days remaining</div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full bg-gray-800/50 border border-app-line-muted rounded-lg px-4 py-2.5 text-gray-400 cursor-not-allowed">
                {currentUser.name}
              </div>
            )}
          </div>

          {/* Remaining days info */}
          <div className="bg-app-bg border border-app-line-muted rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-gray-400 text-sm">
              {isAdmin && selectedEmployee.id !== currentUser.id
                ? `${selectedEmployee.name}'s available days`
                : 'Your available days'}
            </span>
            <span className={`text-lg font-bold ${remaining <= 3 ? 'text-red-400' : remaining <= 7 ? 'text-orange-400' : 'text-green-400'}`}>
              {remaining} days
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Start Date *</label>
              <input
                type="date"
                value={startDate}
                min={today}
                onChange={e => { setStartDate(e.target.value); if (endDate && e.target.value > endDate) setEndDate(e.target.value); }}
                required
                className="w-full bg-app-bg border border-app-line-muted rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">End Date *</label>
              <input
                type="date"
                value={endDate}
                min={startDate || today}
                onChange={e => setEndDate(e.target.value)}
                required
                className="w-full bg-app-bg border border-app-line-muted rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              />
            </div>
          </div>

          {daysCount > 0 && (
            <div className="bg-app-bg border border-app-line-muted rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-gray-400 text-sm">Working days requested</span>
              <span className="text-white font-semibold">{daysCount} days</span>
            </div>
          )}

          {hasOverlap && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-red-400 text-sm">
                {selectedEmployee.id === currentUser.id ? 'You already have' : `${selectedEmployee.name} already has`} a vacation request overlapping these dates.
              </p>
            </div>
          )}

          {insufficientDays && !hasOverlap && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-red-400 text-sm">
                Not enough days. Requested {daysCount}, only {remaining} available.
              </p>
            </div>
          )}

          {canSubmit && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-500 text-sm">
                {daysCount} working days · {remaining - daysCount} will remain after approval.
              </p>
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-sm mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional information..."
              className="w-full bg-app-bg border border-app-line-muted rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-app-line">
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-app-line-muted rounded-lg text-gray-400 hover:bg-app-hover transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
