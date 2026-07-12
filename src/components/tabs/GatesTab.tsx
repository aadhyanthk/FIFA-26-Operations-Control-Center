import React from 'react';
import { useStadiumStore } from '../../store/stadiumStore';
import { MetricCard } from '../dashboard/MetricCard';

export const GatesTab: React.FC = () => {
  const gates = useStadiumStore(state => state.gates);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <h2 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-md)' }}>Gate Operations</h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 'var(--space-md)'
      }}>
        {Object.values(gates).map(gate => (
          <div key={gate.id} style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: 'var(--space-md)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Gate {gate.id}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <div style={{ 
                  padding: '4px 8px', 
                  borderRadius: 'var(--radius-sm)', 
                  backgroundColor: gate.isOpen ? 'var(--ok-bg)' : 'var(--critical-bg)',
                  color: gate.isOpen ? 'var(--ok)' : 'var(--critical)',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  {gate.isOpen ? 'OPEN' : 'CLOSED'}
                </div>
                <button
                  onClick={() => {
                    useStadiumStore.getState().updateState({
                      gates: {
                        ...useStadiumStore.getState().gates,
                        [gate.id]: { ...gate, isOpen: !gate.isOpen }
                      }
                    });
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Toggle
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <MetricCard 
                title="Queue" 
                value={Math.round(gate.queueLength)} 
                status={gate.queueLength > 500 ? 'warning' : 'ok'} 
              />
              <MetricCard 
                title="Wait Time" 
                value={gate.averageWaitTime} 
                format="time"
                status={gate.averageWaitTime > 15 ? 'warning' : 'ok'} 
              />
            </div>

            <div style={{ marginTop: 'var(--space-md)', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Active Lanes</span>
                <span className="mono">{gate.activeLanes} / 4</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Scanner Status</span>
                <span style={{ 
                  color: gate.scannerStatus === 'operational' ? 'var(--ok)' : 
                         gate.scannerStatus === 'degraded' ? 'var(--warning)' : 'var(--critical)' 
                }}>
                  {gate.scannerStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
