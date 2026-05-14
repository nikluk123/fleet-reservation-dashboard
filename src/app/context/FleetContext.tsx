import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  type Vehicle,
  type Reservation,
  type Employee,
  type Department,
  type Project,
} from '../data/mockData';
import { supabase } from '../../lib/supabaseClient';
import { notifyAdminsNewRequest, notifyUserStatusChange } from '../../lib/emailService';
import { toast } from 'sonner';

interface Activity {
  id: string;
  type: 'reservation_created' | 'reservation_approved' | 'reservation_rejected' | 'vehicle_added' | 'employee_added';
  message: string;
  timestamp: Date;
  user: string;
}

interface FleetContextType {
  vehicles: Vehicle[];
  reservations: Reservation[];
  employees: Employee[];
  projects: Project[];
  departments: Department[];
  currentUser: Employee;
  activities: Activity[];

  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  addReservation: (reservation: Omit<Reservation, 'id'>) => void;
  updateReservation: (id: string, reservation: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;
  approveReservation: (id: string) => void;
  rejectReservation: (id: string) => void;
  cancelReservation: (id: string) => void;

  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addDepartment: (department: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, department: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  setCurrentUser: (user: Employee) => void;
  logout: () => void;
  changePassword: (currentPwd: string, newPwd: string) => Promise<'ok' | 'wrong-password'>;

  getVehicleStatus: (vehicleId: string) => 'available' | 'booked' | 'pending' | 'maintenance';
  isVehicleAvailableNow: (vehicleId: string) => boolean;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

// ── DB row → TypeScript object mappers ───────────────────────────────────────

const mapVehicle = (row: any): Vehicle => ({
  id: row.id,
  model: row.model,
  plate: row.plate,
  type: row.type,
  status: row.status,
  currentLocation: row.current_location ?? undefined,
  lastUser: row.last_user ?? undefined,
});

const mapEmployee = (row: any): Employee => ({
  id: row.id,
  name: row.name,
  email: row.email,
  sector: row.sector,
  role: row.role,
  vacationRole: row.vacation_role ?? 'user',
  vacationDaysTotal: row.vacation_days_total ?? 20,
});

const mapProject = (row: any): Project => ({
  id: row.id,
  name: row.name,
  kmPerDay: row.km_per_day,
});

const mapDepartment = (row: any): Department => ({
  id: row.id,
  name: row.name,
  parent: row.parent ?? undefined,
});

const mapReservation = (row: any): Reservation => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  bookerName: row.booker_name,
  sector: row.sector,
  project: row.project ?? undefined,
  startDate: row.start_date,
  endDate: row.end_date,
  notes: row.notes ?? undefined,
  status: row.status,
  approvedBy: row.approved_by ?? undefined,
  approvedAt: row.approved_at ?? undefined,
});

// ─────────────────────────────────────────────────────────────────────────────

export function FleetProvider({ children, initialUser }: { children: ReactNode; initialUser: Employee }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentUser, setCurrentUserState] = useState<Employee>(initialUser);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Load all data from Supabase on mount
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [v, e, p, d, r] = await Promise.all([
          supabase.from('vehicles').select('*').order('plate'),
          supabase.from('employees').select('id, name, email, sector, role').order('name'),
          supabase.from('projects').select('*').order('name'),
          supabase.from('departments').select('*'),
          supabase.from('reservations').select('*').order('start_date'),
        ]);

        if (v.error) throw v.error;
        if (e.error) throw e.error;
        if (p.error) throw p.error;
        if (d.error) throw d.error;
        if (r.error) throw r.error;

