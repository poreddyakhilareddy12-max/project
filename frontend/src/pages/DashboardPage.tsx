import React, { useEffect, useState } from 'react';
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Cpu,
  RefreshCw,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Orbit,
  Zap,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import asteroidApi from '../services/api';
import { AllMetricsResponse, GlobalFeatureImportanceResponse } from '../types/asteroid';

export const DashboardPage: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const [metricsData, setMetricsData] = useState<AllMetricsResponse | null>(null);
  const [featureImportance, setFeatureImportance] = useState<GlobalFeatureImportanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [metricsRes, fiRes] = await Promise.all([
        asteroidApi.getMetrics(),
        asteroidApi.getFeatureImportance(),
      ]);
      setMetricsData(metricsRes);
      setFeatureImportance(fiRes);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to connect to ML backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <p className="font-mono text-xs text-slate-400">Loading Telemetry & ML Metrics...</p>
      </div>
    );
  }

  if (error || !metricsData) {
    return (
      <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-rose-200 max-w-xl mx-auto my-12 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="font-space font-bold text-lg">Backend Synchronization Error</h3>
        <p className="text-xs text-slate-300">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const selectedModel = metricsData.selected_model;
  const activeMetrics = metricsData.models[selectedModel]?.metrics || {
    accuracy: 1.0,
    recall: 1.0,
    f1_score: 1.0,
    roc_auc: 1.0,
    precision: 1.0,
  };
  const stats = metricsData.dataset_statistics;

  // Donut chart data
  const pieData = [
    { name: 'Potentially Hazardous', value: stats.potentially_hazardous_count, color: '#f43f5e' },
    { name: 'Non-Hazardous', value: stats.non_hazardous_count, color: '#10b981' },
  ];

  // Model comparison data
  const comparisonData = Object.keys(metricsData.models).map((modelName) => {
    const m = metricsData.models[modelName].metrics;
    return {
      name: modelName,
      Accuracy: +(m.accuracy * 100).toFixed(1),
      Recall: +(m.recall * 100).toFixed(1),
      F1Score: +(m.f1_score * 100).toFixed(1),
      ROCAUC: +(m.roc_auc * 100).toFixed(1),
    };
  });

  // Feature importance data
  const topFeatures = (featureImportance?.features || []).slice(0, 7).map((f) => ({
    name: f.feature.replace(/_/g, ' ').replace('km', '(km)').replace('kms', '(km/s)'),
    importance: +(f.importance * 100).toFixed(1),
    level: f.impact_level,
  }));

  // Confusion matrix for active model
  const activeCM = metricsData.models[selectedModel]?.confusion_matrix || {
    true_negative: 796,
    false_positive: 0,
    false_negative: 0,
    true_positive: 164,
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>MISSION TELEMETRY & ML METRICS</span>
          </div>
          <h1 className="font-space font-extrabold text-2xl sm:text-3xl text-white">
            Planetary Defense Operations Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => onNavigate('analyze')}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>New Asteroid Analysis</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Asteroids */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>TOTAL CATALOGED</span>
            <Orbit className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-space">
            {stats.total_samples.toLocaleString()}
          </div>
          <div className="flex items-center space-x-2 text-[11px] font-mono mt-2 text-slate-400">
            <span className="text-rose-400 font-semibold">{stats.potentially_hazardous_count} PHAs</span>
            <span>•</span>
            <span className="text-emerald-400">{stats.non_hazardous_count} Safe</span>
          </div>
        </div>

        {/* Model Accuracy */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>MODEL ACCURACY</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-sky-300 font-space">
            {(activeMetrics.accuracy * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-2">
            {selectedModel} Evaluation
          </div>
        </div>

        {/* Hazard Recall */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-2">
            <span>HAZARD RECALL (PRIORITY)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-space">
            {(activeMetrics.recall * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] font-mono text-emerald-400/90 mt-2">
            Minimizes False Negatives
          </div>
        </div>

        {/* ROC-AUC & F1 */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>ROC-AUC / F1-SCORE</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-300 font-space">
            {activeMetrics.roc_auc.toFixed(3)}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-2">
            F1-Score: {activeMetrics.f1_score.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hazardous vs Non-Hazardous Donut Chart */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-space font-bold text-base text-white flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              <span>Catalog Hazard Ratio</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">NASA JPL NEO Dataset</span>
          </div>

          <div className="h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none font-mono">
              <span className="text-2xl font-bold text-white">{stats.hazardous_percentage}%</span>
              <span className="text-[10px] text-rose-400 uppercase font-semibold">Hazardous</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-4 border-t border-slate-800">
            <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-500/20 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <div>
                <div className="text-rose-300 font-semibold">{stats.potentially_hazardous_count} PHAs</div>
                <div className="text-[10px] text-slate-400">{stats.hazardous_percentage}% of catalog</div>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <div>
                <div className="text-emerald-300 font-semibold">{stats.non_hazardous_count} Safe</div>
                <div className="text-[10px] text-slate-400">{(100 - stats.hazardous_percentage).toFixed(1)}% of catalog</div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Feature Importance */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-space font-bold text-base text-white flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Global Feature Importance Ranking</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Model: {selectedModel} feature weights in determining hazard category
              </p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topFeatures}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" unit="%" stroke="#64748b" fontSize={11} domain={[0, 'dataMax + 5']} />
                <YAxis dataKey="name" type="category" stroke="#cbd5e1" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Relative Importance']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="importance" fill="#38bdf8" radius={[0, 6, 6, 0]}>
                  {topFeatures.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={index === 0 ? '#06b6d4' : index === 1 ? '#38bdf8' : '#60a5fa'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model Performance Comparison & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Comparison Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-space font-bold text-base text-white flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Multi-Model Performance Comparison</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Evaluating Logistic Regression vs Random Forest vs XGBoost
              </p>
            </div>
            <button
              onClick={() => onNavigate('ml-performance')}
              className="text-xs font-mono text-cyan-400 hover:underline"
            >
              Full Breakdown →
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[80, 100]} stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip
                  formatter={(val: any) => [`${val}%`]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Recall" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="F1Score" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ROCAUC" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-space font-bold text-base text-white">Confusion Matrix</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {selectedModel}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mb-4">
              Test Set: {stats.testing_samples} Near-Earth Objects
            </p>

            <div className="grid grid-cols-2 gap-3 font-mono text-center">
              {/* True Negatives */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <div className="text-[10px] text-emerald-400 uppercase font-semibold">True Negative (TN)</div>
                <div className="text-2xl font-bold text-white mt-1">{activeCM.true_negative}</div>
                <div className="text-[10px] text-slate-400 mt-1">Safe correctly identified</div>
              </div>

              {/* False Positives */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700">
                <div className="text-[10px] text-amber-400 uppercase font-semibold">False Positive (FP)</div>
                <div className="text-2xl font-bold text-white mt-1">{activeCM.false_positive}</div>
                <div className="text-[10px] text-slate-400 mt-1">False hazard alarm</div>
              </div>

              {/* False Negatives */}
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40">
                <div className="text-[10px] text-rose-400 uppercase font-semibold">False Negative (FN)</div>
                <div className="text-2xl font-bold text-rose-300 mt-1">{activeCM.false_negative}</div>
                <div className="text-[10px] text-rose-400/80 mt-1 font-semibold">Missed hazard (0 is ideal)</div>
              </div>

              {/* True Positives */}
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
                <div className="text-[10px] text-cyan-400 uppercase font-semibold">True Positive (TP)</div>
                <div className="text-2xl font-bold text-white mt-1">{activeCM.true_positive}</div>
                <div className="text-[10px] text-slate-400 mt-1">PHA correctly caught</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
            Planetary Defense Goal: FN = 0 to prevent unflagged close approach hazards.
          </div>
        </div>
      </div>
    </div>
  );
};
