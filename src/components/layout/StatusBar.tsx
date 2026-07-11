import React from 'react';
import { useStadiumStore } from '../../store/stadiumStore';

export const StatusBar: React.FC = () => {
  const { simTime, tickCount, speed, isPaused, setSpeed, togglePause } = useStadiumStore();

  const formatSimTime = (time: number) => {
    // 0 is kickoff (e.g. 15:00)
    // 14:32 (T-28min)
    const kickoffSeconds = 15 * 3600; // 15:00 in seconds
    const currentSeconds = kickoffSeconds + time;
    
    const h = Math.floor(currentSeconds / 3600) % 24;
    const m = Math.floor((currentSeconds % 3600) / 60);
    
    const absMin = Math.floor(Math.abs(time) / 60);
    const tString = time < 0 ? `T-${absMin}m` : `T+${absMin}m`;
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} (${tString})`;
  };

  return (
    <div style={{
      height: '32px',
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-md)',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
          Sim: {formatSimTime(simTime)}
        </div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          Tick: {tickCount}
        </div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          Events: {useStadiumStore(state => state.incidents.length)}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <button 
          onClick={() => setSpeed(speed === 10 ? 1 : (speed === 1 ? 2 : (speed === 2 ? 5 : 10)))}
          style={{ 
          color: 'var(--text-primary)', 
          fontSize: '12px', 
          backgroundColor: 'var(--bg-tertiary)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)'
        }}>
          ▶ {speed}x
        </button>
        <button 
          onClick={togglePause}
          style={{ 
          color: isPaused ? 'var(--warning)' : 'var(--text-secondary)', 
          fontSize: '12px', 
          backgroundColor: 'transparent',
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid transparent'
        }}>
          {isPaused ? '▶' : '⏸'}
        </button>
        <button
          onClick={() => {
            const types = ['crowd', 'medical', 'security', 'maintenance', 'weather', 'transport'] as const;
            const type = types[Math.floor(Math.random() * types.length)];
            const severities = ['low', 'medium', 'high', 'critical'] as const;
            const severity = severities[Math.floor(Math.random() * severities.length)];
            const locations = ['Gate A', 'Section 101', 'East Concourse', 'Section 320', 'Gate C', 'West Club'];
            const location = locations[Math.floor(Math.random() * locations.length)];
            
            useStadiumStore.getState().addIncident({
              id: `ev-manual-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: simTime,
              type,
              severity,
              title: `Manual Test Incident (${type})`,
              description: `This is an injected event for testing purposes.`,
              location,
              relatedEvents: [],
              status: 'new'
            });
          }}
          style={{ 
          color: 'var(--accent)', 
          fontSize: '12px', 
          backgroundColor: 'transparent',
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--accent)',
          marginLeft: 'var(--space-md)',
          cursor: 'pointer'
        }}>
          + Event
        </button>
      </div>
    </div>
  );
};
