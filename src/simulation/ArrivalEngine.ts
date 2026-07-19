import type { StadiumState } from '../store/stadiumStore';

/**
 * Distributes fans from the transport layer into gate queues.
 *
 * ## Model
 * `TransportEngine` accumulates `incomingPassengers` each tick based on
 * transport schedules and delays. This engine consumes that value by
 * distributing fans evenly across all open gates, then zeroes the counter.
 *
 * Distributing before `GateEngine` runs ensures the gate throughput
 * simulation immediately accounts for the newly added queue pressure.
 *
 * @param state - Full stadium state snapshot
 * @param _deltaTime - Unused; distribution is instantaneous
 * @returns Partial state with updated `gates` and `transport.incomingPassengers` zeroed
 */
export class ArrivalEngine {
  tick(state: StadiumState, _deltaTime: number): Partial<StadiumState> {
    if (state.transport.incomingPassengers <= 0) {
      return {};
    }

    const gates = { ...state.gates };
    let remainingPassengers = state.transport.incomingPassengers;
    
    // Distribute passengers to open gates
    const openGateKeys = Object.keys(gates).filter(k => gates[k].isOpen);
    
    if (openGateKeys.length > 0 && remainingPassengers > 0) {
      // For now, distribute evenly
      const perGate = Math.floor(remainingPassengers / openGateKeys.length);
      const extra = remainingPassengers % openGateKeys.length;
      
      openGateKeys.forEach((key, index) => {
        gates[key] = {
          ...gates[key],
          queueLength: gates[key].queueLength + perGate + (index === 0 ? extra : 0)
        };
      });
    }

    return { 
      gates,
      transport: {
        ...state.transport,
        incomingPassengers: 0
      }
    };
  }
}
