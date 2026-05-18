import { LayoutDashboard, Calendar, ClipboardList, Settings, Shield, LogOut } from 'lucide-react';
import { useFleet } from '../context/FleetContext';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onSettingsClick: () => void;
  isAdmin?: boolean;
  onSwitchToVacation?: () => void;
}

const allMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { id: 'calendar', label: 'Reservations Calendar', icon: Calendar, adminOnly: true },
  { id: 'my-reservations', label: 'My Reservations', icon: ClipboardList, adminOnly: false },
  { id: 'admin', label: 'Admin Panel', icon: Shield, adminOnly: true },
];

export function Sidebar({ activeView, setActiveView, onSettingsClick, isAdmin = false, onSwitchToVacation }: SidebarProps) {
  const { currentUser, logout } = useFleet();

  const menuItems = allMenuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside className="w-64 bg-app-surface border-r border-app-line flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-app-line">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">FleetFlow</h1>
            <p className="text-gray-400 text-xs">Fleet Management</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-app-line">
        <div className="flex items-center gap-3 p-3 bg-app-bg rounded-lg border border-app-line-muted">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{currentUser.name}</p>
            <p className="text-gray-400 text-xs capitalize">{currentUser.role === 'admin' ? 'Administrator' : 'User'}</p>
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
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-gray-400 hover:bg-app-hover hover:text-white'
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

      <div className="p-4 border-t border-app-line space-y-1">
        {onSwitchToVacation && (
          <button
            onClick={onSwitchToVacation}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-green-500/10 hover:text-green-400 transition-all text-sm"
          >
            <span className="text-base">🏖️</span>
            <span className="font-medium">Switch to Vacation</span>
          </button>
        )}
        <button
          onClick={onSettingsClick}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-app-hover hover:text-white transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
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
