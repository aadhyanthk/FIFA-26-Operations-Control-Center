import React from 'react';
import { useStadiumStore } from '../../store/stadiumStore';
import { useShallow } from 'zustand/react/shallow';
import { MetricCard } from '../dashboard/MetricCard';
import { Sparkline } from '../common/Sparkline';

export const GatesTab: React.FC = () => {
  const gates = useStadiumStore(useShallow(state => state.gates));
  const historicalMetrics = useStadiumStore(useShallow(state => state.historicalMetrics));

  const gatesArray = Object.values(gates);
  const openGates = gatesArray.filter(g => g.isOpen).length;
  const totalGates = gatesArray.length;
  const totalThroughput = gatesArray.reduce((acc, g) => acc + (g.currentThroughput || 0), 0);
  const avgWait = gatesArray.reduce((acc, g) => acc + g.averageWaitTime, 0) / (totalGates || 1);

  return (
    <div className="flex-col gap-md">
      <h2 className="text-primary mb-md mt-0">Gate Operations</h2>
      
      <div className="grid-3 gap-md mb-md">
        <MetricCard 
          title="Total Throughput" 
          value={Math.round(totalThroughput)} 
          format="number" 
        />
        <MetricCard 
          title="Avg Wait Time" 
          value={avgWait} 
          format="time" 
          status={avgWait >= 20 ? 'critical' : avgWait >= 10 ? 'warning' : 'ok'} 
        />
        <MetricCard 
          title="Open Gates" 
          value={openGates} 
        />
      </div>

      <div className="grid-auto gap-md">
        {Object.values(gates).map(gate => {
          
          let queueTrendColor = 'var(--text-secondary)';
          if (historicalMetrics.timeline.length >= 2) {
            const first = historicalMetrics.timeline[0].gatesQueue?.[gate.id] || 0;
            const last = historicalMetrics.timeline[historicalMetrics.timeline.length - 1].gatesQueue?.[gate.id] || 0;
            if (last > first) queueTrendColor = 'var(--critical)';
            else if (last < first) queueTrendColor = 'var(--ok)';
          }

          return (
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
              <div className="flex-col">
                <MetricCard 
                  title="Queue" 
                  value={Math.round(gate.queueLength)} 
                  status={gate.queueLength > 500 ? 'warning' : 'ok'} 
                />
                <div className="mt-xs flex-row justify-end">
                  <Sparkline 
                    data={historicalMetrics.timeline} 
                    dataKey={`gatesQueue.${gate.id}`} 
                    width={60} 
                    height={20} 
                    color={queueTrendColor}
                  />
                </div>
              </div>
              <div className="flex-col gap-xs">
                <MetricCard 
                  title="Wait Time" 
                  value={gate.averageWaitTime} 
                  format="time"
                  status={gate.averageWaitTime >= 20 ? 'critical' : gate.averageWaitTime >= 10 ? 'warning' : 'ok'} 
                />
                <div className="text-xs text-secondary mt-xs flex-row justify-between">
                  <span>Throughput</span>
                  <span className="mono font-semibold text-primary">{Math.round(gate.currentThroughput || 0)} / {gate.capacityPerHour} <span className="text-muted">pph</span></span>
                </div>
              </div>
            </div>

            <div className="text-base text-secondary flex-col gap-sm">
              <div className="flex-row justify-between items-center">
                <span>Active Lanes</span>
                <div className="flex-row gap-xs">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(lane => (
                    <div 
                      key={lane}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '2px',
                        backgroundColor: lane <= gate.activeLanes ? 'var(--accent)' : 'var(--bg-tertiary)',
                        border: lane <= gate.activeLanes ? 'none' : '1px solid var(--border)'
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex-col gap-xs">
                <div className="flex-row justify-between items-center">
                  <span>Scanner Health</span>
                  <span className={`text-xs font-semibold ${gate.scannerHealth < 50 ? 'text-critical' : gate.scannerHealth < 80 ? 'text-warning' : 'text-ok'}`}>
                    {Math.round(gate.scannerHealth)}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${gate.scannerHealth}%`,
                    height: '100%',
                    backgroundColor: gate.scannerHealth < 50 ? 'var(--critical)' : gate.scannerHealth < 80 ? 'var(--warning)' : 'var(--ok)',
                    transition: 'width 0.3s ease, background-color 0.3s ease'
                  }} />
                </div>
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
        )})}
      </div>
    </div>
  );
};
