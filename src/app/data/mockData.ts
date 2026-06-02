export interface Department {
  id: string;
  name: string;
  parent?: string;
}

export interface Project {
  id: string;
  name: string;
  kmPerDay: number;
}

export interface Vehicle {
  id: string;
  model: string;
  plate: string;
  type: string;
  status: 'available' | 'booked' | 'maintenance';
  currentLocation?: string;
  lastUser?: string;
}

export interface Reservation {
  id: string;
  vehicleId: string;
  bookerName: string;
  sector: string;
  project?: string;
  startDate: string;
  endDate: string;
  notes?: string;
  status: 'approved' | 'pending' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  sector: string;
  role: 'user' | 'admin';
  vacationRole?: 'user' | 'sector_admin' | 'admin';
  vacationDaysTotal?: number;
  inventoryRole?: 'user' | 'admin';
  jobTitle?: string;
  educationLevel?: 'SSS' | 'VSS';
  nesStartDate?: string;
  hasChildrenUnder15?: boolean;
  isSingleParent?: boolean;
}

export interface InventoryItem {
  id: string;
  barcodeId: string;
  category: 'IT' | 'Namestaj';
  itemType: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  year?: number;
  condition: string;
  department?: string;
  employeeName?: string;
  location?: string;
  notes?: string;
  assignedDate?: string;
  material?: string;
  colorDesc?: string;
  dimensions?: string;
}

// Returns date string for current week: offset 0=Mon, 1=Tue, ..., 6=Sun
function weekDate(dayOffset: number, hour: number = 9): string {
  const now = new Date();
  const dow = now.getDay();
  const mondayDiff = dow === 0 ? -6 : 1 - dow;
  const target = new Date(now);
  target.setDate(now.getDate() + mondayDiff + dayOffset);
  target.setHours(hour, 0, 0, 0);
  return target.toISOString().slice(0, 16);
}

export const departments: Department[] = [
  { id: 'management', name: 'Management' },
  { id: 'development', name: 'Development' },
  { id: 'engineering', name: 'Engineering' },
  { id: 'design', name: 'Design', parent: 'engineering' },
  { id: 'permitting', name: 'Permitting', parent: 'engineering' },
  { id: 'construction', name: 'Construction', parent: 'engineering' },
  { id: 'am-logistics', name: 'Asset Management & Logistics' },
  { id: 'am', name: 'AM', parent: 'am-logistics' },
  { id: 'logistics', name: 'Logistics', parent: 'am-logistics' },
  { id: 'finance', name: 'Finance and Administration' },
];

export const projects: Project[] = [
  { id: '1', name: 'Northern Highway Project', kmPerDay: 150 },
  { id: '2', name: 'Bridge Renovation', kmPerDay: 100 },
  { id: '3', name: 'Asset Survey Q1', kmPerDay: 50 },
  { id: '4', name: 'New Site Development', kmPerDay: 200 },
  { id: '5', name: 'Equipment Transport', kmPerDay: 120 },
  { id: '6', name: 'Permit Site Visit', kmPerDay: 80 },
  { id: '7', name: 'Executive Review', kmPerDay: 30 },
  { id: '8', name: 'Southern Expansion', kmPerDay: 180 },
  { id: '9', name: 'Infrastructure Upgrade', kmPerDay: 110 },
];

export const vehicles: Vehicle[] = [
  { id: '1', model: 'Land Rover Defender', plate: 'BG2795-VO', type: 'SUV', status: 'available', currentLocation: 'Main Office', lastUser: 'John Doe' },
  { id: '2', model: 'Volvo XC60', plate: 'BG2765-RL', type: 'SUV', status: 'booked', currentLocation: 'Site A', lastUser: 'Maria Silva' },
  { id: '3', model: 'Volvo XC60', plate: 'BG1671-TO', type: 'SUV', status: 'available', currentLocation: 'Main Office' },
  { id: '4', model: 'Ford Kuga', plate: 'BG2779-DS', type: 'SUV', status: 'booked', currentLocation: 'Site B', lastUser: 'Carlos Santos' },
  { id: '5', model: 'Ford Kuga', plate: 'BG2779-DZ', type: 'SUV', status: 'available', currentLocation: 'Main Office' },
  { id: '6', model: 'Ford Puma', plate: 'BG2900-I', type: 'Compact SUV', status: 'available', currentLocation: 'Main Office' },
  { id: '7', model: 'Land Rover Discovery', plate: 'BG2051-ON', type: 'SUV', status: 'booked', currentLocation: 'Site C', lastUser: 'Ana Costa' },
  { id: '8', model: 'Smart', plate: 'BG2792-GB', type: 'City Car', status: 'available', currentLocation: 'Main Office' },
  { id: '9', model: 'Jeep Renegade', plate: 'BG1665-HC', type: 'SUV', status: 'available', currentLocation: 'Main Office' },
  { id: '10', model: 'Jeep Renegade', plate: 'BG2198-EP', type: 'SUV', status: 'booked', currentLocation: 'Site D', lastUser: 'Pedro Alves' },
  { id: '11', model: 'Dacia Duster', plate: 'BG1645-XB', type: 'SUV', status: 'available', currentLocation: 'Main Office' },
  { id: '12', model: 'Dacia Duster', plate: 'BG2387-IM', type: 'SUV', status: 'available', currentLocation: 'Main Office' },
  { id: '13', model: 'Dacia Sandero', plate: 'BG1645-XC', type: 'Sedan', status: 'available', currentLocation: 'Main Office' },
  { id: '14', model: 'Fiat Panda', plate: 'BG1996-FG', type: 'City Car', status: 'available', currentLocation: 'Main Office' },
  { id: '15', model: 'Ford Transit Kombi', plate: 'BG2380-TN', type: 'Van', status: 'booked', currentLocation: 'Site E', lastUser: 'Sofia Lima' },
  { id: '16', model: 'VW T-Roc', plate: 'BG1822-TD', type: 'Compact SUV', status: 'available', currentLocation: 'Main Office' },
  { id: '17', model: 'Jeep Renegade', plate: 'BG1665-HB', type: 'SUV', status: 'available', currentLocation: 'Main Office' },
  { id: '18', model: 'Jeep Renegade', plate: 'BG1818-ZT', type: 'SUV', status: 'available', currentLocation: 'Main Office' },
  { id: '19', model: 'Jeep Renegade', plate: 'BG1818-ZU', type: 'SUV', status: 'available', currentLocation: 'Main Office' },
];

