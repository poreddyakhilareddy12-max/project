import React, { useState, useEffect } from 'react';
import { routesApi } from '../services/api';
import { RouteCompareResponse, RouteCandidate, CargoPriority } from '../types';
import { LiveMap } from '../components/map/LiveMap';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  Compass, 
  ArrowRight, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Flame, 
  HeartHandshake, 
  Truck, 
  Info,
  Navigation
} from 'lucide-react';

const CITIES = [
  { name: 'Guwahati Medical College (GMCH)', lat: 26.1445, lng: 91.7362 },
  { name: 'RIMS Hospital, Imphal', lat: 24.8170, lng: 93.9368 },
  { name: 'Shillong Civil Hospital', lat: 25.5788, lng: 91.8933 },
  { name: 'Dimapur Logistics Hub', lat: 25.9068, lng: 93.7271 },
  { name: 'Kohima District Hospital', lat: 25.6751, lng: 94.1086 },
  { name: 'Silchar Medical College', lat: 24.8333, lng: 92.7789 },
  { name: 'Aizawl Civil Hospital', lat: 23.7307, lng: 92.7173 },
  { name: 'Agartala Freight Terminal', lat: 23.8315, lng: 91.2868 },
  { name: 'Gangtok STNM Hospital', lat: 27.3389, lng: 88.6065 },
  { name: 'Itanagar Capital Depot', lat: 27.0844, lng: 93.6053 },
];

