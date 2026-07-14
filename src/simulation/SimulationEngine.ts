import type { StadiumState } from '../store/stadiumStore';
import { WeatherEngine } from './WeatherEngine';
import { TransportEngine } from './TransportEngine';
import { ArrivalEngine } from './ArrivalEngine';
import { GateEngine } from './GateEngine';
import { CrowdEngine } from './CrowdEngine';
import { MedicalEngine } from './MedicalEngine';
import { SecurityEngine } from './SecurityEngine';
import { CleaningEngine } from './CleaningEngine';
import { FoodEngine } from './FoodEngine';
import { EventEngine } from './EventEngine';

export class SimulationEngine {
  private engines = [
    new WeatherEngine(),
    new TransportEngine(),
    new ArrivalEngine(),
    new GateEngine(),
    new CrowdEngine(),
    new MedicalEngine(),
    new SecurityEngine(),
    new CleaningEngine(),
    new FoodEngine(),
    new EventEngine(),
  ];

  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    const finalState = this.engines.reduce((acc, engine) => {
      const result = engine.tick({ ...state, ...acc }, deltaTime);
      return { ...acc, ...result };
    }, {} as Partial<StadiumState>);

    // Update historical metrics for dashboard trends every 60 sim seconds
    const currentState = { ...state, ...finalState };
    
    // Add check to initialize if missing
    if (!currentState.historicalMetrics.timeline) {
       currentState.historicalMetrics.timeline = [];
       currentState.historicalMetrics.lastTimelineUpdate = -7200;
    }

    const totalOccupancy = Object.values(currentState.zones).reduce((acc, z) => acc + z.currentOccupancy, 0);
    const totalQueue = Object.values(currentState.gates).reduce((acc, g) => acc + g.queueLength, 0);
    const activeIncidents = currentState.incidents.filter(i => i.status !== 'resolved').length;
    const teamsAvailable = Object.values(currentState.teams).filter(t => t.status === 'idle' && (t.department === 'medical' || t.department === 'security')).length;

    const newMetrics = { ...currentState.historicalMetrics };
    let metricsChanged = false;

    // Timeline update (every 10 seconds for sparklines, keep last 5 mins = 300s = 30 points max)
    if (currentState.simTime - newMetrics.lastTimelineUpdate >= 10) {
       const gatesQueue = Object.values(currentState.gates).reduce((acc, g) => {
         acc[g.id] = g.queueLength;
         return acc;
       }, {} as Record<string, number>);

       const newPoint = { 
         time: currentState.simTime, 
         occupancy: totalOccupancy, 
         queue: totalQueue, 
         incidents: activeIncidents, 
         teamsAvailable,
         gatesQueue 
       };
       newMetrics.timeline = [...newMetrics.timeline.slice(-30), newPoint];
       newMetrics.lastTimelineUpdate = currentState.simTime;
       metricsChanged = true;
    }

    // Trend update (every 60 seconds)
    if (currentState.simTime - newMetrics.lastTrendUpdate >= 60) {
      const lastOccupancy = Math.max(1, newMetrics.lastOccupancy);
      const lastQueue = Math.max(1, newMetrics.lastQueue);
      
      newMetrics.occupancyTrend = Number((((totalOccupancy - lastOccupancy) / lastOccupancy) * 100).toFixed(1));
      newMetrics.queueTrend = Number((((totalQueue - lastQueue) / lastQueue) * 100).toFixed(1));
      newMetrics.lastOccupancy = totalOccupancy;
      newMetrics.lastQueue = totalQueue;
      newMetrics.lastTrendUpdate = currentState.simTime;
      metricsChanged = true;
    }

    if (metricsChanged) {
      finalState.historicalMetrics = newMetrics;
    }

    return finalState;
  }
}
