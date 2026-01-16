import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { type Reservation } from '../data/mockData';
import { useFleet } from '../context/FleetContext';

interface MyReservationsPageProps {
  reservations: Reservation[];
}

export function MyReservationsPage({ reservations }: MyReservationsPageProps) {
  const { vehicles, currentUser } = useFleet();
  
  // Filter reservations for current user
  const myReservations = reservations.filter(res => res.bookerName === currentUser.name);

  const activeReservations = myReservations.filter(res => {
    const end = new Date(res.endDate);
    const today = new Date(2026, 0, 11);
    return end >= today && res.status === 'approved';
  });

  const pastReservations = myReservations.filter(res => {
    const end = new Date(res.endDate);
    const today = new Date(2026, 0, 11);
    return end < today;
  });

  const pendingReservations = myReservations.filter(res => res.status === 'pending');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-500 bg-green-500/10 border-green-500/50';
      case 'pending': return 'text-orange-500 bg-orange-500/10 border-orange-500/50';
      case 'rejected': return 'text-red-500 bg-red-500/10 border-red-500/50';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'rejected': return <XCircle className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const ReservationCard = ({ reservation }: { reservation: Reservation }) => {
    const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
    
    return (
      <div className="bg-[#0f1117] border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{vehicle?.model}</h3>
              <p className="text-gray-400 font-mono text-sm">{vehicle?.plate}</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(reservation.status)}`}>
            {getStatusIcon(reservation.status)}
            <span className="text-sm font-medium capitalize">{reservation.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-500 text-sm mb-1">Start Date</p>
            <p className="text-white">{new Date(reservation.startDate).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">End Date</p>
            <p className="text-white">{new Date(reservation.endDate).toLocaleString()}</p>
          </div>
        </div>

        {reservation.project && (
          <div className="mb-4">
            <p className="text-gray-500 text-sm mb-1">Project</p>
            <p className="text-blue-400">{reservation.project}</p>
          </div>
        )}

        {reservation.notes && (
          <div className="mb-4">
            <p className="text-gray-500 text-sm mb-1">Notes</p>
            <p className="text-gray-300 text-sm">{reservation.notes}</p>
          </div>
        )}

        {reservation.approvedBy && (
          <div className="pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              Approved by <span className="text-white">{reservation.approvedBy}</span>
              {reservation.approvedAt && (
                <span className="text-gray-500"> on {new Date(reservation.approvedAt).toLocaleString()}</span>
              )}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-white mb-2">My Reservations</h2>
        <p className="text-gray-400">View and manage your vehicle reservations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-500/10 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-gray-400">Active Reservations</p>
          </div>
          <p className="text-3xl font-bold text-white">{activeReservations.length}</p>
        </div>
        
        <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-500/10 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-gray-400">Pending Approval</p>
          </div>
          <p className="text-3xl font-bold text-white">{pendingReservations.length}</p>
        </div>
        
        <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-gray-400">Past Reservations</p>
          </div>
          <p className="text-3xl font-bold text-white">{pastReservations.length}</p>
        </div>
      </div>

      {/* Active Reservations */}
      {activeReservations.length > 0 && (
        <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Active Reservations</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeReservations.map(res => <ReservationCard key={res.id} reservation={res} />)}
          </div>
        </div>
      )}

      {/* Pending Reservations */}
      {pendingReservations.length > 0 && (
        <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Pending Approval</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingReservations.map(res => <ReservationCard key={res.id} reservation={res} />)}
          </div>
        </div>
      )}

      {/* Past Reservations */}
      {pastReservations.length > 0 && (
        <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Past Reservations</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pastReservations.map(res => <ReservationCard key={res.id} reservation={res} />)}
          </div>
        </div>
      )}

      {myReservations.length === 0 && (
        <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">No Reservations Yet</h3>
          <p className="text-gray-400">You haven't made any vehicle reservations yet.</p>
        </div>
      )}
    </div>
  );
}