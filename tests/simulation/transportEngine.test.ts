import { describe, it, expect } from 'vitest';
import { TransportEngine } from '../../src/simulation/TransportEngine';
import type { StadiumState } from '../../src/store/stadiumStore';

describe('TransportEngine', () => {
  const getMockState = (): StadiumState => ({
    simTime: -3600, // 1 hour out
    tickCount: 0,
    speed: 1,
    isPaused: false,
    announcementBanner: null,
    activeMatchPhase: 'Pre-Game',
    weather: {
      temperature: 24,
      rainIntensity: 0,
      windSpeed: 10,
      humidity: 60,
      targetTemperature: 25,
      targetRainIntensity: 0
    },
    transport: { trainDelays: 0, busDelays: 0, incomingPassengers: 0, dispersingCrowds: [] },
    gates: {},
    zones: {},
    teams: {},
    foodCourts: {},
    incidents: [],
    historicalMetrics: { occupancyTrend: 0, queueTrend: 0, lastOccupancy: 0, lastQueue: 0, lastTrendUpdate: 0, lastTimelineUpdate: 0, timeline: [] },
    setSpeed: () => {},
    togglePause: () => {},
    tick: () => {},
    updateState: () => {},
    addIncident: () => {},
    resolveIncident: () => {},
    setAnnouncementBanner: () => {}
  } as unknown as StadiumState);

  it('adds train delays during heavy rain', () => {
    const engine = new TransportEngine();
    const state = getMockState();
    state.weather.rainIntensity = 0.8;
    
    const result = engine.tick(state, 1);
    expect(result.transport?.trainDelays).toBeGreaterThan(0);
  });

  it('generates incoming passengers at peak time', () => {
    const engine = new TransportEngine();
    const state = getMockState();
    state.simTime = -1800; // Peak time
    
    const result = engine.tick(state, 10);
    // Base rate is 15. Over 10 seconds, ~150 base * noise
    expect(result.transport?.incomingPassengers).toBeGreaterThan(0);
  });

  it('processes dispersing crowds over time', () => {
    const engine = new TransportEngine();
    const state = getMockState();
    state.transport.dispersingCrowds = [
      { amount: 100, timeRemaining: 1 }
    ];
    
    const result = engine.tick(state, 1);
    expect(result.transport?.dispersingCrowds?.length).toBe(0);
    expect(result.transport?.incomingPassengers).toBeGreaterThanOrEqual(100);
  });
});
