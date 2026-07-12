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
    return this.engines.reduce((acc, engine) => {
      const result = engine.tick({ ...state, ...acc }, deltaTime);
      return { ...acc, ...result };
    }, {} as Partial<StadiumState>);
  }
}
