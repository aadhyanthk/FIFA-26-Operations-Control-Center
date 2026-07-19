import { describe, it, expect } from 'vitest';
import { WeatherEngine } from '../../src/simulation/WeatherEngine';
import type { StadiumState } from '../../src/store/stadiumStore';

describe('WeatherEngine', () => {
  const engine = new WeatherEngine();
  
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

  it('maintains clear weather with slight drift', () => {
    const state = createBaseState();
    const update = engine.tick(state, 0.1);
    expect(update.weather).toBeDefined();
    expect(update.weather?.temperature).toBeCloseTo(20, 1);
  });

  it('interpolates rain intensity towards target over time', () => {
    const state = createBaseState();
    state.weather.targetRainIntensity = 0.8;
    const update = engine.tick(state, 10);
    expect(update.weather?.rainIntensity).toBeGreaterThan(0);
    expect(update.weather?.rainIntensity).toBeLessThanOrEqual(0.05); // 0.005 * 10
  });
});
