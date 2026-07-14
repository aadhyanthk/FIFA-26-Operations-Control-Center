import type { StadiumState, FoodCourtState } from '../store/stadiumStore';
import type { StadiumEvent } from './EventEngine';

export class FoodEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    const newIncidents: StadiumEvent[] = [...state.incidents];
    let newFoodCourts: Record<string, FoodCourtState> = { ...state.foodCourts };
    let hasChanges = false;

    // Match phases
    let matchPhaseMultiplier = 1.0;
    if (state.simTime >= 2700 && state.simTime < 3600) {
      matchPhaseMultiplier = 3.0; // Halftime rush
    } else if (state.simTime < 0) {
      matchPhaseMultiplier = 1.5; // Pre-game
    } else {
      matchPhaseMultiplier = 0.5; // Active gameplay
    }

    Object.values(newFoodCourts).forEach(fc => {
      const zone = Object.values(state.zones).find(z => z.name === fc.location);
      const density = zone ? zone.density : 0.5;

      const demandRate = (density * 5 * matchPhaseMultiplier);
      const newPeople = demandRate * deltaTime;
      fc.queueLength += newPeople;

      // Equipment failure
      if (fc.equipmentStatus === 'operational' && Math.random() < 0.0001) {
        fc.equipmentStatus = 'failed';
        hasChanges = true;
        
        const exists = newIncidents.find(i => i.type === 'maintenance' && i.location === fc.name && i.status !== 'resolved');
        if (!exists) {
          newIncidents.unshift({
            id: `ev-mnt-equip-${Date.now()}-${fc.id}`,
            timestamp: state.simTime,
            type: 'maintenance',
            severity: 'high',
            title: `Equipment Failure at ${fc.name}`,
            description: `A vendor equipment piece has failed. Throughput is reduced and some fans will gradually leave the queue.`,
            location: fc.name,
            relatedEvents: [],
            status: 'new'
          });
        }
      }

      let processingRate = 2.0; 
      if (fc.equipmentStatus === 'failed') {
        processingRate = 1.0;
        // Fans gradually leave the queue because they wanted the food from the broken equipment
        const leaving = Math.min(fc.queueLength, 0.5 * deltaTime); 
        fc.queueLength = Math.max(0, fc.queueLength - leaving);
      }
      
      const processed = Math.min(fc.queueLength, processingRate * deltaTime);
      fc.queueLength = Math.max(0, fc.queueLength - processed);
      if (processed > 0 || newPeople > 0) hasChanges = true;

      let drinkDepletion = processed * 0.05;
      if (state.weather.temperature > 30) {
        drinkDepletion *= 1.3; 
      }
      const foodDepletion = processed * 0.05;

      fc.drinkStock = Math.max(0, fc.drinkStock - drinkDepletion);
      fc.foodStock = Math.max(0, fc.foodStock - foodDepletion);
      
      fc.revenue += processed * 15; 

      if (fc.drinkStock < 20 || fc.foodStock < 20) {
        const item = fc.drinkStock < 20 ? 'Drinks' : 'Food';
        const exists = newIncidents.find(i => i.type === 'maintenance' && i.location === fc.name && i.title.includes('Stock') && i.status !== 'resolved');
        if (!exists) {
          newIncidents.unshift({
            id: `ev-log-stock-${Date.now()}-${fc.id}`,
            timestamp: state.simTime,
            type: 'maintenance',
            severity: 'high',
            title: `Low ${item} Stock at ${fc.name}`,
            description: `${item} stock is critically low (<20%). Maintenance resupply needed.`,
            location: fc.name,
            relatedEvents: [],
            status: 'new'
          });
          hasChanges = true;
        }
      }

      if (fc.queueLength > 1000) {
        const exists = newIncidents.find(i => i.type === 'crowd' && i.location === fc.name && i.title.includes('Queue') && i.status !== 'resolved');
        if (!exists) {
          newIncidents.unshift({
            id: `ev-crd-queue-${Date.now()}-${fc.id}`,
            timestamp: state.simTime,
            type: 'crowd',
            severity: 'medium',
            title: `Long Queue at ${fc.name}`,
            description: `Food court queue has exceeded 1000 people (${Math.floor(fc.queueLength)} currently).`,
            location: fc.name,
            relatedEvents: [],
            status: 'new'
          });
          hasChanges = true;
        }
      }
    });

    // Autonomous Fan Behavior for load balancing (Transit logic)
    const fcList = Object.values(newFoodCourts);
    fcList.forEach(fc => {
      // Process arriving transits
      if (fc.inboundTransits && fc.inboundTransits.length > 0) {
        const remaining: {amount: number, timeRemaining: number}[] = [];
        fc.inboundTransits.forEach(t => {
          t.timeRemaining -= deltaTime;
          if (t.timeRemaining <= 0) {
            fc.queueLength += t.amount;
            hasChanges = true;
          } else {
            remaining.push(t);
          }
        });
        fc.inboundTransits = remaining;
      }

      // If queue is huge, some fans decide to walk to a shorter one
      if (fc.queueLength > 500) {
        const candidates = fcList.filter(f => f.id !== fc.id && f.queueLength < 150);
        if (candidates.length > 0) {
          // Transfer ~10% of the excess crowd per second (so it's gradual)
          const leavingRate = (fc.queueLength - 500) * 0.10;
          const leaving = Math.min(fc.queueLength - 500, leavingRate * deltaTime);
          
          if (leaving > 1) {
            fc.queueLength -= leaving;
            const candidate = candidates[Math.floor(Math.random() * candidates.length)];
            
            candidate.inboundTransits = [
              ...(candidate.inboundTransits || []),
              { amount: leaving, timeRemaining: 180 + Math.random() * 120 } // 3 to 5 mins walk
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
