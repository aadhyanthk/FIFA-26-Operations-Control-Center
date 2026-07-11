import type { StadiumState } from '../store/stadiumStore';

export class ArrivalEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
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
