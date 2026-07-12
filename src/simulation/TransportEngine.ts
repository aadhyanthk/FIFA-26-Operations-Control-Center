import type { StadiumState } from '../store/stadiumStore';

export class TransportEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    const transport = { ...state.transport };
    
    let incidentDelay = 0;
    let totalActiveIncidents = 0;
    if (state.incidents && state.incidents.length > 0) {
      const activeIncidents = state.incidents.filter(i => i.status !== 'resolved');
      totalActiveIncidents = activeIncidents.length;
      const transportIncidents = activeIncidents.filter(i => i.type === 'transport');
      
      // Transport incidents add major delays, other incidents add minor chaotic delays
      incidentDelay = (transportIncidents.length * 15) + ((totalActiveIncidents - transportIncidents.length) * 5);
    }

    // Weather impact on delays
    if (state.weather.rainIntensity > 0.5) {
      transport.trainDelays = Math.floor(state.weather.rainIntensity * 20) + incidentDelay;
    } else {
      transport.trainDelays = Math.max(incidentDelay, transport.trainDelays - deltaTime * 0.05);
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
      // Base probability is 10%, goes up to 30% if incidents are active
      const surgeProbability = totalActiveIncidents > 0 ? 0.30 : 0.10;
      if (Math.random() < surgeProbability) {
        // If there's a transport incident, reduce incoming surge slightly but still burst
        const surgeFactor = incidentDelay > 0 ? 0.5 : 1.0;
        transport.incomingPassengers += Math.floor((Math.random() * 2000 + 1000) * surgeFactor);
      }
      
      // Direct arrival spike from chaos of any incident
      if (totalActiveIncidents > 0 && Math.random() < 0.2) {
         transport.incomingPassengers += Math.floor(Math.random() * 300 * totalActiveIncidents);
      }
    }
    
    return { transport };
  }
}