export const reservations: Reservation[] = [
  {
    id: '1',
    vehicleId: '2',
    bookerName: 'Maria Silva',
    sector: 'Engineering - Design',
    project: 'Northern Highway Project',
    startDate: weekDate(0, 9),
    endDate: weekDate(2, 17),
    notes: 'Site inspection',
    status: 'approved',
    approvedBy: 'John Smith',
    approvedAt: weekDate(0, 8),
  },
  {
    id: '2',
    vehicleId: '4',
    bookerName: 'Carlos Santos',
    sector: 'Engineering - Construction',
    project: 'Bridge Renovation',
    startDate: weekDate(0, 8),
    endDate: weekDate(4, 18),
    notes: 'Construction site visits',
    status: 'approved',
    approvedBy: 'John Smith',
    approvedAt: weekDate(0, 7),
  },
  {
    id: '3',
    vehicleId: '7',
    bookerName: 'Ana Costa',
    sector: 'Asset Management & Logistics - AM',
    project: 'Asset Survey Q1',
    startDate: weekDate(1, 10),
    endDate: weekDate(2, 16),
    notes: 'Equipment inspection',
    status: 'approved',
    approvedBy: 'John Smith',
    approvedAt: weekDate(1, 9),
  },
  {
    id: '4',
    vehicleId: '10',
    bookerName: 'Pedro Alves',
    sector: 'Development',
    project: 'New Site Development',
    startDate: weekDate(0, 8),
    endDate: weekDate(6, 17),
    notes: 'Week-long site evaluation',
    status: 'approved',
    approvedBy: 'John Smith',
    approvedAt: weekDate(0, 7),
  },
  {
    id: '5',
    vehicleId: '15',
    bookerName: 'Sofia Lima',
    sector: 'Asset Management & Logistics - Logistics',
    project: 'Equipment Transport',
    startDate: weekDate(2, 7),
    endDate: weekDate(2, 19),
    notes: 'Transporting materials',
    status: 'approved',
    approvedBy: 'John Smith',
    approvedAt: weekDate(2, 6),
  },
  {
    id: '6',
    vehicleId: '1',
    bookerName: 'Ricardo Mendes',
    sector: 'Engineering - Permitting',
    project: 'Permit Site Visit',
    startDate: weekDate(4, 9),
    endDate: weekDate(4, 15),
    status: 'pending',
  },
  {
    id: '7',
    vehicleId: '3',
    bookerName: 'Luisa Torres',
    sector: 'Management',
    project: 'Executive Review',
    startDate: weekDate(7, 10),
    endDate: weekDate(8, 14),
    status: 'pending',
  },
];

export const employees: Employee[] = [
  { id: '1', name: 'John Smith', email: 'john.smith@fleetflow.com', sector: 'Management', role: 'admin' },
  { id: '2', name: 'Maria Silva', email: 'maria.silva@fleetflow.com', sector: 'Engineering - Design', role: 'user' },
  { id: '3', name: 'Carlos Santos', email: 'carlos.santos@fleetflow.com', sector: 'Engineering - Construction', role: 'user' },
  { id: '4', name: 'Ana Costa', email: 'ana.costa@fleetflow.com', sector: 'Asset Management & Logistics - AM', role: 'user' },
  { id: '5', name: 'Pedro Alves', email: 'pedro.alves@fleetflow.com', sector: 'Development', role: 'user' },
  { id: '6', name: 'Sofia Lima', email: 'sofia.lima@fleetflow.com', sector: 'Asset Management & Logistics - Logistics', role: 'user' },
  { id: '7', name: 'Ricardo Mendes', email: 'ricardo.mendes@fleetflow.com', sector: 'Engineering - Permitting', role: 'user' },
  { id: '8', name: 'Luisa Torres', email: 'luisa.torres@fleetflow.com', sector: 'Management', role: 'user' },
];

export const currentUser: Employee = employees[0];
