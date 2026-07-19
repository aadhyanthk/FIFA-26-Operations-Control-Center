import type { StadiumState } from '../store/stadiumStore';
import type { StadiumEvent } from './EventEngine';
import { OCC_CONSTANTS } from '../utils/operationsConstants';

const { TRANSPORT, THRESHOLDS, TIME } = OCC_CONSTANTS;

/**
 * Simulates the transport network servicing MetLife Stadium on match day.
 *
 * ## Model
 * `incomingPassengers` accumulates each tick from two sources:
 * 1. **Schedule-based arrivals** — a smooth demand curve keyed to time from
 *    kickoff, with noise and a chaos multiplier during active incidents.
 * 2. **Batch arrivals** — probabilistic simulation of individual trains
 *    arriving during the pre-match window.
 *
 * Transport delays are caused by heavy rain (`rainIntensity > SEVERE_WEATHER_RAIN`)
 * and worsen with active incidents. When a delay resolves (randomly), all
 * accumulated passengers arrive as a surge, which may generate its own incident.
 *
 * Dispersing crowds (fans redirected from closed gates) are also processed here:
 * they arrive at open gates after a simulated walk time.
 *
 * ## Causal Outputs
 * - `transport.incomingPassengers` — consumed by `ArrivalEngine`
 * - `transport.trainDelays` / `busDelays` — read by `EventEngine` for alert generation
 *
 * @param state - Full stadium state snapshot
 * @param deltaTime - Seconds elapsed since last tick
 * @returns Partial state containing updated `transport` and any new incidents
 */
export class TransportEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    const transport = { ...state.transport };
    const newIncidents: StadiumEvent[] = [...state.incidents];

    let incidentDelay = 0;
    let totalActiveIncidents = 0;
    if (state.incidents && state.incidents.length > 0) {
      const activeIncidents = state.incidents.filter(
        (i) => i.status !== 'resolved'
      );
      totalActiveIncidents = activeIncidents.length;
      const transportIncidents = activeIncidents.filter(
        (i) => i.type === 'transport'
      );
      // Transport incidents add major delays; other incidents add minor chaotic delays
      incidentDelay =
        transportIncidents.length * 15 +
        (totalActiveIncidents - transportIncidents.length) * 5;
    }

    // Rain-driven train delays
    if (state.weather.rainIntensity > THRESHOLDS.SEVERE_WEATHER_RAIN) {
      transport.trainDelays =
        Math.floor(state.weather.rainIntensity * 20) + incidentDelay;
    } else {
      transport.trainDelays = Math.max(
        incidentDelay,
        transport.trainDelays - deltaTime * 0.05
      );
    }

    if (transport.trainDelays > THRESHOLDS.CRITICAL_TRAIN_DELAY) {
      const exists = newIncidents.find(
        (i) =>
          i.type === 'transport' &&
          i.title.includes('Major Train Delay') &&
          i.status !== 'resolved'
      );
      if (!exists) {
        newIncidents.unshift({
          id: `ev-trn-delay-${Date.now()}`,
          timestamp: state.simTime,
          type: 'transport',
          severity: 'high',
          title: 'Major Train Delay',
          description: `Train delays are currently estimated at ${Math.floor(transport.trainDelays)} minutes. Expect a surge when service resumes.`,
          location: 'Transit Hub',
          relatedEvents: [],
          status: 'new',
        });
      }
    }

    // Train delay resolution — occasional random clearance causing passenger surge
    if (transport.trainDelays > 0 && Math.random() < 0.02) {
      const surgeAmount = transport.trainDelays * 50;
      transport.incomingPassengers += surgeAmount;

      if (surgeAmount > 500) {
        newIncidents.unshift({
          id: `ev-trn-surge-${Date.now()}`,
          timestamp: state.simTime,
          type: 'transport',
          severity: 'medium',
          title: 'Transit Delay Resolved - Incoming Surge',
          description: `A train delay has resolved. An unexpected surge of ~${Math.floor(surgeAmount)} passengers is arriving at the Transit Hub.`,
          location: 'Transit Hub',
          relatedEvents: [],
          status: 'new',
        });
      }
      transport.trainDelays = 0;
    }

    // Bus delay resolution
    if (transport.busDelays > 0 && Math.random() < 0.03) {
      const surgeAmount = transport.busDelays * 20;
      transport.incomingPassengers += surgeAmount;
      if (surgeAmount > 500) {
        newIncidents.unshift({
          id: `ev-bus-surge-${Date.now()}`,
          timestamp: state.simTime,
          type: 'transport',
          severity: 'medium',
          title: 'Bus Delay Resolved - Incoming Surge',
          description: `A bus delay has resolved. An unexpected surge of ~${Math.floor(surgeAmount)} passengers is arriving.`,
          location: 'Transit Hub',
          relatedEvents: [],
          status: 'new',
        });
      }
      transport.busDelays = 0;
    }

    // Demand curve: arrival rate keyed to simTime offset from kickoff
    const t = state.simTime;
    let baseArrivalRate = 0;

    if (t < TIME.HOURS_2_OUT) {
      baseArrivalRate = 0;
    } else if (t < TIME.HOURS_1_5_OUT) {
      baseArrivalRate = TRANSPORT.BASE_ARRIVAL_RATE;
    } else if (t < TIME.HOURS_1_OUT) {
      baseArrivalRate = TRANSPORT.MID_ARRIVAL_RATE;
    } else if (t < TIME.MINS_30_OUT) {
      baseArrivalRate = TRANSPORT.PEAK_ARRIVAL_RATE;
    } else if (t < TIME.MINS_15_OUT) {
      baseArrivalRate = TRANSPORT.PRE_PEAK_ARRIVAL_RATE;
    } else if (t <= TIME.KICKOFF) {
      baseArrivalRate = TRANSPORT.LATE_ARRIVAL_RATE;
    } else if (t < TIME.MINS_30_AFTER) {
      baseArrivalRate = TRANSPORT.AFTERKICKOFF_RATE;
    }

    if (baseArrivalRate > 0) {
      const noise =
        TRANSPORT.ARRIVAL_NOISE_MIN + Math.random() * TRANSPORT.ARRIVAL_NOISE_MAX;
      const incidentFactor =
        totalActiveIncidents > 0 ? TRANSPORT.INCIDENT_ARRIVAL_BOOST : 1.0;
      transport.incomingPassengers += Math.floor(
        baseArrivalRate * deltaTime * noise * incidentFactor
      );
    }

    // Scheduled train batch arrivals during the arrival window
    if (t > TIME.HOURS_2_OUT && t < TIME.MINS_30_AFTER) {
      if (
        Math.random() <
        TRANSPORT.TRAIN_ARRIVAL_PROBABILITY_PER_SEC * deltaTime
      ) {
        transport.incomingPassengers += Math.floor(
          Math.random() * TRANSPORT.TRAIN_BATCH_SIZE_RANGE +
            TRANSPORT.TRAIN_BATCH_SIZE_MIN
        );
      }
    }

    // Process dispersing crowds (fans walking from closed gates to open ones)
    if (transport.dispersingCrowds && transport.dispersingCrowds.length > 0) {
      const remainingCrowds: { amount: number; timeRemaining: number }[] = [];
      transport.dispersingCrowds.forEach((crowd) => {
        crowd.timeRemaining -= deltaTime;
        if (crowd.timeRemaining <= 0) {
          transport.incomingPassengers += crowd.amount;
        } else {
          remainingCrowds.push(crowd);
        }
      });
      transport.dispersingCrowds = remainingCrowds;
    }

    return { transport, incidents: newIncidents };
  }
}
