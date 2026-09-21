import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SpaceCanvas } from './components/SpaceCanvas';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { ExplorerPage } from './pages/ExplorerPage';
import { DetailPage } from './pages/DetailPage';
import { MLPerformancePage } from './pages/MLPerformancePage';
import { DataAnalysisPage } from './pages/DataAnalysisPage';
import { AboutPage } from './pages/AboutPage';
import { AsteroidSummary } from './types/asteroid';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedAsteroidId, setSelectedAsteroidId] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<any | null>(null);

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAsteroid = (id: string) => {
    setSelectedAsteroidId(id);
    setCurrentTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadInAnalyzer = (preset: any) => {
    setSelectedPreset(preset);
    setCurrentTab('analyze');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col relative font-sans">
      {/* Background Animated Space Canvas */}
      <SpaceCanvas />

      {/* Aerospace Navigation Bar */}
      <Navbar currentTab={currentTab} onSelectTab={handleNavigate} />

      {/* Main Content View Container */}
      <main className="flex-grow z-10">
        {currentTab === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            onSelectAsteroidPreset={handleLoadInAnalyzer}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage onNavigate={handleNavigate} />
        )}

        {currentTab === 'analyze' && (
          <AnalyzePage initialPreset={selectedPreset} />
        )}

        {currentTab === 'explorer' && (
          <ExplorerPage
            onSelectAsteroid={handleSelectAsteroid}
            onAnalyzeAsteroid={(ast: AsteroidSummary) => {
              handleLoadInAnalyzer({
                name: ast.name,
                estimated_diameter_km: ast.estimated_diameter_km,
                relative_velocity_kms: ast.relative_velocity_kms,
                miss_distance_km: ast.miss_distance_km,
                eccentricity: ast.eccentricity,
                inclination_deg: ast.inclination_deg,
                orbital_period_days: ast.orbital_period_days,
              });
            }}
          />
        )}

        {currentTab === 'detail' && selectedAsteroidId && (
          <DetailPage
            asteroidId={selectedAsteroidId}
            onBack={() => handleNavigate('explorer')}
            onAnalyze={handleLoadInAnalyzer}
          />
        )}

        {currentTab === 'ml-performance' && <MLPerformancePage />}

        {currentTab === 'data-analysis' && <DataAnalysisPage />}

        {currentTab === 'about' && <AboutPage />}
      </main>

      {/* Aerospace Footer */}
      <Footer onSelectTab={handleNavigate} />
    </div>
  );
};

export default App;
