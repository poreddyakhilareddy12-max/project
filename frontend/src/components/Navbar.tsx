import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Activity,
  Search,
  Cpu,
  BarChart3,
  Info,
  Menu,
  X,
  Radio,
  ExternalLink,
  Orbit
} from 'lucide-react';
import asteroidApi from '../services/api';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [activeModel, setActiveModel] = useState<string>('Random Forest');

  useEffect(() => {
    const checkApi = async () => {
      try {
        const health = await asteroidApi.getHealth();
        setApiConnected(health.status === 'healthy' && health.model_loaded);
        if (health.active_model) {
          setActiveModel(health.active_model);
        }
      } catch (err) {
        setApiConnected(false);
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 25000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'analyze', label: 'Analyze Asteroid', icon: Radio },
    { id: 'explorer', label: 'Asteroid Explorer', icon: Search },
    { id: 'data-analysis', label: 'Data Analysis', icon: BarChart3 },
    { id: 'ml-performance', label: 'ML Performance', icon: Cpu },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#070a13]/90 backdrop-blur-md border-b border-sky-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Tag */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onSelectTab('landing')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-sky-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Orbit className="w-6 h-6 animate-[spin_12s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-space font-bold text-lg tracking-wider text-white">
                  ASTRA<span className="text-cyan-400">-SAFE</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-800 text-sky-300">
                  AI-NEO v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
                PLANETARY DEFENSE INTELLIGENCE
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.12)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status Badge */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiConnected === true
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : apiConnected === false
                    ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                    : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span className="text-slate-300">
                {apiConnected === true ? `${activeModel} Active` : apiConnected === false ? 'API Offline' : 'Connecting...'}
              </span>
            </div>

            <button
              onClick={() => onSelectTab('analyze')}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-semibold text-xs hover:from-cyan-400 hover:to-sky-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Run Analysis</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#070a13]/95 border-b border-sky-950 px-4 pt-2 pb-5 space-y-1.5 backdrop-blur-xl">
          <div className="pb-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>MODEL: {activeModel}</span>
            <span className={apiConnected ? 'text-emerald-400' : 'text-rose-400'}>
              {apiConnected ? '● ONLINE' : '○ OFFLINE'}
            </span>
          </div>

          <button
            onClick={() => {
              onSelectTab('landing');
              setMobileOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'landing' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300'
            }`}
          >
            Mission Overview
          </button>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
