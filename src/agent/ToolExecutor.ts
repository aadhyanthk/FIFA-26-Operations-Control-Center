import { useStadiumStore } from '../store/stadiumStore';

export class ToolExecutor {
  static async execute(toolName: string, params: Record<string, any>): Promise<string> {
    const store = useStadiumStore.getState();

    switch (toolName) {
      case 'open_gate':
        if (store.gates[params.gate_id]) {
          useStadiumStore.setState(state => ({
            gates: { ...state.gates, [params.gate_id]: { ...state.gates[params.gate_id], isOpen: true } }
          }));
          return `Gate ${params.gate_id} opened.`;
        }
        return `Gate ${params.gate_id} not found.`;
        
      case 'close_gate':
        if (store.gates[params.gate_id]) {
          useStadiumStore.setState(state => ({
            gates: { ...state.gates, [params.gate_id]: { ...state.gates[params.gate_id], isOpen: false } }
          }));
          return `Gate ${params.gate_id} closed.`;
        }
        return `Gate ${params.gate_id} not found.`;

      case 'adjust_gate_lanes':
        if (store.gates[params.gate_id]) {
          useStadiumStore.setState(state => ({
            gates: { ...state.gates, [params.gate_id]: { ...state.gates[params.gate_id], activeLanes: params.lanes } }
          }));
          return `Gate ${params.gate_id} lanes adjusted to ${params.lanes}.`;
        }
        return `Gate ${params.gate_id} not found.`;

      case 'reroute_gate': {
        const fromId = params.from_gate;
        const toId = params.to_gate;
        const perc = params.percentage;
        const fromGate = store.gates[fromId];
        const toGate = store.gates[toId];

        if (!fromGate || !toGate) return `Gate not found.`;
        if (perc <= 0 || perc > 100) return `Invalid percentage.`;

        const amount = Math.floor(fromGate.queueLength * (perc / 100));
        if (amount <= 0) return `Queue at ${fromId} is empty.`;

        const { stadiumLayout } = await import('../data/stadiumLayout');
        const g1 = stadiumLayout.gates.find(g => g.id === fromId)?.location || { x: 0.5, y: 0.5 };
        const g2 = stadiumLayout.gates.find(g => g.id === toId)?.location || { x: 0.5, y: 0.5 };
        const distance = Math.sqrt(Math.pow(g1.x - g2.x, 2) + Math.pow(g1.y - g2.y, 2));
        const travelTime = 120 + Math.floor(distance * 600); 

        useStadiumStore.setState(state => ({
          gates: {
            ...state.gates,
            [fromId]: { ...state.gates[fromId], queueLength: Math.max(0, state.gates[fromId].queueLength - amount) },
            [toId]: { ...state.gates[toId], inboundTransits: [...(state.gates[toId].inboundTransits || []), { amount, timeRemaining: travelTime }] }
          }
        }));

        return `Rerouted ${amount} fans from Gate ${fromId} to Gate ${toId}. Est. transit time: ${Math.floor(travelTime / 60)} minutes.`;
      }

      case 'dispatch_security':
      case 'dispatch_medical':
      case 'dispatch_cleaning': {
        const teamId = params.team_id || params.crew_id;
        const targetLoc = params.location;
        const team = store.teams[teamId];
        
        if (!team) return `Team ${teamId} not found.`;
        if (team.status === 'busy') return `Team ${teamId} is already busy.`;

        const type = toolName === 'dispatch_security' ? 'security' : toolName === 'dispatch_medical' ? 'medical' : 'cleaning';
        const activeIncident = store.incidents.find(i => i.type === type && i.location === targetLoc && i.status !== 'resolved');
        if (!activeIncident) return `No active ${type} incident found at ${targetLoc}. Dispatching anyway.`;

        const { stadiumLayout } = await import('../data/stadiumLayout');
        let currentCoords = { x: 0.5, y: 0.5 };
        let targetCoords = { x: 0.5, y: 0.5 };

        const findCoords = (loc: string) => {
          const zone = stadiumLayout.zones.find(z => z.name === loc);
          if (zone) return zone.center;
          const gate = stadiumLayout.gates.find(g => `Gate ${g.id}` === loc);
          if (gate) return gate.location;
          return null;
        };

        const c1 = findCoords(team.location);
        const c2 = findCoords(targetLoc);
        if (c1) currentCoords = c1;
        if (c2) targetCoords = c2;

        const distance = Math.sqrt(Math.pow(currentCoords.x - targetCoords.x, 2) + Math.pow(currentCoords.y - targetCoords.y, 2));
        const travelTime = Math.max(30, Math.floor(distance * 300)); 

        useStadiumStore.setState(state => ({
          teams: {
            ...state.teams,
            [teamId]: { ...team, status: 'busy', currentAssignment: activeIncident?.id || 'manual', targetLocation: targetLoc, arrivalTick: state.simTime + travelTime }
          },
          ...(activeIncident ? {
            incidents: state.incidents.map(i => i.id === activeIncident.id ? { ...i, assignedTeam: teamId } : i)
          } : {})
        }));

        return `Dispatched ${teamId} to ${targetLoc}. Estimated arrival in ${travelTime} seconds.`;
      }

      case 'send_announcement': {
        useStadiumStore.getState().setAnnouncementBanner(params.message);
        useStadiumStore.getState().addIncident({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          title: 'Public Announcement',
          description: `Message: ${params.message} | Zones: ${params.zones.join(', ')}`,
          location: 'Stadium-wide',
          severity: 'info',
          type: 'crowd',
          status: 'resolved',
          relatedEvents: []
        });
        return `Announcement sent: "${params.message}"`;
      }

      case 'update_signage': {
        useStadiumStore.getState().addIncident({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          title: 'Signage Updated',
          description: `Message: ${params.message} | Signs: ${params.sign_ids.join(', ')}`,
          location: 'Digital Signage',
          severity: 'info',
          type: 'crowd',
          status: 'resolved',
          relatedEvents: []
        });
        return `Signage updated to: "${params.message}"`;
      }

      case 'create_maintenance_ticket': {
        useStadiumStore.getState().addIncident({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          title: `Maintenance: ${params.equipment}`,
          description: `Priority ${params.priority} maintenance required for ${params.equipment}`,
          location: params.location,
          severity: params.priority === 'high' ? 'critical' : params.priority === 'medium' ? 'high' : 'medium',
          type: 'maintenance',
          status: 'new',
          relatedEvents: []
        });
        return `Maintenance ticket created for ${params.equipment} at ${params.location}.`;
      }

      case 'reserve_emergency_route': {
        useStadiumStore.getState().addIncident({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          title: 'Emergency Route Reserved',
          description: `Route cleared from ${params.from} to ${params.to}.`,
          location: `${params.from} -> ${params.to}`,
          severity: 'info',
          type: 'security',
          status: 'resolved',
          relatedEvents: []
        });
        return `Emergency route reserved from ${params.from} to ${params.to}.`;
      }

      case 'get_zone_density': {
        const zone = Object.values(store.zones).find(z => z.id === params.zone_id || z.name === params.zone_id);
        if (!zone) return `Zone ${params.zone_id} not found.`;
        return JSON.stringify({ name: zone.name, density: zone.density, occupancy: zone.currentOccupancy, capacity: zone.maxCapacity });
      }

      case 'get_gate_status': {
        if (params.gate_id && store.gates[params.gate_id]) {
          return JSON.stringify(store.gates[params.gate_id]);
        }
        return JSON.stringify(store.gates);
      }

      case 'get_team_status': {
        const deptTeams = Object.values(store.teams).filter(t => t.department === params.department);
        return JSON.stringify(deptTeams);
      }

      case 'get_active_incidents': {
        let active = store.incidents.filter(i => i.status !== 'resolved');
        if (params.severity) active = active.filter(i => i.severity === params.severity);
        if (params.type) active = active.filter(i => i.type === params.type);
        return JSON.stringify(active);
      }

      case 'get_weather': {
        return JSON.stringify(store.weather);
      }

      case 'get_transport_status': {
        return JSON.stringify(store.transport);
      }

      case 'query_sop': {
        const { sops } = await import('../data/sops');
        const match = sops.find(s => s.topic.toLowerCase().includes(params.topic.toLowerCase()) || s.content.toLowerCase().includes(params.topic.toLowerCase()));
        return match ? match.content : `No SOP found matching "${params.topic}".`;
      }

      case 'generate_situation_summary': {
        const openGates = Object.values(store.gates).filter(g => g.isOpen).length;
        const totalGates = Object.values(store.gates).length;
        const activeCount = store.incidents.filter(i => i.status !== 'resolved').length;
        const criticalCount = store.incidents.filter(i => i.status !== 'resolved' && i.severity === 'critical').length;
        return `Stadium Situation Summary:
- Weather: ${store.weather.temperature}°C, Rain: ${store.weather.rainIntensity > 0 ? 'Yes' : 'No'}
- Gates: ${openGates}/${totalGates} open.
- Incidents: ${activeCount} active (${criticalCount} critical).
- Simulation Time: ${Math.floor(store.simTime / 60)} minutes elapsed.`;
      }

      case 'generate_shift_handover': {
        return `Shift Handover Report:
- Total Incidents: ${store.incidents.length}
- Resolved Incidents: ${store.incidents.filter(i => i.status === 'resolved').length}
- Currently Active Incidents: ${store.incidents.filter(i => i.status !== 'resolved').length}
- Active Deployments: ${Object.values(store.teams).filter(t => t.status === 'busy').length}`;
      }

      case 'generate_incident_report': {
        const incident = store.incidents.find(i => i.id === params.incident_id);
        if (!incident) return `Incident ${params.incident_id} not found.`;
        return `Incident Report: [${incident.id}] ${incident.title}
- Type: ${incident.type} | Severity: ${incident.severity}
- Location: ${incident.location}
- Description: ${incident.description}
- Status: ${incident.status}`;
      }

      default:
        console.warn(`Tool ${toolName} not implemented yet`);
        return `Executed ${toolName} (mocked)`;
    }
  }
}
