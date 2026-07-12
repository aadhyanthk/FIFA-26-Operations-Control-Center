import React from 'react';
import { StadiumMap } from '../dashboard/StadiumMap';
import { MetricCard } from '../dashboard/MetricCard';
import { IncidentFeed } from '../dashboard/IncidentFeed';
import { PredictiveAlerts } from '../dashboard/PredictiveAlerts';
import { useStadiumStore } from '../../store/stadiumStore';

export const OverviewTab: React.FC = () => {
  const { gates, zones, transport, historicalMetrics } = useStadiumStore();

  const totalCapacity = Object.values(zones).reduce((acc, z) => acc + z.maxCapacity, 0);
  const totalOccupancy = Object.values(zones).reduce((acc, z) => acc + z.currentOccupancy, 0);
  const totalQueue = Object.values(gates).reduce((acc, g) => acc + g.queueLength, 0);
  const dispersingCrowdsTotal = transport.dispersingCrowds?.reduce((acc, c) => acc + c.amount, 0) || 0;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 350px',
      gap: 'var(--space-md)',
      height: '100%'
    }}>
      {/* Left Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', minHeight: 0 }}>
        
        {/* Top Metrics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)' }}>
          <MetricCard 
            title="Total Inside" 
            value={Math.round(totalOccupancy)} 
            trend={historicalMetrics?.occupancyTrend || 0} 
            status={totalOccupancy / totalCapacity > 0.9 ? 'warning' : 'ok'} 
          />
          <MetricCard 
            title="Total Outside Queue" 
            value={Math.round(totalQueue)} 
            trend={historicalMetrics?.queueTrend || 0} 
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

        {/* Transport Metrics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)' }}>
          <MetricCard 
            title="Incoming Fan Stream" 
            value={transport.incomingPassengers} 
            status="ok" 
          />
          <MetricCard 
            title="In-Transit (Dispersed)" 
            value={Math.round(dispersingCrowdsTotal)} 
            status={dispersingCrowdsTotal > 1000 ? 'warning' : 'ok'} 
          />
          <MetricCard 
            title="Train Delays" 
            value={transport.trainDelays} 
            format="number"
            status={transport.trainDelays > 15 ? 'warning' : 'ok'} 
          />
          <MetricCard 
            title="Bus Delays" 
            value={transport.busDelays} 
            format="number"
            status={transport.busDelays > 15 ? 'warning' : 'ok'} 
          />
        </div>

        {/* Map */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <StadiumMap />
        </div>

      </div>

      {/* Right Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', minHeight: 0 }}>
        <PredictiveAlerts />
        
        <div style={{ flex: 1, minHeight: 0 }}>
          <IncidentFeed />
        </div>
      </div>
    </div>
  );
};
