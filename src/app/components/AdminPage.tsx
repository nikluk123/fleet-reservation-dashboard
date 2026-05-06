import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useFleet } from '../context/FleetContext';
import { type Vehicle, type Employee, type Project, type Department } from '../data/mockData';

export function AdminPage() {
  const {
    vehicles, employees, projects, departments, reservations,
    addVehicle, updateVehicle, deleteVehicle,
    addEmployee, updateEmployee, deleteEmployee,
    addProject, updateProject, deleteProject,
    addDepartment, deleteDepartment,
    approveReservation, rejectReservation,
  } = useFleet();

  const [activeTab, setActiveTab] = useState<'vehicles' | 'employees' | 'projects' | 'sectors' | 'reservations'>('vehicles');

  const tabs = [
    { id: 'vehicles' as const, label: 'Vehicles' },
    { id: 'employees' as const, label: 'Employees' },
    { id: 'projects' as const, label: 'Projects' },
    { id: 'sectors' as const, label: 'Sectors' },
    { id: 'reservations' as const, label: 'All Reservations' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-white mb-6">Admin Panel</h2>

        <div className="flex gap-1 mb-6 border-b border-gray-800 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 font-medium whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-blue-400 border-blue-500'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div>
          {activeTab === 'vehicles' && (
            <VehiclesTab vehicles={vehicles} addVehicle={addVehicle} updateVehicle={updateVehicle} deleteVehicle={deleteVehicle} />
          )}
          {activeTab === 'employees' && (
            <EmployeesTab employees={employees} departments={departments} addEmployee={addEmployee} updateEmployee={updateEmployee} deleteEmployee={deleteEmployee} />
          )}
          {activeTab === 'projects' && (
            <ProjectsTab projects={projects} addProject={addProject} updateProject={updateProject} deleteProject={deleteProject} />
          )}
          {activeTab === 'sectors' && (
            <SectorsTab sectors={departments} addDepartment={addDepartment} deleteDepartment={deleteDepartment} />
          )}
          {activeTab === 'reservations' && (
            <ReservationsTab reservations={reservations} vehicles={vehicles} employees={employees} onApprove={approveReservation} onReject={rejectReservation} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Vehicles ──────────────────────────────────────────────────────────────────

function VehiclesTab({ vehicles, addVehicle, updateVehicle, deleteVehicle }: any) {
  const blank = { model: '', plate: '', type: 'SUV', status: 'available' as const, currentLocation: 'Main Office' };
  const [isAdding, setIsAdding] = useState(false);
  const [newVehicle, setNewVehicle] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Vehicle>>({});

  const startEdit = (v: Vehicle) => { setEditingId(v.id); setEditData({ ...v }); };
  const saveEdit = () => { updateVehicle(editingId, editData); setEditingId(null); };

  const handleAdd = () => {
    if (newVehicle.model && newVehicle.plate) {
      addVehicle(newVehicle);
      setNewVehicle(blank);
      setIsAdding(false);
    }
  };

  const types = ['SUV', 'Compact SUV', 'Sedan', 'City Car', 'Van'];
  const statuses = ['available', 'booked', 'maintenance'];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Vehicles ({vehicles.length})</h3>
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              {['Model', 'Plate', 'Type', 'Status', 'Location', ''].map(h => (
                <th key={h} className="text-left text-gray-400 text-sm font-medium py-3 px-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr className="border-b border-gray-800 bg-blue-500/5">
                <td className="py-2 px-4"><input className={inputCls} placeholder="Model" value={newVehicle.model} onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })} /></td>
                <td className="py-2 px-4"><input className={inputCls} placeholder="Plate" value={newVehicle.plate} onChange={e => setNewVehicle({ ...newVehicle, plate: e.target.value })} /></td>
                <td className="py-2 px-4"><Select options={types} value={newVehicle.type} onChange={v => setNewVehicle({ ...newVehicle, type: v })} /></td>
                <td className="py-2 px-4"><Select options={statuses} value={newVehicle.status} onChange={v => setNewVehicle({ ...newVehicle, status: v as any })} /></td>
                <td className="py-2 px-4"><input className={inputCls} placeholder="Location" value={newVehicle.currentLocation} onChange={e => setNewVehicle({ ...newVehicle, currentLocation: e.target.value })} /></td>
                <td className="py-2 px-4">
                  <div className="flex gap-1 justify-end">
                    <IconBtn icon={Save} color="green" onClick={handleAdd} />
                    <IconBtn icon={X} color="red" onClick={() => { setIsAdding(false); setNewVehicle(blank); }} />
                  </div>
                </td>
              </tr>
            )}
            {vehicles.map((v: Vehicle) => (
              <tr key={v.id} className="border-b border-gray-800 hover:bg-gray-800/20">
                {editingId === v.id ? (
                  <>
                    <td className="py-2 px-4"><input className={inputCls} value={editData.model ?? ''} onChange={e => setEditData({ ...editData, model: e.target.value })} /></td>
                    <td className="py-2 px-4"><input className={inputCls} value={editData.plate ?? ''} onChange={e => setEditData({ ...editData, plate: e.target.value })} /></td>
                    <td className="py-2 px-4"><Select options={types} value={editData.type ?? ''} onChange={val => setEditData({ ...editData, type: val })} /></td>
                    <td className="py-2 px-4"><Select options={statuses} value={editData.status ?? ''} onChange={val => setEditData({ ...editData, status: val as any })} /></td>
                    <td className="py-2 px-4"><input className={inputCls} value={editData.currentLocation ?? ''} onChange={e => setEditData({ ...editData, currentLocation: e.target.value })} /></td>
                    <td className="py-2 px-4"><div className="flex gap-1 justify-end"><IconBtn icon={Save} color="green" onClick={saveEdit} /><IconBtn icon={X} color="gray" onClick={() => setEditingId(null)} /></div></td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-4 text-white">{v.model}</td>
                    <td className="py-3 px-4 text-gray-400 font-mono text-sm">{v.plate}</td>
                    <td className="py-3 px-4 text-gray-400">{v.type}</td>
                    <td className="py-3 px-4"><StatusBadge status={v.status} /></td>
                    <td className="py-3 px-4 text-gray-400">{v.currentLocation || '—'}</td>
                    <td className="py-3 px-4"><div className="flex gap-1 justify-end"><IconBtn icon={Edit} color="blue" onClick={() => startEdit(v)} /><IconBtn icon={Trash2} color="red" onClick={() => confirm('Delete this vehicle?') && deleteVehicle(v.id)} /></div></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Employees ─────────────────────────────────────────────────────────────────

function EmployeesTab({ employees, departments, addEmployee, updateEmployee, deleteEmployee }: any) {
  const blank = { name: '', email: '', sector: '', role: 'user' as const };
  const [isAdding, setIsAdding] = useState(false);
  const [newEmp, setNewEmp] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Employee>>({});

  const startEdit = (e: Employee) => { setEditingId(e.id); setEditData({ ...e }); };
  const saveEdit = () => { updateEmployee(editingId, editData); setEditingId(null); };

  const handleAdd = () => {
    if (newEmp.name && newEmp.email && newEmp.sector) {
      addEmployee(newEmp);
      setNewEmp(blank);
      setIsAdding(false);
    }
  };

  const SectorSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <select value={value} onChange={e => onChange(e.target.value)} className={inputCls}>
      <option value="">Select sector</option>
      {departments.filter((d: any) => !d.parent).map((dept: any) => (
        <optgroup key={dept.id} label={dept.name}>
          <option value={dept.name}>{dept.name}</option>
          {departments.filter((d: any) => d.parent === dept.id).map((sub: any) => (
            <option key={sub.id} value={`${dept.name} - ${sub.name}`}>{dept.name} - {sub.name}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Employees ({employees.length})</h3>
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              {['Name', 'Email', 'Sector', 'Role', ''].map(h => (
                <th key={h} className="text-left text-gray-400 text-sm font-medium py-3 px-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr className="border-b border-gray-800 bg-blue-500/5">
                <td className="py-2 px-4"><input className={inputCls} placeholder="Full name" value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} /></td>
                <td className="py-2 px-4"><input className={inputCls} type="email" placeholder="email@company.com" value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} /></td>
                <td className="py-2 px-4"><SectorSelect value={newEmp.sector} onChange={v => setNewEmp({ ...newEmp, sector: v })} /></td>
                <td className="py-2 px-4"><Select options={['user', 'admin']} value={newEmp.role} onChange={v => setNewEmp({ ...newEmp, role: v as any })} /></td>
                <td className="py-2 px-4"><div className="flex gap-1 justify-end"><IconBtn icon={Save} color="green" onClick={handleAdd} /><IconBtn icon={X} color="red" onClick={() => { setIsAdding(false); setNewEmp(blank); }} /></div></td>
              </tr>
            )}
            {employees.map((emp: Employee) => (
              <tr key={emp.id} className="border-b border-gray-800 hover:bg-gray-800/20">
                {editingId === emp.id ? (
                  <>
                    <td className="py-2 px-4"><input className={inputCls} value={editData.name ?? ''} onChange={e => setEditData({ ...editData, name: e.target.value })} /></td>
                    <td className="py-2 px-4"><input className={inputCls} type="email" value={editData.email ?? ''} onChange={e => setEditData({ ...editData, email: e.target.value })} /></td>
                    <td className="py-2 px-4"><SectorSelect value={editData.sector ?? ''} onChange={v => setEditData({ ...editData, sector: v })} /></td>
                    <td className="py-2 px-4"><Select options={['user', 'admin']} value={editData.role ?? 'user'} onChange={v => setEditData({ ...editData, role: v as any })} /></td>
                    <td className="py-2 px-4"><div className="flex gap-1 justify-end"><IconBtn icon={Save} color="green" onClick={saveEdit} /><IconBtn icon={X} color="gray" onClick={() => setEditingId(null)} /></div></td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-4 text-white">{emp.name}</td>
                    <td className="py-3 px-4 text-gray-400 text-sm">{emp.email}</td>
                    <td className="py-3 px-4 text-gray-400 text-sm">{emp.sector}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${emp.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>{emp.role}</span>
                    </td>
                    <td className="py-3 px-4"><div className="flex gap-1 justify-end"><IconBtn icon={Edit} color="blue" onClick={() => startEdit(emp)} /><IconBtn icon={Trash2} color="red" onClick={() => confirm('Delete this employee?') && deleteEmployee(emp.id)} /></div></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Projects ──────────────────────────────────────────────────────────────────

function ProjectsTab({ projects, addProject, updateProject, deleteProject }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', kmPerDay: 100 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Project>>({});

  const startEdit = (p: Project) => { setEditingId(p.id); setEditData({ ...p }); };
  const saveEdit = () => { updateProject(editingId, editData); setEditingId(null); };

  const handleAdd = () => {
    if (newProject.name.trim()) {
      addProject(newProject);
      setNewProject({ name: '', kmPerDay: 100 });
      setIsAdding(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Projects ({projects.length})</h3>
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Project Name</th>
              <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Km / Day</th>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr className="border-b border-gray-800 bg-blue-500/5">
                <td className="py-2 px-4"><input className={inputCls} placeholder="Project name" value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} /></td>
                <td className="py-2 px-4"><input className={inputCls} type="number" min={0} value={newProject.kmPerDay} onChange={e => setNewProject({ ...newProject, kmPerDay: parseInt(e.target.value) || 0 })} /></td>
                <td className="py-2 px-4"><div className="flex gap-1 justify-end"><IconBtn icon={Save} color="green" onClick={handleAdd} /><IconBtn icon={X} color="red" onClick={() => setIsAdding(false)} /></div></td>
              </tr>
            )}
            {projects.map((p: Project) => (
              <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/20">
                {editingId === p.id ? (
                  <>
                    <td className="py-2 px-4"><input className={inputCls} value={editData.name ?? ''} onChange={e => setEditData({ ...editData, name: e.target.value })} /></td>
                    <td className="py-2 px-4"><input className={inputCls} type="number" min={0} value={editData.kmPerDay ?? 0} onChange={e => setEditData({ ...editData, kmPerDay: parseInt(e.target.value) || 0 })} /></td>
                    <td className="py-2 px-4"><div className="flex gap-1 justify-end"><IconBtn icon={Save} color="green" onClick={saveEdit} /><IconBtn icon={X} color="gray" onClick={() => setEditingId(null)} /></div></td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-4 text-white">{p.name}</td>
                    <td className="py-3 px-4 text-gray-400">{p.kmPerDay} km/day</td>
                    <td className="py-3 px-4"><div className="flex gap-1 justify-end"><IconBtn icon={Edit} color="blue" onClick={() => startEdit(p)} /><IconBtn icon={Trash2} color="red" onClick={() => confirm('Delete this project?') && deleteProject(p.id)} /></div></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Sectors ───────────────────────────────────────────────────────────────────

function SectorsTab({ sectors, addDepartment, deleteDepartment }: any) {
  const [newDept, setNewDept] = useState({ name: '', parent: '' });
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newDept.name.trim()) {
      addDepartment({ name: newDept.name, parent: newDept.parent || undefined });
      setNewDept({ name: '', parent: '' });
      setIsAdding(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Sectors & Departments ({sectors.length})</h3>
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
          <Plus className="w-4 h-4" /> Add Sector
        </button>
      </div>

      {isAdding && (
        <div className="mb-4 bg-blue-500/5 border border-blue-500/30 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Name *</label>
              <input className={inputCls} placeholder="Sector name" value={newDept.name} onChange={e => setNewDept({ ...newDept, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Parent (optional)</label>
              <select className={inputCls} value={newDept.parent} onChange={e => setNewDept({ ...newDept, parent: e.target.value })}>
                <option value="">None (top-level)</option>
                {sectors.filter((s: Department) => !s.parent).map((d: Department) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">Save</button>
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sectors.filter((s: Department) => !s.parent).map((sector: Department) => {
          const children = sectors.filter((s: Department) => s.parent === sector.id);
          return (
            <div key={sector.id} className="bg-[#0f1117] border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{sector.name}</span>
                <IconBtn icon={Trash2} color="red" onClick={() => confirm('Delete this department and all sub-departments?') && deleteDepartment(sector.id)} />
              </div>
              {children.length > 0 && (
                <div className="pl-4 space-y-1 border-l-2 border-gray-700 mt-2">
                  {children.map((child: Department) => (
                    <div key={child.id} className="flex items-center justify-between py-1">
                      <span className="text-gray-400 text-sm">{child.name}</span>
                      <IconBtn icon={Trash2} color="red" onClick={() => confirm('Delete this sub-department?') && deleteDepartment(child.id)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── All Reservations ──────────────────────────────────────────────────────────

function ReservationsTab({ reservations, vehicles, onApprove, onReject }: any) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filtered = reservations.filter((r: any) => filter === 'all' || r.status === filter);

  const getStatusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'pending') return <Clock className="w-4 h-4 text-orange-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">All Reservations ({filtered.length})</h3>
        <div className="flex gap-1">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors capitalize ${filter === f ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-gray-400 text-sm">No reservations found.</p>}
        {filtered.map((res: any) => {
          const vehicle = vehicles.find((v: any) => v.id === res.vehicleId);
          return (
            <div key={res.id} className="bg-[#0f1117] border border-gray-700 rounded-lg p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {getStatusIcon(res.status)}
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{res.bookerName} — {vehicle?.plate ?? '?'} ({vehicle?.model ?? '?'})</p>
                  <p className="text-gray-400 text-xs">{res.sector}{res.project ? ` · ${res.project}` : ''}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {new Date(res.startDate).toLocaleDateString('en-GB')} → {new Date(res.endDate).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
              {res.status === 'pending' && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => onApprove(res.id)} className="px-3 py-1.5 bg-green-600/20 border border-green-600/50 text-green-400 rounded-lg text-sm hover:bg-green-600/30 transition-colors">Approve</button>
                  <button onClick={() => onReject(res.id)} className="px-3 py-1.5 bg-red-600/20 border border-red-600/50 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition-colors">Reject</button>
                </div>
              )}
              {res.status === 'approved' && res.approvedBy && (
                <p className="text-gray-500 text-xs flex-shrink-0">Approved by {res.approvedBy}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

const inputCls = 'w-full bg-[#0f1117] border border-gray-700 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500';

function Select({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={inputCls}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function IconBtn({ icon: Icon, color, onClick }: { icon: any; color: 'green' | 'red' | 'blue' | 'gray'; onClick: () => void }) {
  const colors = {
    green: 'text-green-500 hover:bg-green-500/10',
    red: 'text-red-500 hover:bg-red-500/10',
    blue: 'text-blue-500 hover:bg-blue-500/10',
    gray: 'text-gray-400 hover:bg-gray-500/10',
  };
  return (
    <button onClick={onClick} className={`p-1.5 rounded transition-colors ${colors[color]}`}>
      <Icon className="w-4 h-4" />
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    available: 'bg-green-500/20 text-green-400',
    booked: 'bg-red-500/20 text-red-400',
    maintenance: 'bg-orange-500/20 text-orange-400',
  };
  return <span className={`px-2 py-1 rounded-full text-xs ${styles[status] ?? 'bg-gray-500/20 text-gray-400'}`}>{status}</span>;
}
