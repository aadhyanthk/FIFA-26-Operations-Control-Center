import { describe, it, expect, beforeEach } from 'vitest';
import { GateEngine } from '../../src/simulation/GateEngine';
import type { StadiumState } from '../../src/store/stadiumStore';

describe('GateEngine', () => {
  let engine: GateEngine;
  let mockState: Partial<StadiumState>;

  beforeEach(() => {
    engine = new GateEngine();
    mockState = {
      weather: { temperature: 20, rainIntensity: 0, windSpeed: 5 },
      gates: {
        'A': {
          id: 'A',
          isOpen: true,
          capacityPerHour: 1000,
          queueLength: 500,
          activeLanes: 4,
          averageWaitTime: 0,
          scannerStatus: 'operational',
          scannerHealth: 100
        }
      }
    };
  });

  it('should process queue based on capacity', () => {
    // 1000 per hour = 1000 / 3600 per second = ~0.27 per sec
    const newState = engine.tick(mockState as StadiumState, 1);
    expect(newState.gates!['A'].queueLength).toBeLessThan(500);
  });

  it('should not process queue if gate is closed', () => {
    mockState.gates!['A'].isOpen = false;
    const newState = engine.tick(mockState as StadiumState, 1);
    expect(newState.gates!['A'].queueLength).toBe(475);
  });

  it('should calculate wait time correctly', () => {
    const newState = engine.tick(mockState as StadiumState, 1);
    // Wait time depends on pressure multiplier and queue remaining
    expect(newState.gates!['A'].averageWaitTime).toBeCloseTo(8, 0);
  });
});
