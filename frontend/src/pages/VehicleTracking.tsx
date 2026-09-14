import React, { useState, useEffect, useRef } from 'react';
import { vehiclesApi, tripsApi } from '../services/api';
import { Vehicle, Trip } from '../types';
import { LiveMap } from '../components/map/LiveMap';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  Truck, 
  Play, 
  Pause, 
  RotateCcw, 
  Gauge, 
  Radio, 
  MapPin, 
  CheckCircle2,
  ShieldCheck,
  Zap
} from 'lucide-react';

// Waypoints along Guwahati -> Shillong -> Silchar -> Imphal medical alternate corridor
const SIMULATION_WAYPOINTS = [
  { lat: 26.1445, lng: 91.7362, name: 'Guwahati Medical College' },
  { lat: 26.0120, lng: 91.8210, name: 'Jorabat Foothills' },
  { lat: 25.8240, lng: 91.8650, name: 'Nongpoh Valley' },
  { lat: 25.5788, lng: 91.8933, name: 'Shillong Bypass' },
  { lat: 25.4410, lng: 92.1980, name: 'Jowai Junction' },
  { lat: 25.1850, lng: 92.4210, name: 'Khliehriat Hill Climb' },
  { lat: 24.8333, lng: 92.7789, name: 'Silchar Checkpoint' },
  { lat: 24.7890, lng: 93.1250, name: 'Jiribam Border' },
  { lat: 24.8450, lng: 93.4560, name: 'Noney Ridge' },
  { lat: 24.8170, lng: 93.9368, name: 'RIMS Hospital, Imphal' },
];

export const VehicleTracking: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  // Simulation controls
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [speedKmh, setSpeedKmh] = useState(45);
  const timerRef = useRef<any>(null);

  const fetchFleet = async () => {
    try {
      const [vecs, trps] = await Promise.all([
        vehiclesApi.getAll(),
        tripsApi.getAll(),
      ]);
      setVehicles(vecs);
      setTrips(trps);
      if (vecs.length > 0 && selectedVehicleId === null) {
        setSelectedVehicleId(vecs[0].id);
      }
    } catch (err) {
      console.error('Failed to load fleet data:', err);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  // Simulator step logic
  const advanceSimulation = async () => {
    if (vehicles.length === 0) return;
    const targetVehicle = vehicles.find((v) => v.vehicle_type === 'MEDICAL_SUPPLY') || vehicles[0];
    
    setSimStep((prev) => {
      const nextStep = (prev + 1) % SIMULATION_WAYPOINTS.length;
      const wp = SIMULATION_WAYPOINTS[nextStep];

      // Transmit to backend
      vehiclesApi.updateLocation(targetVehicle.id, {
        latitude: wp.lat,
        longitude: wp.lng,
        speed_kmh: speedKmh,
      }).then((updated) => {
        setVehicles((curr) => curr.map((v) => (v.id === updated.id ? updated : v)));
      });

      return nextStep;
    });
  };

  useEffect(() => {
    if (isSimulating) {
      timerRef.current = setInterval(advanceSimulation, 2200);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSimulating, speedKmh, vehicles]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedTrip = trips.find((t) => t.vehicle_id === selectedVehicleId);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-cyan-400" />
            <span>Active Fleet Tracking & Telematics Operations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time GPS telemetry, medical supply priority monitoring, and waypoint interpolation simulation.
          </p>
        </div>

        {/* Real vs Sim Status Banner */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-slate-300 font-semibold">Feed:</span>
          <span className="text-amber-400 font-mono font-bold">SIMULATED FLEET FEED</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-mono">REST /api/vehicles/:id/location ready</span>
        </div>
      </div>

      {/* Simulator Control Dock */}
      <div className="bg-slate-900/90 border border-cyan-800/40 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-700/50 text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">GPS Simulation Engine</div>
            <div className="text-[11px] text-slate-400">
              Simulating Convoy: <strong className="text-rose-400">AS-01-MC-1049 (Medical Supply)</strong> along NH-6 &rarr; NH-37
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              isSimulating
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Movement</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Start Simulation</span>
              </>
            )}
          </button>

          <button
            onClick={advanceSimulation}
            disabled={isSimulating}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            Step 1 Waypoint
          </button>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Speed:</span>
            <span className="font-mono font-bold text-white">{speedKmh} km/h</span>
          </div>
        </div>
      </div>

      {/* Main Map + Fleet Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vehicles List & Selected Telemetry */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Active Registered Fleets ({vehicles.length})
            </h2>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {vehicles.map((v) => {
                const isSelected = v.id === selectedVehicleId;
                const isMed = v.vehicle_type === 'MEDICAL_SUPPLY';
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-950 border-cyan-500 ring-1 ring-cyan-500/40 shadow'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-xs text-white flex items-center gap-1.5">
                        <span>{isMed ? '🚑' : '🚛'}</span>
                        <span>{v.registration_number}</span>
                      </span>
                      <StatusBadge type="vehicle" value={v.status} size="sm" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-medium text-slate-300">{v.vehicle_type}</span>
                      <span className="font-mono text-cyan-400 font-bold">{v.speed_kmh} km/h</span>
                    </div>

                    <div className="text-[10px] text-slate-500 pt-1 font-mono flex items-center justify-between border-t border-slate-800/60 mt-1.5">
                      <span>Coords: [{v.current_lat.toFixed(4)}, {v.current_lng.toFixed(4)}]</span>
                      <span>Ping: {new Date(v.last_gps_ping).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Trip Details */}
          {selectedTrip && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200">Active Freight Assignment</span>
                <span className="font-mono text-[11px] text-cyan-400 font-bold">{selectedTrip.tracking_code}</span>
              </div>

              <div>
                <div className="text-[10px] text-slate-500">Cargo Description:</div>
                <div className="text-xs font-semibold text-slate-200">{selectedTrip.cargo_type}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-500">Origin</div>
                  <div className="font-semibold text-slate-300 truncate">{selectedTrip.origin_name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Destination</div>
                  <div className="font-semibold text-slate-300 truncate">{selectedTrip.destination_name}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Cargo Priority:</span>
                <StatusBadge type="priority" value={selectedTrip.cargo_priority} size="sm" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Disruption Delay:</span>
                <span className="font-mono font-bold text-amber-400">+{selectedTrip.expected_delay_minutes} min</span>
              </div>
            </div>
          )}
        </div>

        {/* Live GIS Map Visualizing Fleets */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>LIVE SATELLITE FLEET RADAR &bull; NORTH EAST INDIA</span>
            </h2>
            <div className="text-xs text-slate-400 font-mono">
              Waypoint: {simStep + 1} / {SIMULATION_WAYPOINTS.length} ({SIMULATION_WAYPOINTS[simStep]?.name})
            </div>
          </div>

          <div className="h-[520px] w-full rounded-xl overflow-hidden">
            <LiveMap
              vehicles={vehicles}
              center={selectedVehicle ? [selectedVehicle.current_lat, selectedVehicle.current_lng] : [25.8, 93.2]}
              zoom={8}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
