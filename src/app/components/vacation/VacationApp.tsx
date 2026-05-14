import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Toaster } from 'sonner';
import { VacationSidebar } from './VacationSidebar';
import { VacationHeader } from './VacationHeader';
import { VacationTimeline } from './VacationTimeline';
import { VacationRequestModal } from './VacationRequestModal';
import { MyVacationPage } from './MyVacationPage';
import { VacationAdminPage } from './VacationAdminPage';
import { useVacation } from '../../context/VacationContext';

interface Props {
  onSwitchToFleet: () => void;
}

export function VacationApp({ onSwitchToFleet }: Props) {
  const { currentUser } = useVacation();
  const [activeView, setActiveView] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = currentUser.vacationRole === 'admin' || currentUser.vacationRole === 'sector_admin';

  const renderContent = () => {
    switch (activeView) {
      case 'my-requests':
        return <MyVacationPage />;
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
    </div>
  );
}
