import type { StadiumState } from '../store/stadiumStore';

export class GateEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    const gates = { ...state.gates };
    const transport = { ...state.transport };
    
    // Switch to outflow during Exodus
    const isOutflowPhase = state.simTime >= 6300;

    let totalEntered = 0;
    let totalDeparted = 0;

    Object.keys(gates).forEach(key => {
      const gate = { ...gates[key] };
      
      if (isOutflowPhase && gate.mode !== 'outflow') {
        gate.mode = 'outflow';
      } else if (!isOutflowPhase && gate.mode !== 'inflow') {
        gate.mode = 'inflow';
      }

      if (gate.inboundTransits && gate.inboundTransits.length > 0) {
        const remaining: {amount: number, timeRemaining: number}[] = [];
        gate.inboundTransits.forEach(t => {
          t.timeRemaining -= deltaTime;
          if (t.timeRemaining <= 0) {
            gate.queueLength += t.amount;
          } else {
            remaining.push(t);
          }
        });
        gate.inboundTransits = remaining;
      }

      if (!gate.isOpen) {
        if (gate.queueLength > 0) {
          // Crowd naturally leaves the closed gate to find an open one
          const dispersalRate = Math.max(5, Math.min(500, gate.queueLength * 0.05));
          const leaving = Math.min(gate.queueLength, dispersalRate * deltaTime);
          gate.queueLength -= leaving;
          
          if (leaving > 0) {
            transport.dispersingCrowds = [
              ...(transport.dispersingCrowds || []),
              { amount: leaving, timeRemaining: 120 + Math.random() * 180 }
            ];
          }
        }
        gates[key] = gate;
        return;
      }
      
      const laneMultiplier = gate.activeLanes / 4; 
      let effectiveCapacityPerHour = gate.capacityPerHour * laneMultiplier;
      
      if (state.weather.rainIntensity > 0.3) {
        effectiveCapacityPerHour *= 0.85; 
      }
      
      let scannerFactor = 1.0;
      if (gate.scannerStatus === 'degraded') {
        scannerFactor = 0.75;
      } else if (gate.scannerStatus === 'offline') {
        scannerFactor = 0.50;
      }

      if (state.incidents && state.incidents.length > 0) {
        const activeGateIncidents = state.incidents.filter(
          i => i.status !== 'resolved' && i.location === `Gate ${key}`
        );
        if (activeGateIncidents.length > 0) {
          scannerFactor *= 0.50; 
        }
      }

      effectiveCapacityPerHour *= scannerFactor;
      
      const pressureMultiplier = 1 + Math.min(1.0, gate.queueLength / 2000);
      const surgeMultiplier = 3 * pressureMultiplier;
      const capacityPerSecond = (effectiveCapacityPerHour * surgeMultiplier) / 3600;
      
      const processed = Math.min(gate.queueLength, capacityPerSecond * deltaTime);
      
      gate.queueLength = Math.max(0, gate.queueLength - processed);
      
      if (gate.mode === 'inflow') {
        totalEntered += processed;
      } else {
        totalDeparted += processed;
      }
      
      if (effectiveCapacityPerHour > 0) {
        gate.averageWaitTime = (gate.queueLength / (effectiveCapacityPerHour * surgeMultiplier)) * 60;
      } else {
        gate.averageWaitTime = gate.queueLength > 0 ? 999 : 0;
      }
      
      gate.currentThroughput = effectiveCapacityPerHour * surgeMultiplier;
      
      gates[key] = gate;
    });

    transport.newlyEntered = totalEntered;
    transport.departedPassengers = (transport.departedPassengers || 0) + totalDeparted;

    return { gates, transport };
  }
}
