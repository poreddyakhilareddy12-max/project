import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Truck, MapPin, AlertCircle, ArrowRight, Lock, User as UserIcon } from 'lucide-react';

interface LoginProps {
  onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl p-8 z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-black text-2xl shadow-lg shadow-cyan-900/40 mb-3">
            NL
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">NER-LOGIX</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            AI-Based Smart Logistics Accessibility Intelligence Platform &bull; North Eastern Region of India
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Username or Official Email
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="admin@nerlogix.gov.in"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all shadow-md shadow-cyan-900/30 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Enter Operations Platform</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Logins for Evaluators */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
            Demo Personas (Click to Load)
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'Password123!')}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-700/50 text-slate-300 flex flex-col items-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-[11px]">Admin</span>
              <span className="text-[9px] text-slate-500">Command</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('official', 'Password123!')}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-700/50 text-slate-300 flex flex-col items-center gap-1 transition-colors"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-[11px]">Field Official</span>
              <span className="text-[9px] text-slate-500">Hazard Ops</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('driver', 'Password123!')}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-700/50 text-slate-300 flex flex-col items-center gap-1 transition-colors"
            >
              <Truck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-[11px]">Convoy Driver</span>
              <span className="text-[9px] text-slate-500">Mobile View</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500">
        Government of India / SIH-2026 Prototype &bull; Autonomous GIS & Hazard Intelligence
      </div>
    </div>
  );
};
