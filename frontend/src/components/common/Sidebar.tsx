import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Truck, 
  AlertTriangle, 
  ShieldAlert, 
  Navigation, 
  Radio, 
  BarChart3, 
  Compass, 
  Building2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { role } = useAuth();

  const navItems = [
    { id: 'command-center', label: 'Command Center', icon: LayoutDashboard, badge: 'Live GIS' },
    { id: 'route-planner', label: 'Route Planner', icon: Compass, badge: 'AI-Risk' },
    { id: 'vehicles', label: 'Fleet & GPS Tracking', icon: Truck, badge: '4 Active' },
    { id: 'field-ops', label: 'Field Incident Report', icon: AlertTriangle, badge: 'Offline' },
    { id: 'driver-cockpit', label: 'Driver Cockpit', icon: Navigation, badge: 'Mobile' },
    { id: 'districts', label: 'District Accessibility', icon: Building2, badge: 'Matrix' },
    { id: 'alerts', label: 'Alerts & Warnings', icon: ShieldAlert, badge: 'Triage' },
    { id: 'low-bandwidth', label: 'Low-Bandwidth / SMS', icon: Radio, badge: 'USSD' },
    { id: 'analytics', label: 'Analytics & Trends', icon: BarChart3, badge: 'KPI' },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Operations Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-700/50 shadow-sm shadow-cyan-900/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isActive 
                    ? 'bg-cyan-900 text-cyan-200 font-bold' 
                    : 'bg-slate-800/80 text-slate-400 group-hover:bg-slate-800'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/30">
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px]">
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="font-semibold">Region Status:</span>
            <span className="text-amber-400 font-mono font-bold">MONSOON VIGIL</span>
          </div>
          <p className="text-slate-500 text-[10px]">
            Barail & Patkai hill corridors monitoring 10 National Highway lifelines.
          </p>
        </div>
      </div>
    </aside>
  );
};
