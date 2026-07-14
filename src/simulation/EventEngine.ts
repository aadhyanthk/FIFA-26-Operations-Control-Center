export interface StadiumEvent {
  id: string;
  timestamp: number;
  type: 'crowd' | 'medical' | 'security' | 'maintenance' | 'weather' | 'transport' | 'cleaning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  relatedEvents: string[];
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved';
  assignedTeam?: string;
  aiPlanId?: string;
}

import type { StadiumState } from '../store/stadiumStore';

export class EventEngine {
  tick(state: StadiumState): Partial<StadiumState> {
    const newIncidents: StadiumEvent[] = [];

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

    if (newIncidents.length > 0 || incidentsChanged) {
      return { incidents: [...newIncidents, ...incidents] };
    }

    return {};
  }
}
