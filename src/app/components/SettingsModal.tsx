import { X, Bell, User } from 'lucide-react';
import { useState } from 'react';
import { useFleet } from '../context/FleetContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { currentUser } = useFleet();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1d29] border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Notification Settings */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h3>
            <div className="bg-[#0f1117] border border-gray-700 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-gray-400 text-sm">Receive reservation updates via email</p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    emailNotifications ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div>
                  <p className="text-white font-medium">Push Notifications</p>
                  <p className="text-gray-400 text-sm">Receive push notifications for approvals</p>
                </div>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    pushNotifications ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      pushNotifications ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </h3>
            <div className="bg-[#0f1117] border border-gray-700 rounded-lg p-4 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Name</label>
                <input
                  type="text"
                  value={currentUser.name}
                  readOnly
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={currentUser.email}
                  readOnly
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Department</label>
                <input
                  type="text"
                  value={currentUser.sector}
                  readOnly
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Role</label>
                <input
                  type="text"
                  value={currentUser.role}
                  readOnly
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-400 cursor-not-allowed capitalize"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
