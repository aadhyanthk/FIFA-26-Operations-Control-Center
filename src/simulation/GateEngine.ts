import type { StadiumState } from '../store/stadiumStore';
import { OCC_CONSTANTS } from '../utils/operationsConstants';

const { GATE, THRESHOLDS } = OCC_CONSTANTS;

/**
 * Simulates physical gate operations at MetLife Stadium — turnstile throughput,
 * scanner health effects, weather penalties, and crowd dispersal from closed gates.
 *
 * ## Model
 * Each gate's effective throughput is derived from:
 *  1. `capacityPerHour` × lane throughput ratio (active lanes / standard lanes)
 *  2. Rain penalty (if `rainIntensity > SEVERE_WEATHER_RAIN`)
 *  3. Scanner health factor (`operational` / `degraded` / `offline`)
 *  4. Active incident penalty (if any unresolved incident is at this gate)
 *  5. Queue pressure surge (larger queues drive higher instantaneous processing)
 *
 * Closed gates disperse their queue gradually to the transport layer so fans
 * are rerouted to open gates via the `TransportEngine`.
 *
 * ## Causal Outputs
 * - `transport.newlyEntered` — fans entering the stadium from inflow gates
 * - `transport.departedPassengers` — fans exiting from outflow gates (exodus)
 *
 * @param state - Full stadium state snapshot
 * @param deltaTime - Seconds elapsed since last tick
 * @returns Partial state containing updated `gates` and `transport`
 */
export class GateEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    const gates = { ...state.gates };
    const transport = { ...state.transport };

    // Switch all gates to outflow mode during the post-match exodus
    const isOutflowPhase = state.simTime >= OCC_CONSTANTS.TIME.SECOND_HALF_END;

    let totalEntered = 0;
    let totalDeparted = 0;

    Object.keys(gates).forEach((key) => {
      const gate = { ...gates[key] };

      // Update gate mode based on match phase
      if (isOutflowPhase && gate.mode !== 'outflow') {
        gate.mode = 'outflow';
      } else if (!isOutflowPhase && gate.mode !== 'inflow') {
        gate.mode = 'inflow';
      }

      // Process inbound rerouted transit crowds arriving at this gate
      if (gate.inboundTransits && gate.inboundTransits.length > 0) {
        const remaining: { amount: number; timeRemaining: number }[] = [];
        gate.inboundTransits.forEach((t) => {
          t.timeRemaining -= deltaTime;
          if (t.timeRemaining <= 0) {
            gate.queueLength += t.amount;
          } else {
            remaining.push(t);
          }
        });
        gate.inboundTransits = remaining;
      }

      // Closed gate: gradually disperse crowd to other gates
      if (!gate.isOpen) {
        if (gate.queueLength > 0) {
          const dispersalRate = Math.max(
            GATE.DISPERSAL_RATE_MIN,
            Math.min(GATE.DISPERSAL_RATE_MAX, gate.queueLength * GATE.DISPERSAL_QUEUE_FRACTION)
          );
          const leaving = Math.min(gate.queueLength, dispersalRate * deltaTime);
          gate.queueLength -= leaving;

          if (leaving > 0) {
            transport.dispersingCrowds = [
              ...(transport.dispersingCrowds || []),
              {
                amount: leaving,
                timeRemaining:
                  GATE.DISPERSAL_TRANSIT_MIN +
                  Math.random() * GATE.DISPERSAL_TRANSIT_RANGE,
              },
            ];
          }
        }
        gates[key] = gate;
        return;
      }

      // Throughput calculation
      const laneThroughputRatio = gate.activeLanes / GATE.STANDARD_LANE_DIVISOR;
      let effectiveCapacityPerHour =
        gate.capacityPerHour * laneThroughputRatio;

      if (state.weather.rainIntensity > THRESHOLDS.SEVERE_WEATHER_RAIN) {
        effectiveCapacityPerHour *= GATE.RAIN_THROUGHPUT_PENALTY;
      }

      let scannerFactor = 1.0;
      if (gate.scannerStatus === 'degraded') {
        scannerFactor = GATE.SCANNER_DEGRADED_FACTOR;
      } else if (gate.scannerStatus === 'offline') {
        scannerFactor = GATE.SCANNER_OFFLINE_FACTOR;
      }

      if (state.incidents && state.incidents.length > 0) {
        const hasActiveGateIncident = state.incidents.some(
          (i) => i.status !== 'resolved' && i.location === `Gate ${key}`
        );
        if (hasActiveGateIncident) {
          scannerFactor *= GATE.GATE_INCIDENT_FACTOR;
        }
      }

      effectiveCapacityPerHour *= scannerFactor;

      const queuePressureMultiplier =
        1 + Math.min(1.0, gate.queueLength / GATE.PRESSURE_QUEUE_DIVISOR);
      const surgeFactor = GATE.SURGE_MULTIPLIER * queuePressureMultiplier;
      const capacityPerSecond = (effectiveCapacityPerHour * surgeFactor) / 3600;

      const processed = Math.min(gate.queueLength, capacityPerSecond * deltaTime);
      gate.queueLength = Math.max(0, gate.queueLength - processed);

      if (gate.mode === 'inflow') {
        totalEntered += processed;
      } else {
        totalDeparted += processed;
      }

      gate.averageWaitTime =
        effectiveCapacityPerHour > 0
          ? (gate.queueLength / (effectiveCapacityPerHour * surgeFactor)) * 60
          : gate.queueLength > 0
          ? 999
          : 0;

      gate.currentThroughput = effectiveCapacityPerHour * surgeFactor;

      gates[key] = gate;
    });

    transport.newlyEntered = totalEntered;
    transport.departedPassengers =
      (transport.departedPassengers || 0) + totalDeparted;

    return { gates, transport };
  }
}
