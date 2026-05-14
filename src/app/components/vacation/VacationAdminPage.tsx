import { useState } from 'react';
import { Save, X, CheckCircle, Clock, XCircle, Trash2, Edit } from 'lucide-react';
import { useVacation } from '../../context/VacationContext';
import { type VacationRequest } from '../../data/vacationTypes';
import { type Employee } from '../../data/mockData';

export function VacationAdminPage() {
  const { currentUser } = useVacation();
  const isFullAdmin = currentUser.vacationRole === 'admin';

  const [activeTab, setActiveTab] = useState<'requests' | 'employees'>(
    isFullAdmin ? 'employees' : 'requests'
  );

  const tabs = [
    ...(isFullAdmin ? [{ id: 'employees' as const, label: 'Employees' }] : []),
    { id: 'requests' as const, label: 'All Requests' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-white mb-6">Admin Panel</h2>

        <div className="flex gap-1 mb-6 border-b border-gray-800">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 font-medium whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-green-400 border-green-500'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'employees' && isFullAdmin && <EmployeesTab />}
        {activeTab === 'requests' && <RequestsTab />}
      </div>
    </div>
  );
}

// ── Employees Tab ──────────────────────────────────────────────────────────────

function EmployeesTab() {
  const { employees, updateEmployeeVacation, getUsedDays } = useVacation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ vacationDaysTotal: number; vacationRole: string }>({ vacationDaysTotal: 20, vacationRole: 'user' });

  const startEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setEditData({ vacationDaysTotal: emp.vacationDaysTotal ?? 20, vacationRole: emp.vacationRole ?? 'user' });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateEmployeeVacation(editingId, editData);
    setEditingId(null);
  };

  const roleLabel = (role: string) => {
    if (role === 'admin') return 'Admin';
    if (role === 'sector_admin') return 'Sector Admin';
    return 'Employee';
  };

  const roleColor = (role: string) => {
    if (role === 'admin') return 'bg-purple-500/20 text-purple-400';
    if (role === 'sector_admin') return 'bg-green-500/20 text-green-400';
    return 'bg-blue-500/20 text-blue-400';
  };

  return (
    <div>
      <h3 className="text-white font-semibold mb-4">Employees ({employees.length})</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              {['Name', 'Sector', 'Vacation Role', 'Total Days', 'Used', 'Remaining', ''].map(h => (
                <th key={h} className="text-left text-gray-400 text-sm font-medium py-3 px-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => {
              const used = getUsedDays(emp.id);
              const remaining = (emp.vacationDaysTotal ?? 20) - used;
              return (
                <tr key={emp.id} className="border-b border-gray-800 hover:bg-gray-800/20">
                  {editingId === emp.id ? (
                    <>
                      <td className="py-3 px-4 text-white">{emp.name}</td>
                      <td className="py-3 px-4 text-gray-400 text-sm">{emp.sector}</td>
                      <td className="py-2 px-4">
                        <select
                          value={editData.vacationRole}
                          onChange={e => setEditData({ ...editData, vacationRole: e.target.value })}
                          className={inputCls}
                        >
                          <option value="user">Employee</option>
                          <option value="sector_admin">Sector Admin</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="number"
                          min={0}
                          max={365}
                          value={editData.vacationDaysTotal}
                          onChange={e => setEditData({ ...editData, vacationDaysTotal: parseInt(e.target.value) || 0 })}
                          className={inputCls}
                        />
                      </td>
                      <td className="py-3 px-4 text-gray-400">{used}</td>
                      <td className="py-3 px-4 text-gray-400">{(editData.vacationDaysTotal) - used}</td>
                      <td className="py-2 px-4">
                        <div className="flex gap-1 justify-end">
                          <IconBtn icon={Save} color="green" onClick={saveEdit} />
                          <IconBtn icon={X} color="gray" onClick={() => setEditingId(null)} />
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 text-white">{emp.name}</td>
                      <td className="py-3 px-4 text-gray-400 text-sm">{emp.sector}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${roleColor(emp.vacationRole ?? 'user')}`}>
                          {roleLabel(emp.vacationRole ?? 'user')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white font-medium">{emp.vacationDaysTotal ?? 20}</td>
                      <td className="py-3 px-4 text-gray-400">{used}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${remaining <= 3 ? 'text-red-400' : remaining <= 7 ? 'text-orange-400' : 'text-green-400'}`}>
                          {remaining}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end">
                          <IconBtn icon={Edit} color="blue" onClick={() => startEdit(emp)} />
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Requests Tab ───────────────────────────────────────────────────────────────

function RequestsTab() {
  const { currentUser, employees, vacationRequests, approveRequest, rejectRequest, deleteRequest } = useVacation();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const isFullAdmin = currentUser.vacationRole === 'admin';

  const visible = vacationRequests.filter(r => {
    if (!isFullAdmin && r.sector !== currentUser.sector) return false;
    if (filter !== 'all' && r.status !== filter) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'pending')  return <Clock className="w-4 h-4 text-orange-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { dateStyle: 'medium' });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">
          {isFullAdmin ? 'All Requests' : `${currentUser.sector} — Requests`} ({visible.length})
        </h3>
        <div className="flex gap-1">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors capitalize ${filter === f ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {visible.length === 0 && <p className="text-gray-400 text-sm">No requests found.</p>}
        {visible.map(req => {
          const emp = employees.find(e => e.id === req.employeeId);
          return (
            <div key={req.id} className="bg-[#0f1117] border border-gray-700 rounded-lg p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {getStatusIcon(req.status)}
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">
                    {req.employeeName} — {req.daysCount} days
                  </p>
                  <p className="text-gray-400 text-xs">{req.sector}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {fmt(req.startDate)} → {fmt(req.endDate)}
                  </p>
                  {req.notes && <p className="text-gray-600 text-xs mt-0.5 italic">"{req.notes}"</p>}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {req.status === 'pending' && (
                  <>
                    <button onClick={() => approveRequest(req.id)} className="px-3 py-1.5 bg-green-600/20 border border-green-600/50 text-green-400 rounded-lg text-sm hover:bg-green-600/30 transition-colors">
                      Approve
                    </button>
                    <button onClick={() => rejectRequest(req.id)} className="px-3 py-1.5 bg-red-600/20 border border-red-600/50 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition-colors">
                      Reject
                    </button>
                  </>
                )}
                {req.status === 'approved' && req.approvedBy && (
                  <p className="text-gray-500 text-xs">Approved by {req.approvedBy}</p>
                )}
                {isFullAdmin && (
                  <IconBtn icon={Trash2} color="red" onClick={() => confirm('Delete this request?') && deleteRequest(req.id)} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls = 'w-full bg-[#0f1117] border border-gray-700 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-green-500';

function IconBtn({ icon: Icon, color, onClick }: { icon: any; color: 'green' | 'red' | 'blue' | 'gray'; onClick: () => void }) {
  const colors = {
    green: 'text-green-500 hover:bg-green-500/10',
    red:   'text-red-500 hover:bg-red-500/10',
    blue:  'text-blue-500 hover:bg-blue-500/10',
    gray:  'text-gray-400 hover:bg-gray-500/10',
  };
  return (
    <button onClick={onClick} className={`p-1.5 rounded transition-colors ${colors[color]}`}>
      <Icon className="w-4 h-4" />
    </button>
  );
}
