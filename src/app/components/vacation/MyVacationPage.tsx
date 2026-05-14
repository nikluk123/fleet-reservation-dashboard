import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useVacation } from '../../context/VacationContext';
import { type VacationRequest } from '../../data/vacationTypes';

export function MyVacationPage() {
  const { currentUser, vacationRequests, cancelRequest, getUsedDays, getRemainingDays } = useVacation();

  const mine = vacationRequests.filter(r => r.employeeId === currentUser.id);
  const now = new Date().toISOString().split('T')[0];

  const active  = mine.filter(r => r.status === 'approved' && r.endDate >= now);
  const pending = mine.filter(r => r.status === 'pending');
  const past    = mine.filter(r => r.status === 'rejected' || (r.status === 'approved' && r.endDate < now));

  const total     = currentUser.vacationDaysTotal ?? 20;
  const used      = getUsedDays(currentUser.id);
  const remaining = getRemainingDays(currentUser.id);
  const pendingDays = mine.filter(r => r.status === 'pending').reduce((s, r) => s + r.daysCount, 0);
  const usedPct   = Math.min(100, Math.round((used / total) * 100));

  const getStatusStyle = (status: string) => {
    if (status === 'approved') return 'text-green-500 bg-green-500/10 border-green-500/50';
    if (status === 'pending')  return 'text-orange-500 bg-orange-500/10 border-orange-500/50';
    return 'text-red-500 bg-red-500/10 border-red-500/50';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle className="w-4 h-4" />;
    if (status === 'pending')  return <Clock className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { dateStyle: 'medium' });

  const RequestCard = ({ req }: { req: VacationRequest }) => (
    <div className="bg-[#0f1117] border border-gray-700 rounded-lg p-6 hover:border-green-500/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-500/10 p-3 rounded-lg">
            <Calendar className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h3 className="text-white font-semibold">{fmt(req.startDate)} — {fmt(req.endDate)}</h3>
            <p className="text-gray-400 text-sm">{req.daysCount} working days</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${getStatusStyle(req.status)}`}>
            {getStatusIcon(req.status)}
            <span className="capitalize">{req.status}</span>
          </div>
          {req.status === 'pending' && (
            <button
              onClick={() => confirm('Cancel this request?') && cancelRequest(req.id)}
              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Cancel request"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {req.notes && (
        <div className="mb-3">
          <p className="text-gray-500 text-sm mb-1">Notes</p>
          <p className="text-gray-300 text-sm">{req.notes}</p>
        </div>
      )}

      {req.approvedBy && (
        <div className="pt-3 border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            Approved by <span className="text-white">{req.approvedBy}</span>
            {req.approvedAt && <span className="text-gray-500"> · {new Date(req.approvedAt).toLocaleDateString('en-GB')}</span>}
          </p>
        </div>
      )}
    </div>
  );

  const Section = ({ title, items }: { title: string; items: VacationRequest[] }) =>
    items.length > 0 ? (
      <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold text-lg mb-4">{title}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map(r => <RequestCard key={r.id} req={r} />)}
        </div>
      </div>
    ) : null;

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-white mb-1">My Vacation Requests</h2>
        <p className="text-gray-400">Your vacation history and pending requests</p>
      </div>

      {/* Vacation balance */}
      <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Vacation Balance {new Date().getFullYear()}</h3>
        <div className="flex items-end gap-4 mb-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Remaining</p>
            <p className={`text-4xl font-bold ${remaining <= 3 ? 'text-red-400' : remaining <= 7 ? 'text-orange-400' : 'text-green-400'}`}>
              {remaining}
            </p>
            <p className="text-gray-500 text-sm">of {total} days</p>
          </div>
          <div className="flex-1 pb-2">
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${usedPct > 80 ? 'bg-red-500' : usedPct > 50 ? 'bg-orange-500' : 'bg-green-500'}`}
                style={{ width: `${usedPct}%` }}
              />
            </div>
            <p className="text-gray-500 text-xs mt-1">{usedPct}% used</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#0f1117] border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Used</p>
            <p className="text-2xl font-bold text-white">{used}</p>
            <p className="text-gray-500 text-xs">days approved</p>
          </div>
          <div className="bg-[#0f1117] border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-orange-400">{pendingDays}</p>
            <p className="text-gray-500 text-xs">days awaiting</p>
          </div>
          <div className="bg-[#0f1117] border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Active now</p>
            <p className="text-2xl font-bold text-green-400">{active.length}</p>
            <p className="text-gray-500 text-xs">requests active</p>
          </div>
        </div>
      </div>

      <Section title="Active Vacation" items={active} />
      <Section title="Pending Approval" items={pending} />
      <Section title="Past & Rejected" items={past} />

      {mine.length === 0 && (
        <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-12 text-center">
          <span className="text-6xl block mb-4">🏖️</span>
          <h3 className="text-white font-semibold text-lg mb-2">No Vacation Requests Yet</h3>
          <p className="text-gray-400">Submit a request from the dashboard to plan your vacation.</p>
        </div>
      )}
    </div>
  );
}
