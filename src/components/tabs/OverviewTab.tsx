import React from 'react';
import { StadiumMap } from '../dashboard/StadiumMap';
import { MetricCard } from '../dashboard/MetricCard';
import { IncidentFeed } from '../dashboard/IncidentFeed';
import { PredictiveAlerts } from '../dashboard/PredictiveAlerts';
import { useStadiumStore } from '../../store/stadiumStore';

export const OverviewTab: React.FC = () => {
  const { gates, zones } = useStadiumStore();

  const totalCapacity = Object.values(zones).reduce((acc, z) => acc + z.maxCapacity, 0);
  const totalOccupancy = Object.values(zones).reduce((acc, z) => acc + z.currentOccupancy, 0);
  const totalQueue = Object.values(gates).reduce((acc, g) => acc + g.queueLength, 0);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 350px',
      gap: 'var(--space-md)',
      height: '100%'
    }}>
      {/* Left Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        
        {/* Top Metrics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)' }}>
          <MetricCard 
            title="Total Inside" 
            value={totalOccupancy} 
            trend={2.4} 
            status={totalOccupancy / totalCapacity > 0.9 ? 'warning' : 'ok'} 
          />
          <MetricCard 
            title="Total Outside Queue" 
            value={totalQueue} 
            trend={-1.2} 
            status={totalQueue > 2000 ? 'warning' : 'ok'} 
          />
          <MetricCard 
            title="Active Incidents" 
            value={useStadiumStore(state => state.incidents.filter(i => i.status !== 'resolved').length)} 
            status="ok" 
          />
          <MetricCard 
            title="Med/Sec Teams Available" 
            value={42} 
            format="number"
            status="ok" 
          />
        </div>

        {/* Map */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <StadiumMap />
        </div>

      </div>

      {/* Right Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <PredictiveAlerts />
        
        <div style={{ flex: 1, minHeight: 0 }}>
          <IncidentFeed />
        </div>
      </div>
    </div>
  );
};
