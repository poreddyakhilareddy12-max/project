import React from 'react';

interface StatusBadgeProps {
  type: 'risk' | 'accessibility' | 'priority' | 'alert' | 'vehicle' | 'incident';
  value: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'md' }) => {
  const v = value.toUpperCase();
  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  let colorClasses = 'bg-slate-800 text-slate-300 border border-slate-700';

  if (type === 'risk' || type === 'alert') {
    if (v === 'LOW' || v === 'INFO') {
      colorClasses = 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30';
    } else if (v === 'MODERATE' || v === 'WARNING') {
      colorClasses = 'bg-amber-950/60 text-amber-300 border border-amber-500/30';
    } else if (v === 'HIGH') {
      colorClasses = 'bg-orange-950/60 text-orange-300 border border-orange-500/40';
    } else if (v === 'CRITICAL') {
      colorClasses = 'bg-rose-950/70 text-rose-200 border border-rose-500/50 animate-pulse';
    }
  } else if (type === 'accessibility') {
    if (v === 'GREEN') {
      colorClasses = 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40';
    } else if (v === 'YELLOW') {
      colorClasses = 'bg-amber-950/80 text-amber-300 border border-amber-500/40';
    } else if (v === 'ORANGE') {
      colorClasses = 'bg-orange-950/80 text-orange-300 border border-orange-500/40';
    } else if (v === 'RED') {
      colorClasses = 'bg-rose-950/90 text-rose-200 border border-rose-500/60 animate-pulse';
    }
  } else if (type === 'priority') {
    if (v === 'MEDICAL' || v === 'EMERGENCY') {
      colorClasses = 'bg-rose-900/60 text-rose-300 border border-rose-500/40 font-bold';
    } else if (v === 'ESSENTIAL') {
      colorClasses = 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30';
    } else {
      colorClasses = 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  } else if (type === 'vehicle') {
    if (v === 'ACTIVE' || v === 'ON_TRIP') {
      colorClasses = 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30';
    } else if (v === 'IDLE') {
      colorClasses = 'bg-slate-800 text-slate-400 border border-slate-700';
    } else {
      colorClasses = 'bg-amber-950/60 text-amber-300 border border-amber-500/30';
    }
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full uppercase tracking-wider ${px} ${colorClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {value}
    </span>
  );
};
