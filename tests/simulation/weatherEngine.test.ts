import { describe, it, expect } from 'vitest';
import { WeatherEngine } from '../../src/simulation/WeatherEngine';
import type { StadiumState } from '../../src/store/stadiumStore';

describe('WeatherEngine', () => {
  const getMockState = (): StadiumState => ({
    simTime: 0,
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
      targetRainIntensity: 0.5
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

  it('interpolates temperature towards target', () => {
    const engine = new WeatherEngine();
    const state = getMockState();
    
    // Target is 25, current is 24, deltaTime is 1
    const result = engine.tick(state, 1);
    expect(result.weather?.temperature).toBeCloseTo(24.1, 1);
  });

  it('interpolates rain intensity towards target', () => {
    const engine = new WeatherEngine();
    const state = getMockState();
    
    // Target is 0.5, current is 0, deltaTime is 1
    const result = engine.tick(state, 1);
    expect(result.weather?.rainIntensity).toBeCloseTo(0.005, 3);
  });
  
  it('caps temperature adjustments properly', () => {
    const engine = new WeatherEngine();
    const state = getMockState();
    state.weather.temperature = 24.95;
    state.weather.targetTemperature = 25;
    
    // 0.1 delta would push it to 25.05, but it should cap at 25
    const result = engine.tick(state, 1);
    expect(result.weather?.temperature).toBeCloseTo(25, 2);
  });
});
