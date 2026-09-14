import React, { useState, useEffect } from 'react';
import { tripsApi, vehiclesApi } from '../services/api';
import { Trip } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  Navigation, 
  MapPin, 
  AlertTriangle, 
  Send, 
  CheckCircle, 
  PhoneCall, 
  Clock, 
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Zap
} from 'lucide-react';

interface DriverDashboardProps {
  onNavigateToReport: () => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({ onNavigateToReport }) => {
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isSendingGps, setIsSendingGps] = useState(false);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const trip = await tripsApi.getMyTrip();
      setActiveTrip(trip);
    } catch (err) {
      console.error('Failed to fetch driver trip:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, []);

  const handleSendGps = () => {
    if ('geolocation' in navigator && activeTrip) {
      setIsSendingGps(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            await vehiclesApi.updateLocation(activeTrip.vehicle_id, {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              speed_kmh: 40,
            });
            setStatusMsg(`GPS Coordinates successfully transmitted to Command Center [${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}]`);
          } catch (e: any) {
            setStatusMsg('Failed to transmit GPS: ' + e.message);
          } finally {
            setIsSendingGps(false);
          }
        },
        (err) => {
          setStatusMsg('GPS hardware error: ' + err.message);
          setIsSendingGps(false);
        },
        { timeout: 5000 }
      );
    }
  };

  const handleReroute = async () => {
    if (!activeTrip) return;
    try {
      const altGeom = JSON.stringify([[26.1445, 91.7362], [25.5788, 91.8933], [24.8333, 92.7789], [24.8170, 93.9368]]);
      const altReasons = JSON.stringify(['Driver accepted Southern Bypass detour via NH-6 & NH-37 to avoid Mao blockage']);
      const updated = await tripsApi.reroute(activeTrip.id, altGeom, altReasons);
      setActiveTrip(updated);
      setStatusMsg('Route recalculation applied: Convoy diverted to Southern Alternate Corridor (Bypassing Mao blockage)!');
    } catch (e: any) {
      setStatusMsg('Reroute failed: ' + e.message);
    }
  };

  const formatMinutes = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-5">
      {/* Mobile Cockpit Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono">
            DRIVER COCKPIT &bull; OUTDOOR MODE
          </span>
          <h1 className="text-lg font-black text-white">Assigned Freight Trip</h1>
        </div>
        <button
          onClick={fetchTrip}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Refresh Trip Status"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-cyan-950/90 border border-cyan-500/50 text-cyan-200 text-xs font-medium leading-relaxed">
          {statusMsg}
        </div>
      )}

      {activeTrip ? (
        <>
          {/* Main Trip Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400">
                {activeTrip.tracking_code}
              </span>
              <StatusBadge type="priority" value={activeTrip.cargo_priority} />
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase">Cargo Manifest:</div>
              <div className="text-base font-bold text-white mt-0.5">{activeTrip.cargo_type}</div>
            </div>

            {/* Route from & to */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-xs text-slate-300 font-semibold">{activeTrip.origin_name}</span>
              </div>
              <div className="ml-1 border-l-2 border-dashed border-slate-800 h-4" />
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
                <span className="text-xs text-slate-300 font-semibold">{activeTrip.destination_name}</span>
              </div>
            </div>

            {/* ETA Comparison */}
            <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Normal ETA</div>
                <div className="text-xs font-bold text-slate-300 font-mono mt-0.5">{formatMinutes(activeTrip.normal_eta_minutes)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Delay</div>
                <div className="text-xs font-bold text-amber-400 font-mono mt-0.5">+{activeTrip.expected_delay_minutes}m</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Risk ETA</div>
                <div className="text-xs font-bold text-white font-mono mt-0.5">{formatMinutes(activeTrip.risk_adjusted_eta_minutes)}</div>
              </div>
            </div>

            {/* Active Hazard Warning Notice */}
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Active Route Advisory:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-200">
                {activeTrip.delay_reasons ? JSON.parse(activeTrip.delay_reasons)[0] : 'Caution: Monsoon road conditions active across mountain passes.'}
              </p>
            </div>
          </div>

          {/* Oversized Driver Outdoor Touch Action Buttons */}
          <div className="space-y-3 pt-1">
            <button
              onClick={onNavigateToReport}
              className="w-full bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-black py-4 px-5 rounded-2xl text-base shadow-lg shadow-amber-950/50 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
            >
              <AlertTriangle className="w-6 h-6" />
              <span>REPORT ROAD HAZARD / INCIDENT</span>
            </button>

            <button
              onClick={handleSendGps}
              disabled={isSendingGps}
              className="w-full bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-800 text-white font-bold py-3.5 px-5 rounded-2xl text-sm shadow-md flex items-center justify-center gap-3 transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              <span>{isSendingGps ? 'Transmitting GPS...' : 'TRANSMIT LIVE GPS PING'}</span>
            </button>

            <button
              onClick={handleReroute}
              className="w-full bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 text-slate-200 font-bold py-3.5 px-5 rounded-2xl text-sm shadow-md flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
            >
              <Navigation className="w-5 h-5 text-cyan-400" />
              <span>ACCEPT RECOMMENDED ALTERNATE BYPASS</span>
            </button>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setStatusMsg('Emergency Distress SOS signal transmitted to Control Room.')}
                className="p-3 bg-rose-950 hover:bg-rose-900 border border-rose-600 text-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>EMERGENCY SOS</span>
              </button>

              <button
                onClick={() => setStatusMsg('Control Room Dispatch: Calling Toll-Free Helpline 1077 (Disaster Management)...')}
                className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>HELPLINE 1077</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-sm">
          No active trip currently assigned to your driver ID.
        </div>
      )}
    </div>
  );
};
