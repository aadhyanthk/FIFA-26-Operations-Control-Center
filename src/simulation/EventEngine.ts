export interface StadiumEvent {
  id: string;
  timestamp: number;
  type: 'crowd' | 'medical' | 'security' | 'maintenance' | 'weather' | 'transport' | 'cleaning';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  relatedEvents: string[];
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved';
  assignedTeam?: string;
  aiPlanId?: string;
}

import type { StadiumState } from '../store/stadiumStore';

/**
 * The final stage of the causal tick loop. Scans the aggregated state 
 * for threshold breaches (e.g. queue density, temp + crowd) and 
 * fires autonomous operational alerts.
 */
export class EventEngine {
  tick(state: StadiumState): Partial<StadiumState> {
    const newIncidents: StadiumEvent[] = [];

    // Predictive Gate Overcrowding
    Object.values(state.gates).forEach(gate => {
      // Calculate inbound fans in the next 10 mins
      const imminentInbound = (gate.inboundTransits || []).reduce((acc, t) => acc + (t.timeRemaining < 600 ? t.amount : 0), 0);
      const predictedQueue = gate.queueLength + imminentInbound;
      const gateThroughputPerSec = (gate.activeLanes * 500) / 3600;
      const predictedWaitTime = (predictedQueue / Math.max(1, gateThroughputPerSec)) / 60; // in mins
      
      if (predictedWaitTime > 30 && gate.averageWaitTime < 20) { // Only predict if not currently failing
        const exists = state.incidents.find(i => i.location === `Gate ${gate.id}` && i.title.includes('Predicted') && i.status !== 'resolved');
        if (!exists) {
           newIncidents.push({
            id: `ev-pred-gate-${gate.id}-${state.simTime}`,
            timestamp: state.simTime,
            type: 'crowd',
            severity: 'medium',
            title: `Predicted Overcrowding at Gate ${gate.id}`,
            description: `Incoming transit surges will cause wait times to exceed 30 mins shortly. Predicted queue: ${predictedQueue} fans.`,
            location: `Gate ${gate.id}`,
            relatedEvents: [],
            status: 'new'
          });
        }
      }
    });

    // Check Gates
    Object.values(state.gates).forEach(gate => {
      if (gate.averageWaitTime > 20) {
        // Prevent duplicate events
        const exists = state.incidents.find(i => i.location === `Gate ${gate.id}` && i.status !== 'resolved');
        if (!exists) {
          newIncidents.push({
            id: `ev-gate-${gate.id}-${state.simTime}`,
            timestamp: state.simTime,
            type: 'crowd',
            severity: gate.averageWaitTime > 30 ? 'critical' : 'high',
            title: `Gate ${gate.id} Overcrowded`,
            description: `Wait time has exceeded ${Math.floor(gate.averageWaitTime)} minutes.`,
            location: `Gate ${gate.id}`,
            relatedEvents: [],
            status: 'new'
          });
        }
      }
    });

    // Check Zones
    Object.values(state.zones).forEach(zone => {
      if (zone.density > 0.9) {
        const exists = state.incidents.find(i => i.location === zone.name && i.status !== 'resolved');
        if (!exists) {
          newIncidents.push({
            id: `ev-zone-${zone.id}-${state.simTime}`,
            timestamp: state.simTime,
            type: 'crowd',
            severity: zone.density > 0.95 ? 'critical' : 'high',
            title: `${zone.name} Near Capacity`,
            description: `Density is at ${(zone.density * 100).toFixed(1)}%.`,
            location: zone.name,
            relatedEvents: [],
            status: 'new'
          });
        }
      }
    });

    let incidents = [...state.incidents];
    let incidentsChanged = false;

    // Auto-resolve weather events
    incidents = incidents.map(incident => {
      if (incident.type === 'weather' && incident.status !== 'resolved') {
        if (incident.title.includes('Rain') && state.weather.rainIntensity < 0.3) {
          incidentsChanged = true;
          return { ...incident, status: 'resolved' };
        }
        if (incident.title.includes('Heat') && state.weather.temperature < 35) {
          incidentsChanged = true;
          return { ...incident, status: 'resolved' };
        }
      }
      return incident;
    });

    // Check Weather
    const rainExists = incidents.find(i => i.type === 'weather' && i.title.includes('Rain') && i.status !== 'resolved');
    if (state.weather.rainIntensity > 0.7 && !rainExists) {
      newIncidents.push({
        id: `ev-wth-rain-${state.simTime}`,
        timestamp: state.simTime,
        type: 'weather',
        severity: 'high',
        title: 'Heavy Rain Squall',
        description: `Rain intensity has exceeded 70%. Outdoor concourse flooding possible and gate throughput reduced.`,
        location: 'Stadium Wide',
        relatedEvents: [],
        status: 'new'
      });
    }

    const heatExists = incidents.find(i => i.type === 'weather' && i.title.includes('Heat') && i.status !== 'resolved');
    if (state.weather.temperature > 38 && !heatExists) {
      newIncidents.push({
        id: `ev-wth-heat-${state.simTime}`,
        timestamp: state.simTime,
        type: 'weather',
        severity: 'critical',
        title: 'Extreme Heat Advisory',
        description: `Temperature has reached ${state.weather.temperature.toFixed(1)}°C. High risk of heat exhaustion for fans in exposed zones.`,
        location: 'Stadium Wide',
        relatedEvents: [],
        status: 'new'
      });
    }

    // Match Phase Transition Detection
    let phase = 'Pre-Game';
    if (state.simTime >= 0 && state.simTime < 2700) phase = 'First Half';
    else if (state.simTime >= 2700 && state.simTime < 3600) phase = 'Halftime';
    else if (state.simTime >= 3600 && state.simTime < 6300) phase = 'Second Half';
    else if (state.simTime >= 6300 && state.simTime < 10800) phase = 'Exodus';
    else if (state.simTime >= 10800) phase = 'Post-Game';

    let phaseChanged = false;
    if (phase !== state.activeMatchPhase) {
      phaseChanged = true;
      newIncidents.push({
        id: `ev-phase-${state.simTime}`,
        timestamp: state.simTime,
        type: 'crowd',
        severity: 'info', // using info severity for notifications
        title: `Match Phase: ${phase}`,
        description: `The match has entered the ${phase} phase. Expect shifts in crowd movement and operational demands.`,
        location: 'Stadium Wide',
        relatedEvents: [],
        status: 'new'
      });
    }

    if (newIncidents.length > 0 || incidentsChanged || phaseChanged) {
      return { 
        incidents: [...newIncidents, ...incidents],
        ...(phaseChanged ? { activeMatchPhase: phase } : {})
      };
    }

    return {};
  }
}
