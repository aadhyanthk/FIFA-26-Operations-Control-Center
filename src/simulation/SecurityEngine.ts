import type { StadiumState } from '../store/stadiumStore';

export class SecurityEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    const activeSecurityIncidents = state.incidents?.filter(i => i.type === 'security' && i.status !== 'resolved') || [];
    let resolvedCount = 0;
    let newIncidents = [...state.incidents];

    activeSecurityIncidents.forEach(incident => {
      // Find a security team at the incident's location
      const deployedTeam = Object.values(state.teams).find(
        t => t.department === 'security' && t.location === incident.location && t.status === 'busy'
      );

      if (deployedTeam) {
        // Random chance to resolve each tick (simulate fixing it over a few minutes)
        if (Math.random() < 0.05) {
          const index = newIncidents.findIndex(i => i.id === incident.id);
          if (index !== -1) {
            newIncidents[index] = { ...newIncidents[index], status: 'resolved' };
            resolvedCount++;
          }
        }
      }
    });

    if (resolvedCount > 0) {
      return { incidents: newIncidents };
    }
    return {};
  }
}
