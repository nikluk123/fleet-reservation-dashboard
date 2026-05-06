import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import { type Reservation } from '../data/mockData';
import { useFleet } from '../context/FleetContext';

interface MyReservationsPageProps {
  reservations: Reservation[];
}

export function MyReservationsPage({ reservations }: MyReservationsPageProps) {
  const { vehicles, currentUser, cancelReservation } = useFleet();
  const now = new Date();

  const myReservations = reservations.filter(res => res.bookerName === currentUser.name);

  const activeReservations = myReservations.filter(res => {
    const end = new Date(res.endDate);
    return end >= now && res.status === 'approved';
  });

  const pendingReservations = myReservations.filter(res => res.status === 'pending');

  const pastReservations = myReservations.filter(res => {
    const end = new Date(res.endDate);
    return end < now || res.status === 'rejected';
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-500 bg-green-500/10 border-green-500/50';
      case 'pending': return 'text-orange-500 bg-orange-500/10 border-orange-500/50';
      case 'rejected': return 'text-red-500 bg-red-500/10 border-red-500/50';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      cancelReservation(id);
    }
  };

  const ReservationCard = ({ reservation }: { reservation: Reservation }) => {
    const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
    const isPending = reservation.status === 'pending';

    return (
      <div className="bg-[#0f1117] border border-gray-700 rounded-lg p-6 hover:border-blue-500/30 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{vehicle?.model ?? 'Unknown vehicle'}</h3>
              <p className="text-gray-400 font-mono text-sm">{vehicle?.plate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${getStatusStyle(reservation.status)}`}>
              {getStatusIcon(reservation.status)}
              <span className="capitalize">{reservation.status}</span>
            </div>
            {isPending && (
              <button
                onClick={() => handleCancel(reservation.id)}
                title="Cancel reservation"
                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-500 text-sm mb-1">Start</p>
            <p className="text-white text-sm">{new Date(reservation.startDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">End</p>
            <p className="text-white text-sm">{new Date(reservation.endDate).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
          </div>
        </div>

        {reservation.project && (
          <div className="mb-3">
            <p className="text-gray-500 text-sm mb-1">Project</p>
            <p className="text-blue-400 text-sm">{reservation.project}</p>
          </div>
        )}

        {reservation.notes && (
          <div className="mb-3">
            <p className="text-gray-500 text-sm mb-1">Notes</p>
            <p className="text-gray-300 text-sm">{reservation.notes}</p>
          </div>
        )}

        {reservation.approvedBy && (
          <div className="pt-3 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              Approved by <span className="text-white">{reservation.approvedBy}</span>
              {reservation.approvedAt && (
                <span className="text-gray-500"> · {new Date(reservation.approvedAt).toLocaleDateString('en-GB')}</span>
              )}
            </p>
          </div>
        )}
      </div>
    );
  };

  const Section = ({ title, items }: { title: string; items: Reservation[] }) => (
    items.length > 0 ? (
      <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold text-lg mb-4">{title}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map(res => <ReservationCard key={res.id} reservation={res} />)}
        </div>
      </div>
    ) : null
  );

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-white mb-1">My Reservations</h2>
        <p className="text-gray-400">Your vehicle reservation history and pending requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-500/10 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-gray-400">Active</p>
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
            <p className="text-gray-400">Past / Rejected</p>
          </div>
          <p className="text-3xl font-bold text-white">{pastReservations.length}</p>
        </div>
      </div>

      <Section title="Active Reservations" items={activeReservations} />
      <Section title="Pending Approval" items={pendingReservations} />
      <Section title="Past & Rejected" items={pastReservations} />

      {myReservations.length === 0 && (
        <div className="bg-[#1a1d29] border border-gray-800 rounded-xl p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">No Reservations Yet</h3>
          <p className="text-gray-400">You haven't made any vehicle reservations yet. Go to the Dashboard to create one.</p>
        </div>
      )}
    </div>
  );
}
