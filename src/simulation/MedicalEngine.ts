import type { StadiumState, TeamState } from '../store/stadiumStore';
import type { StadiumEvent } from './EventEngine';
import { resolveTeamIncidents } from './resolveTeamIncidents';
import { OCC_CONSTANTS } from '../utils/operationsConstants';

const { MEDICAL, TIME, THRESHOLDS } = OCC_CONSTANTS;

/**
 * Simulates medical incident generation and team dispatch resolution
 * for the FIFA 26 stadium on match day.
 *
 * ## Responsibilities
 * - Stochastically generates medical incidents (heat exhaustion, falls,
 *   cardiac events, etc.) scaled to crowd density, weather, and match phase.
 * - Drives the traveling → on-scene → resolved FSM for all medical teams
 *   via the shared {@link resolveTeamIncidents} utility.
 *
 * ## Causal Inputs
 * - `state.weather.temperature` — high temperatures raise incident probability
 * - `state.weather.rainIntensity` — rain raises slip/fall incident probability
 * - `state.zones` — high-density zones attract more incidents
 * - `state.simTime` — halftime raises probability due to crowd movement
 */
export class MedicalEngine {
  /** Incident type labels for random selection */
  private static readonly INCIDENT_TYPES = [
    'heat_exhaustion',
    'fall',
    'cardiac',
    'allergic_reaction',
    'intoxication',
  ] as const;

  tick(state: StadiumState, _deltaTime: number): Partial<StadiumState> {
    const newIncidents: StadiumEvent[] = [...state.incidents];
    const newTeams: Record<string, TeamState> = { ...state.teams };
    let hasChanges = false;

    // 1. Stochastic Incident Generation
    let medicalIncidentProbability = MEDICAL.BASE_INCIDENT_RATE;

    if (state.weather.temperature > THRESHOLDS.HEATWAVE_TEMP) {
      medicalIncidentProbability *= MEDICAL.HEAT_RATE_MULTIPLIER;
    }
    if (state.weather.rainIntensity > THRESHOLDS.SEVERE_WEATHER_RAIN) {
      medicalIncidentProbability *= MEDICAL.RAIN_RATE_MULTIPLIER;
    }
    if (
      state.simTime >= TIME.HALFTIME_START &&
      state.simTime <= TIME.HALFTIME_END
    ) {
      medicalIncidentProbability *= MEDICAL.HALFTIME_RATE_MULTIPLIER;
    }

    const hasHighDensity = Object.values(state.zones).some(
      (z) => z.density > THRESHOLDS.WARNING_DENSITY
    );
    if (hasHighDensity) {
      medicalIncidentProbability *= MEDICAL.HIGH_DENSITY_MULTIPLIER;
    }

    if (Math.random() < medicalIncidentProbability) {
      const type =
        MedicalEngine.INCIDENT_TYPES[
          Math.floor(Math.random() * MedicalEngine.INCIDENT_TYPES.length)
        ];
      const severity =
        type === 'cardiac'
          ? 'critical'
          : (['low', 'medium', 'high'] as const)[
              Math.floor(Math.random() * 3)
            ];

      const locations = [
        ...Object.values(state.zones).map((z) => z.name),
        ...Object.values(state.gates).map((g) => `Gate ${g.id}`),
      ];

      let selectedLocation =
        locations[Math.floor(Math.random() * locations.length)];
      const denseZones = Object.values(state.zones).filter(
        (z) => z.density > THRESHOLDS.WARNING_DENSITY
      );
      if (denseZones.length > 0 && Math.random() < 0.5) {
        selectedLocation =
          denseZones[Math.floor(Math.random() * denseZones.length)].name;
      }

      newIncidents.unshift({
        id: `ev-med-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: state.simTime,
        type: 'medical',
        severity,
        title: `Medical Incident: ${type.replace('_', ' ').toUpperCase()}`,
        description: `A ${severity} severity medical incident occurred.`,
        location: selectedLocation,
        relatedEvents: [],
        status: 'new',
      });
      hasChanges = true;
    }

    // 2. Team Resolution FSM
    const fsmChanged = resolveTeamIncidents(
      newTeams,
      newIncidents,
      'medical',
      state.simTime,
      (severity) => MEDICAL.RESOLVE_TIME[severity as keyof typeof MEDICAL.RESOLVE_TIME] ?? MEDICAL.RESOLVE_TIME.medium
    );
    if (fsmChanged) hasChanges = true;

    if (hasChanges) {
      return { incidents: newIncidents, teams: newTeams };
    }
    return {};
  }
}
