import { useState } from 'react';
import { Car, LogIn, Eye, EyeOff, Palmtree } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export type Platform = 'fleet' | 'vacation';

interface LoginPageProps {
  onLogin: (employeeId: string, platform: Platform) => void;
  initialPlatform?: Platform;
}

export function LoginPage({ onLogin, initialPlatform = 'fleet' }: LoginPageProps) {
  const [platform, setPlatform] = useState<Platform>(initialPlatform);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isFleet = platform === 'fleet';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: dbError } = await supabase
        .from('employees')
        .select('id, password')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (dbError) {
        if (dbError.code === '42P01' || dbError.code === '42703') {
          setError('Database not set up yet. Please run the SQL setup script in Supabase first.');
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

      onLogin(data.id, platform);
    } catch (err: any) {
      setError('Connection error. Check your internet and try again.');
      setLoading(false);
    }
  };

  const accentBtn = isFleet
    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
    : 'bg-green-600 hover:bg-green-700 shadow-green-600/20';
  const accentBorder = isFleet ? 'focus:border-blue-500' : 'focus:border-green-500';

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Platform selector */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => { setPlatform('fleet'); setError(''); }}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
              isFleet
                ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/20'
                : 'bg-app-surface border-app-line-muted hover:border-gray-600'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isFleet ? 'bg-blue-600' : 'bg-gray-700'}`}>
              <Car className="w-7 h-7 text-white" />
            </div>
            <span className={`font-semibold text-sm ${isFleet ? 'text-white' : 'text-gray-400'}`}>Fleet Reservations</span>
            <span className="text-gray-500 text-xs">Vehicle booking</span>
          </button>

          <button
            onClick={() => { setPlatform('vacation'); setError(''); }}
            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${
              !isFleet
                ? 'bg-green-600/10 border-green-500 shadow-lg shadow-green-500/20'
                : 'bg-app-surface border-app-line-muted hover:border-gray-600'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${!isFleet ? 'bg-green-600' : 'bg-gray-700'}`}>
              <Palmtree className="w-7 h-7 text-white" />
            </div>
            <span className={`font-semibold text-sm ${!isFleet ? 'text-white' : 'text-gray-400'}`}>Vacation Requests</span>
            <span className="text-gray-500 text-xs">Annual leave</span>
          </button>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="New Energy Solutions" className="h-16 w-auto mb-3" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <h1 className="text-white text-2xl font-bold">New Energy Solutions</h1>
          <p className="text-gray-400 text-sm mt-1">{isFleet ? 'Fleet Reservation System' : 'Vacation Management System'}</p>
        </div>

        <div className="bg-app-surface border border-app-line rounded-2xl p-8 shadow-2xl">
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
                className={`w-full bg-app-bg border border-app-line-muted rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors ${accentBorder}`}
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
                  className={`w-full bg-app-bg border border-app-line-muted rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors pr-12 ${accentBorder}`}
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
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-lg ${accentBtn}`}
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
