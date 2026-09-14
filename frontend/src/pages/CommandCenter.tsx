import React, { useEffect, useState } from 'react';
import { 
  RoadSegment, 
  Vehicle, 
  Incident, 
  Alert, 
  District 
} from '../types';
import { 
  routesApi, 
  vehiclesApi, 
  incidentsApi, 
  alertsApi, 
  districtsApi 
} from '../services/api';
import { LiveMap } from '../components/map/LiveMap';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  AlertTriangle, 
  Truck, 
  ShieldAlert, 
  MapPin, 
  Route as RouteIcon, 
  Activity, 
  CheckCircle2, 
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';

interface CommandCenterProps {
  onNavigate: (tab: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ onNavigate }) => {
  const [segments, setSegments] = useState<RoadSegment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [segs, vecs, incs, alts, dists] = await Promise.all([
        routesApi.getSegments(),
        vehiclesApi.getAll(),
        incidentsApi.getAll(),
        alertsApi.getAll(),
        districtsApi.getAll(),
      ]);
      setSegments(segs);
      setVehicles(vecs);
      setIncidents(incs);
      setAlerts(alts);
      setDistricts(dists);
    } catch (err) {
      console.error('Failed to load command center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  const blockedCount = segments.filter((s) => s.is_blocked).length;
  const highRiskCount = segments.filter((s) => s.risk_level === 'HIGH' || s.risk_level === 'CRITICAL').length;
  const criticalDistricts = districts.filter((d) => d.accessibility_status === 'RED' || d.accessibility_status === 'ORANGE').length;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Stat Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Monitored Corridors</span>
            <RouteIcon className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{segments.length}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">1,940 KM Tracked</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active Fleets</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{vehicles.length}</div>
          <div className="text-[10px] text-emerald-400 mt-1 font-mono">1 Medical Convoy</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Road Blockages</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{blockedCount}</div>
          <div className="text-[10px] text-rose-400/80 mt-1 font-mono">NH-2 Mao Landslide</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>High Risk Corridors</span>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-orange-400">{highRiskCount}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Rainfall &gt; 80mm</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active Incidents</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{incidents.length}</div>
          <div className="text-[10px] text-amber-400 mt-1 font-mono">Geo-tagged Reports</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Disrupted Districts</span>
            <MapPin className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{criticalDistricts}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Imphal West & Kohima</div>
        </div>
      </div>

      {/* Main Command Map & Side Advisory Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Large GIS Map */}
        <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="font-bold text-sm text-white tracking-wide">
                NORTH EASTERN REGION &bull; LIVE GEOGRAPHIC LOGISTICS MAP
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={fetchData}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Refresh Map Feeds"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => onNavigate('route-planner')}
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Launch Route Planner</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="h-[520px] w-full rounded-xl overflow-hidden">
            <LiveMap
              segments={segments}
              vehicles={vehicles}
              incidents={incidents}
              zoom={7}
            />
          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80 px-1">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-emerald-500 rounded"></span>
                <span>Low Risk (&lt;30)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-amber-500 rounded"></span>
                <span>Moderate (30-59)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-orange-500 rounded"></span>
                <span>High Risk (60-79)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-rose-500 rounded"></span>
                <span>Blocked / Critical (80-100)</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span>🚑 Medical Priority Convoy</span>
              <span>🚛 Essential Freight</span>
              <span>⚠️ Hazard Geo-pin</span>
            </div>
          </div>
        </div>

        {/* Tactical Feed & Active Warnings */}
        <div className="space-y-4">
          {/* Critical Advisories Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Tactical Alert Feed</span>
              </h3>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-[11px] text-cyan-400 hover:underline font-medium"
              >
                View All ({alerts.length})
              </button>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {alerts.slice(0, 4).map((alt) => (
                <div
                  key={alt.id}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <StatusBadge type="alert" value={alt.severity} size="sm" />
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-200">{alt.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{alt.description}</p>
                  <div className="text-[10px] text-cyan-400/90 font-mono pt-0.5">
                    📍 {alt.location_name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Corridor Health Matrix */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Highway Lifeline Status</span>
              </h3>
              <button
                onClick={() => onNavigate('districts')}
                className="text-[11px] text-cyan-400 hover:underline font-medium"
              >
                Districts
              </button>
            </div>

            <div className="space-y-2">
              {segments.slice(0, 5).map((seg) => (
                <div key={seg.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
                  <div>
                    <span className="font-bold text-slate-200">{seg.highway_name}</span>
                    <span className="text-slate-400 text-[11px] ml-1.5">{seg.start_location} &rarr; {seg.end_location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-400">{seg.current_risk_score}/100</span>
                    <StatusBadge type="risk" value={seg.risk_level} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
