import type { StadiumState, TeamState, ZoneState } from '../store/stadiumStore';
import type { StadiumEvent } from './EventEngine';

export class CleaningEngine {
  tick(state: StadiumState, _deltaTime: number): Partial<StadiumState> {
    const newIncidents: StadiumEvent[] = [...state.incidents];
    const newTeams: Record<string, TeamState> = { ...state.teams };
    const newZones: Record<string, ZoneState> = { ...state.zones };
    let hasChanges = false;

    // 1. Litter and Restroom Degradation
    const foodCourtAdjacent = ['East Club', 'West Club', 'North Concourse', 'East Concourse', 'South Concourse', 'West Concourse'];
    
    Object.values(newZones).forEach(zone => {
      // Litter
      let litterRate = zone.density * 0.0005; 
      if (foodCourtAdjacent.includes(zone.name)) {
        litterRate *= 1.5;
      }
      
      const oldLitter = zone.litterLevel;
      zone.litterLevel = Math.min(1, zone.litterLevel + litterRate);
      if (zone.litterLevel !== oldLitter) hasChanges = true;

      if (zone.litterLevel > 0.7) {
        const exists = newIncidents.find(i => i.type === 'cleaning' && i.location === zone.name && i.title.includes('Litter') && i.status !== 'resolved');
        if (!exists) {
          const severity = zone.litterLevel > 0.9 ? 'high' : 'medium';
          newIncidents.unshift({
            id: `ev-cln-lit-${Date.now()}-${zone.id}`,
            timestamp: state.simTime,
            type: 'cleaning',
            severity,
            title: `Excessive Litter in ${zone.name}`,
            description: `Litter level has reached ${(zone.litterLevel * 100).toFixed(0)}%.`,
            location: zone.name,
            relatedEvents: [],
            status: 'new'
          });
          hasChanges = true;
        }
      }

      // Restrooms (only in concourses)
      if (zone.name.includes('Concourse')) {
        const oldUsage = zone.restroomUsage;
        zone.restroomUsage += zone.density * 0.1; 
        if (zone.restroomUsage !== oldUsage) hasChanges = true;

        let newStatus: 'clean' | 'needs_attention' | 'critical' = 'clean';
        if (zone.restroomUsage > 100) newStatus = 'critical';
        else if (zone.restroomUsage > 60) newStatus = 'needs_attention';

        if (zone.restroomStatus !== newStatus) {
          zone.restroomStatus = newStatus;
          hasChanges = true;

          if (newStatus === 'critical') {
            const exists = newIncidents.find(i => i.type === 'cleaning' && i.location === zone.name && i.title.includes('Restroom') && i.status !== 'resolved');
            if (!exists) {
              newIncidents.unshift({
                id: `ev-cln-rr-${Date.now()}-${zone.id}`,
                timestamp: state.simTime,
                type: 'cleaning',
                severity: 'critical',
                title: `Restroom Critical in ${zone.name}`,
                description: 'Restroom facilities require immediate attention.',
                location: zone.name,
                relatedEvents: [],
                status: 'new'
              });
              hasChanges = true;
            }
          }
        }
      }
    });

    // 2. Team Resolution
    const activeCleaningIncidents = newIncidents.filter(i => i.type === 'cleaning' && i.status !== 'resolved');
    
    Object.values(newTeams).filter(t => t.department === 'cleaning').forEach(team => {
      if (team.status === 'busy' && team.currentAssignment) {
        const incident = activeCleaningIncidents.find(i => i.id === team.currentAssignment);
        if (incident) {
          if (team.arrivalTick && state.simTime < team.arrivalTick) {
            // traveling
          } else if (team.arrivalTick && state.simTime >= team.arrivalTick && !team.resolveTick) {
            // arrived
            team.location = team.targetLocation || incident.location;
            let resolveTime = 180; 
            if (incident.severity === 'low') resolveTime = 60;
            if (incident.severity === 'medium') resolveTime = 120;
            if (incident.severity === 'high') resolveTime = 240;
            if (incident.severity === 'critical') resolveTime = 300;

            team.resolveTick = state.simTime + resolveTime;
            incident.status = 'in_progress';
            incident.assignedTeam = team.id;
            hasChanges = true;
          } else if (team.resolveTick && state.simTime >= team.resolveTick) {
            // resolved
            incident.status = 'resolved';
            team.status = 'idle';
            team.currentAssignment = undefined;
            team.arrivalTick = undefined;
            team.resolveTick = undefined;
            team.targetLocation = undefined;
            
            // Reset zone metrics
            const zone = Object.values(newZones).find(z => z.name === incident.location);
            if (zone) {
              if (incident.title.includes('Litter')) {
                zone.litterLevel = 0;
              }
              if (incident.title.includes('Restroom')) {
                zone.restroomUsage = 0;
                zone.restroomStatus = 'clean';
              }
            }
            hasChanges = true;
          }
        } else {
          // resolved elsewhere
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
      return { incidents: newIncidents, teams: newTeams, zones: newZones };
    }
    return {};
  }
}
