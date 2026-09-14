import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NetworkProvider } from './context/NetworkContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Login } from './pages/Login';
import { CommandCenter } from './pages/CommandCenter';
import { RoutePlanner } from './pages/RoutePlanner';
import { VehicleTracking } from './pages/VehicleTracking';
import { FieldOperations } from './pages/FieldOperations';
import { DriverDashboard } from './pages/DriverDashboard';
import { DistrictAccessibility } from './pages/DistrictAccessibility';
import { AlertsPage } from './pages/AlertsPage';
import { LowBandwidthMode } from './pages/LowBandwidthMode';
import { AnalyticsPage } from './pages/AnalyticsPage';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('command-center');

  // Set initial tab based on role upon login
  useEffect(() => {
    if (role === 'DRIVER') {
      setActiveTab('driver-cockpit');
    } else if (role === 'FIELD_OFFICIAL') {
      setActiveTab('field-ops');
    } else {
      setActiveTab('command-center');
    }
  }, [role]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
          INITIALIZING NER-LOGIX SECURE ENVIRONMENT...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Universal Operations Header */}
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Operations Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Main Workspace Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950/40">
          {activeTab === 'command-center' && <CommandCenter onNavigate={setActiveTab} />}
          {activeTab === 'route-planner' && <RoutePlanner />}
          {activeTab === 'vehicles' && <VehicleTracking />}
          {activeTab === 'field-ops' && <FieldOperations />}
          {activeTab === 'driver-cockpit' && (
            <DriverDashboard onNavigateToReport={() => setActiveTab('field-ops')} />
          )}
          {activeTab === 'districts' && <DistrictAccessibility />}
          {activeTab === 'alerts' && <AlertsPage />}
          {activeTab === 'low-bandwidth' && <LowBandwidthMode />}
          {activeTab === 'analytics' && <AnalyticsPage />}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <NetworkProvider>
        <MainApp />
      </NetworkProvider>
    </AuthProvider>
  );
}

export default App;
