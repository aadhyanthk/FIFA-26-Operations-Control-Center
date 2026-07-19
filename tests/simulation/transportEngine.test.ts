import { describe, it, expect } from 'vitest';
import { TransportEngine } from '../../src/simulation/TransportEngine';
import type { StadiumState } from '../../src/store/stadiumStore';

describe('TransportEngine', () => {
  const engine = new TransportEngine();
  
  const createBaseState = (): StadiumState => ({
    simTime: 0,
    tickCount: 0,
    speed: 1,
    isPaused: false,
    announcementBanner: null,
    activeMatchPhase: 'Pre-Game',
    tick: () => {},
    setAnnouncementBanner: () => {},
    weather: {
      temperature: 20,
      rainIntensity: 0,
      windSpeed: 5,
      humidity: 50,
      targetTemperature: 20,
      targetRainIntensity: 0,
    },
    transport: { 
      trainDelays: 0, 
      busDelays: 0, 
      incomingPassengers: 0, 
      dispersingCrowds: [] 
    },
    gates: {},
    zones: {},
    teams: {},
    foodCourts: {},
    incidents: [],
    historicalMetrics: {
      timeline: [],
      occupancyTrend: 0,
      queueTrend: 0,
      lastTrendUpdate: 0,
      lastTimelineUpdate: 0,
      lastOccupancy: 0,
      lastQueue: 0,
    },
    setSpeed: () => {},
    togglePause: () => {},
    addIncident: () => {},
    resolveIncident: () => {},
    updateState: () => {}
  });

  it('generates base arrivals based on simTime curve', () => {
    const state = createBaseState();
    state.simTime = -1800; // 30 mins to 1 hour out
    const update = engine.tick(state, 10);
    expect(update.transport).toBeDefined();
    // baseRate is 10. 10 * 10 = 100 * noise factor (0.8-1.2) = 80-120
    expect(update.transport?.incomingPassengers).toBeGreaterThanOrEqual(80);
    expect(update.transport?.incomingPassengers).toBeLessThanOrEqual(120);
  });

  it('delays trains if rain intensity is high', () => {
    const state = createBaseState();
    state.weather.rainIntensity = 0.8;
    const update = engine.tick(state, 0.1);
    expect(update.transport?.trainDelays).toBeGreaterThan(0);
  });
});
