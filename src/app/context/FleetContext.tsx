import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  vehicles as initialVehicles,
  reservations as initialReservations,
  employees as initialEmployees,
  projects as initialProjects,
  departments as initialDepartments,
  type Vehicle,
  type Reservation,
  type Employee,
  type Department,
  type Project
} from '../data/mockData';
import { loadState, saveState } from '../../lib/storage';
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

  getVehicleStatus: (vehicleId: string) => 'available' | 'booked' | 'pending' | 'maintenance';
  isVehicleAvailableNow: (vehicleId: string) => boolean;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export function FleetProvider({ children, initialUser }: { children: ReactNode; initialUser?: Employee }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => loadState('vehicles', initialVehicles));
  const [reservations, setReservations] = useState<Reservation[]>(() => loadState('reservations', initialReservations));
  const [employees, setEmployees] = useState<Employee[]>(() => loadState('employees', initialEmployees));
  const [projects, setProjects] = useState<Project[]>(() => loadState('projects', initialProjects));
  const [departments, setDepartments] = useState<Department[]>(() => loadState('departments', initialDepartments));
  const [currentUser, setCurrentUserState] = useState<Employee>(initialUser ?? initialEmployees[0]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Persist to localStorage on every change
  useEffect(() => { saveState('vehicles', vehicles); }, [vehicles]);
  useEffect(() => { saveState('reservations', reservations); }, [reservations]);
  useEffect(() => { saveState('employees', employees); }, [employees]);
  useEffect(() => { saveState('projects', projects); }, [projects]);
  useEffect(() => { saveState('departments', departments); }, [departments]);

  // Update vehicle statuses based on current reservations
  useEffect(() => {
    const now = new Date();

    setVehicles(prevVehicles =>
      prevVehicles.map(vehicle => {
        if (vehicle.status === 'maintenance') return vehicle;

        const activeReservation = reservations.find(res =>
          res.vehicleId === vehicle.id &&
          res.status === 'approved' &&
          new Date(res.startDate) <= now &&
          new Date(res.endDate) >= now
        );

        if (activeReservation) {
          return { ...vehicle, status: 'booked' as const, lastUser: activeReservation.bookerName };
        }

        if (vehicle.status === 'booked') {
          return { ...vehicle, status: 'available' as const };
        }

        return vehicle;
      })
    );
  }, [reservations]);

  const addActivity = (type: Activity['type'], message: string, user: string) => {
    const activity: Activity = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      user,
    };
    setActivities(prev => [activity, ...prev].slice(0, 10));
  };

  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: (Math.max(...vehicles.map(v => parseInt(v.id)), 0) + 1).toString(),
    };
    setVehicles(prev => [...prev, newVehicle]);
    addActivity('vehicle_added', `Vehicle ${newVehicle.plate} added`, currentUser.name);
    toast.success(`Vehicle ${newVehicle.plate} added successfully`);
  };

  const updateVehicle = (id: string, vehicle: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...vehicle } : v));
    toast.success('Vehicle updated successfully');
  };

  const deleteVehicle = (id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    setVehicles(prev => prev.filter(v => v.id !== id));
    toast.success(`Vehicle ${vehicle?.plate} deleted`);
  };

  const addReservation = (reservation: Omit<Reservation, 'id'>) => {
    const newReservation: Reservation = {
      ...reservation,
      id: (Math.max(...reservations.map(r => parseInt(r.id)), 0) + 1).toString(),
    };
    setReservations(prev => [...prev, newReservation]);
    const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
    addActivity('reservation_created', `New reservation for ${vehicle?.plate} by ${reservation.bookerName}`, currentUser.name);
    toast.success('Reservation submitted for approval');

    // Email: notify all admins
    if (vehicle) {
      const admins = employees.filter(e => e.role === 'admin');
      notifyAdminsNewRequest(reservation, vehicle, admins);
    }
  };

  const updateReservation = (id: string, reservation: Partial<Reservation>) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, ...reservation } : r));
    toast.success('Reservation updated');
  };

  const deleteReservation = (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
    toast.success('Reservation deleted');
  };

  const approveReservation = (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    const vehicle = vehicles.find(v => v.id === reservation?.vehicleId);

    setReservations(prev => prev.map(r =>
      r.id === id
        ? { ...r, status: 'approved', approvedBy: currentUser.name, approvedAt: new Date().toISOString() }
        : r
    ));

    if (reservation && vehicle) {
      addActivity('reservation_approved', `Reservation for ${vehicle.plate} approved for ${reservation.bookerName}`, currentUser.name);

      // Email: notify the booker
      const booker = employees.find(e => e.name === reservation.bookerName);
      if (booker) {
        const approved: Reservation = { ...reservation, status: 'approved', approvedBy: currentUser.name };
        notifyUserStatusChange(approved, vehicle, 'approved', currentUser.name, booker.email);
      }
    }
    toast.success('Reservation approved');
  };

  const rejectReservation = (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    const vehicle = vehicles.find(v => v.id === reservation?.vehicleId);

    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));

    if (reservation && vehicle) {
      addActivity('reservation_rejected', `Reservation for ${vehicle.plate} rejected for ${reservation.bookerName}`, currentUser.name);

      // Email: notify the booker
      const booker = employees.find(e => e.name === reservation.bookerName);
      if (booker) {
        const rejected: Reservation = { ...reservation, status: 'rejected' };
        notifyUserStatusChange(rejected, vehicle, 'rejected', currentUser.name, booker.email);
      }
    }
    toast.error('Reservation rejected');
  };

  const cancelReservation = (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    if (!reservation) return;
    if (reservation.bookerName !== currentUser.name && currentUser.role !== 'admin') return;
    setReservations(prev => prev.filter(r => r.id !== id));
    toast.success('Reservation cancelled');
  };

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: (Math.max(...employees.map(e => parseInt(e.id)), 0) + 1).toString(),
    };
    setEmployees(prev => [...prev, newEmployee]);
    addActivity('employee_added', `Employee ${newEmployee.name} added`, currentUser.name);
    toast.success(`Employee ${newEmployee.name} added`);
  };

  const updateEmployee = (id: string, employee: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...employee } : e));
    toast.success('Employee updated');
  };

  const deleteEmployee = (id: string) => {
    const employee = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    toast.success(`Employee ${employee?.name} deleted`);
  };

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: (Math.max(...projects.map(p => parseInt(p.id)), 0) + 1).toString(),
    };
    setProjects(prev => [...prev, newProject]);
    toast.success(`Project "${newProject.name}" added`);
  };

  const updateProject = (id: string, project: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...project } : p));
    toast.success('Project updated');
  };

  const deleteProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    setProjects(prev => prev.filter(p => p.id !== id));
    toast.success(`Project "${project?.name}" deleted`);
  };

  const addDepartment = (department: Omit<Department, 'id'>) => {
    const newDepartment: Department = {
      ...department,
      id: `dept-${Date.now()}`,
    };
    setDepartments(prev => [...prev, newDepartment]);
    toast.success(`Department "${newDepartment.name}" added`);
  };

  const updateDepartment = (id: string, department: Partial<Department>) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...department } : d));
    toast.success('Department updated');
  };

  const deleteDepartment = (id: string) => {
    const department = departments.find(d => d.id === id);
    setDepartments(prev => prev.filter(d => d.id !== id && d.parent !== id));
    toast.success(`Department "${department?.name}" deleted`);
  };

  const setCurrentUser = (user: Employee) => {
    setCurrentUserState(user);
  };

  const logout = () => {
    localStorage.removeItem('fleetflow_user_id');
    window.location.reload();
  };

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
