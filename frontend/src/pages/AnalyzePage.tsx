import React, { useState, useEffect } from 'react';
import {
  Radio,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Layers,
  BarChart3,
  Orbit,
  ArrowRight,
  Info,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import asteroidApi from '../services/api';
import { AsteroidPredictionRequest, AsteroidPredictionResponse } from '../types/asteroid';
import { OrbitViewer } from '../components/OrbitViewer';

const PRESET_ASTEROIDS = [
  {
    label: '99942 Apophis (Hazardous PHA)',
    name: '99942 Apophis (2004 MN4)',
    estimated_diameter_km: 0.37,
    relative_velocity_kms: 30.73,
    miss_distance_km: 37400,
    eccentricity: 0.191,
    inclination_deg: 3.33,
    orbital_period_days: 323.6,
  },
  {
    label: '101955 Bennu (Hazardous PHA)',
    name: '101955 Bennu (1999 RQ36)',
    estimated_diameter_km: 0.492,
    relative_velocity_kms: 27.72,
    miss_distance_km: 478700,
    eccentricity: 0.204,
    inclination_deg: 6.03,
    orbital_period_days: 436.6,
  },
  {
    label: '65803 Didymos (DART Target - Hazardous)',
    name: '65803 Didymos (1996 GT)',
    estimated_diameter_km: 0.78,
    relative_velocity_kms: 23.41,
    miss_distance_km: 6133000,
    eccentricity: 0.384,
    inclination_deg: 3.41,
    orbital_period_days: 770.8,
  },
  {
    label: '2024 YR4 (Close Flyby - Non-Hazardous Small)',
    name: '2024 YR4',
    estimated_diameter_km: 0.055,
    relative_velocity_kms: 17.12,
    miss_distance_km: 107700,
    eccentricity: 0.342,
    inclination_deg: 1.82,
    orbital_period_days: 529.0,
  },
  {
    label: '433 Eros (Non-Hazardous Amor)',
    name: '433 Eros (1898 DQ)',
    estimated_diameter_km: 16.84,
    relative_velocity_kms: 5.48,
    miss_distance_km: 26630000,
    eccentricity: 0.223,
    inclination_deg: 10.83,
    orbital_period_days: 643.2,
  },
  {
    label: '1 Ceres (Main Belt Giant - Safe)',
    name: '1 Ceres',
    estimated_diameter_km: 939.4,
    relative_velocity_kms: 9.15,
    miss_distance_km: 251300000,
    eccentricity: 0.076,
    inclination_deg: 10.59,
    orbital_period_days: 1681.6,
  },
];

interface AnalyzePageProps {
  initialPreset?: any;
}

export const AnalyzePage: React.FC<AnalyzePageProps> = ({ initialPreset }) => {
  const [formData, setFormData] = useState<AsteroidPredictionRequest>({
    name: 'Custom Asteroid Target',
    estimated_diameter_km: 0.35,
    relative_velocity_kms: 24.5,
    miss_distance_km: 4500000,
    eccentricity: 0.25,
    inclination_deg: 5.4,
    orbital_period_days: 380.0,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AsteroidPredictionResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPreset) {
      setFormData(initialPreset);
    }
  }, [initialPreset]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name?.trim()) errors.name = 'Asteroid Name or ID is required.';
    if (!formData.estimated_diameter_km || formData.estimated_diameter_km <= 0) {
      errors.estimated_diameter_km = 'Diameter must be greater than 0 km.';
    }
    if (!formData.relative_velocity_kms || formData.relative_velocity_kms <= 0) {
      errors.relative_velocity_kms = 'Velocity must be greater than 0 km/s.';
    }
    if (!formData.miss_distance_km || formData.miss_distance_km <= 0) {
      errors.miss_distance_km = 'Miss distance must be greater than 0 km.';
    }
    if (formData.eccentricity < 0 || formData.eccentricity >= 1.0) {
      errors.eccentricity = 'Eccentricity must be between 0.0 and 0.999 (elliptical orbit).';
    }
    if (formData.inclination_deg < 0 || formData.inclination_deg > 180) {
      errors.inclination_deg = 'Inclination must be between 0° and 180°.';
    }
    if (!formData.orbital_period_days || formData.orbital_period_days <= 0) {
      errors.orbital_period_days = 'Orbital period must be positive.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setAnalyzing(true);
      setApiError(null);
      const res = await asteroidApi.predictHazard(formData);
      setResult(res);
    } catch (err: any) {
      console.error('Prediction failed:', err);
      setApiError(err?.response?.data?.detail || err?.message || 'Error executing ML prediction.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePresetSelect = (preset: any) => {
    setFormData({
      name: preset.name,
      estimated_diameter_km: preset.estimated_diameter_km,
      relative_velocity_kms: preset.relative_velocity_kms,
      miss_distance_km: preset.miss_distance_km,
      eccentricity: preset.eccentricity,
      inclination_deg: preset.inclination_deg,
      orbital_period_days: preset.orbital_period_days,
    });
    setValidationErrors({});
    setResult(null);
  };

  const resetForm = () => {
    setFormData({
      name: 'Custom Asteroid Target',
      estimated_diameter_km: 0.35,
      relative_velocity_kms: 24.5,
      miss_distance_km: 4500000,
      eccentricity: 0.25,
      inclination_deg: 5.4,
      orbital_period_days: 380.0,
    });
    setValidationErrors({});
    setResult(null);
    setApiError(null);
  };

  // Prepare horizontal contribution chart data
  const explanationChartData = (result?.feature_contributions || []).map((c) => ({
    name: c.label,
    impact: c.relative_impact_percent,
    direction: c.direction,
    level: c.impact_level,
    rationale: c.scientific_rationale,
  }));

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>AI INFERENCE & FEATURE EXPLAINABILITY ENGINE</span>
          </div>
          <h1 className="font-space font-extrabold text-2xl sm:text-3xl text-white">
            Analyze Asteroid Hazard Profile
          </h1>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400">Load Preset:</span>
          <select
            onChange={(e) => {
              const selected = PRESET_ASTEROIDS.find((p) => p.name === e.target.value);
              if (selected) handlePresetSelect(selected);
            }}
            value={PRESET_ASTEROIDS.some((p) => p.name === formData.name) ? formData.name : ''}
            className="bg-slate-900 border border-sky-800/80 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="">Custom Parameters...</option>
            {PRESET_ASTEROIDS.map((p) => (
              <option key={p.name} value={p.name}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form Column */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-space font-bold text-base text-white flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Physical & Orbital Inputs</span>
              </h2>
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-mono text-slate-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Asteroid Name */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                ASTEROID NAME / DESIGNATION
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. 99942 Apophis or 2026 XK4"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
              {validationErrors.name && (
                <p className="text-[11px] text-rose-400 mt-1 font-mono">{validationErrors.name}</p>
              )}
            </div>

            {/* Diameter (km) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-mono text-slate-300">
                  ESTIMATED DIAMETER <span className="text-cyan-400 font-bold">(km)</span>
                </label>
                <span className="text-xs font-mono text-cyan-300 font-semibold">
                  {formData.estimated_diameter_km} km ({Math.round(formData.estimated_diameter_km * 1000)} m)
                </span>
              </div>
              <input
                type="number"
                step="0.001"
                min="0.001"
                max="1000"
                value={formData.estimated_diameter_km}
                onChange={(e) => setFormData({ ...formData, estimated_diameter_km: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                PHA screening threshold: ≥ 0.14 km (140 meters)
              </p>
              {validationErrors.estimated_diameter_km && (
                <p className="text-[11px] text-rose-400 mt-1 font-mono">{validationErrors.estimated_diameter_km}</p>
              )}
            </div>

            {/* Velocity (km/s) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-mono text-slate-300">
                  RELATIVE VELOCITY <span className="text-cyan-400 font-bold">(km/s)</span>
                </label>
                <span className="text-xs font-mono text-cyan-300 font-semibold">
                  {formData.relative_velocity_kms} km/s
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="120"
                value={formData.relative_velocity_kms}
                onChange={(e) => setFormData({ ...formData, relative_velocity_kms: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
              {validationErrors.relative_velocity_kms && (
                <p className="text-[11px] text-rose-400 mt-1 font-mono">{validationErrors.relative_velocity_kms}</p>
              )}
            </div>

            {/* Miss Distance (km) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-mono text-slate-300">
                  MISS DISTANCE <span className="text-cyan-400 font-bold">(km)</span>
                </label>
                <span className="text-xs font-mono text-cyan-300 font-semibold">
                  {(formData.miss_distance_km / 149597870.7).toFixed(4)} AU
                </span>
              </div>
              <input
                type="number"
                step="1000"
                min="100"
                value={formData.miss_distance_km}
                onChange={(e) => setFormData({ ...formData, miss_distance_km: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                0.05 AU ≈ 7,479,893 km (Critical PHA perimeter)
              </p>
              {validationErrors.miss_distance_km && (
                <p className="text-[11px] text-rose-400 mt-1 font-mono">{validationErrors.miss_distance_km}</p>
              )}
            </div>

            {/* Orbital Eccentricity */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-mono text-slate-300">
                  ORBITAL ECCENTRICITY <span className="text-cyan-400 font-bold">(e)</span>
                </label>
                <span className="text-xs font-mono text-cyan-300 font-semibold">{formData.eccentricity}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.95"
                step="0.005"
                value={formData.eccentricity}
                onChange={(e) => setFormData({ ...formData, eccentricity: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0.0 (Circular)</span>
                <span>0.5 (Elliptical)</span>
                <span>0.95 (Highly Eccentric)</span>
              </div>
            </div>

            {/* Inclination & Orbital Period Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  INCLINATION <span className="text-cyan-400 font-bold">(deg °)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="180"
                  value={formData.inclination_deg}
                  onChange={(e) => setFormData({ ...formData, inclination_deg: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  ORBIT PERIOD <span className="text-cyan-400 font-bold">(days)</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="10"
                  max="10000"
                  value={formData.orbital_period_days}
                  onChange={(e) => setFormData({ ...formData, orbital_period_days: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={analyzing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all cursor-pointer disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                  <span>RUNNING AI INFERENCE...</span>
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4 text-slate-950" />
                  <span>RUN AI ANALYSIS</span>
                </>
              )}
            </button>
          </form>

          {apiError && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{apiError}</span>
            </div>
          )}
        </div>

        {/* Prediction Results & Explanation Column */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div
              className={`p-6 sm:p-8 rounded-2xl transition-all duration-500 relative overflow-hidden space-y-6 ${
                result.is_hazardous ? 'glass-panel-hazard' : 'glass-panel-safe'
              }`}
            >
              {/* Result Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    ASTEROID ANALYSIS COMPLETE
                  </span>
                  <h2 className="font-space font-extrabold text-2xl sm:text-3xl text-white mt-0.5">
                    {result.name}
                  </h2>
                </div>

                <div
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold font-mono uppercase tracking-wider shadow-lg ${
                    result.is_hazardous
                      ? 'bg-rose-500 text-slate-950 shadow-rose-500/20 animate-pulse'
                      : 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                  }`}
                >
                  {result.is_hazardous ? (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>⚠ POTENTIALLY HAZARDOUS</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>✔ NON-HAZARDOUS</span>
                    </>
                  )}
                </div>
              </div>

              {/* Probability & Risk Score Gauge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Predicted Probability</div>
                  <div
                    className={`text-3xl font-extrabold font-space mt-1 ${
                      result.is_hazardous ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {result.hazard_probability_percent}
                  </div>
                  {/* Progress bar confidence */}
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        result.is_hazardous ? 'bg-rose-500' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${result.hazard_probability}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Screening Risk Tier</div>
                  <div className="text-xl font-bold font-space text-white mt-1">{result.risk_level}</div>
                  <div className="text-[11px] font-mono text-slate-400 mt-2">
                    Confidence: <span className="text-cyan-300 font-semibold">{result.confidence_level}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Evaluated Model</div>
                  <div className="text-sm font-bold font-space text-white mt-1">{result.model_used}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-2">
                    {new Date(result.timestamp).toLocaleTimeString()} UTC
                  </div>
                </div>
              </div>

              {/* 2D Orbital Plane Visualizer */}
              <OrbitViewer
                semiMajorAxis={result.input_parameters.semi_major_axis_au || 1.2}
                eccentricity={result.input_parameters.eccentricity}
                inclination={result.input_parameters.inclination_deg}
                asteroidName={result.name}
                isHazardous={result.is_hazardous}
              />

              {/* AI Explainability Bar Chart */}
              <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-space font-bold text-sm text-white flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      <span>AI Feature Attribution & Explanation (SHAP)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Relative statistical influence of parameters on this classification
                    </p>
                  </div>
                </div>

                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={explanationChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 110, bottom: 5 }}
                    >
                      <XAxis type="number" stroke="#64748b" fontSize={10} domain={[-100, 100]} unit="%" />
                      <YAxis dataKey="name" type="category" stroke="#cbd5e1" fontSize={10} tickLine={false} />
                      <Tooltip
                        formatter={(val: any) => [`${val}%`, 'Relative Impact']}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                      />
                      <ReferenceLine x={0} stroke="#475569" strokeWidth={1.5} />
                      <Bar dataKey="impact" radius={[4, 4, 4, 4]}>
                        {explanationChartData.map((entry, idx) => (
                          <Cell
                            key={`expl-bar-${idx}`}
                            fill={entry.impact > 0 ? '#f43f5e' : '#10b981'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Important Contributor Breakdown List */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] font-mono text-slate-400 font-semibold uppercase">
                    Key Parameter Influences:
                  </div>
                  {result.feature_contributions.slice(0, 4).map((fc, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono flex items-start justify-between gap-3"
                    >
                      <div>
                        <span className="font-semibold text-white">{fc.label}:</span>{' '}
                        <span className="text-slate-300">{fc.scientific_rationale}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                          fc.impact_level === 'High'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {fc.impact_level} Impact
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scientific Disclaimer Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/20 text-slate-400 text-[11px] font-mono flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">Notice: </span>
                  {result.scientific_disclaimer}
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="h-full min-h-[480px] p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Orbit className="w-8 h-8 animate-[spin_20s_linear_infinite]" />
              </div>
              <h3 className="font-space font-bold text-lg text-white">Inference Engine Ready</h3>
              <p className="text-xs font-mono text-slate-400 max-w-sm">
                Enter custom asteroid parameters on the left or select a known benchmark object, then click{' '}
                <span className="text-cyan-300 font-semibold">"RUN AI ANALYSIS"</span> to compute real-time hazard probabilities and SHAP feature attributions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
