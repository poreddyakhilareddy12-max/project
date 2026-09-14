import React, { useState, useEffect } from 'react';
import { alertsApi } from '../services/api';
import { Alert, AlertSeverity, AlertStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { ShieldAlert, CheckCircle2, Clock, MapPin, Filter, RefreshCw } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertsApi.getAll();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (id: number) => {
    try {
      const updated = await alertsApi.acknowledge(id);
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      const updated = await alertsApi.resolve(id);
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const filtered = alerts.filter((a) => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>Automated Incident & Hazard Alerts Triage</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time hazard warnings triggered by ML risk thresholds, road blockages, and remote field reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">All Severities</option>
              <option value="CRITICAL" className="bg-slate-900">CRITICAL</option>
              <option value="HIGH" className="bg-slate-900">HIGH</option>
              <option value="WARNING" className="bg-slate-900">WARNING</option>
              <option value="INFO" className="bg-slate-900">INFO</option>
            </select>
          </div>

          <button
            onClick={fetchAlerts}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filtered.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
              alert.status === 'RESOLVED'
                ? 'bg-slate-900/30 border-slate-800/60 opacity-60'
                : alert.severity === 'CRITICAL'
                ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/20'
                : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <StatusBadge type="alert" value={alert.severity} size="sm" />
                <h3 className="font-bold text-sm text-slate-200">{alert.title}</h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(alert.created_at).toLocaleString()}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  alert.status === 'ACTIVE' 
                    ? 'bg-rose-950 text-rose-300 border border-rose-800/60' 
                    : alert.status === 'ACKNOWLEDGED' 
                    ? 'bg-amber-950 text-amber-300 border border-amber-800/60' 
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                }`}>
                  {alert.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
              <div className="text-cyan-400 flex items-center gap-1 font-mono text-[11px]">
                <MapPin className="w-3.5 h-3.5" />
                <span>{alert.location_name}</span>
              </div>

              {alert.status !== 'RESOLVED' && (
                <div className="flex items-center gap-2">
                  {alert.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1 bg-amber-950 hover:bg-amber-900 border border-amber-700/50 text-amber-300 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Acknowledge Alert
                    </button>
                  )}
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="px-3 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Mark Resolved</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
