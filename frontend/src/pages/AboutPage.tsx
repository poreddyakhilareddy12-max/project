import React from 'react';
import {
  Info,
  ShieldAlert,
  Database,
  Cpu,
  Orbit,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>PROJECT ARCHITECTURE & SCIENTIFIC METHODOLOGY</span>
        </div>
        <h1 className="font-space font-extrabold text-2xl sm:text-4xl text-white">
          About ASTRA-SAFE
        </h1>
        <p className="text-sm text-slate-300 font-mono mt-1">
          AI-Based Asteroid Hazard Classification & Monitoring Platform
        </p>
      </div>

      {/* Mission & Purpose */}
      <section className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h2 className="font-space font-bold text-lg text-white flex items-center space-x-2">
          <Orbit className="w-5 h-5 text-cyan-400" />
          <span>Mission & Core Purpose</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <strong className="text-white">ASTRA-SAFE</strong> is an aerospace-grade artificial intelligence platform engineered to perform rapid preliminary screening of Near-Earth Objects (NEOs). By leveraging physical metrics (diameter, absolute visual magnitude) alongside Keplerian orbital mechanics (eccentricity, semi-major axis, inclination, orbital period, relative velocity, miss distance), the platform categorizes asteroids into <span className="text-rose-400 font-semibold">Potentially Hazardous Asteroids (PHAs)</span> or <span className="text-emerald-400 font-semibold">Non-Hazardous Asteroids</span>.
        </p>
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs font-mono text-cyan-300">
          Developed as an AI/ML research and educational platform for planetary defense analytics.
        </div>
      </section>

      {/* Critical Distinction: ML Screening vs Orbital Determination */}
      <section className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
        <h2 className="font-space font-bold text-lg text-amber-300 flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span>Crucial Scientific Distinction</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-300 pt-2">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <span className="text-cyan-400 font-bold block text-sm">1. AI Preliminary Screening (ASTRA-SAFE)</span>
            <p className="text-slate-400 leading-relaxed">
              Fast, probabilistic classification using supervised pattern recognition across multidimensional feature spaces. Identifies candidates requiring urgent optical astrometry and prioritizes radar follow-ups.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <span className="text-amber-400 font-bold block text-sm">2. High-Precision Orbital Determination</span>
            <p className="text-slate-400 leading-relaxed">
              Professional NASA JPL / CNEOS Sentry systems utilizing numerical N-body gravitational integrations (including relativistic effects, Yarkovsky non-gravitational acceleration, and planetary ephemerides) to compute exact physical impact probabilities.
            </p>
          </div>
        </div>
      </section>

      {/* Machine Learning Methodology & Architecture */}
      <section className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <h2 className="font-space font-bold text-lg text-white flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>Machine Learning Pipeline & Models</span>
        </h2>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300">
          <p>
            The platform trains, validates, and compares three distinct algorithmic paradigms:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">Logistic Regression</span>
              <p className="text-slate-400">
                Linear decision boundary baseline with class-balanced weighting to establish linear separability benchmarks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30">
              <span className="text-cyan-300 font-bold block mb-1">Random Forest Classifier</span>
              <p className="text-slate-400">
                Ensemble of 200 de-correlated decision trees with balanced bootstrap subsampling, capturing non-linear boundary interactions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-purple-400 font-bold block mb-1">XGBoost Classifier</span>
              <p className="text-slate-400">
                Extreme Gradient Boosting with scale_pos_weight optimization for precise boundary gradients on imbalanced asteroid catalogs.
              </p>
            </div>
          </div>
        </div>

        {/* Explainability */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <h3 className="font-space font-bold text-sm text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Explainable AI (SHAP & TreeExplainer)</span>
          </h3>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            Rather than serving black-box predictions, ASTRA-SAFE integrates Shapley Additive Explanations (SHAP) to calculate exact local feature attributions for every inference request. Users see which features pushed the hazard probability higher (e.g. large diameter, high velocity, close encounter) versus which features mitigated the risk (e.g. high orbital inclination, large miss distance).
          </p>
        </div>
      </section>

      {/* Dataset & Data Governance */}
      <section className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h2 className="font-space font-bold text-lg text-white flex items-center space-x-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Dataset Calibration & Sources</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The dataset is calibrated against the <strong className="text-white">NASA JPL NeoWS (Near-Earth Object Web Service)</strong> and the <strong className="text-white">JPL Small-Body Database (SBDB)</strong>. Features conform to standard IAU astronomical parameters:
        </p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
          <li className="p-2 rounded bg-slate-950 border border-slate-800">✓ Estimated Diameter (km / meters)</li>
          <li className="p-2 rounded bg-slate-950 border border-slate-800">✓ Relative Velocity (km/s)</li>
          <li className="p-2 rounded bg-slate-950 border border-slate-800">✓ Nominal Miss Distance (AU & km)</li>
          <li className="p-2 rounded bg-slate-950 border border-slate-800">✓ Orbital Eccentricity (e)</li>
          <li className="p-2 rounded bg-slate-950 border border-slate-800">✓ Orbital Inclination (i in degrees)</li>
          <li className="p-2 rounded bg-slate-950 border border-slate-800">✓ Orbital Period (days)</li>
          <li className="p-2 rounded bg-slate-950 border border-slate-800">✓ Semi-Major Axis (a in AU)</li>
          <li className="p-2 rounded bg-slate-950 border border-slate-800">✓ Absolute Magnitude (H in mag)</li>
        </ul>
      </section>

      {/* Future Scope */}
      <section className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h2 className="font-space font-bold text-lg text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>Future Scope & Roadmap</span>
        </h2>
        <ul className="space-y-2 text-xs font-mono text-slate-300">
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>Direct WebGL 3D interactive Solar System orbital animation renderer (Three.js).</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>Automatic webhook alerts to astronomical observatories for high-hazard candidates.</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>Integration of asteroid spectral composition data (C-type, S-type, M-type) for impact density modeling.</span>
          </li>
        </ul>
      </section>
    </div>
  );
};
