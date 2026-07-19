import { useEffect, useRef } from 'react';
import { TopBar } from './components/layout/TopBar';
import { TabBar } from './components/layout/TabBar';
import { StatusBar } from './components/layout/StatusBar';
import { OverviewTab } from './components/tabs/OverviewTab';
import { GatesTab } from './components/tabs/GatesTab';
import { SecurityTab } from './components/tabs/SecurityTab';
import { MedicalTab } from './components/tabs/MedicalTab';
import { MaintenanceTab } from './components/tabs/MaintenanceTab';
import { FoodTab } from './components/tabs/FoodTab';
import { AgentTab } from './components/tabs/AgentTab';
import { AIPanel } from './components/layout/AIPanel';
import { useStadiumStore } from './store/stadiumStore';
import { useUIStore } from './store/uiStore';
import { SimulationEngine } from './simulation/SimulationEngine';

const engine = new SimulationEngine();

function App() {
  const { isPaused, speed, announcementBanner, setAnnouncementBanner } = useStadiumStore();
  const { activeTab } = useUIStore();
  const stateRef = useRef(useStadiumStore.getState());

  useEffect(() => {
    useStadiumStore.subscribe((state) => {
      stateRef.current = state;
    });
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const intervalId = setInterval(() => {
      const currentState = stateRef.current;
      const updates = engine.tick(currentState, 1);
      
      useStadiumStore.getState().tick(1);
      useStadiumStore.getState().updateState(updates);
      
    }, 1000 / speed);

    return () => clearInterval(intervalId);
  }, [isPaused, speed]);

  return (
    <div className="layout-root">
      <TopBar />
      <TabBar />

      {announcementBanner && (
        <div className="announcement-banner">
          <div className="flex-row items-center gap-sm">
            <span>📢</span>
            <span>{announcementBanner}</span>
          </div>
          <button
            onClick={() => setAnnouncementBanner(null)}
            className="btn btn--sm btn--ghost announcement-banner__dismiss"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="layout-content">
        <div className="layout-tab-content">
          {activeTab === 'Overview' && <OverviewTab />}
          {activeTab === 'Gates' && <GatesTab />}
          {activeTab === 'Security' && <SecurityTab />}
          {activeTab === 'Medical' && <MedicalTab />}
          {activeTab === 'Maintenance' && <MaintenanceTab />}
          {activeTab === 'Food' && <FoodTab />}
          {activeTab === 'Agent' && <AgentTab />}
        </div>

        {/* AI Panel */}
        <AIPanel />
      </div>

      <StatusBar />
    </div>
  );
}

export default App;
