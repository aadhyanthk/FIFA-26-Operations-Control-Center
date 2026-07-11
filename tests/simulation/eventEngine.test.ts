import { describe, it, expect, beforeEach } from 'vitest';
import { EventEngine } from '../../src/simulation/EventEngine';
import type { StadiumState } from '../../src/store/stadiumStore';

describe('EventEngine', () => {
  let engine: EventEngine;
  let mockState: Partial<StadiumState>;

  beforeEach(() => {
    engine = new EventEngine();
    mockState = {
      simTime: 100,
      incidents: [],
      gates: {
        'A': { id: 'A', isOpen: true, capacityPerHour: 1000, queueLength: 800, activeLanes: 4, averageWaitTime: 25, scannerStatus: 'operational' }
      },
      zones: {
        '101': { id: '101', name: 'Section 101', maxCapacity: 1000, currentOccupancy: 950, density: 0.95 }
      }
    };
  });

  it('should generate an event if gate queue wait time is > 20', () => {
    const newState = engine.tick(mockState as StadiumState);
    expect(newState.incidents?.length).toBeGreaterThan(0);
    expect(newState.incidents![0].type).toBe('crowd');
    expect(newState.incidents![0].location).toContain('Gate A');
  });

  it('should generate an event if zone density > 0.9', () => {
    // Reset gate to avoid triggering gate event
    mockState.gates!['A'].averageWaitTime = 10;
    
    const newState = engine.tick(mockState as StadiumState);
    expect(newState.incidents?.length).toBeGreaterThan(0);
    expect(newState.incidents![0].type).toBe('crowd');
    expect(newState.incidents![0].location).toContain('Section 101');
  });
});
