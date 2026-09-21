import React from 'react';

interface OrbitViewerProps {
  semiMajorAxis: number; // in AU
  eccentricity: number;
  inclination: number; // in deg
  asteroidName: string;
  isHazardous: boolean;
}

export const OrbitViewer: React.FC<OrbitViewerProps> = ({
  semiMajorAxis,
  eccentricity,
  inclination,
  asteroidName,
  isHazardous,
}) => {
  const width = 360;
  const height = 300;
  const cx = width / 2;
  const cy = height / 2;

  // Scale: 1 AU = 70 pixels
  const auScale = 65;

  const a = Math.max(0.4, Math.min(semiMajorAxis, 3.5)) * auScale;
  const e = Math.min(Math.max(eccentricity, 0.01), 0.92);
  const b = a * Math.sqrt(1 - e * e);
  const focusOffset = a * e;

  // Earth orbit (1 AU, circular approximation for 2D schema)
  const earthR = 1.0 * auScale;

  return (
    <div className="flex flex-col items-center p-4 rounded-xl bg-slate-900/60 border border-slate-800 relative overflow-hidden">
      <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Orbital Plane Projection (2D)</span>
        </span>
        <span className="text-slate-400">e={eccentricity.toFixed(3)} | i={inclination.toFixed(1)}°</span>
      </div>

      <svg width={width} height={height} className="overflow-visible">
        {/* Grid Circles */}
        <circle cx={cx} cy={cy} r={auScale * 0.5} fill="none" stroke="rgba(255,255,255,0.05)" strokeDasharray="2,4" />
        <circle cx={cx} cy={cy} r={auScale * 1.0} fill="none" stroke="rgba(56,189,248,0.2)" strokeDasharray="3,3" />
        <circle cx={cx} cy={cy} r={auScale * 2.0} fill="none" stroke="rgba(255,255,255,0.05)" strokeDasharray="2,4" />

        {/* Orbit distance markers */}
        <text x={cx + earthR + 4} y={cy + 12} fill="#38bdf8" fontSize="9" fontFamily="monospace">
          1.0 AU (Earth)
        </text>
        <text x={cx + auScale * 2.0 + 4} y={cy + 12} fill="#64748b" fontSize="8" fontFamily="monospace">
          2.0 AU
        </text>

        {/* Earth Orbit */}
        <circle
          cx={cx}
          cy={cy}
          r={earthR}
          fill="none"
          stroke="#0284c7"
          strokeWidth="1.5"
          className="opacity-60"
        />
        {/* Earth Marker */}
        <circle cx={cx + earthR * Math.cos(Math.PI * 0.25)} cy={cy - earthR * Math.sin(Math.PI * 0.25)} r="4" fill="#38bdf8" />
        <text
          x={cx + earthR * Math.cos(Math.PI * 0.25) + 6}
          y={cy - earthR * Math.sin(Math.PI * 0.25) + 3}
          fill="#e0f2fe"
          fontSize="10"
          fontFamily="monospace"
        >
          Earth
        </text>

        {/* Asteroid Orbit Ellipse centered at (cx - focusOffset, cy) so Sun is at focal point (cx, cy) */}
        <ellipse
          cx={cx - focusOffset}
          cy={cy}
          rx={a}
          ry={b}
          fill="none"
          stroke={isHazardous ? '#f43f5e' : '#34d399'}
          strokeWidth="2"
          strokeDasharray={isHazardous ? 'none' : '4,2'}
          transform={`rotate(${-inclination * 0.8}, ${cx}, ${cy})`}
        />

        {/* Asteroid Marker at perihelion */}
        <circle
          cx={cx + (a - focusOffset) * 0.85}
          cy={cy - b * 0.4}
          r="5"
          fill={isHazardous ? '#f43f5e' : '#34d399'}
          className="animate-pulse"
        />
        <text
          x={cx + (a - focusOffset) * 0.85 + 7}
          y={cy - b * 0.4 + 4}
          fill={isHazardous ? '#fda4af' : '#6ee7b7'}
          fontSize="10"
          fontWeight="bold"
          fontFamily="monospace"
        >
          {asteroidName.slice(0, 14)}
        </text>

        {/* Sun at Center Focus */}
        <circle cx={cx} cy={cy} r="7" fill="#fbbf24" filter="drop-shadow(0 0 8px #f59e0b)" />
        <circle cx={cx} cy={cy} r="12" fill="rgba(251, 191, 36, 0.2)" />
        <text x={cx - 10} y={cy + 20} fill="#fde68a" fontSize="9" fontFamily="monospace">
          Sun
        </text>
      </svg>

      <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800">
        <span className="flex items-center space-x-1">
          <span className="w-2.5 h-1 bg-cyan-400 inline-block rounded" />
          <span>Earth Orbit</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className={`w-2.5 h-1 ${isHazardous ? 'bg-rose-500' : 'bg-emerald-400'} inline-block rounded`} />
          <span>Target Orbit (a={semiMajorAxis.toFixed(2)} AU)</span>
        </span>
      </div>
    </div>
  );
};
