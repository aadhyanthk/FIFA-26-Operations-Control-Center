import type { StadiumState } from '../store/stadiumStore';

export class GateEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    const gates = { ...state.gates };
    let transport = { ...state.transport } as any;
    let totalProcessed = 0;

    Object.keys(gates).forEach(key => {
      const gate = { ...gates[key] };
      
      if (!gate.isOpen) {
        if (gate.queueLength > 0) {
          // Crowd naturally leaves the closed gate to find an open one
          // Dispersal rate depends on crowd size (5% per second, clamped between 5 and 500)
          const dispersalRate = Math.max(5, Math.min(500, gate.queueLength * 0.05));
          const leaving = Math.min(gate.queueLength, dispersalRate * deltaTime);
          gate.queueLength -= leaving;
          
          // Add them to the transit delay pool (delay of 120-300 seconds)
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
      
      // Base throughput per second
      // capacityPerHour is for 4 lanes max
      const laneMultiplier = gate.activeLanes / 4; 
      let effectiveCapacityPerHour = gate.capacityPerHour * laneMultiplier;
      
      // Rain reduces throughput
      if (state.weather.rainIntensity > 0.3) {
        effectiveCapacityPerHour *= 0.85; // 15% reduction
      }
      
      // Scanner issues reduce throughput
      let scannerFactor = 1.0;
      if (gate.scannerStatus === 'degraded') {
        scannerFactor = 0.75;
      } else if (gate.scannerStatus === 'failed') {
        scannerFactor = 0.50;
      }

      // Incidents reduce throughput heavily
      if (state.incidents && state.incidents.length > 0) {
        const activeGateIncidents = state.incidents.filter(
          i => i.status !== 'resolved' && i.location === `Gate ${key}`
        );
        if (activeGateIncidents.length > 0) {
          scannerFactor *= 0.50; // 50% capacity reduction per active incident
        }
      }

      effectiveCapacityPerHour *= scannerFactor;
      
      // Pressure multiplier: Staff process people up to 2x faster if the queue is massive
      const pressureMultiplier = 1 + Math.min(1.0, gate.queueLength / 2000);
      
      // Multiply by a factor of 3 to simulate real-world surges
      const surgeMultiplier = 3 * pressureMultiplier;
      const capacityPerSecond = (effectiveCapacityPerHour * surgeMultiplier) / 3600;
      
      // Number of people processed this tick
      const processed = Math.min(gate.queueLength, capacityPerSecond * deltaTime);
      
      gate.queueLength = Math.max(0, gate.queueLength - processed);
      totalProcessed += processed;
      
      // Wait time in minutes: (queue length / surge effective capacity per hour) * 60
      if (effectiveCapacityPerHour > 0) {
        gate.averageWaitTime = (gate.queueLength / (effectiveCapacityPerHour * surgeMultiplier)) * 60;
      } else {
        gate.averageWaitTime = gate.queueLength > 0 ? 999 : 0;
      }
      
      gates[key] = gate;
    });

    // We can accumulate processed people in a temporary field if we want to pass to CrowdEngine
    // For now, let's add `processedThisTick` to transport state just to bridge it
    transport.newlyEntered = totalProcessed;

    return { gates, transport };
  }
}
