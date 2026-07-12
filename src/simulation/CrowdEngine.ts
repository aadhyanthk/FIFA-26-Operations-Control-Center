import type { StadiumState } from '../store/stadiumStore';

export class CrowdEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    const zones = { ...state.zones };
    const transport = state.transport as any;
    const newlyEntered = transport?.newlyEntered || 0;

    // Distribute newly entered people to concourse zones
    const concourseKeys = Object.keys(zones).filter(k => k.startsWith('concourse'));
    if (newlyEntered > 0 && concourseKeys.length > 0) {
      const perConcourse = Math.floor(newlyEntered / concourseKeys.length);
      concourseKeys.forEach(k => {
        zones[k].currentOccupancy = Math.floor(zones[k].currentOccupancy + perConcourse);
      });
    }

    // Move people from concourse to seating (before kickoff)
    // or seating to concourse (halftime/fulltime)
    
    // Simplification for now: update densities
    Object.keys(zones).forEach(key => {
      const zone = zones[key];
      // Random movement diffusion
      if (Math.random() < 0.1) {
         // Diffusion logic would go here
      }
      
      zone.currentOccupancy = Math.floor(zone.currentOccupancy);
      zone.density = zone.currentOccupancy / zone.maxCapacity;
    });

    return { zones, transport: { ...state.transport, newlyEntered: 0 } as any };
  }
}
