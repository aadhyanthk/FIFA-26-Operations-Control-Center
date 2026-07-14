import { stadiumLayout } from '../data/stadiumLayout';
import type { StadiumState, TeamState } from '../store/stadiumStore';
import type { StadiumEvent } from './EventEngine';

export class MedicalEngine {
  tick(state: StadiumState, _deltaTime: number): Partial<StadiumState> {
    const newIncidents: StadiumEvent[] = [...state.incidents];
    const newTeams: Record<string, TeamState> = { ...state.teams };
    let hasChanges = false;

    // 1. Incident Generation
    let incidentChance = 2 / 3600; // base ~2/hour
    if (state.weather.temperature > 35) incidentChance *= 1.4;
    if (state.weather.rainIntensity > 0.5) incidentChance *= 1.25;
    if (state.simTime >= 2700 && state.simTime <= 3600) incidentChance *= 1.2; // Halftime rush

    const hasHighDensity = Object.values(state.zones).some(z => z.density > 0.8);
    if (hasHighDensity) incidentChance *= 1.15;

    if (Math.random() < incidentChance) {
      const types = ['heat_exhaustion', 'fall', 'cardiac', 'allergic_reaction', 'intoxication'];
      const type = types[Math.floor(Math.random() * types.length)];
      const severity = type === 'cardiac' ? 'critical' : ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high';
      
      const locations = [
        ...Object.values(state.zones).map(z => z.name),
        ...Object.values(state.gates).map(g => `Gate ${g.id}`)
      ];
      
      let selectedLocation = locations[Math.floor(Math.random() * locations.length)];
      const denseZones = Object.values(state.zones).filter(z => z.density > 0.8);
      if (denseZones.length > 0 && Math.random() < 0.5) {
        selectedLocation = denseZones[Math.floor(Math.random() * denseZones.length)].name;
      }

      newIncidents.unshift({
        id: `ev-med-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: state.simTime,
        type: 'medical',
        severity,
        title: `Medical Incident: ${type.replace('_', ' ').toUpperCase()}`,
        description: `A ${severity} severity medical incident occurred.`,
        location: selectedLocation,
        relatedEvents: [],
        status: 'new'
      });
      hasChanges = true;
    }

    // 2. Team Resolution
    const activeMedicalIncidents = newIncidents.filter(i => i.type === 'medical' && i.status !== 'resolved');
    
    Object.values(newTeams).filter(t => t.department === 'medical').forEach(team => {
      if (team.status === 'busy' && team.currentAssignment) {
        const incident = activeMedicalIncidents.find(i => i.id === team.currentAssignment);
        if (incident) {
          if (team.arrivalTick && state.simTime < team.arrivalTick) {
            // Still traveling
          } else if (team.arrivalTick && state.simTime >= team.arrivalTick && !team.resolveTick) {
            // Arrived
            team.location = team.targetLocation || incident.location;
            
            let resolveTime = 120; // medium
            if (incident.severity === 'low') resolveTime = 60;
            if (incident.severity === 'high') resolveTime = 180;
            if (incident.severity === 'critical') resolveTime = 300;

            team.resolveTick = state.simTime + resolveTime;
            incident.status = 'in_progress';
            incident.assignedTeam = team.id;
            hasChanges = true;
          } else if (team.resolveTick && state.simTime >= team.resolveTick) {
            // Resolved
            incident.status = 'resolved';
            team.status = 'idle';
            team.currentAssignment = undefined;
            team.arrivalTick = undefined;
            team.resolveTick = undefined;
            team.targetLocation = undefined;
            hasChanges = true;
          }
        } else {
          // Incident might have been resolved by other means
          team.status = 'idle';
          team.currentAssignment = undefined;
          team.arrivalTick = undefined;
          team.resolveTick = undefined;
          team.targetLocation = undefined;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      return { incidents: newIncidents, teams: newTeams };
    }
    return {};
  }
}