export const RoutePlanner: React.FC = () => {
  const [originIndex, setOriginIndex] = useState(0); // Guwahati
  const [destIndex, setDestIndex] = useState(1); // Imphal
  const [cargoPriority, setCargoPriority] = useState<CargoPriority>('MEDICAL');
  const [cargoType, setCargoType] = useState('Emergency ICU Medicines & Blood Plasma');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RouteCompareResponse | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');

  const calculateRoutes = async () => {
    try {
      setLoading(true);
      const origin = CITIES[originIndex];
      const dest = CITIES[destIndex];
      const resp = await routesApi.compare({
        origin_name: origin.name,
        origin_lat: origin.lat,
        origin_lng: origin.lng,
        destination_name: dest.name,
        destination_lat: dest.lat,
        destination_lng: dest.lng,
        cargo_priority: cargoPriority,
        cargo_type: cargoType,
      });
      setResult(resp);
      setSelectedRouteId(resp.recommended_route_id);
    } catch (err) {
      console.error('Failed to calculate route comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateRoutes();
  }, []);

  const formatMinutes = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  };

  const selectedCandidate = result?.candidates.find((c) => c.id === selectedRouteId);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <span>AI Risk-Aware Route Optimizer & Medical Corridors</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic terrain disruption calculation integrating slope, rainfall, soil saturation, and field-reported landslides.
          </p>
        </div>

        {cargoPriority === 'MEDICAL' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-semibold shadow-sm">
            <HeartHandshake className="w-4 h-4 text-rose-400" />
            <span>Medical Priority Mode Activated (Alpha = 3.5 Penalty)</span>
          </div>
        )}
      </div>

      {/* Control Configuration Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg">
        {/* Origin Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Origin Location
          </label>
          <select
            value={originIndex}
            onChange={(e) => setOriginIndex(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            {CITIES.map((c, i) => (
              <option key={i} value={i} disabled={i === destIndex}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Destination Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Destination Location
          </label>
          <select
            value={destIndex}
            onChange={(e) => setDestIndex(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            {CITIES.map((c, i) => (
              <option key={i} value={i} disabled={i === originIndex}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cargo Priority */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Cargo Freight Priority
          </label>
          <select
            value={cargoPriority}
            onChange={(e) => setCargoPriority(e.target.value as CargoPriority)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none font-semibold"
          >
            <option value="NORMAL">Normal Commercial Freight</option>
            <option value="ESSENTIAL">Essential Commodities (Food/Fuel)</option>
            <option value="MEDICAL">Medical & Vaccine Shipment</option>
            <option value="EMERGENCY">Disaster Emergency Relief</option>
          </select>
        </div>

        {/* Action Button */}
        <div className="flex items-end">
          <button
            onClick={calculateRoutes}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all shadow-md shadow-cyan-900/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Evaluating Corridors...</span>
            ) : (
              <>
                <span>Calculate Optimal Route</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Analysis Display: Map + Candidate Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Candidate Route Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold uppercase tracking-wider">Candidate Route Corridors ({result?.candidates.length || 0})</span>
            <span>Click card to inspect</span>
          </div>

          {result?.candidates.map((cand) => {
            const isSelected = cand.id === selectedRouteId;
            const isRecommended = cand.id === result.recommended_route_id;

            return (
              <div
                key={cand.id}
                onClick={() => setSelectedRouteId(cand.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/80 ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                {/* Header with Category Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black tracking-wider uppercase font-mono ${
                      cand.category === 'RECOMMENDED' 
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50' 
                        : cand.category === 'SAFEST' 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}>
                      {cand.category}
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      {cand.highway_corridor}
                    </span>
                  </div>
                  {isRecommended && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded-full border border-cyan-500/40">
                      <ShieldCheck className="w-3 h-3" />
                      SYSTEM PICK
                    </span>
                  )}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-2 my-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
                  <div>
                    <div className="text-[10px] text-slate-500">Distance</div>
                    <div className="text-xs font-bold text-slate-200 font-mono">{cand.distance_km} km</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Normal ETA</div>
                    <div className="text-xs font-bold text-slate-300 font-mono">{formatMinutes(cand.normal_eta_minutes)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Expected Delay</div>
                    <div className={`text-xs font-bold font-mono ${cand.expected_delay_minutes > 60 ? 'text-rose-400' : 'text-amber-400'}`}>
                      +{cand.expected_delay_minutes} min
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Risk Score</div>
                    <div className={`text-xs font-bold font-mono ${cand.average_risk_score >= 70 ? 'text-rose-400' : cand.average_risk_score >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {cand.average_risk_score}/100
                    </div>
                  </div>
                </div>

                {/* Total Risk-Adjusted ETA */}
                <div className="flex items-center justify-between text-xs py-1 px-1 border-t border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Risk-Adjusted ETA:</span>
                  </span>
                  <span className="font-bold text-white font-mono text-sm">
                    {formatMinutes(cand.risk_adjusted_eta_minutes)}
                  </span>
                </div>

                {/* Why recommended / warnings */}
                {cand.why_recommended && (
                  <div className="mt-2.5 p-2 rounded-lg bg-cyan-950/40 border border-cyan-700/30 text-[11px] text-cyan-200 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{cand.why_recommended}</span>
                  </div>
                )}

                {/* Delay & Hazard Explanations */}
                <div className="mt-2 space-y-1">
                  {cand.delay_reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                      <span className="text-amber-500 font-bold shrink-0">&bull;</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Large GIS Map Visualizing Selected Route */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <h2 className="font-bold text-sm text-white">
                TERRAIN GEOMETRY &bull; {selectedCandidate?.highway_corridor || 'EVALUATED CORRIDORS'}
              </h2>
            </div>
            {selectedCandidate && (
              <div className="text-xs text-slate-300 flex items-center gap-2 font-mono">
                <span>Dist: <strong>{selectedCandidate.distance_km} km</strong></span>
                <span>Delay: <strong className="text-amber-400">+{selectedCandidate.expected_delay_minutes}m</strong></span>
              </div>
            )}
          </div>

          <div className="h-[560px] w-full rounded-xl overflow-hidden">
            <LiveMap
              activeRoutes={result?.candidates || []}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
              zoom={7}
            />
          </div>

          {/* Segment Details breakdown */}
          {selectedCandidate && (
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-xs space-y-2">
              <div className="font-semibold text-slate-300">Highway Segment Risk Breakdown:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedCandidate.segments_summary.map((seg, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-300 font-medium">{seg.name}</span>
                    <span className="font-mono text-[11px] font-bold text-slate-400">{seg.risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
