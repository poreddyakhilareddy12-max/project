import React from 'react';
import { ShieldAlert, Globe, Database, Cpu, ExternalLink } from 'lucide-react';

export const Footer: React.FC<{ onSelectTab: (tab: string) => void }> = ({ onSelectTab }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#050811] text-slate-400 text-xs py-10 mt-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-space font-bold text-base text-white">ASTRA-SAFE</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                Planetary Defense Screening
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
              Automated artificial intelligence platform performing rapid preliminary hazard classification
              of Near-Earth Asteroids (NEOs) through multidimensional physical and Keplerian orbital parameter evaluation.
            </p>
            <div className="flex items-center space-x-4 pt-1 font-mono text-[11px] text-slate-500">
              <span>Stack: FastAPI • XGBoost • React • TypeScript</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Platform Navigation</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onSelectTab('dashboard')} className="hover:text-cyan-400 transition-colors">
                  Operations Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('analyze')} className="hover:text-cyan-400 transition-colors">
                  AI Asteroid Inference
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('explorer')} className="hover:text-cyan-400 transition-colors">
                  Catalog Explorer
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('ml-performance')} className="hover:text-cyan-400 transition-colors">
                  Model Verification & Metrics
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('data-analysis')} className="hover:text-cyan-400 transition-colors">
                  Orbital Data Distributions
                </button>
              </li>
            </ul>
          </div>

          {/* Scientific Sources */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Scientific Data Sources</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://cneos.jpl.nasa.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 hover:text-cyan-400 transition-colors"
                >
                  <span>NASA JPL CNEOS</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 hover:text-cyan-400 transition-colors"
                >
                  <span>JPL Small-Body Database</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://minorplanetcenter.net/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 hover:text-cyan-400 transition-colors"
                >
                  <span>IAU Minor Planet Center</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Scientific Disclaimer Banner */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-200/90 flex items-start space-x-3 text-xs leading-relaxed mb-6">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">SCIENTIFIC DISCLAIMER: </span>
            This system provides preliminary machine-learning-based screening and is not a replacement for professional orbital analysis or confirmed impact prediction. Model outputs reflect statistical feature attributions and do not compute N-body gravitational perturbational trajectories.
          </div>
        </div>

        <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
          <p>© 2026 ASTRA-SAFE Planetary Defense Intelligence. Developed as an AI/ML Research & Educational System.</p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0 font-mono">
            <span>NASA/JPL NeoWS Calibrated</span>
            <span>•</span>
            <span>SHAP Explainability Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
