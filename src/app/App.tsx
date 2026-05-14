import { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Toaster } from 'sonner';
import { FleetProvider, useFleet } from './context/FleetContext';
import { VacationProvider } from './context/VacationContext';
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
import { LoginPage, type Platform } from './components/LoginPage';
import { VacationApp } from './components/vacation/VacationApp';
import { type Vehicle, type Employee } from './data/mockData';
import { supabase } from '../lib/supabaseClient';

function AppContent({ onSwitchToVacation }: { onSwitchToVacation: () => void }) {
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

            <VehicleTimeline vehicles={filteredVehicles} reservations={reservations} />

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
        onSwitchToVacation={onSwitchToVacation}
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
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(() =>
    localStorage.getItem('fleetflow_user_id')
  );
  const [activePlatform, setActivePlatform] = useState<Platform>(() =>
    (localStorage.getItem('fleetflow_platform') as Platform) ?? 'fleet'
  );
  const [loggedEmployee, setLoggedEmployee] = useState<Employee | null>(null);
  const [loadingUser, setLoadingUser] = useState(!!localStorage.getItem('fleetflow_user_id'));

  useEffect(() => {
    if (!loggedInUserId) {
      setLoggedEmployee(null);
      setLoadingUser(false);
      return;
    }

    setLoadingUser(true);
    supabase
      .from('employees')
      .select('id, name, email, sector, role, vacation_role, vacation_days_total')
      .eq('id', loggedInUserId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          localStorage.removeItem('fleetflow_user_id');
          localStorage.removeItem('fleetflow_platform');
          setLoggedInUserId(null);
        } else {
          setLoggedEmployee({
            id: data.id,
            name: data.name,
            email: data.email,
            sector: data.sector,
            role: data.role as 'admin' | 'user',
            vacationRole: data.vacation_role ?? 'user',
            vacationDaysTotal: data.vacation_days_total ?? 20,
          });
        }
        setLoadingUser(false);
      });
  }, [loggedInUserId]);

  const handleLogin = (employeeId: string, platform: Platform) => {
    localStorage.setItem('fleetflow_user_id', employeeId);
    localStorage.setItem('fleetflow_platform', platform);
    setActivePlatform(platform);
    setLoggedInUserId(employeeId);
  };

  const handleLogout = () => {
    localStorage.removeItem('fleetflow_user_id');
    localStorage.removeItem('fleetflow_platform');
    setLoggedInUserId(null);
    setLoggedEmployee(null);
  };

  const handleSwitchPlatform = (to: Platform) => {
    localStorage.setItem('fleetflow_platform', to);
    setActivePlatform(to);
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!loggedInUserId || !loggedEmployee) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <LoginPage onLogin={handleLogin} initialPlatform={activePlatform} />
      </>
    );
  }

  if (activePlatform === 'vacation') {
    return (
      <VacationProvider initialUser={loggedEmployee} onLogout={handleLogout}>
        <VacationApp onSwitchToFleet={() => handleSwitchPlatform('fleet')} />
      </VacationProvider>
    );
  }

  return (
    <FleetProvider initialUser={loggedEmployee}>
      <AppContent onSwitchToVacation={() => handleSwitchPlatform('vacation')} />
    </FleetProvider>
  );
}
