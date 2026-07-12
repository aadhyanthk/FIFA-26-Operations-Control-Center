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

    if (newIncidents.length > 0) {
      return { incidents: [...newIncidents, ...state.incidents] };
    }

    return {};
  }
}
