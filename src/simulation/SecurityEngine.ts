import type { StadiumState, TeamState, GateState } from '../store/stadiumStore';
import type { StadiumEvent } from './EventEngine';
import { resolveTeamIncidents } from './resolveTeamIncidents';
import { OCC_CONSTANTS } from '../utils/operationsConstants';

const { SECURITY, TIME } = OCC_CONSTANTS;

/**
 * Simulates security incidents, scanner health degradation, and team
 * dispatch resolution for the FIFA 26 stadium on match day.
 *
 * ## Responsibilities
 * - Randomly degrades gate scanner health and escalates scanner status.
 * - Stochastically generates security incidents (altercations, unattended
 *   bags, crowd surges, etc.) weighted toward high-alcohol zones.
 * - Drives the traveling → on-scene → resolved FSM for all security teams
 *   via the shared {@link resolveTeamIncidents} utility.
 *
 * ## Causal Inputs
 * - `state.gates` — scanner health read and written per gate
 * - `state.simTime` — late game period raises incident probability
 * - `state.zones` — locations pool for incident placement
 */
export class SecurityEngine {
  /** Security incident sub-types for random selection */
  private static readonly INCIDENT_TYPES = [
    'unattended_bag',
    'altercation',
    'unauthorized_access',
    'crowd_surge',
  ] as const;

  /** Zones where alcohol is served; incidents are weighted here */
  private static readonly ALCOHOL_ZONES = [
    'East Club',
    'West Club',
    'North Concourse',
    'East Concourse',
    'South Concourse',
    'West Concourse',
  ] as const;

  tick(state: StadiumState, _deltaTime: number): Partial<StadiumState> {
    const newIncidents: StadiumEvent[] = [...state.incidents];
    const newTeams: Record<string, TeamState> = { ...state.teams };
    const newGates: Record<string, GateState> = { ...state.gates };
    let hasChanges = false;

    // 1. Scanner Degradation
    Object.values(newGates).forEach((gate) => {
      if (Math.random() < SECURITY.SCANNER_DEGRADE_CHANCE) {
        gate.scannerHealth = Math.max(
          0,
          gate.scannerHealth -
            Math.floor(Math.random() * SECURITY.SCANNER_DEGRADE_MAX_POINTS + 1)
        );

        let newStatus: GateState['scannerStatus'] = 'operational';
        if (gate.scannerHealth < SECURITY.SCANNER_OFFLINE_THRESHOLD) {
          newStatus = 'offline';
        } else if (gate.scannerHealth < SECURITY.SCANNER_DEGRADED_THRESHOLD) {
          newStatus = 'degraded';
        }

        if (gate.scannerStatus !== newStatus) {
          gate.scannerStatus = newStatus;
          hasChanges = true;

          if (newStatus === 'offline') {
            const hasMaint = newIncidents.find(
              (i) =>
                i.type === 'maintenance' &&
                i.location === `Gate ${gate.id}` &&
                i.status !== 'resolved'
            );
            if (!hasMaint) {
              newIncidents.unshift({
                id: `ev-maint-${Date.now()}-${gate.id}`,
                timestamp: state.simTime,
                type: 'maintenance',
                severity: 'high',
                title: `Scanner Failure at Gate ${gate.id}`,
                description: 'Gate scanner health critical. Maintenance required.',
                location: `Gate ${gate.id}`,
                relatedEvents: [],
                status: 'new',
              });
            }
          }
        }
      }
    });

    // 2. Stochastic Incident Generation
    let securityIncidentProbability = SECURITY.BASE_INCIDENT_RATE;
    if (state.simTime > TIME.LATE_GAME_START) {
      securityIncidentProbability *= SECURITY.LATE_GAME_MULTIPLIER;
    }

    const hasFailedScanner = Object.values(newGates).some(
      (g) => g.scannerStatus === 'offline'
    );
    if (hasFailedScanner) {
      securityIncidentProbability *= SECURITY.FAILED_SCANNER_MULTIPLIER;
    }

    securityIncidentProbability *= SECURITY.ALCOHOL_ZONE_MULTIPLIER;

    if (Math.random() < securityIncidentProbability) {
      const type =
        SecurityEngine.INCIDENT_TYPES[
          Math.floor(Math.random() * SecurityEngine.INCIDENT_TYPES.length)
        ];
      const severity =
        type === 'crowd_surge'
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
      if (Math.random() < SECURITY.ALCOHOL_ZONE_SELECTION_CHANCE) {
        selectedLocation =
          SecurityEngine.ALCOHOL_ZONES[
            Math.floor(Math.random() * SecurityEngine.ALCOHOL_ZONES.length)
          ];
      }

      newIncidents.unshift({
        id: `ev-sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: state.simTime,
        type: 'security',
        severity,
        title: `Security Incident: ${type.replace('_', ' ').toUpperCase()}`,
        description: `A ${severity} severity security incident occurred.`,
        location: selectedLocation,
        relatedEvents: [],
        status: 'new',
      });
      hasChanges = true;
    }

    // 3. Team Resolution FSM
    const fsmChanged = resolveTeamIncidents(
      newTeams,
      newIncidents,
      'security',
      state.simTime,
      (severity) =>
        SECURITY.RESOLVE_TIME[severity as keyof typeof SECURITY.RESOLVE_TIME] ??
        SECURITY.RESOLVE_TIME.medium
    );
    if (fsmChanged) hasChanges = true;

    if (hasChanges) {
      return { incidents: newIncidents, teams: newTeams, gates: newGates };
    }
    return {};
  }
}