        setVehicles((v.data ?? []).map(mapVehicle));
        setEmployees((e.data ?? []).map(mapEmployee));
        setProjects((p.data ?? []).map(mapProject));
        setDepartments((d.data ?? []).map(mapDepartment));
        setReservations((r.data ?? []).map(mapReservation));
      } catch (err) {
        console.error('Failed to load data from Supabase:', err);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  // Update in-memory vehicle status based on active reservations (not persisted)
  useEffect(() => {
    const now = new Date();
    setVehicles(prev =>
      prev.map(vehicle => {
        if (vehicle.status === 'maintenance') return vehicle;

        const active = reservations.find(res =>
          res.vehicleId === vehicle.id &&
          res.status === 'approved' &&
          new Date(res.startDate) <= now &&
          new Date(res.endDate) >= now
        );

        if (active) return { ...vehicle, status: 'booked' as const, lastUser: active.bookerName };
        if (vehicle.status === 'booked') return { ...vehicle, status: 'available' as const };
        return vehicle;
      })
    );
  }, [reservations]);

  const addActivity = (type: Activity['type'], message: string, user: string) => {
    setActivities(prev => [
      { id: Date.now().toString(), type, message, timestamp: new Date(), user },
      ...prev,
    ].slice(0, 10));
  };

  // ── Vehicles ──────────────────────────────────────────────────────────────

  const addVehicle = async (vehicleData: Omit<Vehicle, 'id'>) => {
    const newId = Date.now().toString();
    setVehicles(prev => [...prev, { ...vehicleData, id: newId }]);

    const { error } = await supabase.from('vehicles').insert({
      id: newId,
      model: vehicleData.model,
      plate: vehicleData.plate,
      type: vehicleData.type,
      status: vehicleData.status,
      current_location: vehicleData.currentLocation ?? null,
      last_user: vehicleData.lastUser ?? null,
    });

    if (error) {
      setVehicles(prev => prev.filter(v => v.id !== newId));
      toast.error('Failed to save vehicle');
      return;
    }

    addActivity('vehicle_added', `Vehicle ${vehicleData.plate} added`, currentUser.name);
    toast.success(`Vehicle ${vehicleData.plate} added successfully`);
  };

  const updateVehicle = async (id: string, vehicleData: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...vehicleData } : v));

    const db: Record<string, unknown> = {};
    if (vehicleData.model !== undefined) db.model = vehicleData.model;
    if (vehicleData.plate !== undefined) db.plate = vehicleData.plate;
    if (vehicleData.type !== undefined) db.type = vehicleData.type;
    if (vehicleData.status !== undefined) db.status = vehicleData.status;
    if (vehicleData.currentLocation !== undefined) db.current_location = vehicleData.currentLocation;
    if (vehicleData.lastUser !== undefined) db.last_user = vehicleData.lastUser;

    const { error } = await supabase.from('vehicles').update(db).eq('id', id);
    if (error) toast.error('Failed to update vehicle');
    else toast.success('Vehicle updated successfully');
  };

  const deleteVehicle = async (id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    setVehicles(prev => prev.filter(v => v.id !== id));

    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) toast.error('Failed to delete vehicle');
    else toast.success(`Vehicle ${vehicle?.plate} deleted`);
  };

  // ── Reservations ──────────────────────────────────────────────────────────

  const addReservation = async (reservationData: Omit<Reservation, 'id'>) => {
    const newId = Date.now().toString();
    setReservations(prev => [...prev, { ...reservationData, id: newId }]);

    const { error } = await supabase.from('reservations').insert({
      id: newId,
      vehicle_id: reservationData.vehicleId,
      booker_name: reservationData.bookerName,
      sector: reservationData.sector,
      project: reservationData.project ?? null,
      start_date: reservationData.startDate,
      end_date: reservationData.endDate,
      notes: reservationData.notes ?? null,
      status: reservationData.status,
      approved_by: reservationData.approvedBy ?? null,
      approved_at: reservationData.approvedAt ?? null,
    });

    if (error) {
      setReservations(prev => prev.filter(r => r.id !== newId));
      toast.error('Failed to save reservation');
      return;
    }

    const vehicle = vehicles.find(v => v.id === reservationData.vehicleId);
    addActivity('reservation_created', `New reservation for ${vehicle?.plate} by ${reservationData.bookerName}`, currentUser.name);
    toast.success('Reservation submitted for approval');

    if (vehicle) {
      const admins = employees.filter(e => e.role === 'admin');
      notifyAdminsNewRequest(reservationData, vehicle, admins);
    }
  };

  const updateReservation = async (id: string, reservationData: Partial<Reservation>) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, ...reservationData } : r));

    const db: Record<string, unknown> = {};
    if (reservationData.status !== undefined) db.status = reservationData.status;
    if (reservationData.approvedBy !== undefined) db.approved_by = reservationData.approvedBy;
    if (reservationData.approvedAt !== undefined) db.approved_at = reservationData.approvedAt;
    if (reservationData.notes !== undefined) db.notes = reservationData.notes;
    if (reservationData.project !== undefined) db.project = reservationData.project;
    if (reservationData.startDate !== undefined) db.start_date = reservationData.startDate;
    if (reservationData.endDate !== undefined) db.end_date = reservationData.endDate;

    const { error } = await supabase.from('reservations').update(db).eq('id', id);
    if (error) toast.error('Failed to update reservation');
    else toast.success('Reservation updated');
  };

  const deleteReservation = async (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));

    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (error) toast.error('Failed to delete reservation');
    else toast.success('Reservation deleted');
  };

  const approveReservation = async (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    const vehicle = vehicles.find(v => v.id === reservation?.vehicleId);
    const now = new Date().toISOString();

    setReservations(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'approved' as const, approvedBy: currentUser.name, approvedAt: now } : r
    ));

    const { error } = await supabase.from('reservations').update({
      status: 'approved',
      approved_by: currentUser.name,
      approved_at: now,
    }).eq('id', id);

    if (error) {
      toast.error('Failed to approve reservation');
      return;
    }

    if (reservation && vehicle) {
      addActivity('reservation_approved', `Reservation for ${vehicle.plate} approved for ${reservation.bookerName}`, currentUser.name);
      const booker = employees.find(e => e.name === reservation.bookerName);
      if (booker) {
        const approved: Reservation = { ...reservation, status: 'approved', approvedBy: currentUser.name, approvedAt: now };
        notifyUserStatusChange(approved, vehicle, 'approved', currentUser.name, booker.email);
      }
    }
    toast.success('Reservation approved');
  };

  const rejectReservation = async (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    const vehicle = vehicles.find(v => v.id === reservation?.vehicleId);

    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r));

    const { error } = await supabase.from('reservations').update({ status: 'rejected' }).eq('id', id);

    if (error) {
      toast.error('Failed to reject reservation');
      return;
    }

    if (reservation && vehicle) {
      addActivity('reservation_rejected', `Reservation for ${vehicle.plate} rejected for ${reservation.bookerName}`, currentUser.name);
      const booker = employees.find(e => e.name === reservation.bookerName);
      if (booker) {
        const rejected: Reservation = { ...reservation, status: 'rejected' };
        notifyUserStatusChange(rejected, vehicle, 'rejected', currentUser.name, booker.email);
      }
    }
    toast.error('Reservation rejected');
  };

  const cancelReservation = async (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    if (!reservation) return;
    if (reservation.bookerName !== currentUser.name && currentUser.role !== 'admin') return;

    setReservations(prev => prev.filter(r => r.id !== id));

    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (error) toast.error('Failed to cancel reservation');
    else toast.success('Reservation cancelled');
  };

  // ── Employees ─────────────────────────────────────────────────────────────

  const addEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    const newId = Date.now().toString();
    setEmployees(prev => [...prev, { ...employeeData, id: newId }]);

    const { error } = await supabase.from('employees').insert({
      id: newId,
      name: employeeData.name,
      email: employeeData.email,
      sector: employeeData.sector,
      role: employeeData.role,
      password: 'fleet2026',
    });

    if (error) {
      setEmployees(prev => prev.filter(e => e.id !== newId));
      toast.error('Failed to add employee');
      return;
    }

    addActivity('employee_added', `Employee ${employeeData.name} added`, currentUser.name);
    toast.success(`Employee ${employeeData.name} added`);
  };

  const updateEmployee = async (id: string, employeeData: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...employeeData } : e));
    if (id === currentUser.id) setCurrentUserState(prev => ({ ...prev, ...employeeData }));

    const db: Record<string, unknown> = {};
    if (employeeData.name !== undefined) db.name = employeeData.name;
    if (employeeData.email !== undefined) db.email = employeeData.email;
    if (employeeData.sector !== undefined) db.sector = employeeData.sector;
    if (employeeData.role !== undefined) db.role = employeeData.role;

    const { error } = await supabase.from('employees').update(db).eq('id', id);
    if (error) toast.error('Failed to update employee');
    else toast.success('Employee updated');
  };

  const deleteEmployee = async (id: string) => {
    const employee = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(e => e.id !== id));

    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) toast.error('Failed to delete employee');
    else toast.success(`Employee ${employee?.name} deleted`);
  };

  // ── Projects ──────────────────────────────────────────────────────────────

  const addProject = async (projectData: Omit<Project, 'id'>) => {
    const newId = Date.now().toString();
    setProjects(prev => [...prev, { ...projectData, id: newId }]);

    const { error } = await supabase.from('projects').insert({
      id: newId,
      name: projectData.name,
      km_per_day: projectData.kmPerDay,
    });

    if (error) {
      setProjects(prev => prev.filter(p => p.id !== newId));
      toast.error('Failed to add project');
      return;
    }

    toast.success(`Project "${projectData.name}" added`);
  };

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...projectData } : p));

    const db: Record<string, unknown> = {};
    if (projectData.name !== undefined) db.name = projectData.name;
    if (projectData.kmPerDay !== undefined) db.km_per_day = projectData.kmPerDay;

    const { error } = await supabase.from('projects').update(db).eq('id', id);
    if (error) toast.error('Failed to update project');
    else toast.success('Project updated');
  };

  const deleteProject = async (id: string) => {
    const project = projects.find(p => p.id === id);
    setProjects(prev => prev.filter(p => p.id !== id));

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) toast.error('Failed to delete project');
    else toast.success(`Project "${project?.name}" deleted`);
  };

  // ── Departments ───────────────────────────────────────────────────────────

  const addDepartment = async (departmentData: Omit<Department, 'id'>) => {
    const newId = `dept-${Date.now()}`;
    setDepartments(prev => [...prev, { ...departmentData, id: newId }]);

    const { error } = await supabase.from('departments').insert({
      id: newId,
      name: departmentData.name,
      parent: departmentData.parent ?? null,
    });

    if (error) {
      setDepartments(prev => prev.filter(d => d.id !== newId));
      toast.error('Failed to add department');
      return;
    }

    toast.success(`Department "${departmentData.name}" added`);
  };

  const updateDepartment = async (id: string, departmentData: Partial<Department>) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...departmentData } : d));

    const db: Record<string, unknown> = {};
    if (departmentData.name !== undefined) db.name = departmentData.name;
    if (departmentData.parent !== undefined) db.parent = departmentData.parent ?? null;

    const { error } = await supabase.from('departments').update(db).eq('id', id);
    if (error) toast.error('Failed to update department');
    else toast.success('Department updated');
  };

  const deleteDepartment = async (id: string) => {
    const department = departments.find(d => d.id === id);
    const childIds = departments.filter(d => d.parent === id).map(d => d.id);
    setDepartments(prev => prev.filter(d => d.id !== id && d.parent !== id));

    if (childIds.length > 0) {
      await supabase.from('departments').delete().in('id', childIds);
    }
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) toast.error('Failed to delete department');
    else toast.success(`Department "${department?.name}" deleted`);
  };

  // ── Auth ──────────────────────────────────────────────────────────────────

  const setCurrentUser = (user: Employee) => setCurrentUserState(user);

  const logout = () => {
    localStorage.removeItem('fleetflow_user_id');
    window.location.reload();
  };

  const changePassword = async (currentPwd: string, newPwd: string): Promise<'ok' | 'wrong-password'> => {
    const { data, error } = await supabase
      .from('employees')
      .select('password')
      .eq('id', currentUser.id)
      .single();

    if (error || !data || data.password !== currentPwd) return 'wrong-password';

    await supabase.from('employees').update({ password: newPwd }).eq('id', currentUser.id);
    return 'ok';
  };

  // ── Computed status ───────────────────────────────────────────────────────

  const getVehicleStatus = (vehicleId: string): 'available' | 'booked' | 'pending' | 'maintenance' => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return 'available';
    if (vehicle.status === 'maintenance') return 'maintenance';

    const now = new Date();

    const hasApproved = reservations.some(res =>
      res.vehicleId === vehicleId &&
      res.status === 'approved' &&
      new Date(res.startDate) <= now &&
      new Date(res.endDate) >= now
    );
    if (hasApproved) return 'booked';

    const hasPending = reservations.some(res =>
      res.vehicleId === vehicleId &&
      res.status === 'pending' &&
      new Date(res.startDate) <= now &&
      new Date(res.endDate) >= now
    );
    if (hasPending) return 'pending';

    return 'available';
  };

  const isVehicleAvailableNow = (vehicleId: string): boolean => {
    return getVehicleStatus(vehicleId) === 'available';
  };

  // ── Loading / Error ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center text-center px-4">
        <div>
          <p className="text-red-400 text-lg font-semibold mb-2">Database connection failed</p>
          <p className="text-gray-400 text-sm mb-4">Check your internet connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const value: FleetContextType = {
    vehicles,
    reservations,
    employees,
    projects,
    departments,
    currentUser,
    activities,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addReservation,
    updateReservation,
    deleteReservation,
    approveReservation,
    rejectReservation,
    cancelReservation,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addProject,
    updateProject,
    deleteProject,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    setCurrentUser,
    logout,
    changePassword,
    getVehicleStatus,
    isVehicleAvailableNow,
  };

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet() {
  const context = useContext(FleetContext);
  if (context === undefined) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
}
