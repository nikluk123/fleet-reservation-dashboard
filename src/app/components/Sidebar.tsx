import { LayoutDashboard, Car, Calendar, ClipboardList, Settings, Shield } from 'lucide-react';
import { useFleet } from '../context/FleetContext';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onSettingsClick: () => void;
  isAdmin?: boolean;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vehicles', label: 'Vehicle List', icon: Car },
  { id: 'calendar', label: 'Reservations Calendar', icon: Calendar },
  { id: 'my-reservations', label: 'My Reservations', icon: ClipboardList },
  { id: 'admin', label: 'Admin', icon: Shield, adminOnly: true },
];

export function Sidebar({ activeView, setActiveView, onSettingsClick, isAdmin = true }: SidebarProps) {
  const { currentUser } = useFleet();

  return (
    <aside className="w-64 bg-[#1a1d29] border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">FleetFlow</h1>
            <p className="text-gray-400 text-xs">Fleet Management</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 p-3 bg-[#0f1117] rounded-lg border border-gray-700">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{currentUser.name}</p>
            <p className="text-gray-400 text-xs capitalize truncate">{currentUser.role}</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            if (item.adminOnly && !isAdmin) {
              return null;
            }
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
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
      
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onSettingsClick}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}