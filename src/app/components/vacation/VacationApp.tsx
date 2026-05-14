import { useState } from 'react';
import { Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Toaster } from 'sonner';
import { VacationSidebar } from './VacationSidebar';
import { VacationHeader } from './VacationHeader';
import { VacationTimeline } from './VacationTimeline';
import { VacationRequestModal } from './VacationRequestModal';
import { VacationSettingsModal } from './VacationSettingsModal';
import { MyVacationPage } from './MyVacationPage';
import { VacationAdminPage } from './VacationAdminPage';
import { VacationCalendarPage } from './VacationCalendarPage';
import { useVacation } from '../../context/VacationContext';

interface Props {
  onSwitchToFleet: () => void;
}

function PendingSection() {
  const { currentUser, vacationRequests, employees, approveRequest, rejectRequest } = useVacation();
  const isAdmin = currentUser.vacationRole === 'admin';
  const isSectorAdmin = currentUser.vacationRole === 'sector_admin';

  const pending = vacationRequests.filter(r => {
    if (r.status !== 'pending') return false;
    if (isAdmin) return true;
    if (isSectorAdmin) return r.sector === currentUser.sector;
    return r.employeeId === currentUser.id;
  });

  if (pending.length === 0) return null;

  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { dateStyle: 'medium' });

  return (
    <div className="bg-[#1a1d29] border border-orange-500/30 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-5 h-5 text-orange-400" />
        <h3 className="text-white font-semibold">
          {isAdmin || isSectorAdmin ? `Pending Requests (${pending.length})` : `My Pending Requests (${pending.length})`}
        </h3>
      </div>

      <div className="space-y-3">
        {pending.map(req => (
          <div key={req.id} className="bg-[#0f1117] border border-gray-700 rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-white font-medium truncate">
                {req.employeeName} — <span className="text-orange-400">{req.daysCount} days</span>
              </p>
              <p className="text-gray-400 text-xs">{req.sector}</p>
              <p className="text-gray-500 text-xs mt-0.5">{fmt(req.startDate)} → {fmt(req.endDate)}</p>
              {req.notes && <p className="text-gray-600 text-xs mt-0.5 italic">"{req.notes}"</p>}
            </div>
            {(isAdmin || isSectorAdmin) && (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => approveRequest(req.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 border border-green-600/50 text-green-400 rounded-lg text-sm hover:bg-green-600/30 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => rejectRequest(req.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 border border-red-600/50 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function VacationApp({ onSwitchToFleet }: Props) {
  const { currentUser } = useVacation();
  const [activeView, setActiveView] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isAdmin = currentUser.vacationRole === 'admin' || currentUser.vacationRole === 'sector_admin';

  const renderContent = () => {
    switch (activeView) {
      case 'my-requests':
        return <MyVacationPage />;
      case 'calendar':
        if (!isAdmin) return null;
        return <VacationCalendarPage />;
      case 'admin':
        if (!isAdmin) return null;
        return <VacationAdminPage />;
      case 'dashboard':
      default:
        return (
          <>
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-lg shadow-green-600/20 font-medium"
              >
                <Plus className="w-5 h-5" />
                New Request
              </button>
            </div>
            <VacationTimeline />
            <PendingSection />
          </>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#0f1117]">
      <Toaster position="top-right" richColors />

      <VacationSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onSwitchToFleet={onSwitchToFleet}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <VacationHeader />

        <main className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-6">
            {renderContent()}
          </div>
        </main>
      </div>

      <VacationRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <VacationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
