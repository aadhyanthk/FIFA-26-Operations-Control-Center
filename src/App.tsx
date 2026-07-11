import { useEffect, useRef } from 'react';
import { TopBar } from './components/layout/TopBar';
import { TabBar } from './components/layout/TabBar';
import { StatusBar } from './components/layout/StatusBar';
import { OverviewTab } from './components/tabs/OverviewTab';
import { useStadiumStore } from './store/stadiumStore';
import { useUIStore } from './store/uiStore';
import { SimulationEngine } from './simulation/SimulationEngine';

const engine = new SimulationEngine();

function App() {
  const { isPaused, speed, updateState } = useStadiumStore();
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
      // At speed multiplier n, the interval is 1000/n ms and each tick advances sim time by 1 second
      const updates = engine.tick(currentState, 1);
      
      useStadiumStore.getState().tick(1);
      useStadiumStore.getState().updateState(updates);
      
    }, 1000 / speed);

    return () => clearInterval(intervalId);
  }, [isPaused, speed]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      <TopBar />
      <TabBar />
      
      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginTop: '88px', // TopBar(48) + TabBar(40)
        marginBottom: '32px', // StatusBar(32)
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden'
      }}>
        {/* Tab Content Placeholder */}
        <div style={{
          flex: 1,
          padding: 'var(--space-md)',
          overflowY: 'auto'
        }}>
          {activeTab === 'Overview' && <OverviewTab />}
          {activeTab !== 'Overview' && (
            <div style={{ color: 'var(--text-secondary)' }}>
              {activeTab} content will go here...
            </div>
          )}
        </div>

        {/* AI Panel Placeholder */}
        <div style={{
          width: '350px',
          borderLeft: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'none' // Hidden for now
        }}>
        </div>
      </div>

      <StatusBar />
    </div>
  );
}

export default App;
