import type { StadiumState } from '../store/stadiumStore';

export class GateEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    const gates = { ...state.gates };
    let totalProcessed = 0;

    Object.keys(gates).forEach(key => {
      const gate = { ...gates[key] };
      
      if (!gate.isOpen) {
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
      if (gate.scannerStatus === 'degraded') {
        effectiveCapacityPerHour *= 0.75;
      } else if (gate.scannerStatus === 'failed') {
        effectiveCapacityPerHour *= 0.50;
      }

      const capacityPerSecond = effectiveCapacityPerHour / 3600;
      
      // Number of people processed this tick
      const processed = Math.min(gate.queueLength, capacityPerSecond * deltaTime);
      
      gate.queueLength = Math.max(0, gate.queueLength - processed);
      totalProcessed += processed;
      
      // Wait time in minutes: (queue length / effective capacity per hour) * 60
      if (effectiveCapacityPerHour > 0) {
        gate.averageWaitTime = (gate.queueLength / effectiveCapacityPerHour) * 60;
      } else {
        gate.averageWaitTime = gate.queueLength > 0 ? 999 : 0;
      }
      
      gates[key] = gate;
    });

    // We can accumulate processed people in a temporary field if we want to pass to CrowdEngine
    // But let's just let CrowdEngine pull it or we pass it via a state field.
    // For now, let's add `processedThisTick` to transport state just to bridge it
    const transport = { ...state.transport, newlyEntered: totalProcessed } as any;

    return { gates, transport };
  }
}
