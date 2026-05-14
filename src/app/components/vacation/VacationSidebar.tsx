import { LayoutDashboard, ClipboardList, Shield, Calendar, LogOut, Palmtree, Settings } from 'lucide-react';
import { useVacation } from '../../context/VacationContext';

interface VacationSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onSwitchToFleet: () => void;
  onSettingsClick: () => void;
}

export function VacationSidebar({ activeView, setActiveView, onSwitchToFleet, onSettingsClick }: VacationSidebarProps) {
  const { currentUser, logout } = useVacation();
  const isAdmin = currentUser.vacationRole === 'admin' || currentUser.vacationRole === 'sector_admin';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-requests', label: 'My Requests', icon: ClipboardList },
    { id: 'calendar', label: 'Leave Calendar', icon: Calendar },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: Shield }] : []),
  ];

  const roleLabel = currentUser.vacationRole === 'admin'
    ? 'Administrator'
    : currentUser.vacationRole === 'sector_admin'
    ? 'Sector Admin'
    : 'Employee';

  return (
    <aside className="w-64 bg-[#1a1d29] border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-700 rounded-lg flex items-center justify-center">
            <Palmtree className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">LeaveFlow</h1>
            <p className="text-gray-400 text-xs">Vacation Management</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 p-3 bg-[#0f1117] rounded-lg border border-gray-700">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-700 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{currentUser.name}</p>
            <p className="text-gray-400 text-xs">{roleLabel}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-1">
        <button
          onClick={onSettingsClick}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        <button
          onClick={onSwitchToFleet}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-blue-500/10 hover:text-blue-400 transition-all text-sm"
        >
          <span className="text-base">🚗</span>
          <span className="font-medium">Switch to Fleet</span>
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
