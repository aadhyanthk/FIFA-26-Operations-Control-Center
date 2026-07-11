import type { StadiumState } from '../store/stadiumStore';

export class WeatherEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    const weather = { ...state.weather };
    
    // Every tick (or over time), slightly adjust weather
    // deltaTime is usually 1 second
    
    // Slowly change temperature
    // Random walk with boundaries
    if (Math.random() < 0.05) {
      weather.temperature += (Math.random() - 0.5) * 0.1;
      weather.temperature = Math.max(18, Math.min(42, weather.temperature));
    }

    // Slowly change rain intensity
    if (Math.random() < 0.02) {
      weather.rainIntensity += (Math.random() - 0.5) * 0.05;
      weather.rainIntensity = Math.max(0, Math.min(1, weather.rainIntensity));
    }

    // Slowly change wind speed
    if (Math.random() < 0.05) {
      weather.windSpeed += (Math.random() - 0.5) * 2;
      weather.windSpeed = Math.max(0, Math.min(60, weather.windSpeed));
    }

    return { weather };
  }
}
