import React from 'react';
import { StadiumMap } from '../dashboard/StadiumMap';
import { MetricCard } from '../dashboard/MetricCard';
import { IncidentFeed } from '../dashboard/IncidentFeed';
import { PredictiveAlerts } from '../dashboard/PredictiveAlerts';
import { WeatherStrip } from '../dashboard/WeatherStrip';
import { useStadiumStore } from '../../store/stadiumStore';

export const OverviewTab: React.FC = () => {
  const { gates, zones, transport, historicalMetrics, incidents, teams } = useStadiumStore();

  const totalCapacity = Object.values(zones).reduce((acc, z) => acc + z.maxCapacity, 0);
  const totalOccupancy = Object.values(zones).reduce((acc, z) => acc + z.currentOccupancy, 0);
  const totalQueue = Object.values(gates).reduce((acc, g) => acc + g.queueLength, 0);
  
  const activeIncidents = incidents.filter(i => i.status !== 'resolved').length;
  
  const medSecTeams = Object.values(teams).filter(t => t.department === 'medical' || t.department === 'security');
  const availableTeams = medSecTeams.filter(t => t.status === 'idle').length;

  return (
    <div className="grid-2 h-full gap-md" style={{ gridTemplateColumns: '1fr 350px' }}>
      {/* Left Column */}
      <div className="flex-col gap-md flex-1">
        
        {/* Top Metrics Row */}
        <div className="grid-4 gap-md">
          <MetricCard 
            title="Total Inside" 
            value={Math.round(totalOccupancy)} 
            trend={historicalMetrics?.occupancyTrend || 0} 
            status={totalOccupancy / totalCapacity > 0.9 ? 'warning' : 'ok'}
            progress={(totalOccupancy / totalCapacity) * 100}
            history={historicalMetrics?.timeline}
            dataKey="occupancy"
          />
          <MetricCard 
            title="Total Outside Queue" 
            value={Math.round(totalQueue)} 
            trend={historicalMetrics?.queueTrend || 0} 
            status={totalQueue > 2000 ? 'warning' : 'ok'}
            progress={Math.min(100, (totalQueue / 5000) * 100)}
            history={historicalMetrics?.timeline}
            dataKey="queue"
          />
          <MetricCard 
            title="Active Incidents" 
            value={activeIncidents} 
            status={activeIncidents > 5 ? 'critical' : activeIncidents > 0 ? 'warning' : 'ok'}
            history={historicalMetrics?.timeline}
            dataKey="incidents"
          />
          <MetricCard 
            title="Med/Sec Teams Available" 
            value={availableTeams} 
            format="number"
            status={availableTeams < 2 ? 'critical' : availableTeams < 4 ? 'warning' : 'ok'}
            progress={(availableTeams / (medSecTeams.length || 1)) * 100}
            history={historicalMetrics?.timeline}
            dataKey="teamsAvailable"
          />
        </div>

        {/* Weather Strip */}
        <WeatherStrip />

        {/* Map */}
        <div className="flex-1" style={{ minHeight: '60%' }}>
          <StadiumMap />
        </div>

      </div>

      {/* Right Column */}
      <div className="flex-col gap-md flex-1">
        <PredictiveAlerts />
        
        <div className="flex-1">
          <IncidentFeed />
        </div>
      </div>
    </div>
  );
};
