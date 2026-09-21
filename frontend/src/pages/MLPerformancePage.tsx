import React, { useState, useEffect } from 'react';
import {
  Cpu,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  Sparkles,
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
  LineChart,
  Line,
} from 'recharts';
import asteroidApi from '../services/api';
import { AllMetricsResponse } from '../types/asteroid';

export const MLPerformancePage: React.FC = () => {
  const [metricsData, setMetricsData] = useState<AllMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>('comparison');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const res = await asteroidApi.getMetrics();
        setMetricsData(res);
      } catch (err) {
        console.error('Failed to load metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs text-slate-400">Loading ML Performance & Confusion Matrices...</p>
      </div>
    );
  }

  if (!metricsData) {
    return (
      <div className="p-8 text-center text-rose-400 font-mono text-sm">
        Failed to load ML comparison metrics.
      </div>
    );
  }

  const models = metricsData.models;
  const modelNames = Object.keys(models);

  // Comparison Bar Chart Data
  const chartData = modelNames.map((name) => {
    const m = models[name].metrics;
    return {
      name,
      Accuracy: +(m.accuracy * 100).toFixed(1),
      Precision: +(m.precision * 100).toFixed(1),
      Recall: +(m.recall * 100).toFixed(1),
      F1Score: +(m.f1_score * 100).toFixed(1),
      ROCAUC: +(m.roc_auc * 100).toFixed(1),
    };
  });

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>MODEL BENCHMARKING & VALIDATION PIPELINE</span>
          </div>
          <h1 className="font-space font-extrabold text-2xl sm:text-3xl text-white">
            Machine Learning Performance & Selection
          </h1>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-mono">
          <button
            onClick={() => setSelectedTab('comparison')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedTab === 'comparison' ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Model Comparison
          </button>
          <button
            onClick={() => setSelectedTab('matrices')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedTab === 'matrices' ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Confusion Matrices
          </button>
          <button
            onClick={() => setSelectedTab('roc')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedTab === 'roc' ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            ROC Curves
          </button>
        </div>
      </div>

      {/* Model Selection Policy Box */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900/80 to-slate-900/90 border border-cyan-500/30 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="font-bold">PRODUCTION SELECTION RULE & RATIONALE</span>
        </div>
        <div className="text-white font-space font-bold text-lg">
          Deployed Architecture: <span className="text-cyan-300">{metricsData.selected_model}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-mono">
          {metricsData.selection_rationale}
        </p>
        <div className="flex flex-wrap gap-4 text-xs font-mono pt-2 text-slate-400">
          <div>Optimization Formula: <span className="text-cyan-300">Score = 0.50×Recall + 0.30×F1 + 0.20×ROC-AUC</span></div>
          <div>•</div>
          <div>Test Split: <span className="text-white">{metricsData.dataset_statistics.testing_samples} samples</span> (Stratified 20%)</div>
        </div>
      </div>

      {/* Comparison Tab */}
      {selectedTab === 'comparison' && (
        <div className="space-y-6">
          {/* Bar Chart View */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <h3 className="font-space font-bold text-base text-white mb-4 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Multi-Metric Performance Benchmarking</span>
            </h3>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[80, 100]} stroke="#64748b" fontSize={11} unit="%" />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Recall" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="F1Score" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Precision" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Accuracy" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ROCAUC" fill="#c084fc" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-space font-bold text-sm text-white">
              Standardized Evaluation Metrics on Unseen Test Partition
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4">MODEL ALGORITHM</th>
                    <th className="py-3 px-4 text-center">ACCURACY</th>
                    <th className="py-3 px-4 text-center">PRECISION</th>
                    <th className="py-3 px-4 text-center text-emerald-400 font-bold">RECALL (PHA)</th>
                    <th className="py-3 px-4 text-center">F1-SCORE</th>
                    <th className="py-3 px-4 text-center">ROC-AUC</th>
                    <th className="py-3 px-4 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {modelNames.map((name) => {
                    const m = models[name].metrics;
                    const isSelected = name === metricsData.selected_model;
                    return (
                      <tr key={name} className={isSelected ? 'bg-cyan-950/20' : 'hover:bg-slate-800/30'}>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <div className="flex items-center space-x-2">
                            <span>{name}</span>
                            {isSelected && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                                DEPLOYED
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {models[name].description}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold">{(m.accuracy * 100).toFixed(2)}%</td>
                        <td className="py-3.5 px-4 text-center font-bold">{(m.precision * 100).toFixed(2)}%</td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-emerald-400">
                          {(m.recall * 100).toFixed(2)}%
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold">{(m.f1_score * 100).toFixed(2)}%</td>
                        <td className="py-3.5 px-4 text-center font-bold">{m.roc_auc.toFixed(4)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isSelected ? 'Primary' : 'Benchmark'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confusion Matrices Tab */}
      {selectedTab === 'matrices' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modelNames.map((name) => {
            const cm = models[name].confusion_matrix;
            const isSelected = name === metricsData.selected_model;
            return (
              <div
                key={name}
                className={`p-6 rounded-2xl border ${
                  isSelected ? 'bg-slate-900 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-slate-900/80 border-slate-800'
                } space-y-4`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-space font-bold text-base text-white">{name}</h3>
                  {isSelected && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                      SELECTED
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-center font-mono">
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-400 block font-semibold">TN (Safe Correct)</span>
                    <span className="text-xl font-bold text-white mt-1 block">{cm.true_negative}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700">
                    <span className="text-[10px] text-amber-400 block font-semibold">FP (False Alarm)</span>
                    <span className="text-xl font-bold text-white mt-1 block">{cm.false_positive}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40">
                    <span className="text-[10px] text-rose-400 block font-semibold">FN (Missed PHA)</span>
                    <span className="text-xl font-bold text-rose-300 mt-1 block">{cm.false_negative}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
                    <span className="text-[10px] text-cyan-400 block font-semibold">TP (Caught PHA)</span>
                    <span className="text-xl font-bold text-white mt-1 block">{cm.true_positive}</span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800 flex justify-between">
                  <span>Recall: <strong className="text-emerald-400">{(models[name].metrics.recall * 100).toFixed(1)}%</strong></span>
                  <span>F1: <strong className="text-cyan-300">{(models[name].metrics.f1_score * 100).toFixed(1)}%</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ROC Curves Tab */}
      {selectedTab === 'roc' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div>
            <h3 className="font-space font-bold text-base text-white">Receiver Operating Characteristic (ROC)</h3>
            <p className="text-xs font-mono text-slate-400">True Positive Rate vs False Positive Rate across probability thresholds</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={models[metricsData.selected_model]?.roc_curve || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="fpr" stroke="#64748b" fontSize={11} unit="" label={{ value: 'False Positive Rate (1 - Specificity)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#94a3b8' }} />
                <YAxis dataKey="tpr" stroke="#64748b" fontSize={11} domain={[0, 1]} label={{ value: 'True Positive Rate (Recall)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(val: any) => [val, 'Rate']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="tpr" stroke="#06b6d4" strokeWidth={2.5} dot={false} name="Active Model ROC" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Educational Guide on Planetary Defense Metrics */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <h3 className="font-space font-bold text-base text-white flex items-center space-x-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Understanding Planetary Defense ML Metrics</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <span className="text-emerald-400 font-bold block text-sm">RECALL (True Positive Rate)</span>
            <p className="text-slate-400 leading-relaxed">
              <strong className="text-white">Why it matters most:</strong> In planetary defense screening, missing a genuine hazardous asteroid (False Negative) would have catastrophic consequences. A high recall guarantees that no potential threat goes unflagged for optical follow-up.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <span className="text-sky-300 font-bold block text-sm">PRECISION & F1-SCORE</span>
            <p className="text-slate-400 leading-relaxed">
              <strong className="text-white">Operational efficiency:</strong> Precision measures what fraction of flagged objects are truly hazardous. A high F1-score balances high recall with minimal false alarm fatigue for telescope observation crews.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <span className="text-purple-300 font-bold block text-sm">ROC-AUC SCORE</span>
            <p className="text-slate-400 leading-relaxed">
              <strong className="text-white">Discrimination capability:</strong> Area under the ROC curve measures the model's ability to rank a random hazardous asteroid higher than a random non-hazardous asteroid across all possible probability thresholds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
