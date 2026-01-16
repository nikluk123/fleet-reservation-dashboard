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
import { toast } from 'sonner';

interface Activity {
  id: string;
  type: 'reservation_created' | 'reservation_approved' | 'reservation_rejected' | 'vehicle_added' | 'employee_added';
  message: string;
  timestamp: Date;
  user: string;
}

interface FleetContextType {
  // Data
  vehicles: Vehicle[];
  reservations: Reservation[];
  employees: Employee[];
  projects: Project[];
  departments: Department[];
  currentUser: Employee;
  activities: Activity[];

  // Vehicle actions
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  // Reservation actions
  addReservation: (reservation: Omit<Reservation, 'id'>) => void;
  updateReservation: (id: string, reservation: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;
  approveReservation: (id: string) => void;
  rejectReservation: (id: string) => void;

  // Employee actions
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Project actions
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Department actions
  addDepartment: (department: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, department: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  // User actions
  setCurrentUser: (user: Employee) => void;

  // Helper functions
  getVehicleStatus: (vehicleId: string) => 'available' | 'booked' | 'pending' | 'maintenance';
  isVehicleAvailableNow: (vehicleId: string) => boolean;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export function FleetProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [currentUser, setCurrentUserState] = useState<Employee>(initialEmployees[0]); // Default to John Smith (admin)
  const [activities, setActivities] = useState<Activity[]>([]);

  // Update vehicle statuses based on reservations
  useEffect(() => {
    const now = new Date('2026-01-11T10:00:00'); // Current simulated time
    const nowStr = now.toISOString();

    setVehicles(prevVehicles => 
      prevVehicles.map(vehicle => {
        // Find if vehicle has any active approved reservation
        const activeReservation = reservations.find(res => 
          res.vehicleId === vehicle.id &&
          res.status === 'approved' &&
          new Date(res.startDate) <= now &&
          new Date(res.endDate) >= now
        );

        if (activeReservation) {
          return {
            ...vehicle,
            status: 'booked' as const,
            lastUser: activeReservation.bookerName
          };
        }

        // If no active reservation and status is booked, make it available
        if (vehicle.status === 'booked' && !activeReservation) {
          return {
            ...vehicle,
            status: 'available' as const
          };
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
      user
    };
    setActivities(prev => [activity, ...prev].slice(0, 10)); // Keep last 10
  };

  // Vehicle actions
  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: (Math.max(...vehicles.map(v => parseInt(v.id)), 0) + 1).toString()
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
    toast.success(`Vehicle ${vehicle?.plate} deleted successfully`);
  };

  // Reservation actions
  const addReservation = (reservation: Omit<Reservation, 'id'>) => {
    const newReservation: Reservation = {
      ...reservation,
      id: (Math.max(...reservations.map(r => parseInt(r.id)), 0) + 1).toString()
    };
    setReservations(prev => [...prev, newReservation]);
    
    const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
    
    addActivity('reservation_created', `New reservation for ${vehicle?.plate} by ${reservation.bookerName}`, currentUser.name);
    toast.success('Reservation submitted for approval');
  };

  const updateReservation = (id: string, reservation: Partial<Reservation>) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, ...reservation } : r));
    toast.success('Reservation updated successfully');
  };

  const deleteReservation = (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
    toast.success('Reservation deleted successfully');
  };

  const approveReservation = (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    const vehicle = vehicles.find(v => v.id === reservation?.vehicleId);
    
    setReservations(prev => prev.map(r => 
      r.id === id ? { 
        ...r, 
        status: 'approved',
        approvedBy: currentUser.name,
        approvedAt: new Date().toISOString()
      } : r
    ));
    
    if (reservation && vehicle) {
      // Update vehicle status and last user
      updateVehicle(reservation.vehicleId, {
        status: 'booked',
        lastUser: reservation.bookerName
      });
      
      addActivity('reservation_approved', `Reservation for ${vehicle.plate} approved for ${reservation.bookerName}`, currentUser.name);
    }
    toast.success('Reservation approved successfully');
  };

  const rejectReservation = (id: string) => {
    const reservation = reservations.find(r => r.id === id);
    const vehicle = vehicles.find(v => v.id === reservation?.vehicleId);
    
    setReservations(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'rejected' } : r
    ));
    
    if (reservation && vehicle) {
      addActivity('reservation_rejected', `Reservation for ${vehicle.plate} rejected for ${reservation.bookerName}`, currentUser.name);
    }
    toast.error('Reservation rejected');
  };

  // Employee actions
  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: (Math.max(...employees.map(e => parseInt(e.id)), 0) + 1).toString()
    };
    setEmployees(prev => [...prev, newEmployee]);
    addActivity('employee_added', `Employee ${newEmployee.name} added`, currentUser.name);
    toast.success(`Employee ${newEmployee.name} added successfully`);
  };

  const updateEmployee = (id: string, employee: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...employee } : e));
    toast.success('Employee updated successfully');
  };

  const deleteEmployee = (id: string) => {
    const employee = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    toast.success(`Employee ${employee?.name} deleted successfully`);
  };

  // Project actions
  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: (Math.max(...projects.map(p => parseInt(p.id)), 0) + 1).toString()
    };
    setProjects(prev => [...prev, newProject]);
    toast.success(`Project "${newProject.name}" added successfully`);
  };

  const updateProject = (id: string, project: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...project } : p));
    toast.success('Project updated successfully');
  };

  const deleteProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    setProjects(prev => prev.filter(p => p.id !== id));
    toast.success(`Project "${project?.name}" deleted successfully`);
  };

  // Department actions
  const addDepartment = (department: Omit<Department, 'id'>) => {
    const newDepartment: Department = {
      ...department,
      id: department.name.toLowerCase().replace(/\s+/g, '-')
    };
    setDepartments(prev => [...prev, newDepartment]);
    toast.success(`Department "${newDepartment.name}" added successfully`);
  };

  const updateDepartment = (id: string, department: Partial<Department>) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...department } : d));
    toast.success('Department updated successfully');
  };

  const deleteDepartment = (id: string) => {
    const department = departments.find(d => d.id === id);
    // Also delete child departments
    setDepartments(prev => prev.filter(d => d.id !== id && d.parent !== id));
    toast.success(`Department "${department?.name}" deleted successfully`);
  };

  const setCurrentUser = (user: Employee) => {
    setCurrentUserState(user);
  };

  // Helper functions
  const getVehicleStatus = (vehicleId: string): 'available' | 'booked' | 'pending' | 'maintenance' => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return 'available';
    
    if (vehicle.status === 'maintenance') return 'maintenance';

    const now = new Date('2026-01-11T10:00:00');
    
    // Check for approved reservation
    const hasApprovedReservation = reservations.some(res => 
      res.vehicleId === vehicleId &&
      res.status === 'approved' &&
      new Date(res.startDate) <= now &&
      new Date(res.endDate) >= now
    );

    if (hasApprovedReservation) return 'booked';

    // Check for pending reservation
    const hasPendingReservation = reservations.some(res => 
      res.vehicleId === vehicleId &&
      res.status === 'pending' &&
      new Date(res.startDate) <= now &&
      new Date(res.endDate) >= now
    );

    if (hasPendingReservation) return 'pending';

    return 'available';
  };

  const isVehicleAvailableNow = (vehicleId: string): boolean => {
    const status = getVehicleStatus(vehicleId);
    return status === 'available';
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
    getVehicleStatus,
    isVehicleAvailableNow
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
