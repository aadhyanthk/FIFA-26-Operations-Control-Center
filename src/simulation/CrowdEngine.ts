import type { StadiumState } from '../store/stadiumStore';

export class CrowdEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    const zones = { ...state.zones };
    const transport = state.transport;
    const newlyEntered = transport?.newlyEntered || 0;

    // Handle Inflow from gates to concourses
    const concourseKeys = Object.keys(zones).filter(k => k.startsWith('concourse'));
    if (newlyEntered > 0 && concourseKeys.length > 0) {
      const perConcourse = newlyEntered / concourseKeys.length;
      concourseKeys.forEach(k => {
        zones[k].currentOccupancy += perConcourse;
      });
    }

    // Match Phase Directional Flow
    const isHalftime = state.simTime >= 2700 && state.simTime < 3600;
    const isExodus = state.simTime >= 6300;
    
    // In Pre-Game, First Half, Second Half: Fans flow Concourse -> Seating
    // In Halftime: Fans flow Seating -> Concourse
    // In Exodus: Fans flow Seating -> Concourse -> Gates (outflow)
    
    const seatingKeys = Object.keys(zones).filter(k => !k.startsWith('concourse'));
    
    if (isExodus) {
      // Seating empties to concourses
      seatingKeys.forEach(seatKey => {
        const seating = zones[seatKey];
        if (seating.currentOccupancy > 0) {
          const leaving = Math.min(seating.currentOccupancy, seating.maxCapacity * 0.05 * deltaTime);
          seating.currentOccupancy -= leaving;
          // Distribute to all concourses for simplicity
          const perConcourse = leaving / concourseKeys.length;
          concourseKeys.forEach(k => zones[k].currentOccupancy += perConcourse);
        }
      });
      // Concourses empty to gates (outflow)
      let totalLeavingConcourses = 0;
      concourseKeys.forEach(conKey => {
        const concourse = zones[conKey];
        if (concourse.currentOccupancy > 0) {
          const leaving = Math.min(concourse.currentOccupancy, concourse.maxCapacity * 0.05 * deltaTime);
          concourse.currentOccupancy -= leaving;
          totalLeavingConcourses += leaving;
        }
      });
      if (totalLeavingConcourses > 0) {
        // Distribute to gates (outflow)
        const gates = { ...state.gates };
        const openGateKeys = Object.keys(gates).filter(k => gates[k].isOpen);
        if (openGateKeys.length > 0) {
          const perGate = totalLeavingConcourses / openGateKeys.length;
          openGateKeys.forEach(k => {
            gates[k] = { ...gates[k], queueLength: gates[k].queueLength + perGate };
          });
          return { zones, gates, transport: { ...transport, newlyEntered: 0 } };
        }
      }
    } else if (isHalftime) {
      // Surge from seating to concourses (40% leave seats)
      seatingKeys.forEach(seatKey => {
        const seating = zones[seatKey];
        // Target occupancy during halftime is 60% of current max
        const targetOccupancy = seating.maxCapacity * 0.6;
        if (seating.currentOccupancy > targetOccupancy) {
          const leaving = Math.min(seating.currentOccupancy - targetOccupancy, seating.maxCapacity * 0.02 * deltaTime);
          seating.currentOccupancy -= leaving;
          const perConcourse = leaving / concourseKeys.length;
          concourseKeys.forEach(k => zones[k].currentOccupancy += perConcourse);
        }
      });
    } else {
      // Active Halves & Pre-Game: Concourse to Seating
      // If there are people in the concourse, they try to find their seats
      let concoursePool = 0;
      concourseKeys.forEach(conKey => {
        const concourse = zones[conKey];
        const leaving = Math.min(concourse.currentOccupancy, concourse.maxCapacity * 0.02 * deltaTime);
        concourse.currentOccupancy -= leaving;
        concoursePool += leaving;
      });
      
      if (concoursePool > 0) {
        const perSeat = concoursePool / seatingKeys.length;
        seatingKeys.forEach(seatKey => {
          zones[seatKey].currentOccupancy += perSeat;
        });
      }
    }

    // Update densities
    Object.keys(zones).forEach(key => {
      const zone = zones[key];
      // Clamp just in case
      zone.currentOccupancy = Math.max(0, zone.currentOccupancy);
      zone.density = zone.currentOccupancy / zone.maxCapacity;
    });

    return { zones, transport: { ...transport, newlyEntered: 0 } };
  }
}
