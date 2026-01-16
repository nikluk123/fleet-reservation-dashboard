import { useState, useMemo } from 'react';
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
import { VehicleListPage } from './components/VehicleListPage';
import { CalendarPage } from './components/CalendarPage';
import { MyReservationsPage } from './components/MyReservationsPage';
import { AdminPage } from './components/AdminPage';
import { type Vehicle } from './data/mockData';

function AppContent() {
  const { 
    vehicles, 
    reservations, 
    currentUser,
    addReservation,
    approveReservation,
    rejectReservation
  } = useFleet();

  const [activeView, setActiveView] = useState('dashboard');
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Vehicle details modal
  const [selectedVehicleForDetails, setSelectedVehicleForDetails] = useState<Vehicle | null>(null);
  const [isVehicleDetailsModalOpen, setIsVehicleDetailsModalOpen] = useState(false);

  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedVehicleType, setSelectedVehicleType] = useState('All Types');
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [dateRange, setDateRange] = useState({ start: '2026-01-11', end: '2026-01-18' });
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Calculate summary metrics
  const totalVehicles = vehicles.length;
  const availableNow = vehicles.filter(v => v.status === 'available').length;
  
  const today = new Date(2026, 0, 11); // Jan 11, 2026
  const todayStr = today.toISOString().split('T')[0];
  const bookedToday = reservations.filter(res => {
    const start = new Date(res.startDate).toISOString().split('T')[0];
    const end = new Date(res.endDate).toISOString().split('T')[0];
    return start <= todayStr && end >= todayStr && res.status === 'approved';
  }).length;

  const upcomingReservations = reservations.filter(res => {
    const start = new Date(res.startDate);
    return start > today && res.status !== 'rejected';
  }).length;

  // Filter vehicles based on all criteria including search
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          vehicle.model.toLowerCase().includes(query) ||
          vehicle.plate.toLowerCase().includes(query) ||
          vehicle.type.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }

      // Only apply other filters if explicitly applied
      if (filtersApplied) {
        // Vehicle type filter
        if (selectedVehicleType !== 'All Types' && vehicle.type !== selectedVehicleType) {
          return false;
        }
      }
      
      return true;
    });
  }, [vehicles, searchQuery, filtersApplied, selectedVehicleType]);

  // Filter reservations based on filters
  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const vehicle = vehicles.find(v => v.id === res.vehicleId);
        const matchesSearch = 
          vehicle?.model.toLowerCase().includes(query) ||
          vehicle?.plate.toLowerCase().includes(query) ||
          res.bookerName.toLowerCase().includes(query) ||
          res.project?.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }

      // Only apply other filters if explicitly applied
      if (filtersApplied) {
        if (selectedProject !== 'All Projects' && res.project !== selectedProject) {
          return false;
        }

        if (selectedDepartment !== 'all' && res.sector !== selectedDepartment) {
          return false;
        }
      }
      
      return true;
    });
  }, [reservations, vehicles, searchQuery, filtersApplied, selectedProject, selectedDepartment]);

  const pendingReservations = reservations.filter(res => res.status === 'pending');

  const handleApplyFilters = () => {
    setFiltersApplied(true);
  };

  const handleClearFilters = () => {
    setSelectedDepartment('all');
    setSelectedVehicleType('All Types');
    setSelectedProject('All Projects');
    setDateRange({ start: '2026-01-11', end: '2026-01-18' });
    setFiltersApplied(false);
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicleForDetails(vehicle);
    setIsVehicleDetailsModalOpen(true);
  };

  const handleNewReservationClick = () => {
    setSelectedVehicle(undefined);
    setIsReservationModalOpen(true);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'vehicles':
        return <VehicleListPage vehicles={filteredVehicles} onSelectVehicle={handleSelectVehicle} />;
      
      case 'calendar':
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
            {/* Summary Cards - now calculated dynamically */}
            <SummaryCards />

            {/* New Reservation Button */}
            <div className="flex justify-end">
              <button
                onClick={handleNewReservationClick}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg shadow-blue-600/20 font-medium"
              >
                <Plus className="w-5 h-5" />
                New Reservation
              </button>
            </div>

            {/* Filters with Analytics */}
            <Filters
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={setSelectedDepartment}
              selectedVehicleType={selectedVehicleType}
              setSelectedVehicleType={setSelectedVehicleType}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              dateRange={dateRange}
              setDateRange={setDateRange}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              filtersApplied={filtersApplied}
            />

            {/* Timeline View - Always shows all vehicles (unfiltered) */}
            <VehicleTimeline 
              vehicles={vehicles}
              reservations={reservations}
            />

            {/* Approval Workflow */}
            {currentUser.role === 'admin' && pendingReservations.length > 0 && (
              <ApprovalWorkflow
                pendingReservations={pendingReservations}
                onApprove={approveReservation}
                onReject={rejectReservation}
              />
            )}

            {/* Vehicle Grid - shows filtered vehicles */}
            <VehicleGrid vehicles={filteredVehicles} onSelectVehicle={handleSelectVehicle} />
          </>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#0f1117]">
      <Toaster position="top-right" richColors />
      
      {/* Sidebar */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
        isAdmin={currentUser.role === 'admin'}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-6">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Modals */}
      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => {
          setIsReservationModalOpen(false);
          setSelectedVehicle(undefined);
        }}
        onSubmit={(reservation) => {
          addReservation(reservation);
          setIsReservationModalOpen(false);
          setSelectedVehicle(undefined);
        }}
        preselectedVehicle={selectedVehicle}
      />

      <VehicleDetailsModal
        isOpen={isVehicleDetailsModalOpen}
        onClose={() => {
          setIsVehicleDetailsModalOpen(false);
          setSelectedVehicleForDetails(null);
        }}
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
  return (
    <FleetProvider>
      <AppContent />
    </FleetProvider>
  );
}