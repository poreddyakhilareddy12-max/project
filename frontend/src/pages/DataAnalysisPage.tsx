import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  Orbit,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import asteroidApi from '../services/api';
import { DistributionDataResponse } from '../types/asteroid';

export const DataAnalysisPage: React.FC = () => {
  const [distData, setDistData] = useState<DistributionDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<string>('estimated_diameter_km');

  useEffect(() => {
    const fetchDistributions = async () => {
      try {
        setLoading(true);
        const res = await asteroidApi.getDistributions();
        setDistData(res);
      } catch (err) {
        console.error('Failed to load dataset distributions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDistributions();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs text-slate-400">Computing Scientific Feature Distributions...</p>
      </div>
    );
  }

  if (!distData) {
    return (
      <div className="p-8 text-center text-rose-400 font-mono text-sm">
        Failed to load feature distribution data.
      </div>
    );
  }

  const featureOptions = [
    { key: 'estimated_diameter_km', label: 'Estimated Diameter (km)' },
    { key: 'relative_velocity_kms', label: 'Relative Velocity (km/s)' },
    { key: 'miss_distance_km', label: 'Miss Distance (km)' },
    { key: 'eccentricity', label: 'Orbital Eccentricity (e)' },
    { key: 'inclination_deg', label: 'Orbital Inclination (deg °)' },
    { key: 'orbital_period_days', label: 'Orbital Period (days)' },
  ];

  const currentDist = distData[selectedFeature] || distData['estimated_diameter_km'];
  const stats = currentDist?.statistics || {
    mean_all: 0,
    mean_hazardous: 0,
    mean_non_hazardous: 0,
    median_all: 0,
    std_all: 0,
    min: 0,
    max: 0,
  };

  const chartData = (currentDist?.histogram || []).map((h) => ({
    range: h.range_label,
    Hazardous: h.hazardous_count,
    NonHazardous: h.non_hazardous_count,
    Total: h.total_count,
  }));

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>DATASET STATISTICAL EXPLORATION & DISTRIBUTIONS</span>
          </div>
          <h1 className="font-space font-extrabold text-2xl sm:text-3xl text-white">
            Astronomical Feature Distribution Analytics
          </h1>
        </div>

        {/* Feature Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-mono">
          {featureOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSelectedFeature(opt.key)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedFeature === opt.key
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.12)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Statistical Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Overall Dataset Mean</span>
          <span className="text-2xl font-bold font-space text-white mt-1 block">
            {stats.mean_all} <span className="text-xs text-cyan-400 font-mono">{currentDist.unit}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400 mt-1 block">
            Median: {stats.median_all} {currentDist.unit}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/30">
          <span className="text-[10px] font-mono text-rose-400 block uppercase">Hazardous Asteroid Mean</span>
          <span className="text-2xl font-bold font-space text-rose-300 mt-1 block">
            {stats.mean_hazardous} <span className="text-xs text-rose-400 font-mono">{currentDist.unit}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400 mt-1 block">
            PHA Population Average
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30">
          <span className="text-[10px] font-mono text-emerald-400 block uppercase">Non-Hazardous Mean</span>
          <span className="text-2xl font-bold font-space text-emerald-300 mt-1 block">
            {stats.mean_non_hazardous} <span className="text-xs text-emerald-400 font-mono">{currentDist.unit}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400 mt-1 block">
            Safe Population Average
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Observed Range & Spread</span>
          <span className="text-base font-bold font-space text-slate-200 mt-1 block">
            {stats.min} → {stats.max}
          </span>
          <span className="text-[10px] font-mono text-slate-400 mt-1 block">
            Std Dev: ±{stats.std_all}
          </span>
        </div>
      </div>

      {/* Main Histogram Chart */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-space font-bold text-base text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>{currentDist.label} Distribution by Hazard Category</span>
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Comparison of Hazardous (PHA) vs Non-Hazardous Near-Earth Objects across bins
            </p>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="range"
                stroke="#64748b"
                fontSize={10}
                angle={-25}
                textAnchor="end"
                interval={0}
              />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
              <Bar dataKey="Hazardous" fill="#f43f5e" stackId="a" radius={[0, 0, 0, 0]} name="Potentially Hazardous (PHA)" />
              <Bar dataKey="NonHazardous" fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} name="Non-Hazardous (Safe)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scientific Insights Box */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h4 className="font-space font-bold text-sm text-white flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Planetary Defense Distribution Insight: {currentDist.label}</span>
        </h4>
        <p className="text-xs text-slate-300 font-mono leading-relaxed">
          {selectedFeature === 'estimated_diameter_km' &&
            'Hazardous asteroids exhibit a strict lower bound at ~0.14 km (140 meters) consistent with the IAU/NASA Planetary Defense threshold for catastrophic regional destruction. Asteroids below 140m rarely sustain sufficient atmospheric mass retention.'}
          {selectedFeature === 'relative_velocity_kms' &&
            'Encounter velocity peaks around 20-30 km/s for Apollo and Aten asteroids. Higher velocities substantially amplify kinetic energy (E = 0.5 mv²), dramatically increasing the calculated hazard priority.'}
          {selectedFeature === 'miss_distance_km' &&
            'Close approach distances under 0.05 AU (~7.5 million km) represent the screening threshold for potential orbital intersection over century timescales due to gravitational perturbations.'}
          {selectedFeature === 'eccentricity' &&
            'Earth-crossing asteroids typically possess eccentricity e > 0.2, allowing them to traverse between inner perihelion and outer asteroid belt aphelion regions.'}
          {selectedFeature === 'inclination_deg' &&
            'Low orbital inclination objects (i < 10°) spend more time near the ecliptic plane where Earth resides, resulting in higher encounter frequency.'}
          {selectedFeature === 'orbital_period_days' &&
            'Near-Earth asteroids exhibit orbital periods ranging from 250 to 1,500 days, defining orbital resonance and periodicity with Earth.'}
        </p>
      </div>
    </div>
  );
};
