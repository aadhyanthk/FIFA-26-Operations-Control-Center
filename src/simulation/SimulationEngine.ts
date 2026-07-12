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
    if (currentState.historicalMetrics && (currentState.simTime - currentState.historicalMetrics.lastTrendUpdate >= 60)) {
      const totalOccupancy = Object.values(currentState.zones).reduce((acc, z) => acc + z.currentOccupancy, 0);
      const totalQueue = Object.values(currentState.gates).reduce((acc, g) => acc + g.queueLength, 0);
      
      const lastOccupancy = Math.max(1, currentState.historicalMetrics.lastOccupancy);
      const lastQueue = Math.max(1, currentState.historicalMetrics.lastQueue);
      
      const occupancyTrend = Number((((totalOccupancy - lastOccupancy) / lastOccupancy) * 100).toFixed(1));
      const queueTrend = Number((((totalQueue - lastQueue) / lastQueue) * 100).toFixed(1));

      finalState.historicalMetrics = {
        occupancyTrend,
        queueTrend,
        lastOccupancy: totalOccupancy,
        lastQueue: totalQueue,
        lastTrendUpdate: currentState.simTime
      };
    }

    return finalState;
  }
}
