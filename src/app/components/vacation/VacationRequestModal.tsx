import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { useVacation } from '../../context/VacationContext';
import { countWorkingDays } from '../../data/vacationTypes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function VacationRequestModal({ isOpen, onClose }: Props) {
  const { currentUser, vacationRequests, submitRequest, getRemainingDays } = useVacation();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const remaining = getRemainingDays(currentUser.id);

  const daysCount = startDate && endDate && endDate >= startDate
    ? countWorkingDays(startDate, endDate)
    : 0;

  const hasOverlap = startDate && endDate
    ? vacationRequests.some(r =>
        r.employeeId === currentUser.id &&
        r.status !== 'rejected' &&
        r.startDate <= endDate &&
        r.endDate >= startDate
      )
    : false;

  const insufficientDays = daysCount > remaining;

  const canSubmit = daysCount > 0 && !hasOverlap && !insufficientDays;

  useEffect(() => {
    if (!isOpen) {
      setStartDate('');
      setEndDate('');
      setNotes('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    await submitRequest({
      employeeId:   currentUser.id,
      employeeName: currentUser.name,
      sector:       currentUser.sector,
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
      <div className="bg-[#1a1d29] border border-gray-800 rounded-2xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-semibold text-white">New Vacation Request</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Remaining days info */}
          <div className="bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-gray-400 text-sm">Available vacation days</span>
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
                className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
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
                className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              />
            </div>
          </div>

          {/* Days count preview */}
          {daysCount > 0 && (
            <div className="bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-gray-400 text-sm">Working days requested</span>
              <span className="text-white font-semibold">{daysCount} days</span>
            </div>
          )}

          {/* Errors */}
          {hasOverlap && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-red-400 text-sm">You already have a vacation request overlapping these dates.</p>
            </div>
          )}

          {insufficientDays && !hasOverlap && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-red-400 text-sm">Not enough remaining days. You requested {daysCount} but only have {remaining} left.</p>
            </div>
          )}

          {canSubmit && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-500 text-sm">
                Requesting {daysCount} working days. {remaining - daysCount} will remain after approval.
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
              className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors">
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
