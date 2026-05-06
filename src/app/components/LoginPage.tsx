import { useState } from 'react';
import { Car, LogIn, Eye, EyeOff } from 'lucide-react';
import { loadState } from '../../lib/storage';
import { employees as defaultEmployees } from '../data/mockData';

const DEFAULT_PASSWORD = 'fleet2026';

interface LoginPageProps {
  onLogin: (employeeId: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Use persisted employee list if available
      const employees = loadState('employees', defaultEmployees);
      const employee = employees.find((emp: any) => emp.email.toLowerCase() === email.trim().toLowerCase());

      if (!employee) {
        setError('No account found with that email address.');
        setLoading(false);
        return;
      }

      // Check stored password, fall back to default
      const passwords = loadState<Record<string, string>>('passwords', {});
      const expectedPassword = passwords[employee.id] ?? DEFAULT_PASSWORD;

      if (password !== expectedPassword) {
        setError('Incorrect password. Please try again.');
        setLoading(false);
        return;
      }

      onLogin(employee.id);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <Car className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-white text-3xl font-bold">FleetFlow</h1>
          <p className="text-gray-400 text-sm mt-1">Fleet Management System</p>
        </div>

        {/* Card */}
        <div className="bg-[#1a1d29] border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-white text-xl font-semibold mb-1">Sign in to your account</h2>
          <p className="text-gray-400 text-sm mb-6">Enter your company email and password</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@fleetflow.com"
                required
                className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          Company internal system — contact IT for access issues
        </p>
      </div>
    </div>
  );
}
