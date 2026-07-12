import type { StadiumState } from '../store/stadiumStore';

export class TransportEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    const transport = { ...state.transport };
    
    // Rain > 0.7 causes transport delays
    if (state.weather.rainIntensity > 0.7 && Math.random() < 0.05) {
      transport.trainDelays += Math.floor(Math.random() * 5);
      transport.busDelays += Math.floor(Math.random() * 3);
    }
    
    // Train delays occasionally resolve
    if (transport.trainDelays > 0 && Math.random() < 0.02) {
      // Delay resolves, sending a batch of passengers
      transport.incomingPassengers += transport.trainDelays * 50; 
      transport.trainDelays = 0;
    }
    
    // Bus delays resolve
    if (transport.busDelays > 0 && Math.random() < 0.03) {
      transport.incomingPassengers += transport.busDelays * 20;
      transport.busDelays = 0;
    }
    
    // Normal steady stream of arrivals (more closer to kickoff)
    // simTime < 0 means before kickoff
    if (state.simTime > -7200 && state.simTime < 0) {
      // 2 hours before kickoff: peak arrivals around -30 min
      // 2 hours before kickoff: peak arrivals
      if (Math.random() < 0.3) {
        // Generate realistic surges (100 - 500 people per tick)
        transport.incomingPassengers += Math.floor(Math.random() * 400) + 100;
      }
    }
    
    return { transport };
  }
}
