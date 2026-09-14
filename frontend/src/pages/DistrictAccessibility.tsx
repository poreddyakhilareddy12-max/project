import React, { useState, useEffect } from 'react';
import { districtsApi } from '../services/api';
import { District, AccessibilityStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Building2, Search, Filter, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export const DistrictAccessibility: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchDistricts = async () => {
    try {
      setLoading(true);
      const data = await districtsApi.getAll();
      setDistricts(data);
    } catch (err) {
      console.error('Failed to fetch districts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, []);

  const filtered = districts.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || d.accessibility_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <span>District Accessibility & Lifeline Health Index</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic accessibility scores computed across North Eastern districts from road segment hazard evaluations and field incidents.
          </p>
        </div>

        <button
          onClick={fetchDistricts}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Matrix</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search district or state (e.g., Kohima, Assam, Imphal)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="GREEN">GREEN — Accessible</option>
            <option value="YELLOW">YELLOW — Partial Caution</option>
            <option value="ORANGE">ORANGE — High Risk</option>
            <option value="RED">RED — Inaccessible</option>
          </select>
        </div>
      </div>

      {/* District Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d) => (
          <div
            key={d.id}
            className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">{d.name}</h3>
                <span className="text-xs text-slate-400">{d.state}</span>
              </div>
              <StatusBadge type="accessibility" value={d.accessibility_status} size="sm" />
            </div>

            {/* Accessibility Score Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-400">Accessibility Index</span>
                <span className="font-mono font-bold text-slate-200">{d.accessibility_score}/100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    d.accessibility_score >= 80
                      ? 'bg-emerald-500'
                      : d.accessibility_score >= 60
                      ? 'bg-amber-500'
                      : d.accessibility_score >= 40
                      ? 'bg-orange-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, d.accessibility_score))}%` }}
                />
              </div>
            </div>

            {/* Disruptions & Recovery */}
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-center text-xs">
              <div>
                <div className="text-[10px] text-slate-500">Active Blockages</div>
                <div className="font-bold text-slate-200 font-mono mt-0.5">{d.active_disruptions_count}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Est. Clearance</div>
                <div className="font-bold text-amber-400 font-mono mt-0.5">
                  {d.estimated_recovery_hours > 0 ? `${d.estimated_recovery_hours} hrs` : 'Clear'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
