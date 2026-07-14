import type { StadiumState } from '../store/stadiumStore';
import type { StadiumEvent } from './EventEngine';

export class TransportEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    const transport = { ...state.transport };
    const newIncidents: StadiumEvent[] = [...state.incidents];
    
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

    if (transport.trainDelays > 30) {
      const exists = newIncidents.find(i => i.type === 'transport' && i.title.includes('Major Train Delay') && i.status !== 'resolved');
      if (!exists) {
        newIncidents.unshift({
          id: `ev-trn-delay-${Date.now()}`,
          timestamp: state.simTime,
          type: 'transport',
          severity: 'high',
          title: `Major Train Delay`,
          description: `Train delays are currently estimated at ${Math.floor(transport.trainDelays)} minutes. Expect a surge when service resumes.`,
          location: 'Transit Hub',
          relatedEvents: [],
          status: 'new'
        });
      }
    }
    
    // Train delays occasionally resolve
    if (transport.trainDelays > 0 && Math.random() < 0.02) {
      // Delay resolves, sending a batch of passengers
      const surgeAmount = transport.trainDelays * 50;
      transport.incomingPassengers += surgeAmount; 

      if (surgeAmount > 500) {
        newIncidents.unshift({
          id: `ev-trn-surge-${Date.now()}`,
          timestamp: state.simTime,
          type: 'transport',
          severity: 'medium',
          title: `Transit Delay Resolved - Incoming Surge`,
          description: `A train delay has resolved. An unexpected surge of ~${Math.floor(surgeAmount)} passengers is arriving at the Transit Hub.`,
          location: 'Transit Hub',
          relatedEvents: [],
          status: 'new'
        });
      }
      transport.trainDelays = 0;
    }
    
    // Bus delays resolve
    if (transport.busDelays > 0 && Math.random() < 0.03) {
      const surgeAmount = transport.busDelays * 20;
      transport.incomingPassengers += surgeAmount;
      if (surgeAmount > 500) {
        newIncidents.unshift({
          id: `ev-bus-surge-${Date.now()}`,
          timestamp: state.simTime,
          type: 'transport',
          severity: 'medium',
          title: `Bus Delay Resolved - Incoming Surge`,
          description: `A bus delay has resolved. An unexpected surge of ~${Math.floor(surgeAmount)} passengers is arriving.`,
          location: 'Transit Hub',
          relatedEvents: [],
          status: 'new'
        });
      }
      transport.busDelays = 0;
    }
    
    // Realistic steady stream of arrivals based on time to kickoff
    const t = state.simTime;
    let baseRate = 0;
    
    if (t < -7200) {
      baseRate = 0;
    } else if (t < -5400) {
      baseRate = 2;   // 2 hours to 1.5 hours out
    } else if (t < -3600) {
      baseRate = 5;   // 1.5 hours to 1 hour out
    } else if (t < -1800) {
      baseRate = 15;  // 1 hour to 30 mins out (Peak)
    } else if (t < -900) {
      baseRate = 10;  // 30 mins to 15 mins out
    } else if (t <= 0) {
      baseRate = 6;   // 15 mins to kickoff (just on time)
    } else if (t < 1800) {
      baseRate = 2;   // up to 30 mins after kickoff (latecomers)
    }
    
    // Add some random noise to the base rate (+/- 20%)
    if (baseRate > 0) {
      const noise = 0.8 + Math.random() * 0.4;
      const incidentFactor = totalActiveIncidents > 0 ? 1.2 : 1.0; // slight boost if things are chaotic
      transport.incomingPassengers += Math.floor(baseRate * deltaTime * noise * incidentFactor);
    }
    
    // Simulate scheduled trains/buses arriving (~every 5 minutes during the arrival window)
    if (t > -7200 && t < 1800) {
      const trainProbability = (1 / 300) * deltaTime;
      if (Math.random() < trainProbability) {
        transport.incomingPassengers += Math.floor(Math.random() * 300 + 200);
      }
    }
    
    // Process dispersing crowds (people who left a closed gate and are walking to another one)
    if (transport.dispersingCrowds && transport.dispersingCrowds.length > 0) {
      const remainingCrowds: { amount: number; timeRemaining: number }[] = [];
      transport.dispersingCrowds.forEach(crowd => {
        crowd.timeRemaining -= deltaTime;
        if (crowd.timeRemaining <= 0) {
          transport.incomingPassengers += crowd.amount;
        } else {
          remainingCrowds.push(crowd);
        }
      });
      transport.dispersingCrowds = remainingCrowds;
    }
    
    return { transport, incidents: newIncidents };
  }
}
