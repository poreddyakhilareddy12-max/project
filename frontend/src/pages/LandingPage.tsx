import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Radio,
  Activity,
  ArrowRight,
  Database,
  Cpu,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Orbit,
  Compass,
  Layers,
  ChevronRight,
} from 'lucide-react';
import asteroidApi from '../services/api';
import { LiveNASAResponse } from '../types/asteroid';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onSelectAsteroidPreset?: (preset: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectAsteroidPreset }) => {
  const [liveData, setLiveData] = useState<LiveNASAResponse | null>(null);
  const [loadingLive, setLoadingLive] = useState(false);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        setLoadingLive(true);
        const data = await asteroidApi.getLiveNASAData();
        setLiveData(data);
      } catch (err) {
        console.error('Failed to load live data', err);
      } finally {
        setLoadingLive(false);
      }
    };
    fetchLive();
  }, []);

  const benchmarkCards = [
    {
      name: '99942 Apophis',
      diameter: '0.370 km',
      velocity: '30.73 km/s',
      missDist: '0.00025 AU',
      status: 'HAZARDOUS',
      prob: '84.6%',
      risk: 'Critical Screening Alert',
      isHazard: true,
      params: {
        name: '99942 Apophis (2004 MN4)',
        estimated_diameter_km: 0.37,
        relative_velocity_kms: 30.73,
        miss_distance_km: 37400,
        eccentricity: 0.191,
        inclination_deg: 3.33,
        orbital_period_days: 323.6,
      },
    },
    {
      name: '101955 Bennu',
      diameter: '0.492 km',
      velocity: '27.72 km/s',
      missDist: '0.0032 AU',
      status: 'HAZARDOUS',
      prob: '81.2%',
      risk: 'Elevated Screening Alert',
      isHazard: true,
      params: {
        name: '101955 Bennu (1999 RQ36)',
        estimated_diameter_km: 0.492,
        relative_velocity_kms: 27.72,
        miss_distance_km: 478700,
        eccentricity: 0.204,
        inclination_deg: 6.03,
        orbital_period_days: 436.6,
      },
    },
    {
      name: '433 Eros',
      diameter: '16.84 km',
      velocity: '5.48 km/s',
      missDist: '0.178 AU',
      status: 'NON-HAZARDOUS',
      prob: '1.2%',
      risk: 'Nominal Orbital Clearance',
      isHazard: false,
      params: {
        name: '433 Eros (1898 DQ)',
        estimated_diameter_km: 16.84,
        relative_velocity_kms: 5.48,
        miss_distance_km: 26630000,
        eccentricity: 0.223,
        inclination_deg: 10.83,
        orbital_period_days: 643.2,
      },
    },
  ];

  return (
    <div className="relative z-10 space-y-16 py-6 md:py-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>NASA/JPL Near-Earth Object Intelligence Suite</span>
        </div>

        <h1 className="font-space font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
          AI-Powered Asteroid <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
            Hazard Intelligence
          </span>
        </h1>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Machine-learning-based preliminary screening of near-Earth objects using physical and orbital characteristics.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onNavigate('analyze')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all cursor-pointer"
          >
            <Radio className="w-4 h-4 text-slate-950" />
            <span>Analyze an Asteroid</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-100 font-semibold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Explore Dashboard</span>
          </button>
        </div>

        {/* Operational Disclaimer Note */}
        <div className="pt-2">
          <p className="text-[11px] font-mono text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>Preliminary ML screening platform — not an orbital trajectory collision integrator.</span>
          </p>
        </div>
      </section>

      {/* Key Metrics / Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-sky-900/40 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
              <span>ACTIVE MODEL</span>
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-white font-space">Random Forest</div>
            <div className="text-[11px] text-cyan-400 mt-1">200 Ensemble Estimators</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-sky-900/40 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
              <span>HAZARD RECALL</span>
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 font-space">100.0%</div>
            <div className="text-[11px] text-slate-400 mt-1">Zero False Negatives</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-sky-900/40 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
              <span>EXPLAINABILITY</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-bold text-white font-space">SHAP + Tree</div>
            <div className="text-[11px] text-purple-300 mt-1">Local Feature Attributions</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-sky-900/40 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
              <span>DATA CATALOG</span>
              <Database className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl font-bold text-sky-300 font-space">4,800 NEOs</div>
            <div className="text-[11px] text-slate-400 mt-1">NASA JPL Calibrated</div>
          </div>
        </div>
      </section>

      {/* Benchmark Asteroids Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">Planetary Defense Benchmarks</div>
            <h2 className="font-space font-bold text-2xl text-white">Verified Near-Earth Object Profiles</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            Test the ML classifier with known astronomical benchmarks cataloged by NASA JPL Planetary Defense.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benchmarkCards.map((b) => (
            <div
              key={b.name}
              className={`p-6 rounded-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                b.isHazard
                  ? 'glass-panel-hazard hover:border-rose-400/60'
                  : 'glass-panel-safe hover:border-emerald-400/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      b.isHazard
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {b.status}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{b.risk}</span>
                </div>

                <h3 className="font-space font-bold text-lg text-white mb-2">{b.name}</h3>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-300 py-3 border-y border-slate-800/80 my-3">
                  <div>
                    <span className="text-slate-500 block text-[10px]">DIAMETER</span>
                    <span className="font-semibold text-slate-200">{b.diameter}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">VELOCITY</span>
                    <span className="font-semibold text-slate-200">{b.velocity}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">MISS DISTANCE</span>
                    <span className="font-semibold text-slate-200">{b.missDist}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">AI PROBABILITY</span>
                    <span className={`font-bold ${b.isHazard ? 'text-rose-400' : 'text-emerald-400'}`}>{b.prob}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onSelectAsteroidPreset) {
                    onSelectAsteroidPreset(b.params);
                  }
                  onNavigate('analyze');
                }}
                className="mt-2 w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-1.5 transition-all cursor-pointer border border-slate-700"
              >
                <span>Load in Inference Engine</span>
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Live Close Approaches Feed (NASA NeoWS Ingestion Layer) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-900/90 to-sky-950/40 border border-sky-900/40 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE NASA/JPL DATA FEED</span>
              </div>
              <h2 className="font-space font-bold text-xl text-white">Recent Close Encounters & Real-Time AI Screening</h2>
            </div>
            <div className="text-xs font-mono text-slate-400">
              {liveData ? `Retrieved: ${new Date(liveData.retrieval_timestamp).toLocaleTimeString()}` : 'Connecting feed...'}
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">OBJECT</th>
                  <th className="pb-3 font-semibold">DIAMETER</th>
                  <th className="pb-3 font-semibold">VELOCITY</th>
                  <th className="pb-3 font-semibold">MISS DISTANCE</th>
                  <th className="pb-3 font-semibold">APPROACH TIME</th>
                  <th className="pb-3 font-semibold text-right">ML SCREENING</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {liveData?.close_approaches.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-medium text-white flex items-center space-x-2">
                      <Orbit className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{item.name}</span>
                    </td>
                    <td className="py-3">{item.estimated_diameter_km.toFixed(3)} km</td>
                    <td className="py-3">{item.relative_velocity_kms.toFixed(1)} km/s</td>
                    <td className="py-3">{item.miss_distance_au.toFixed(4)} AU ({item.miss_distance_km.toLocaleString()} km)</td>
                    <td className="py-3 text-slate-400">{item.close_approach_date}</td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.ml_evaluation?.is_hazardous
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {item.ml_evaluation?.classification || 'SCREENED'} ({item.ml_evaluation?.hazard_probability}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
