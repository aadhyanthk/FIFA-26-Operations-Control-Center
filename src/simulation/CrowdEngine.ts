import type { StadiumState } from '../store/stadiumStore';
import { OCC_CONSTANTS } from '../utils/operationsConstants';

const { CROWD, TIME } = OCC_CONSTANTS;

/**
 * Simulates the directional flow of fans through MetLife Stadium's zones
 * across match-day phases.
 *
 * ## Flow Phases
 * | Phase | Direction |
 * |---|---|
 * | Pre-game / active halves | Concourse → Seating |
 * | Halftime | Seating → Concourse (surge) |
 * | Exodus | Seating → Concourse → Gate queues |
 *
 * Zone densities are recalculated after each movement step.
 * The `transport.newlyEntered` value (set by `GateEngine`) drives
 * the initial injection into concourse zones.
 *
 * ## Causal Inputs
 * - `transport.newlyEntered` — fans who passed through gates this tick
 * - `state.simTime` — determines active phase
 *
 * @param state - Full stadium state snapshot
 * @param deltaTime - Seconds elapsed since last tick
 * @returns Partial state containing updated `zones` and `transport`
 */
export class CrowdEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    const zones = { ...state.zones };
    const transport = state.transport;
    const newlyEntered = transport?.newlyEntered || 0;

    const concourseKeys = Object.keys(zones).filter((k) =>
      k.startsWith('concourse')
    );
    const seatingKeys = Object.keys(zones).filter(
      (k) => !k.startsWith('concourse')
    );

    // Inject newly arrived fans into concourses
    if (newlyEntered > 0 && concourseKeys.length > 0) {
      const occupancyPerConcourse = newlyEntered / concourseKeys.length;
      concourseKeys.forEach((k) => {
        zones[k].currentOccupancy += occupancyPerConcourse;
      });
    }

    const isHalftime =
      state.simTime >= TIME.HALFTIME_START &&
      state.simTime < TIME.HALFTIME_END;
    const isExodus = state.simTime >= TIME.SECOND_HALF_END;

    if (isExodus) {
      // Fans drain from seating into concourses
      seatingKeys.forEach((seatKey) => {
        const seating = zones[seatKey];
        if (seating.currentOccupancy > 0) {
          const leaving = Math.min(
            seating.currentOccupancy,
            seating.maxCapacity * CROWD.EXODUS_FLOW_RATE * deltaTime
          );
          seating.currentOccupancy -= leaving;
          const occupancyPerConcourse = leaving / concourseKeys.length;
          concourseKeys.forEach(
            (k) => (zones[k].currentOccupancy += occupancyPerConcourse)
          );
        }
      });

      // Concourses drain to gate queues
      let totalLeavingConcourses = 0;
      concourseKeys.forEach((conKey) => {
        const concourse = zones[conKey];
        if (concourse.currentOccupancy > 0) {
          const leaving = Math.min(
            concourse.currentOccupancy,
            concourse.maxCapacity * CROWD.EXODUS_FLOW_RATE * deltaTime
          );
          concourse.currentOccupancy -= leaving;
          totalLeavingConcourses += leaving;
        }
      });

      if (totalLeavingConcourses > 0) {
        const gates = { ...state.gates };
        const openGateKeys = Object.keys(gates).filter(
          (k) => gates[k].isOpen
        );
        if (openGateKeys.length > 0) {
          const perGate = totalLeavingConcourses / openGateKeys.length;
          openGateKeys.forEach((k) => {
            gates[k] = {
              ...gates[k],
              queueLength: gates[k].queueLength + perGate,
            };
          });
          return { zones, gates, transport: { ...transport, newlyEntered: 0 } };
        }
      }
    } else if (isHalftime) {
      // Halftime surge: fans leave seats for concourses
      seatingKeys.forEach((seatKey) => {
        const seating = zones[seatKey];
        const targetOccupancy =
          seating.maxCapacity * CROWD.HALFTIME_SEATED_FRACTION;
        if (seating.currentOccupancy > targetOccupancy) {
          const leaving = Math.min(
            seating.currentOccupancy - targetOccupancy,
            seating.maxCapacity * CROWD.SEATING_FLOW_RATE * deltaTime
          );
          seating.currentOccupancy -= leaving;
          const occupancyPerConcourse = leaving / concourseKeys.length;
          concourseKeys.forEach(
            (k) => (zones[k].currentOccupancy += occupancyPerConcourse)
          );
        }
      });
    } else {
      // Pre-game and active halves: fans move from concourses to seats
      let concoursePool = 0;
      concourseKeys.forEach((conKey) => {
        const concourse = zones[conKey];
        const leaving = Math.min(
          concourse.currentOccupancy,
          concourse.maxCapacity * CROWD.SEATING_FLOW_RATE * deltaTime
        );
        concourse.currentOccupancy -= leaving;
        concoursePool += leaving;
      });

      if (concoursePool > 0) {
        const perSeat = concoursePool / seatingKeys.length;
        seatingKeys.forEach((seatKey) => {
          zones[seatKey].currentOccupancy += perSeat;
        });
      }
    }

    // Recalculate densities and clamp occupancy
    Object.keys(zones).forEach((key) => {
      const zone = zones[key];
      zone.currentOccupancy = Math.max(0, zone.currentOccupancy);
      zone.density = zone.currentOccupancy / zone.maxCapacity;
    });

    return { zones, transport: { ...transport, newlyEntered: 0 } };
  }
}
