import { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Toaster } from 'sonner';
import { FleetProvider, useFleet } from './context/FleetContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { Filters } from './components/Filters';
import { VehicleTimeline } from './components/VehicleTimeline';
import { VehicleGrid } from './components/VehicleGrid';
import { ReservationModal } from './components/ReservationModal';
import { ApprovalWorkflow } from './components/ApprovalWorkflow';
import { VehicleDetailsModal } from './components/VehicleDetailsModal';
import { SettingsModal } from './components/SettingsModal';
import { CalendarPage } from './components/CalendarPage';
import { MyReservationsPage } from './components/MyReservationsPage';
import { AdminPage } from './components/AdminPage';
import { LoginPage } from './components/LoginPage';
import { employees as defaultEmployees, type Vehicle } from './data/mockData';
import { loadState } from '../lib/storage';

function AppContent() {
  const {
    vehicles,
    reservations,
    currentUser,
    setCurrentUser,
    addReservation,
    approveReservation,
    rejectReservation,
  } = useFleet();

  const [activeView, setActiveView] = useState('dashboard');
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedVehicleForDetails, setSelectedVehicleForDetails] = useState<Vehicle | null>(null);
  const [isVehicleDetailsModalOpen, setIsVehicleDetailsModalOpen] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedVehicleType, setSelectedVehicleType] = useState('All Types');
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const [dateRange, setDateRange] = useState({ start: todayStr, end: nextWeek.toISOString().split('T')[0] });
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Redirect users away from admin/calendar if they don't have access
  useEffect(() => {
    if (currentUser.role !== 'admin' && (activeView === 'admin' || activeView === 'calendar')) {
      setActiveView('dashboard');
    }
  }, [currentUser.role, activeView]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !vehicle.model.toLowerCase().includes(q) &&
          !vehicle.plate.toLowerCase().includes(q) &&
          !vehicle.type.toLowerCase().includes(q)
        ) return false;
      }
      if (filtersApplied && selectedVehicleType !== 'All Types' && vehicle.type !== selectedVehicleType) return false;
      return true;
    });
  }, [vehicles, searchQuery, filtersApplied, selectedVehicleType]);

  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const vehicle = vehicles.find(v => v.id === res.vehicleId);
        if (
          !vehicle?.model.toLowerCase().includes(q) &&
          !vehicle?.plate.toLowerCase().includes(q) &&
          !res.bookerName.toLowerCase().includes(q) &&
          !res.project?.toLowerCase().includes(q)
        ) return false;
      }
      if (filtersApplied) {
        if (selectedProject !== 'All Projects' && res.project !== selectedProject) return false;
        if (selectedDepartment !== 'all' && res.sector !== selectedDepartment) return false;
      }
      return true;
    });
  }, [reservations, vehicles, searchQuery, filtersApplied, selectedProject, selectedDepartment]);

  const pendingReservations = reservations.filter(res => res.status === 'pending');

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicleForDetails(vehicle);
    setIsVehicleDetailsModalOpen(true);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'calendar':
        if (currentUser.role !== 'admin') return null;
        return <CalendarPage reservations={filteredReservations} />;

      case 'my-reservations':
        return <MyReservationsPage reservations={reservations} />;

      case 'admin':
        if (currentUser.role !== 'admin') {
          return (
            <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-12 text-center">
              <h2 className="text-2xl font-semibold text-white mb-2">Access Denied</h2>
              <p className="text-gray-400">You don't have permission to access the admin panel.</p>
            </div>
          );
        }
        return <AdminPage />;

      case 'dashboard':
      default:
        return (
          <>
            <SummaryCards />

            <div className="flex justify-end">
              <button
                onClick={() => { setSelectedVehicle(undefined); setIsReservationModalOpen(true); }}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg shadow-blue-600/20 font-medium"
              >
                <Plus className="w-5 h-5" />
                New Reservation
              </button>
            </div>

            <Filters
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={setSelectedDepartment}
              selectedVehicleType={selectedVehicleType}
              setSelectedVehicleType={setSelectedVehicleType}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              dateRange={dateRange}
              setDateRange={setDateRange}
              onApplyFilters={() => setFiltersApplied(true)}
              onClearFilters={() => {
                setSelectedDepartment('all');
                setSelectedVehicleType('All Types');
                setSelectedProject('All Projects');
                setDateRange({ start: todayStr, end: nextWeek.toISOString().split('T')[0] });
                setFiltersApplied(false);
              }}
              filtersApplied={filtersApplied}
            />

            <VehicleTimeline vehicles={vehicles} reservations={reservations} />

            {currentUser.role === 'admin' && pendingReservations.length > 0 && (
              <ApprovalWorkflow
                pendingReservations={pendingReservations}
                onApprove={approveReservation}
                onReject={rejectReservation}
              />
            )}

            <VehicleGrid vehicles={filteredVehicles} onSelectVehicle={handleSelectVehicle} />
          </>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#0f1117]">
      <Toaster position="top-right" richColors />

      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
        isAdmin={currentUser.role === 'admin'}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-6">
            {renderContent()}
          </div>
        </main>
      </div>

      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => { setIsReservationModalOpen(false); setSelectedVehicle(undefined); }}
        onSubmit={(reservation) => {
          addReservation(reservation);
          setIsReservationModalOpen(false);
          setSelectedVehicle(undefined);
        }}
        preselectedVehicle={selectedVehicle}
      />

      <VehicleDetailsModal
        isOpen={isVehicleDetailsModalOpen}
        onClose={() => { setIsVehicleDetailsModalOpen(false); setSelectedVehicleForDetails(null); }}
        vehicle={selectedVehicleForDetails}
        reservations={reservations}
        dateRange={dateRange}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(() => {
    return localStorage.getItem('fleetflow_user_id');
  });

  const handleLogin = (employeeId: string) => {
    localStorage.setItem('fleetflow_user_id', employeeId);
    setLoggedInUserId(employeeId);
  };

  if (!loggedInUserId) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  const employees = loadState('employees', defaultEmployees);
  const loggedEmployee = employees.find((e: any) => e.id === loggedInUserId) ?? employees[0];

  return (
    <FleetProvider initialUser={loggedEmployee}>
      <AppContent />
    </FleetProvider>
  );
}
