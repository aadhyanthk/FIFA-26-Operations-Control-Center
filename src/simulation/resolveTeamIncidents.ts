import type { TeamState } from '../store/stadiumStore';
import type { StadiumEvent } from './EventEngine';

/**
 * Callback invoked when a team finishes resolving an incident.
 * Allows the calling engine to perform domain-specific side effects
 * (e.g., resetting zone litter levels after a cleaning resolution).
 *
 * @param incident - The incident that was just resolved
 * @param team - The team that resolved it
 */
export type OnResolvedCallback = (
  incident: StadiumEvent,
  team: TeamState
) => void;

/**
 * Runs the three-state team dispatch FSM for a single operational department.
 *
 * ## State Machine
 * ```
 *  [idle] → dispatch → [traveling] → arrived → [on-scene] → resolved → [idle]
 * ```
 *
 * - **Traveling**: `team.arrivalTick` is set; engine waits for `simTime >= arrivalTick`.
 * - **On-scene**: `team.resolveTick` is set; engine waits for `simTime >= resolveTick`.
 * - **Resolved**: incident status set to `'resolved'`, team reset to `'idle'`.
 *
 * If the team's `currentAssignment` incident cannot be found (resolved elsewhere),
 * the team is immediately reset to idle.
 *
 * This function mutates `teams` and `incidents` in place to match the behaviour
 * of the engines it replaces, keeping the causal pipeline's shallow-copy contract.
 *
 * @param teams - The full teams record (mutated in place)
 * @param incidents - The full incidents array (mutated in place)
 * @param department - Which department's teams to process
 * @param simTime - Current simulation time in seconds from kickoff
 * @param getResolveTime - Returns how many seconds a team spends on-scene for a given severity
 * @param onResolved - Optional hook called immediately after an incident is marked resolved
 * @returns `true` if any state changed and the caller should include the mutated data in its return value
 */
export function resolveTeamIncidents(
  teams: Record<string, TeamState>,
  incidents: StadiumEvent[],
  department: TeamState['department'],
  simTime: number,
  getResolveTime: (severity: string) => number,
  onResolved?: OnResolvedCallback
): boolean {
  let hasChanges = false;

  const activeIncidents = incidents.filter(
    (i) => i.type === department && i.status !== 'resolved'
  );

  Object.values(teams)
    .filter((t) => t.department === department)
    .forEach((team) => {
      if (!team.status || team.status !== 'busy' || !team.currentAssignment) {
        return;
      }

      const incident = activeIncidents.find((i) => i.id === team.currentAssignment);

      if (!incident) {
        // Incident was resolved by another means — reset team to idle
        team.status = 'idle';
        team.currentAssignment = undefined;
        team.arrivalTick = undefined;
        team.resolveTick = undefined;
        team.targetLocation = undefined;
        hasChanges = true;
        return;
      }

      const isStillTraveling =
        team.arrivalTick !== undefined && simTime < team.arrivalTick;
      const hasArrived =
        team.arrivalTick !== undefined &&
        simTime >= team.arrivalTick &&
        team.resolveTick === undefined;
      const hasResolved =
        team.resolveTick !== undefined && simTime >= team.resolveTick;

      if (isStillTraveling) {
        // No action needed — team is en route
        return;
      }

      if (hasArrived) {
        // Team reaches the scene and begins work
        team.location = team.targetLocation ?? incident.location;
        team.resolveTick = simTime + getResolveTime(incident.severity);
        incident.status = 'in_progress';
        incident.assignedTeam = team.id;
        hasChanges = true;
        return;
      }

      if (hasResolved) {
        // Team finishes resolving the incident
        incident.status = 'resolved';
        if (onResolved) {
          onResolved(incident, team);
        }
        team.status = 'idle';
        team.currentAssignment = undefined;
        team.arrivalTick = undefined;
        team.resolveTick = undefined;
        team.targetLocation = undefined;
        hasChanges = true;
      }
    });

  return hasChanges;
}
