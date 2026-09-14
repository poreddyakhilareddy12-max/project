import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { BarChart3, TrendingUp, AlertTriangle, Clock, Route, CheckCircle2, RefreshCw } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>Operational Logistics Analytics & Hazard Telemetry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregate performance indicators, bottleneck ranking, and terrain risk distribution across the North Eastern Region.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-slate-500 uppercase font-bold">Monitored Roads</div>
            <div className="text-2xl font-black text-white mt-1 font-mono">{data.kpis.monitored_routes}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-slate-500 uppercase font-bold">Blocked Corridors</div>
            <div className="text-2xl font-black text-rose-400 mt-1 font-mono">{data.kpis.blocked_routes}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-slate-500 uppercase font-bold">High Risk Segments</div>
            <div className="text-2xl font-black text-orange-400 mt-1 font-mono">{data.kpis.high_risk_routes}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-slate-500 uppercase font-bold">Active Fleets</div>
            <div className="text-2xl font-black text-blue-400 mt-1 font-mono">{data.kpis.active_vehicles}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-slate-500 uppercase font-bold">Total Incidents</div>
            <div className="text-2xl font-black text-amber-400 mt-1 font-mono">{data.kpis.total_incidents}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[11px] text-slate-500 uppercase font-bold">Critical Alerts</div>
            <div className="text-2xl font-black text-rose-400 mt-1 font-mono">{data.kpis.active_alerts}</div>
          </div>
        </div>
      )}

      {/* Visual Analytics Charts */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Level Distribution Chart */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Highway Network Risk Score Distribution</span>
            </h2>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.risk_distribution}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {data.risk_distribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              Segment risk scores computed from 24h/72h rainfall, slope gradient, soil moisture, and bridge health.
            </p>
          </div>

          {/* Incident Category Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Field Disruptions by Incident Category</span>
            </h2>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.incident_breakdown} layout="vertical">
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis type="category" dataKey="type" stroke="#64748b" fontSize={11} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#38bdf8" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              Landslide and road subsidence constitute over 65% of recorded disruptions across the region.
            </p>
          </div>
        </div>
      )}

      {/* Corridor Bottleneck Ranking Table */}
      {data && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-400" />
            <span>Major Highway Lifeline Bottlenecks & Travel Delay Ranking</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Highway Corridor</th>
                  <th className="py-3 px-4">Disruption Status</th>
                  <th className="py-3 px-4">Risk Index</th>
                  <th className="py-3 px-4">Predicted Delay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {data.corridors.map((c: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-200">{c.corridor}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'BLOCKED' 
                          ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                          : c.status === 'CAUTION'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-300">{c.risk}/100</td>
                    <td className="py-3 px-4 font-bold text-amber-400">
                      {c.delay_min > 0 ? `+${c.delay_min} min` : 'Normal Flow'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
