import React from 'react';
import { useStadiumStore } from '../../store/stadiumStore';
import { MetricCard } from '../dashboard/MetricCard';

export const GatesTab: React.FC = () => {
  const gates = useStadiumStore(state => state.gates);

  return (
    <div className="flex-col gap-md">
      <h2 className="text-primary mb-md mt-0">Gate Operations</h2>
      
      <div className="grid-auto gap-md">
        {Object.values(gates).map(gate => (
          <div key={gate.id} className="card">
            <div className="flex-row justify-between items-center mb-md">
              <h3 className="m-0 text-primary">Gate {gate.id}</h3>
              <div className="flex-row items-center gap-sm">
                <div className={`badge ${gate.isOpen ? 'badge--ok' : 'badge--critical'}`}>
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
                  className="btn btn--sm btn--ghost"
                >
                  Toggle
                </button>
              </div>
            </div>

            <div className="grid-2 gap-md">
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

            <div className="mt-md text-base text-secondary">
              <div className="flex-row justify-between mb-xs">
                <span>Active Lanes</span>
                <span className="mono">{gate.activeLanes} / 4</span>
              </div>
              <div className="flex-row justify-between">
                <span>Scanner Status</span>
                <span className={`font-medium ${gate.scannerStatus === 'operational' ? 'text-ok' : gate.scannerStatus === 'degraded' ? 'text-warning' : 'text-critical'}`} style={{ color: `var(--${gate.scannerStatus === 'operational' ? 'ok' : gate.scannerStatus === 'degraded' ? 'warning' : 'critical'})` }}>
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
