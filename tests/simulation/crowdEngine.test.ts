import { describe, it, expect, beforeEach } from 'vitest';
import { CrowdEngine } from '../../src/simulation/CrowdEngine';
import type { StadiumState } from '../../src/store/stadiumStore';

describe('CrowdEngine', () => {
  let engine: CrowdEngine;
  let mockState: Partial<StadiumState>;

  beforeEach(() => {
    engine = new CrowdEngine();
    mockState = {
      zones: {
        '101': { id: '101', name: 'Section 101', maxCapacity: 1000, currentOccupancy: 850, density: 0.85 },
        '102': { id: '102', name: 'Section 102', maxCapacity: 1000, currentOccupancy: 200, density: 0.2 }
      }
    };
  });

  it('should recalculate density correctly', () => {
    mockState.zones!['101'].currentOccupancy = 900;
    const newState = engine.tick(mockState as StadiumState);
    expect(newState.zones!['101'].density).toBe(0.9);
  });
});
