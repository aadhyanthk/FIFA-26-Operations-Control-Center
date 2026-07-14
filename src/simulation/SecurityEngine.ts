import type { StadiumState, TeamState, GateState } from '../store/stadiumStore';
import type { StadiumEvent } from './EventEngine';

export class SecurityEngine {
  tick(state: StadiumState, _deltaTime: number): Partial<StadiumState> {
    const newIncidents: StadiumEvent[] = [...state.incidents];
    const newTeams: Record<string, TeamState> = { ...state.teams };
    const newGates: Record<string, GateState> = { ...state.gates };
    let hasChanges = false;

    // 1. Scanner Degradation
    Object.values(newGates).forEach(gate => {
      if (Math.random() < 0.0005) {
        gate.scannerHealth = Math.max(0, gate.scannerHealth - Math.floor(Math.random() * 10 + 1));
        
        let newStatus: 'operational' | 'degraded' | 'offline' = 'operational';
        if (gate.scannerHealth < 20) newStatus = 'offline';
        else if (gate.scannerHealth < 50) newStatus = 'degraded';
        
        if (gate.scannerStatus !== newStatus) {
          gate.scannerStatus = newStatus;
          hasChanges = true;

          if (newStatus === 'offline') {
            const hasMaint = newIncidents.find(i => i.type === 'maintenance' && i.location === `Gate ${gate.id}` && i.status !== 'resolved');
            if (!hasMaint) {
              newIncidents.unshift({
                id: `ev-maint-${Date.now()}-${gate.id}`,
                timestamp: state.simTime,
                type: 'maintenance',
                severity: 'high',
                title: `Scanner Failure at Gate ${gate.id}`,
                description: 'Gate scanner health critical. Maintenance required.',
                location: `Gate ${gate.id}`,
                relatedEvents: [],
                status: 'new'
              });
            }
          }
        }
      }
    });

    // 2. Incident Generation
    let incidentChance = 1 / 3600; // ~1/hour
    if (state.simTime > 3600) incidentChance *= 1.3; // late game tension

    const hasFailedScanner = Object.values(newGates).some(g => g.scannerStatus === 'offline');
    if (hasFailedScanner) incidentChance *= 1.15;

    incidentChance *= 1.2; // High alcohol zones multiplier overall

    if (Math.random() < incidentChance) {
      const types = ['unattended_bag', 'altercation', 'unauthorized_access', 'crowd_surge'];
      const type = types[Math.floor(Math.random() * types.length)];
      const severity = type === 'crowd_surge' ? 'critical' : ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high';
      
      const locations = [
        ...Object.values(state.zones).map(z => z.name),
        ...Object.values(state.gates).map(g => `Gate ${g.id}`)
      ];
      
      let selectedLocation = locations[Math.floor(Math.random() * locations.length)];
      
      // Weight towards alcohol zones
      const alcoholZones = ['East Club', 'West Club', 'North Concourse', 'East Concourse', 'South Concourse', 'West Concourse'];
      if (Math.random() < 0.6) { 
        selectedLocation = alcoholZones[Math.floor(Math.random() * alcoholZones.length)];
      }

      newIncidents.unshift({
        id: `ev-sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: state.simTime,
        type: 'security',
        severity,
        title: `Security Incident: ${type.replace('_', ' ').toUpperCase()}`,
        description: `A ${severity} severity security incident occurred.`,
        location: selectedLocation,
        relatedEvents: [],
        status: 'new'
      });
      hasChanges = true;
    }

    // 3. Team Resolution
    const activeSecurityIncidents = newIncidents.filter(i => i.type === 'security' && i.status !== 'resolved');
    
    Object.values(newTeams).filter(t => t.department === 'security').forEach(team => {
      if (team.status === 'busy' && team.currentAssignment) {
        const incident = activeSecurityIncidents.find(i => i.id === team.currentAssignment);
        if (incident) {
          if (team.arrivalTick && state.simTime < team.arrivalTick) {
            // traveling
          } else if (team.arrivalTick && state.simTime >= team.arrivalTick && !team.resolveTick) {
            // arrived
            team.location = team.targetLocation || incident.location;
            let resolveTime = 300; 
            if (incident.severity === 'low') resolveTime = 120;
            if (incident.severity === 'high') resolveTime = 450;
            if (incident.severity === 'critical') resolveTime = 600;

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
      return { incidents: newIncidents, teams: newTeams, gates: newGates };
    }
    return {};
  }
}
