import type { StadiumState } from '../store/stadiumStore';

export class TransportEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    const transport = { ...state.transport };
    
    // Calculate delays based on active transport incidents
    let incidentDelay = 0;
    if (state.incidents && state.incidents.length > 0) {
      const activeTransportIncidents = state.incidents.filter(i => i.type === 'transport' && i.status !== 'resolved');
      if (activeTransportIncidents.length > 0) {
        // Each active transport incident adds a delay modifier
        incidentDelay = activeTransportIncidents.length * 15;
      }
    }

    // Weather impact on delays
    if (state.weather.rainIntensity > 0.5) {
      transport.trainDelays = Math.floor(state.weather.rainIntensity * 20) + incidentDelay;
    } else {
      transport.trainDelays = Math.max(0, transport.trainDelays - deltaTime * 0.05) + incidentDelay;
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
      // 10% chance of a massive surge to represent full train/bus arrivals
      if (Math.random() < 0.10) {
        // If there's a transport incident, reduce incoming surge slightly but still burst
        const surgeFactor = incidentDelay > 0 ? 0.5 : 1.0;
        transport.incomingPassengers += Math.floor((Math.random() * 2000 + 1000) * surgeFactor);
      }
    }
    
    return { transport };
  }
}
