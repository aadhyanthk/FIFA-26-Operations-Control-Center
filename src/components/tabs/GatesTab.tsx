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
          <div key={gate.id} className="card flex-col gap-md">
            <div className="flex-row justify-between items-center">
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

            <div className="text-base text-secondary">
              <div className="flex-row justify-between mb-xs">
                <span>Active Lanes</span>
                <span className="mono">{gate.activeLanes} Lanes</span>
              </div>
              <div className="flex-row justify-between">
                <span>Scanner Status</span>
                <span className={`font-medium ${gate.scannerStatus === 'operational' ? 'text-ok' : gate.scannerStatus === 'degraded' ? 'text-warning' : 'text-critical'}`} style={{ color: `var(--${gate.scannerStatus === 'operational' ? 'ok' : gate.scannerStatus === 'degraded' ? 'warning' : 'critical'})` }}>
                  {gate.scannerStatus.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="p-sm mt-xs" style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
              <div className="text-sm font-semibold mb-sm text-primary">Manual Reroute</div>
              <div className="flex-row gap-sm items-center">
                <select id={`reroute-dest-${gate.id}`} className="flex-1 p-xs text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  {Object.values(gates).filter(g => g.id !== gate.id && g.isOpen).map(g => (
                    <option key={g.id} value={g.id}>To Gate {g.id}</option>
                  ))}
                </select>
                <select id={`reroute-perc-${gate.id}`} className="p-xs text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  <option value="10">10%</option>
                  <option value="25">25%</option>
                  <option value="50">50%</option>
                </select>
                <button 
                  className="btn btn--sm btn--primary"
                  onClick={async () => {
                    const destSelect = document.getElementById(`reroute-dest-${gate.id}`) as HTMLSelectElement;
                    const percSelect = document.getElementById(`reroute-perc-${gate.id}`) as HTMLSelectElement;
                    if (destSelect && percSelect) {
                      const { ToolExecutor } = await import('../../agent/ToolExecutor');
                      ToolExecutor.execute('reroute_gate', {
                        from_gate: gate.id,
                        to_gate: destSelect.value,
                        percentage: parseInt(percSelect.value, 10)
                      });
                    }
                  }}
                >
                  Dispatch
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
