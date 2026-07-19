import { describe, it, expect, beforeEach } from 'vitest';
import { GateEngine } from '../../src/simulation/GateEngine';
import type { StadiumState } from '../../src/store/stadiumStore';

describe('GateEngine', () => {
  let engine: GateEngine;
  let mockState: Partial<StadiumState>;

  beforeEach(() => {
    engine = new GateEngine();
    mockState = {
      weather: { temperature: 20, rainIntensity: 0, windSpeed: 5, humidity: 50, targetTemperature: 20, targetRainIntensity: 0 },
      transport: {
        incomingPassengers: 0,
        busDelays: 0,
        trainDelays: 0,
        dispersingCrowds: []
      },
      gates: {
        'A': {
          id: 'A',
          isOpen: true,
          capacityPerHour: 1000,
          queueLength: 500,
          activeLanes: 4,
          averageWaitTime: 0,
          scannerStatus: 'operational',
          scannerHealth: 100,
          mode: 'inflow'
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

  it('should decrease throughput heavily under severe rain', () => {
    mockState.weather!.rainIntensity = 0.9;
    const newState = engine.tick(mockState as StadiumState, 1);
    // Queue should process slower due to rain penalty
    expect(newState.gates!['A'].queueLength).toBeGreaterThan(470);
  });

  it('should handle zero active lanes gracefully', () => {
    mockState.gates!['A'].activeLanes = 0;
    const newState = engine.tick(mockState as StadiumState, 1);
    expect(newState.gates!['A'].queueLength).toBeGreaterThanOrEqual(475);
    // Wait time should trend to infinity but is capped/managed safely in engine (or very high)
    expect(newState.gates!['A'].averageWaitTime).toBeGreaterThan(50);
  });
});
