import { X, User, Lock, Eye, EyeOff, CheckCircle, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useVacation } from '../../context/VacationContext';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function VacationSettingsModal({ isOpen, onClose }: Props) {
  const { currentUser, changePassword } = useVacation();
  const { theme, toggleTheme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 6) { setPasswordError('New password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }

    setSaving(true);
    const result = await changePassword(currentPassword, newPassword);
    setSaving(false);

    if (result === 'wrong-password') { setPasswordError('Current password is incorrect.'); return; }

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (!isOpen) return null;

  const roleLabel = currentUser.vacationRole === 'admin'
    ? 'Administrator'
    : currentUser.vacationRole === 'sector_admin'
    ? 'Sector Admin'
    : 'Employee';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-app-surface border border-app-line rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-app-line">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-app-hover transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-green-400" />
              Account Information
            </h3>
            <div className="bg-app-bg border border-app-line-muted rounded-lg p-4 space-y-3">
              <Field label="Name" value={currentUser.name} />
              <Field label="Email" value={currentUser.email} />
              <Field label="Department" value={currentUser.sector} />
              <Field label="Role" value={roleLabel} />
              <Field label="Vacation days total" value={`${currentUser.vacationDaysTotal ?? 20} days`} />
            </div>
          </div>

          {/* Appearance */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-green-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
              Appearance
            </h3>
            <div className="bg-app-bg border border-app-line-muted rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                <p className="text-gray-400 text-xs mt-0.5">Toggle between dark and light theme</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-colors ${theme === 'light' ? 'bg-green-600' : 'bg-gray-600'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${theme === 'light' ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-400" />
              Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="bg-app-bg border border-app-line-muted rounded-lg p-4 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Current password</label>
                <PasswordInput value={currentPassword} onChange={setCurrentPassword} show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} placeholder="Enter current password" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">New password</label>
                <PasswordInput value={newPassword} onChange={setNewPassword} show={showNew} onToggle={() => setShowNew(!showNew)} placeholder="Min. 6 characters" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Confirm new password</label>
                <PasswordInput value={confirmPassword} onChange={setConfirmPassword} show={showNew} onToggle={() => setShowNew(!showNew)} placeholder="Repeat new password" />
              </div>

              {passwordError && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{passwordError}</p>
              )}
              {passwordSuccess && (
                <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                  <CheckCircle className="w-4 h-4" />
                  Password changed successfully. Applied to both platforms.
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-app-line">
          <button onClick={onClose} className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-gray-500 text-xs mb-1">{label}</label>
      <p className="text-white text-sm">{value}</p>
    </div>
  );
}

function PasswordInput({ value, onChange, show, onToggle, placeholder }: {
  value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void; placeholder: string;
}) {
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-app-surface border border-app-line-muted rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition-colors pr-10 text-sm"
      />
      <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
