import type { StadiumState, FoodCourtState } from '../store/stadiumStore';
import type { StadiumEvent } from './EventEngine';
import { OCC_CONSTANTS } from '../utils/operationsConstants';

const { FOOD, TIME } = OCC_CONSTANTS;

/**
 * Simulates food court vendor operations across the FIFA 26 stadium on match day.
 *
 * ## Model
 * Each food court:
 * - Accumulates headcount based on adjacent zone density and match phase
 * - Processes fans at a configurable rate (reduced during equipment failures)
 * - Depletes food/drink stock proportional to throughput
 * - Generates incidents for equipment failures and stock shortages
 * - Autonomously rebalances crowd via transit to less busy courts
 *
 * ## Match Phase Multipliers
 * | Phase | Multiplier |
 * |---|---|
 * | Halftime | 3× (maximum rush) |
 * | Pre-game | 1.5× |
 * | Active play | 0.5× |
 *
 * @param state - Full stadium state snapshot
 * @param deltaTime - Seconds elapsed since last tick
 * @returns Partial state containing updated `foodCourts` and `incidents`
 */
export class FoodEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    const newIncidents: StadiumEvent[] = [...state.incidents];
    const newFoodCourts: Record<string, FoodCourtState> = {
      ...state.foodCourts,
    };
    let hasChanges = false;

    // Determine demand multiplier for current match phase
    let matchPhaseMultiplier: number;
    if (
      state.simTime >= TIME.HALFTIME_START &&
      state.simTime < TIME.HALFTIME_END
    ) {
      matchPhaseMultiplier = FOOD.PHASE_MULTIPLIER.halftime;
    } else if (state.simTime < TIME.KICKOFF) {
      matchPhaseMultiplier = FOOD.PHASE_MULTIPLIER.preGame;
    } else {
      matchPhaseMultiplier = FOOD.PHASE_MULTIPLIER.activePlay;
    }

    Object.values(newFoodCourts).forEach((fc) => {
      const zone = Object.values(state.zones).find(
        (z) => z.name === fc.location
      );
      const density = zone ? zone.density : 0.5;

      // Add incoming demand
      const vendorDemandPerSecond = density * 5 * matchPhaseMultiplier;
      fc.headcount += vendorDemandPerSecond * deltaTime;

      // Equipment failure
      if (
        fc.equipmentStatus === 'operational' &&
        Math.random() < FOOD.EQUIPMENT_FAIL_CHANCE
      ) {
        fc.equipmentStatus = 'failed';
        hasChanges = true;

        const exists = newIncidents.find(
          (i) =>
            i.type === 'maintenance' &&
            i.location === fc.name &&
            i.status !== 'resolved'
        );
        if (!exists) {
          newIncidents.unshift({
            id: `ev-mnt-equip-${Date.now()}-${fc.id}`,
            timestamp: state.simTime,
            type: 'maintenance',
            severity: 'high',
            title: `Equipment Failure at ${fc.name}`,
            description:
              'A vendor equipment piece has failed. Throughput is reduced and some fans will gradually leave the queue.',
            location: fc.name,
            relatedEvents: [],
            status: 'new',
          });
        }
      }

      // Processing rate degrades on equipment failure; fans also abandon queue
      let processingRate = FOOD.NORMAL_PROCESSING_RATE;
      if (fc.equipmentStatus === 'failed') {
        processingRate = FOOD.FAILED_PROCESSING_RATE;
        const abandoning = Math.min(
          fc.headcount,
          FOOD.EQUIPMENT_FAIL_ABANDON_RATE * deltaTime
        );
        fc.headcount = Math.max(0, fc.headcount - abandoning);
      }

      const processed = Math.min(fc.headcount, processingRate * deltaTime);
      fc.headcount = Math.max(0, fc.headcount - processed);
      if (processed > 0 || vendorDemandPerSecond > 0) hasChanges = true;

      // Stock depletion
      let drinkDepletion = processed * FOOD.STOCK_DEPLETION_PER_FAN;
      if (state.weather.temperature > FOOD.HOT_WEATHER_TEMP_THRESHOLD) {
        drinkDepletion *= FOOD.HOT_WEATHER_DRINK_MULTIPLIER;
      }
      const foodDepletion = processed * FOOD.STOCK_DEPLETION_PER_FAN;

      fc.drinkStock = Math.max(0, fc.drinkStock - drinkDepletion);
      fc.foodStock = Math.max(0, fc.foodStock - foodDepletion);
      fc.revenue += processed * FOOD.REVENUE_PER_FAN;

      // Low stock alert
      if (fc.drinkStock < FOOD.LOW_STOCK_THRESHOLD || fc.foodStock < FOOD.LOW_STOCK_THRESHOLD) {
        const item = fc.drinkStock < FOOD.LOW_STOCK_THRESHOLD ? 'Drinks' : 'Food';
        const exists = newIncidents.find(
          (i) =>
            i.type === 'maintenance' &&
            i.location === fc.name &&
            i.title.includes('Stock') &&
            i.status !== 'resolved'
        );
        if (!exists) {
          newIncidents.unshift({
            id: `ev-log-stock-${Date.now()}-${fc.id}`,
            timestamp: state.simTime,
            type: 'maintenance',
            severity: 'high',
            title: `Low ${item} Stock at ${fc.name}`,
            description: `${item} stock is critically low (<${FOOD.LOW_STOCK_THRESHOLD}%). Maintenance resupply needed.`,
            location: fc.name,
            relatedEvents: [],
            status: 'new',
          });
          hasChanges = true;
        }
      }

      // Crowded food court alert
      if (fc.headcount > FOOD.CROWDED_THRESHOLD) {
        const exists = newIncidents.find(
          (i) =>
            i.type === 'crowd' &&
            i.location === fc.name &&
            i.title.includes('Crowded') &&
            i.status !== 'resolved'
        );
        if (!exists) {
          newIncidents.unshift({
            id: `ev-crd-queue-${Date.now()}-${fc.id}`,
            timestamp: state.simTime,
            type: 'crowd',
            severity: 'medium',
            title: `Crowded Food Court at ${fc.name}`,
            description: `Food court headcount has exceeded ${FOOD.CROWDED_THRESHOLD} people (${Math.floor(fc.headcount)} currently).`,
            location: fc.name,
            relatedEvents: [],
            status: 'new',
          });
          hasChanges = true;
        }
      }
    });

    // Autonomous load balancing: fans walk from crowded courts to short queues
    const fcList = Object.values(newFoodCourts);
    fcList.forEach((fc) => {
      // Process arriving transit crowds
      if (fc.inboundTransits && fc.inboundTransits.length > 0) {
        const remaining: { amount: number; timeRemaining: number }[] = [];
        fc.inboundTransits.forEach((t) => {
          t.timeRemaining -= deltaTime;
          if (t.timeRemaining <= 0) {
            fc.headcount += t.amount;
            hasChanges = true;
          } else {
            remaining.push(t);
          }
        });
        fc.inboundTransits = remaining;
      }

      // Overflow fans voluntarily walk to a shorter queue
      if (fc.headcount > FOOD.LOAD_BALANCE_THRESHOLD) {
        const candidates = fcList.filter(
          (f) =>
            f.id !== fc.id && f.headcount < FOOD.LOAD_BALANCE_CANDIDATE_MAX
        );
        if (candidates.length > 0) {
          const excessHeadcount = fc.headcount - FOOD.LOAD_BALANCE_THRESHOLD;
          const leaving = Math.min(
            excessHeadcount,
            excessHeadcount * FOOD.LOAD_BALANCE_RATE * deltaTime
          );

          if (leaving > 1) {
            fc.headcount -= leaving;
            const candidate =
              candidates[Math.floor(Math.random() * candidates.length)];
            candidate.inboundTransits = [
              ...(candidate.inboundTransits || []),
              {
                amount: leaving,
                timeRemaining:
                  FOOD.TRANSIT_TIME_MIN +
                  Math.random() * FOOD.TRANSIT_TIME_RANGE,
              },
            ];
            hasChanges = true;
          }
        }
      }
    });

    if (hasChanges) {
      return { foodCourts: newFoodCourts, incidents: newIncidents };
    }
    return {};
  }
}
