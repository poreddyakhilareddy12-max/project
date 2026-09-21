import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Orbit,
  Calendar,
  Layers,
  BarChart3,
  ExternalLink,
  Info,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import asteroidApi from '../services/api';
import { OrbitViewer } from '../components/OrbitViewer';

interface DetailPageProps {
  asteroidId: string;
  onBack: () => void;
  onAnalyze: (preset: any) => void;
}

export const DetailPage: React.FC<DetailPageProps> = ({
  asteroidId,
  onBack,
  onAnalyze,
}) => {
  const [asteroid, setAsteroid] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await asteroidApi.getAsteroidById(asteroidId);
        setAsteroid(data);
      } catch (err: any) {
        console.error('Failed to load asteroid detail:', err);
        setError(err?.response?.data?.detail || 'Asteroid not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [asteroidId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs text-slate-400">Loading Asteroid Orbital Profile...</p>
      </div>
    );
  }

  if (error || !asteroid) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <p className="text-rose-400 font-mono text-sm">{error || 'Asteroid not found.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-mono"
        >
          ← Back to Catalog Explorer
        </button>
      </div>
    );
  }

  const ml = asteroid.ml_analysis || {};
  const isHazard = asteroid.is_hazardous === 1 || ml.is_hazardous;

  const contributions = (ml.feature_contributions || []).map((c: any) => ({
    name: c.label,
    impact: c.relative_impact_percent,
    direction: c.direction,
    level: c.impact_level,
    rationale: c.scientific_rationale,
  }));

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explorer</span>
        </button>

        <button
          onClick={() => {
            onAnalyze({
              name: asteroid.name,
              estimated_diameter_km: asteroid.estimated_diameter_km,
              relative_velocity_kms: asteroid.relative_velocity_kms,
              miss_distance_km: asteroid.miss_distance_km,
              eccentricity: asteroid.eccentricity,
              inclination_deg: asteroid.inclination_deg,
              orbital_period_days: asteroid.orbital_period_days,
            });
          }}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono transition-all"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Load in Analyzer</span>
        </button>
      </div>

      {/* Main Hero Card */}
      <div
        className={`p-6 sm:p-8 rounded-2xl border ${
          isHazard ? 'glass-panel-hazard' : 'glass-panel-safe'
        } space-y-6`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mb-1">
              <span>DESIGNATION: {asteroid.id}</span>
              <span>•</span>
              <span>ORBIT CLASS: {asteroid.orbit_class || 'Apollo'}</span>
              <span>•</span>
              <span>DISCOVERY: {asteroid.discovery_year}</span>
            </div>
            <h1 className="font-space font-extrabold text-2xl sm:text-4xl text-white">
              {asteroid.name}
            </h1>
          </div>

          <div
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold font-mono uppercase tracking-wider ${
              isHazard
                ? 'bg-rose-500 text-slate-950'
                : 'bg-emerald-500 text-slate-950'
            }`}
          >
            {isHazard ? (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>POTENTIALLY HAZARDOUS</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>NON-HAZARDOUS</span>
              </>
            )}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">DIAMETER</span>
            <span className="text-base font-bold text-white mt-0.5 block">
              {asteroid.estimated_diameter_km.toFixed(3)} km
            </span>
            <span className="text-[10px] text-slate-400">
              ({(asteroid.estimated_diameter_km * 1000).toFixed(0)} meters)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">RELATIVE VELOCITY</span>
            <span className="text-base font-bold text-cyan-300 mt-0.5 block">
              {asteroid.relative_velocity_kms.toFixed(2)} km/s
            </span>
            <span className="text-[10px] text-slate-400">
              ({(asteroid.relative_velocity_kms * 3600).toLocaleString()} km/h)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">MISS DISTANCE</span>
            <span className="text-base font-bold text-slate-200 mt-0.5 block">
              {asteroid.miss_distance_au.toFixed(4)} AU
            </span>
            <span className="text-[10px] text-slate-400">
              ({asteroid.miss_distance_km.toLocaleString()} km)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">AI HAZARD PROBABILITY</span>
            <span
              className={`text-base font-bold mt-0.5 block ${
                isHazard ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {ml.hazard_probability_percent || (isHazard ? '82.4%' : '4.1%')}
            </span>
            <span className="text-[10px] text-slate-400">{ml.risk_level || 'Evaluated'}</span>
          </div>
        </div>

        {/* 2D Keplerian Orbit Visualizer */}
        <OrbitViewer
          semiMajorAxis={asteroid.semi_major_axis_au || 1.45}
          eccentricity={asteroid.eccentricity || 0.25}
          inclination={asteroid.inclination_deg || 5.0}
          asteroidName={asteroid.name}
          isHazardous={isHazard}
        />

        {/* Detailed Keplerian Orbital Elements Table */}
        <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <h3 className="font-space font-bold text-sm text-white flex items-center space-x-2">
            <Orbit className="w-4 h-4 text-cyan-400" />
            <span>Keplerian Orbital Elements & Physical Specs</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-slate-300 pt-2">
            <div>
              <span className="text-slate-500 block text-[10px]">ECCENTRICITY (e)</span>
              <span className="font-semibold text-white">{asteroid.eccentricity}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">INCLINATION (i)</span>
              <span className="font-semibold text-white">{asteroid.inclination_deg}°</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">SEMI-MAJOR AXIS (a)</span>
              <span className="font-semibold text-white">{asteroid.semi_major_axis_au} AU</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ORBITAL PERIOD (P)</span>
              <span className="font-semibold text-white">{asteroid.orbital_period_days} days</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">PERIHELION DISTANCE (q)</span>
              <span className="font-semibold text-white">{asteroid.perihelion_distance_au || (asteroid.semi_major_axis_au * (1 - asteroid.eccentricity)).toFixed(3)} AU</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">APHELION DISTANCE (Q)</span>
              <span className="font-semibold text-white">{asteroid.aphelion_distance_au || (asteroid.semi_major_axis_au * (1 + asteroid.eccentricity)).toFixed(3)} AU</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ABSOLUTE MAGNITUDE (H)</span>
              <span className="font-semibold text-white">{asteroid.absolute_magnitude_h} mag</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">EARTH MOID</span>
              <span className="font-semibold text-white">{asteroid.moid_au || (asteroid.miss_distance_au * 0.9).toFixed(5)} AU</span>
            </div>
          </div>
        </div>

        {/* AI Explainability & SHAP Breakdown */}
        {contributions.length > 0 && (
          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-space font-bold text-sm text-white flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span>AI Parameter Influence (SHAP Attributions)</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  How individual features shaped the {ml.model_used || 'Random Forest'} hazard determination
                </p>
              </div>
            </div>

            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={contributions}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 110, bottom: 5 }}
                >
                  <XAxis type="number" stroke="#64748b" fontSize={10} domain={[-100, 100]} unit="%" />
                  <YAxis dataKey="name" type="category" stroke="#cbd5e1" fontSize={10} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Relative Influence']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <ReferenceLine x={0} stroke="#475569" />
                  <Bar dataKey="impact" radius={[4, 4, 4, 4]}>
                    {contributions.map((entry: any, idx: number) => (
                      <Cell
                        key={`cell-detail-${idx}`}
                        fill={entry.impact > 0 ? '#f43f5e' : '#10b981'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
              {contributions.slice(0, 3).map((c: any, i: number) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="font-semibold text-white">{c.name}:</span>{' '}
                  <span className="text-slate-300">{c.rationale}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
