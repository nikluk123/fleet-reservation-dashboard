import { useState } from 'react';
import { Car, LogIn, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface LoginPageProps {
  onLogin: (employeeId: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: dbError } = await supabase
        .from('employees')
        .select('id, password')
        .ilike('email', email.trim())
        .single();

      if (dbError) {
        console.error('Login error:', dbError);
        // 42P01 = table doesn't exist, 42703 = column doesn't exist
        if (dbError.code === '42P01' || dbError.code === '42703') {
          setError('Database not set up yet. Please run the SQL setup script in Supabase first.');
        } else if (dbError.code === 'PGRST116') {
          setError('No account found with that email address.');
        } else {
          setError(`Database error: ${dbError.message}`);
        }
        setLoading(false);
        return;
      }

      if (!data) {
        setError('No account found with that email address.');
        setLoading(false);
        return;
      }

      if (password !== data.password) {
        setError('Incorrect password. Please try again.');
        setLoading(false);
        return;
      }

      onLogin(data.id);
    } catch (err: any) {
      console.error('Login exception:', err);
      setError('Connection error. Check your internet and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <Car className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-white text-3xl font-bold">FleetFlow</h1>
          <p className="text-gray-400 text-sm mt-1">Fleet Management System</p>
        </div>

        <div className="bg-[#1a1d29] border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-white text-xl font-semibold mb-1">Sign in to your account</h2>
          <p className="text-gray-400 text-sm mb-6">Enter your company email and password</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@company.com"
                required
                className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
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
          Company internal system — contact admin for access issues
        </p>
      </div>
    </div>
  );
}
