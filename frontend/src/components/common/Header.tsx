import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNetwork } from '../../context/NetworkContext';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  User as UserIcon, 
  LogOut, 
  Layers, 
  SlidersHorizontal,
  ShieldCheck
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { 
    effectiveOnline, 
    isSimulatedOffline, 
    toggleSimulatedOffline, 
    pendingSyncCount, 
    isSyncing, 
    syncPending 
  } = useNetwork();

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Platform Identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-black text-white text-lg tracking-wider shadow-md shadow-cyan-900/30">
          NL
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-white text-base">NER-LOGIX</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40 font-mono font-bold">
              SIH-2026
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            North Eastern Accessibility & Logistics Intelligence
          </p>
        </div>
      </div>

      {/* Network, Sync & Data Source Indicators */}
      <div className="flex items-center gap-2.5">
        {/* Data Badges */}
        <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Feeds:</span>
          <span className="text-emerald-400 font-mono font-medium">OSRM GIS</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 font-mono font-medium">Simulated GPS</span>
          <span className="text-slate-600">|</span>
          <span className="text-purple-400 font-mono font-medium">ML Terrain v1.4</span>
        </div>

        {/* Offline Simulation Button */}
        <button
          onClick={toggleSimulatedOffline}
          title="Toggle simulated offline mode to test remote disconnected scenarios"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
            isSimulatedOffline
              ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Simulate Disconnect:</span>
          <span className="font-bold">{isSimulatedOffline ? 'OFFLINE' : 'ONLINE'}</span>
        </button>

        {/* Real Network Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
            effectiveOnline
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
              : 'bg-rose-950/80 text-rose-300 border-rose-500/50 animate-pulse'
          }`}
        >
          {effectiveOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span>LIVE ONLINE</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>OFFLINE MODE</span>
            </>
          )}
        </div>

        {/* Pending Sync Button */}
        {pendingSyncCount > 0 && (
          <button
            onClick={() => syncPending()}
            disabled={!effectiveOnline || isSyncing}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border transition-all ${
              isSyncing
                ? 'bg-blue-900/60 text-blue-300 border-blue-500/40 animate-pulse'
                : 'bg-amber-900/70 hover:bg-amber-800/80 text-amber-200 border-amber-500/50 shadow-sm'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'SYNCING...' : `${pendingSyncCount} PENDING SYNC`}</span>
          </button>
        )}

        {/* User Info & Role */}
        <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-medium text-slate-200">{user?.full_name || user?.username}</span>
            <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase font-mono">
              {role || 'USER'}
            </span>
          </div>

          <button
            onClick={logout}
            title="Logout of session"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-800"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
