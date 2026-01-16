import { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useFleet } from '../context/FleetContext';
import { type Vehicle, type Employee, type Project, type Department } from '../data/mockData';

export function AdminPage() {
  const { 
    vehicles, 
    employees, 
    projects, 
    departments,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addProject,
    updateProject,
    deleteProject,
    addDepartment,
    updateDepartment,
    deleteDepartment
  } = useFleet();

  const [activeTab, setActiveTab] = useState<'vehicles' | 'employees' | 'projects' | 'sectors'>('vehicles');

  const tabs = [
    { id: 'vehicles' as const, label: 'Manage Vehicles' },
    { id: 'employees' as const, label: 'Manage Employees' },
    { id: 'projects' as const, label: 'Manage Projects' },
    { id: 'sectors' as const, label: 'Manage Sectors' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-white mb-6">Admin Dashboard</h2>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-blue-500 border-blue-500'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === 'vehicles' && (
            <VehiclesTab
              vehicles={vehicles}
              addVehicle={addVehicle}
              updateVehicle={updateVehicle}
              deleteVehicle={deleteVehicle}
            />
          )}
          {activeTab === 'employees' && (
            <EmployeesTab
              employees={employees}
              departments={departments}
              addEmployee={addEmployee}
              updateEmployee={updateEmployee}
              deleteEmployee={deleteEmployee}
            />
          )}
          {activeTab === 'projects' && (
            <ProjectsTab
              projects={projects}
              addProject={addProject}
              updateProject={updateProject}
              deleteProject={deleteProject}
            />
          )}
          {activeTab === 'sectors' && (
            <SectorsTab
              sectors={departments}
              addDepartment={addDepartment}
              updateDepartment={updateDepartment}
              deleteDepartment={deleteDepartment}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function VehiclesTab({ vehicles, addVehicle, updateVehicle, deleteVehicle }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    model: '',
    plate: '',
    type: 'SUV',
    status: 'available' as 'available' | 'booked' | 'maintenance',
    currentLocation: 'Main Office'
  });

  const handleAdd = () => {
    if (newVehicle.model && newVehicle.plate) {
      addVehicle(newVehicle);
      setNewVehicle({
        model: '',
        plate: '',
        type: 'SUV',
        status: 'available',
        currentLocation: 'Main Office'
      });
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      deleteVehicle(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Vehicles ({vehicles.length})</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Model</th>
              <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Plate</th>
              <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Type</th>
              <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Status</th>
              <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Location</th>
              <th className="text-right text-gray-400 text-sm font-medium py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr className="border-b border-gray-800 bg-blue-500/5">
                <td className="py-3 px-4">
                  <input
                    type="text"
                    placeholder="Enter model"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    className="w-full bg-[#0f1117] border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="text"
                    placeholder="Enter plate"
                    value={newVehicle.plate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                    className="w-full bg-[#0f1117] border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
                  />
                </td>
                <td className="py-3 px-4">
                  <select 
                    value={newVehicle.type}
                    onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                    className="w-full bg-[#0f1117] border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
                  >
                    <option>SUV</option>
                    <option>Compact SUV</option>
                    <option>Sedan</option>
                    <option>City Car</option>
                    <option>Van</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={newVehicle.status}
                    onChange={(e) => setNewVehicle({ ...newVehicle, status: e.target.value as any })}
                    className="w-full bg-[#0f1117] border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
                  >
                    <option value="available">available</option>
                    <option value="booked">booked</option>
                    <option value="maintenance">maintenance</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  <input
                    type="text"
                    placeholder="Enter location"
                    value={newVehicle.currentLocation}
                    onChange={(e) => setNewVehicle({ ...newVehicle, currentLocation: e.target.value })}
                    className="w-full bg-[#0f1117] border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
                  />
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={handleAdd}
                      className="p-1.5 text-green-500 hover:bg-green-500/10 rounded"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsAdding(false)}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {vehicles.map((vehicle: Vehicle) => (
              <tr key={vehicle.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                <td className="py-3 px-4 text-white">{vehicle.model}</td>
                <td className="py-3 px-4 text-gray-400 font-mono text-sm">{vehicle.plate}</td>
                <td className="py-3 px-4 text-gray-400">{vehicle.type}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    vehicle.status === 'available'
                      ? 'bg-green-500/20 text-green-500'
                      : vehicle.status === 'booked'
                      ? 'bg-red-500/20 text-red-500'
                      : 'bg-orange-500/20 text-orange-500'
                  }`}>
                    {vehicle.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400">{vehicle.currentLocation || '-'}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmployeesTab({ employees, departments, addEmployee, updateEmployee, deleteEmployee }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    sector: '',
    role: 'user' as 'user' | 'admin'
  });

  const handleAdd = () => {
    if (newEmployee.name && newEmployee.email && newEmployee.sector) {
      addEmployee(newEmployee);
      setNewEmployee({
        name: '',
        email: '',
        sector: '',
        role: 'user'
      });
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Employees ({employees.length})</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Name</th>
              <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Email</th>
              <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Sector</th>
              <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Role</th>
              <th className="text-right text-gray-400 text-sm font-medium py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr className="border-b border-gray-800 bg-blue-500/5">
                <td className="py-3 px-4">
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    className="w-full bg-[#0f1117] border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    className="w-full bg-[#0f1117] border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
                  />
                </td>
                <td className="py-3 px-4">
                  <select
                    value={newEmployee.sector}
                    onChange={(e) => setNewEmployee({ ...newEmployee, sector: e.target.value })}
                    className="w-full bg-[#0f1117] border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
                  >
                    <option value="">Select sector</option>
                    {departments.filter((d: any) => !d.parent).map((dept: any) => (
                      <optgroup key={dept.id} label={dept.name}>
                        <option value={dept.name}>{dept.name}</option>
                        {departments
                          .filter((d: any) => d.parent === dept.id)
                          .map((subDept: any) => (
                            <option key={subDept.id} value={`${dept.name} - ${subDept.name}`}>
                              {dept.name} - {subDept.name}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value as any })}
                    className="w-full bg-[#0f1117] border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={handleAdd}
                      className="p-1.5 text-green-500 hover:bg-green-500/10 rounded"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsAdding(false)}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {employees.map((employee: Employee) => (
              <tr key={employee.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                <td className="py-3 px-4 text-white">{employee.name}</td>
                <td className="py-3 px-4 text-gray-400">{employee.email}</td>
                <td className="py-3 px-4 text-gray-400">{employee.sector}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    employee.role === 'admin'
                      ? 'bg-purple-500/20 text-purple-500'
                      : 'bg-blue-500/20 text-blue-500'
                  }`}>
                    {employee.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProjectsTab({ projects, addProject, updateProject, deleteProject }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingKm, setEditingKm] = useState<number>(0);
  const [newProject, setNewProject] = useState({ name: '', kmPerDay: 100 });

  const handleAdd = () => {
    if (newProject.name.trim()) {
      addProject(newProject);
      setNewProject({ name: '', kmPerDay: 100 });
      setIsAdding(false);
    }
  };

  const handleUpdateKm = (id: string) => {
    updateProject(id, { kmPerDay: editingKm });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Projects ({projects.length})</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Project Name</th>
              <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Kilometers per Day</th>
              <th className="text-right text-gray-400 text-sm font-medium py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr className="border-b border-gray-800 bg-blue-500/5">
                <td className="py-3 px-4">
                  <input
                    type="text"
                    placeholder="Enter project name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="w-full bg-[#0f1117] border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="number"
                    placeholder="Enter km/day"
                    value={newProject.kmPerDay}
                    onChange={(e) => setNewProject({ ...newProject, kmPerDay: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#0f1117] border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
                  />
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={handleAdd}
                      className="p-1.5 text-green-500 hover:bg-green-500/10 rounded"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsAdding(false)}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {projects.map((project: Project) => (
              <tr key={project.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                <td className="py-3 px-4 text-white">{project.name}</td>
                <td className="py-3 px-4">
                  {editingId === project.id ? (
                    <input
                      type="number"
                      value={editingKm}
                      onChange={(e) => setEditingKm(parseInt(e.target.value) || 0)}
                      className="w-24 bg-[#0f1117] border border-blue-500 rounded px-3 py-1.5 text-white text-sm"
                      autoFocus
                    />
                  ) : (
                    <span className="text-gray-400">{project.kmPerDay} km/day</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {editingId === project.id ? (
                      <>
                        <button
                          onClick={() => handleUpdateKm(project.id)}
                          className="p-1.5 text-green-500 hover:bg-green-500/10 rounded"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 text-gray-500 hover:bg-gray-500/10 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(project.id);
                            setEditingKm(project.kmPerDay);
                          }}
                          className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectorsTab({ sectors, addDepartment, updateDepartment, deleteDepartment }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ name: '', parent: '' });

  const handleAdd = () => {
    if (newDepartment.name.trim()) {
      addDepartment({
        name: newDepartment.name,
        parent: newDepartment.parent || undefined
      });
      setNewDepartment({ name: '', parent: '' });
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this department? All sub-departments will also be deleted.')) {
      deleteDepartment(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Sectors & Departments ({sectors.length})</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {isAdding && (
        <div className="mb-4 bg-blue-500/5 border border-blue-500/50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Department Name *</label>
              <input
                type="text"
                placeholder="Enter department name"
                value={newDepartment.name}
                onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                className="w-full bg-[#0f1117] border border-gray-700 rounded px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Parent Department (optional)</label>
              <select
                value={newDepartment.parent}
                onChange={(e) => setNewDepartment({ ...newDepartment, parent: e.target.value })}
                className="w-full bg-[#0f1117] border border-gray-700 rounded px-3 py-2 text-white text-sm"
              >
                <option value="">None (Top-level)</option>
                {sectors.filter((s: Department) => !s.parent).map((dept: Department) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewDepartment({ name: '', parent: '' });
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {sectors.filter((s: Department) => !s.parent).map((sector: Department) => {
          const children = sectors.filter((s: Department) => s.parent === sector.id);
          
          return (
            <div key={sector.id} className="bg-[#0f1117] border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">{sector.name}</span>
                <button
                  onClick={() => handleDelete(sector.id)}
                  className="p-1.5 text-red-500 hover:bg-red-500/10 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              {children.length > 0 && (
                <div className="pl-4 space-y-2 border-l-2 border-gray-700">
                  {children.map((child: Department) => (
                    <div key={child.id} className="flex items-center justify-between py-1">
                      <span className="text-gray-400 text-sm">{child.name}</span>
                      <button
                        onClick={() => handleDelete(child.id)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
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
