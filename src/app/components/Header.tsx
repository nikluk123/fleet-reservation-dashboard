import { Bell, Search, User, X } from 'lucide-react';
import { useState } from 'react';
import { useFleet } from '../context/FleetContext';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function Header({ searchQuery, setSearchQuery }: HeaderProps) {
  const { currentUser, activities } = useFleet();
  const [showNotifications, setShowNotifications] = useState(false);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'reservation_created':
        return '📝';
      case 'reservation_approved':
        return '✅';
      case 'reservation_rejected':
        return '❌';
      case 'vehicle_added':
        return '🚗';
      case 'employee_added':
        return '👤';
      default:
        return '📢';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <header className="bg-[#1a1d29] border-b border-gray-800 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">FleetFlow Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and track your fleet reservations</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles, plates, bookers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0f1117] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 w-80 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700 rounded"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-[#0f1117] border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-400" />
              {activities.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-96 bg-[#1a1d29] border border-gray-800 rounded-lg shadow-2xl z-20 max-h-[500px] overflow-y-auto">
                  <div className="p-4 border-b border-gray-800">
                    <h3 className="text-white font-semibold">Recent Activity</h3>
                    <p className="text-gray-400 text-sm">Last 10 events</p>
                  </div>
                  
                  {activities.length > 0 ? (
                    <div className="divide-y divide-gray-800">
                      {activities.map((activity) => (
                        <div key={activity.id} className="p-4 hover:bg-gray-800/30 transition-colors">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm">{activity.message}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-gray-500 text-xs">{activity.user}</span>
                                <span className="text-gray-600">•</span>
                                <span className="text-gray-500 text-xs">{formatTimestamp(activity.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No recent activity</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3 pl-6 border-l border-gray-700">
            <div className="text-right">
              <p className="text-white text-sm font-medium">{currentUser.name}</p>
              <p className="text-gray-400 text-xs capitalize">{currentUser.role}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
