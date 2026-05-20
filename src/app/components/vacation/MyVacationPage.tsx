import { Calendar, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useVacation } from '../../context/VacationContext';
import { type VacationRequest } from '../../data/vacationTypes';

export function MyVacationPage() {
  const { currentUser, employees, vacationRequests, cancelRequest, getUsedDays, getRemainingDays } = useVacation();

  const [pastExpanded, setPastExpanded] = useState(false);
  const [sectorPastExpanded, setSectorPastExpanded] = useState(false);

  const mine = vacationRequests.filter(r => r.employeeId === currentUser.id);
  const now  = new Date().toISOString().split('T')[0];
  const year = new Date().getFullYear();

  const active  = mine.filter(r => r.status === 'approved' && r.endDate >= now);
  const pending = mine.filter(r => r.status === 'pending');
  const past    = mine.filter(r => r.status === 'rejected' || (r.status === 'approved' && r.endDate < now));

  const total       = currentUser.vacationDaysTotal ?? 20;
  const used        = getUsedDays(currentUser.id);
  const remaining   = getRemainingDays(currentUser.id);
  const pendingDays = pending.reduce((s, r) => s + r.daysCount, 0);
  const usedPct     = Math.min(100, Math.round((used / total) * 100));
  const ytdUsed     = mine
    .filter(r => r.status === 'approved' && r.startDate <= now && new Date(r.startDate).getFullYear() === year)
    .reduce((s, r) => s + r.daysCount, 0);

  const isSectorAdmin = currentUser.vacationRole === 'sector_admin';

  // Sector admin: employees in same sector or sub-sectors
  const myTeam = isSectorAdmin
    ? employees.filter(e =>
        e.id !== currentUser.id && (
          e.sector === currentUser.sector ||
          e.sector.startsWith(currentUser.sector + ' - ')
        )
      ).sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const sectorRequests = isSectorAdmin
    ? vacationRequests.filter(r =>
        r.sector === currentUser.sector || r.sector.startsWith(currentUser.sector + ' - ')
      )
    : [];

  const sectorPast = sectorRequests.filter(r =>
    r.status === 'rejected' || (r.status === 'approved' && r.endDate < now)
  ).sort((a, b) => b.startDate.localeCompare(a.startDate));

  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const statusBadge = (status: string) => {
    if (status === 'approved') return <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" />Approved</span>;
    if (status === 'pending')  return <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" />Pending</span>;
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" />Rejected</span>;
  };

  const getStatusStyle = (status: string) => {
    if (status === 'approved') return 'text-green-500 bg-green-500/10 border-green-500/50';
    if (status === 'pending')  return 'text-orange-500 bg-orange-500/10 border-orange-500/50';
    return 'text-red-500 bg-red-500/10 border-red-500/50';
  };

  const RequestCard = ({ req }: { req: VacationRequest }) => (
    <div className="bg-app-bg border border-app-line-muted rounded-lg p-5 hover:border-green-500/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-green-500/10 p-2.5 rounded-lg">
            <Calendar className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{fmt(req.startDate)} — {fmt(req.endDate)}</h3>
            <p className="text-gray-400 text-xs mt-0.5">{req.daysCount} working days</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusStyle(req.status)}`}>
            <span className="capitalize">{req.status}</span>
          </div>
          {req.status === 'pending' && (
            <button
              onClick={() => confirm('Cancel this request?') && cancelRequest(req.id)}
              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-xs"
              title="Cancel request"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      {req.notes && <p className="text-gray-400 text-xs mt-2 italic">"{req.notes}"</p>}
      {req.approvedBy && (
        <p className="text-gray-500 text-xs mt-2 pt-2 border-t border-app-line-muted">
          Approved by <span className="text-gray-300">{req.approvedBy}</span>
          {req.approvedAt && <span> · {new Date(req.approvedAt).toLocaleDateString('en-GB')}</span>}
        </p>
      )}
    </div>
  );

  // Compact table for Past & Rejected
  const PastTable = ({ items, expanded, onToggle }: { items: VacationRequest[]; expanded: boolean; onToggle: () => void }) => {
    if (items.length === 0) return null;
    const visible = expanded ? items : items.slice(0, 5);
    return (
      <div className="bg-app-surface border border-app-line rounded-xl overflow-hidden">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-app-hover transition-colors"
        >
          <h3 className="text-white font-semibold">Past &amp; Rejected <span className="text-gray-500 font-normal text-sm ml-1">({items.length})</span></h3>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-app-line bg-app-bg">
                <th className="text-left text-gray-500 font-medium px-6 py-2.5">Period</th>
                <th className="text-center text-gray-500 font-medium px-4 py-2.5">Days</th>
                <th className="text-center text-gray-500 font-medium px-4 py-2.5">Status</th>
                <th className="text-left text-gray-500 font-medium px-4 py-2.5">Notes</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(r => (
                <tr key={r.id} className="border-t border-app-line hover:bg-app-hover transition-colors">
                  <td className="px-6 py-2.5 text-gray-300 whitespace-nowrap">{fmt(r.startDate)} — {fmt(r.endDate)}</td>
                  <td className="px-4 py-2.5 text-center text-gray-400">{r.daysCount}</td>
                  <td className="px-4 py-2.5 text-center">{statusBadge(r.status)}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs italic max-w-[200px] truncate">{r.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!expanded && items.length > 5 && (
          <button onClick={onToggle} className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-300 transition-colors border-t border-app-line">
            Show all {items.length} records
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-app-surface border border-app-line rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-white mb-1">My Vacation Requests</h2>
        <p className="text-gray-400">Your vacation history and pending requests</p>
      </div>

      {/* Vacation balance */}
      <div className="bg-app-surface border border-app-line rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Vacation Balance {year}</h3>
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
          <div className="bg-app-bg border border-app-line-muted rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Used</p>
            <p className="text-2xl font-bold text-white">{ytdUsed}</p>
            <p className="text-gray-500 text-xs">days taken YTD</p>
          </div>
          <div className="bg-app-bg border border-app-line-muted rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-orange-400">{pendingDays}</p>
            <p className="text-gray-500 text-xs">days awaiting</p>
          </div>
          <div className="bg-app-bg border border-app-line-muted rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Active now</p>
            <p className="text-2xl font-bold text-green-400">{active.length}</p>
            <p className="text-gray-500 text-xs">requests active</p>
          </div>
        </div>
      </div>

      {/* Active */}
      {active.length > 0 && (
        <div className="bg-app-surface border border-app-line rounded-xl p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Active Vacation</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {active.map(r => <RequestCard key={r.id} req={r} />)}
          </div>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div className="bg-app-surface border border-app-line rounded-xl p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Pending Approval</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pending.map(r => <RequestCard key={r.id} req={r} />)}
          </div>
        </div>
      )}

      {/* Past & Rejected — compact table */}
      <PastTable items={past} expanded={pastExpanded} onToggle={() => setPastExpanded(p => !p)} />

      {mine.length === 0 && (
        <div className="bg-app-surface border border-app-line rounded-xl p-12 text-center">
          <span className="text-6xl block mb-4">🏖️</span>
          <h3 className="text-white font-semibold text-lg mb-2">No Vacation Requests Yet</h3>
          <p className="text-gray-400">Submit a request from the dashboard to plan your vacation.</p>
        </div>
      )}

      {/* ── Sector Admin: Team Overview ── */}
      {isSectorAdmin && myTeam.length > 0 && (
        <>
          <div className="bg-app-surface border border-app-line rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-app-line">
              <h3 className="text-white font-semibold text-lg">My Sector — Team Overview</h3>
              <p className="text-gray-400 text-sm mt-0.5">{currentUser.sector} · {myTeam.length} employees</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-app-bg">
                    <th className="text-left text-gray-500 font-medium px-6 py-3">Employee</th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3">Sector</th>
                    <th className="text-center text-gray-500 font-medium px-4 py-3">Total</th>
                    <th className="text-center text-gray-500 font-medium px-4 py-3">Used</th>
                    <th className="text-center text-gray-500 font-medium px-4 py-3">Remaining</th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3">Current Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myTeam.map(emp => {
                    const empTotal     = emp.vacationDaysTotal ?? 20;
                    const empUsed      = getUsedDays(emp.id);
                    const empRemaining = getRemainingDays(emp.id);
                    const empPct       = Math.min(100, Math.round((empUsed / empTotal) * 100));

                    const empActive  = vacationRequests.find(r => r.employeeId === emp.id && r.status === 'approved' && r.endDate >= now && r.startDate <= now);
                    const empPending = vacationRequests.find(r => r.employeeId === emp.id && r.status === 'pending');
                    const empFuture  = vacationRequests.find(r => r.employeeId === emp.id && r.status === 'approved' && r.startDate > now);

                    const currentStatus = empActive
                      ? <span className="text-green-400 text-xs font-medium">🏖️ On leave until {fmt(empActive.endDate)}</span>
                      : empPending
                      ? <span className="text-orange-400 text-xs font-medium">⏳ Pending {fmt(empPending.startDate)}</span>
                      : empFuture
                      ? <span className="text-blue-400 text-xs font-medium">📅 Approved {fmt(empFuture.startDate)}</span>
                      : <span className="text-gray-500 text-xs">At work</span>;

                    const remainColor = empRemaining <= 3 ? 'text-red-400' : empRemaining <= 7 ? 'text-orange-400' : 'text-green-400';

                    return (
                      <tr key={emp.id} className="border-t border-app-line hover:bg-app-hover transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-700 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-semibold">{emp.name.split(' ').map(n => n[0]).join('').slice(0,2)}</span>
                            </div>
                            <span className="text-gray-200 font-medium">{emp.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{emp.sector}</td>
                        <td className="px-4 py-3 text-center text-gray-400">{empTotal}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-gray-300">{empUsed}</span>
                            <div className="w-12 bg-gray-700 rounded-full h-1">
                              <div className={`h-1 rounded-full ${empPct > 80 ? 'bg-red-500' : empPct > 50 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${empPct}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className={`px-4 py-3 text-center font-bold ${remainColor}`}>{empRemaining}</td>
                        <td className="px-4 py-3">{currentStatus}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sector Past & Rejected history */}
          {sectorPast.length > 0 && (
            <div className="bg-app-surface border border-app-line rounded-xl overflow-hidden">
              <button
                onClick={() => setSectorPastExpanded(p => !p)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-app-hover transition-colors"
              >
                <h3 className="text-white font-semibold">Sector Past &amp; Rejected History <span className="text-gray-500 font-normal text-sm ml-1">({sectorPast.length})</span></h3>
                {sectorPastExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {sectorPastExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-t border-app-line bg-app-bg">
                        <th className="text-left text-gray-500 font-medium px-6 py-2.5">Employee</th>
                        <th className="text-left text-gray-500 font-medium px-4 py-2.5">Period</th>
                        <th className="text-center text-gray-500 font-medium px-4 py-2.5">Days</th>
                        <th className="text-center text-gray-500 font-medium px-4 py-2.5">Status</th>
                        <th className="text-left text-gray-500 font-medium px-4 py-2.5">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectorPast.map(r => (
                        <tr key={r.id} className="border-t border-app-line hover:bg-app-hover transition-colors">
                          <td className="px-6 py-2.5 text-gray-300 font-medium">{r.employeeName}</td>
                          <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">{fmt(r.startDate)} — {fmt(r.endDate)}</td>
                          <td className="px-4 py-2.5 text-center text-gray-400">{r.daysCount}</td>
                          <td className="px-4 py-2.5 text-center">{statusBadge(r.status)}</td>
                          <td className="px-4 py-2.5 text-gray-500 text-xs italic max-w-[200px] truncate">{r.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
