import { useStadiumStore } from '../store/stadiumStore';

export class ToolExecutor {
  static async execute(toolName: string, params: Record<string, any>): Promise<string> {
    const store = useStadiumStore.getState();

    switch (toolName) {
      case 'open_gate':
        if (store.gates[params.gate_id]) {
          useStadiumStore.setState(state => ({
            gates: {
              ...state.gates,
              [params.gate_id]: { ...state.gates[params.gate_id], isOpen: true }
            }
          }));
          return `Gate ${params.gate_id} opened.`;
        }
        return `Gate ${params.gate_id} not found.`;
        
      case 'close_gate':
        if (store.gates[params.gate_id]) {
          useStadiumStore.setState(state => ({
            gates: {
              ...state.gates,
              [params.gate_id]: { ...state.gates[params.gate_id], isOpen: false }
            }
          }));
          return `Gate ${params.gate_id} closed.`;
        }
        return `Gate ${params.gate_id} not found.`;

      case 'adjust_gate_lanes':
        if (store.gates[params.gate_id]) {
          useStadiumStore.setState(state => ({
            gates: {
              ...state.gates,
              [params.gate_id]: { ...state.gates[params.gate_id], activeLanes: params.lanes }
            }
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
            [fromId]: {
              ...state.gates[fromId],
              queueLength: Math.max(0, state.gates[fromId].queueLength - amount)
            },
            [toId]: {
              ...state.gates[toId],
              inboundTransits: [
                ...(state.gates[toId].inboundTransits || []),
                { amount, timeRemaining: travelTime }
              ]
            }
          }
        }));

        return `Rerouted ${amount} fans from Gate ${fromId} to Gate ${toId}. Est. transit time: ${Math.floor(travelTime / 60)} minutes.`;
      }

      case 'dispatch_security': {
        const teamId = params.team_id;
        const targetLoc = params.location;
        const team = store.teams[teamId];
        
        if (!team) return `Team ${teamId} not found.`;
        if (team.status === 'busy') return `Team ${teamId} is already busy.`;

        const activeSec = store.incidents.find(i => i.type === 'security' && i.location === targetLoc && i.status !== 'resolved');
        if (!activeSec) return `No active security incident found at ${targetLoc}.`;

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
            [teamId]: {
              ...team,
              status: 'busy',
              currentAssignment: activeSec.id,
              targetLocation: targetLoc,
              arrivalTick: state.simTime + travelTime
            }
          }
        }));

        return `Dispatched ${teamId} to ${targetLoc}. Estimated arrival in ${travelTime} seconds.`;
      }

      case 'dispatch_medical': {
        const teamId = params.team_id;
        const targetLoc = params.location;
        const team = store.teams[teamId];
        
        if (!team) return `Team ${teamId} not found.`;
        if (team.status === 'busy') return `Team ${teamId} is already busy.`;

        // Find the incident
        const activeMedical = store.incidents.find(i => i.type === 'medical' && i.location === targetLoc && i.status !== 'resolved');
        if (!activeMedical) return `No active medical incident found at ${targetLoc}.`;

        // Calculate distance
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
        const travelTime = Math.max(30, Math.floor(distance * 300)); // arbitrary scale, min 30s

        useStadiumStore.setState(state => ({
          teams: {
            ...state.teams,
            [teamId]: {
              ...team,
              status: 'busy',
              currentAssignment: activeMedical.id,
              targetLocation: targetLoc,
              arrivalTick: state.simTime + travelTime
            }
          }
        }));

        return `Dispatched ${teamId} to ${targetLoc}. Estimated arrival in ${travelTime} seconds.`;
      }

      case 'dispatch_cleaning': {
        const teamId = params.crew_id;
        const targetLoc = params.location;
        const team = store.teams[teamId];
        
        if (!team) return `Team ${teamId} not found.`;
        if (team.status === 'busy') return `Team ${teamId} is already busy.`;

        const activeCln = store.incidents.find(i => i.type === 'cleaning' && i.location === targetLoc && i.status !== 'resolved');
        if (!activeCln) return `No active cleaning incident found at ${targetLoc}.`;

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
            [teamId]: {
              ...team,
              status: 'busy',
              currentAssignment: activeCln.id,
              targetLocation: targetLoc,
              arrivalTick: state.simTime + travelTime
            }
          }
        }));

        return `Dispatched ${teamId} to ${targetLoc}. Estimated arrival in ${travelTime} seconds.`;
      }

      default:
        console.warn(`Tool ${toolName} not implemented yet`);
        return `Executed ${toolName} (mocked)`;
    }
  }
}
