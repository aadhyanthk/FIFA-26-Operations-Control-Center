import type { StadiumState, TeamState, ZoneState } from '../store/stadiumStore';
import type { StadiumEvent } from './EventEngine';
import { resolveTeamIncidents } from './resolveTeamIncidents';
import { OCC_CONSTANTS } from '../utils/operationsConstants';

const { CLEANING } = OCC_CONSTANTS;

/**
 * Simulates litter accumulation, restroom degradation, and cleaning team
 * dispatch resolution for the FIFA 26 stadium on match day.
 *
 * ## Responsibilities
 * - Accumulates litter in all zones proportional to crowd density.
 * - Degrades restroom status in concourse zones over time.
 * - Generates incidents when litter or restroom thresholds are crossed.
 * - Drives the traveling → on-scene → resolved FSM for all cleaning teams
 *   via the shared {@link resolveTeamIncidents} utility, with a domain-specific
 *   post-resolution hook that resets zone metrics to clean state.
 *
 * ## Causal Inputs
 * - `state.zones` — density read to calculate accumulation rates
 */
export class CleaningEngine {
  tick(state: StadiumState, _deltaTime: number): Partial<StadiumState> {
    const newIncidents: StadiumEvent[] = [...state.incidents];
    const newTeams: Record<string, TeamState> = { ...state.teams };
    const newZones: Record<string, ZoneState> = { ...state.zones };
    let hasChanges = false;

    // 1. Litter and Restroom Degradation
    Object.values(newZones).forEach((zone) => {
      // Litter accumulation
      let litterRate = zone.density * CLEANING.BASE_LITTER_RATE;
      if ((CLEANING.FOOD_ADJACENT_ZONES as readonly string[]).includes(zone.name)) {
        litterRate *= CLEANING.FOOD_ADJACENT_LITTER_MULTIPLIER;
      }

      const oldLitter = zone.litterLevel;
      zone.litterLevel = Math.min(1, zone.litterLevel + litterRate);
      if (zone.litterLevel !== oldLitter) hasChanges = true;

      if (zone.litterLevel > CLEANING.LITTER_WARNING_THRESHOLD) {
        const exists = newIncidents.find(
          (i) =>
            i.type === 'cleaning' &&
            i.location === zone.name &&
            i.title.includes('Litter') &&
            i.status !== 'resolved'
        );
        if (!exists) {
          const severity =
            zone.litterLevel > CLEANING.LITTER_HIGH_THRESHOLD ? 'high' : 'medium';
          newIncidents.unshift({
            id: `ev-cln-lit-${Date.now()}-${zone.id}`,
            timestamp: state.simTime,
            type: 'cleaning',
            severity,
            title: `Excessive Litter in ${zone.name}`,
            description: `Litter level has reached ${(zone.litterLevel * 100).toFixed(0)}%.`,
            location: zone.name,
            relatedEvents: [],
            status: 'new',
          });
          hasChanges = true;
        }
      }

      // Restroom degradation (concourses only)
      if (zone.name.includes('Concourse')) {
        const oldUsage = zone.restroomUsage;
        zone.restroomUsage += zone.density * CLEANING.RESTROOM_USAGE_RATE;
        if (zone.restroomUsage !== oldUsage) hasChanges = true;

        let newStatus: ZoneState['restroomStatus'] = 'clean';
        if (zone.restroomUsage > CLEANING.RESTROOM_CRITICAL_THRESHOLD) {
          newStatus = 'critical';
        } else if (zone.restroomUsage > CLEANING.RESTROOM_ATTENTION_THRESHOLD) {
          newStatus = 'needs_attention';
        }

        if (zone.restroomStatus !== newStatus) {
          zone.restroomStatus = newStatus;
          hasChanges = true;

          if (newStatus === 'critical') {
            const exists = newIncidents.find(
              (i) =>
                i.type === 'cleaning' &&
                i.location === zone.name &&
                i.title.includes('Restroom') &&
                i.status !== 'resolved'
            );
            if (!exists) {
              newIncidents.unshift({
                id: `ev-cln-rr-${Date.now()}-${zone.id}`,
                timestamp: state.simTime,
                type: 'cleaning',
                severity: 'critical',
                title: `Restroom Critical in ${zone.name}`,
                description: 'Restroom facilities require immediate attention.',
                location: zone.name,
                relatedEvents: [],
                status: 'new',
              });
              hasChanges = true;
            }
          }
        }
      }
    });

    // 2. Team Resolution FSM
    const fsmChanged = resolveTeamIncidents(
      newTeams,
      newIncidents,
      'cleaning',
      state.simTime,
      (severity) =>
        CLEANING.RESOLVE_TIME[severity as keyof typeof CLEANING.RESOLVE_TIME] ??
        CLEANING.RESOLVE_TIME.medium,
      // Post-resolution hook: reset zone metrics after cleaning
      (incident) => {
        const zone = Object.values(newZones).find(
          (z) => z.name === incident.location
        );
        if (zone) {
          if (incident.title.includes('Litter')) {
            zone.litterLevel = 0;
          }
          if (incident.title.includes('Restroom')) {
            zone.restroomUsage = 0;
            zone.restroomStatus = 'clean';
          }
        }
      }
    );
    if (fsmChanged) hasChanges = true;

    if (hasChanges) {
      return { incidents: newIncidents, teams: newTeams, zones: newZones };
    }
    return {};
  }
}
