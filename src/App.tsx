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
        <div 
          style={{
            position: 'absolute',
            top: '88px',
            left: 0,
            right: 0,
            zIndex: 50,
            backgroundColor: 'var(--info-bg)',
            color: 'var(--info)',
            borderBottom: '1px solid var(--info-border)',
            padding: '8px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 500,
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div className="flex-row items-center gap-sm">
            <span>📢</span>
            <span>{announcementBanner}</span>
          </div>
          <button 
            onClick={() => setAnnouncementBanner(null)}
            className="btn btn--sm btn--ghost"
            style={{ color: 'var(--info)' }}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="flex-row w-full flex-1" style={{
        marginTop: '88px', // TopBar(48) + TabBar(40)
        marginBottom: '32px', // StatusBar(32)
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Tab Content Placeholder */}
        <div className="flex-1 p-md" style={{ overflowY: 'auto' }}>
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
