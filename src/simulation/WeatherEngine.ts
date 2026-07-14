import type { StadiumState } from '../store/stadiumStore';

export class WeatherEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    const weather = { ...state.weather };
    
    // Smooth interpolation towards targets
    // Temperature: moves 0.1 degree per second max
    if (weather.temperature < weather.targetTemperature) {
      weather.temperature = Math.min(weather.targetTemperature, weather.temperature + 0.1 * deltaTime);
    } else if (weather.temperature > weather.targetTemperature) {
      weather.temperature = Math.max(weather.targetTemperature, weather.temperature - 0.1 * deltaTime);
    }

    // Rain: moves 0.005 per second max (takes ~160 seconds to go from 0 to 0.8)
    if (weather.rainIntensity < weather.targetRainIntensity) {
      weather.rainIntensity = Math.min(weather.targetRainIntensity, weather.rainIntensity + 0.005 * deltaTime);
    } else if (weather.rainIntensity > weather.targetRainIntensity) {
      weather.rainIntensity = Math.max(weather.targetRainIntensity, weather.rainIntensity - 0.005 * deltaTime);
    }

    // Slowly change wind speed (random walk)
    if (Math.random() < 0.05) {
      weather.windSpeed += (Math.random() - 0.5) * 2;
      weather.windSpeed = Math.max(0, Math.min(60, weather.windSpeed));
    }
    
    // Slowly change humidity (random walk)
    if (Math.random() < 0.05) {
      weather.humidity += (Math.random() - 0.5) * 1.5;
      weather.humidity = Math.max(30, Math.min(95, weather.humidity));
    }

    // Trigger Weather Events (Random chances)
    // Only trigger if we aren't already in a major event
    if (weather.targetRainIntensity < 0.5 && weather.targetTemperature < 35) {
      // 0.0005 chance per second (~3% per minute) to trigger a rain squall
      if (Math.random() < 0.0005) {
        weather.targetRainIntensity = 0.8; // Heavy rain
        weather.windSpeed = Math.max(weather.windSpeed, 30); // Gusts
      } 
      // 0.0002 chance per second to trigger a heatwave
      else if (Math.random() < 0.0002) {
        weather.targetTemperature = 39; // Heat advisory levels
      } else {
        // Natural drift of targets
        if (Math.random() < 0.01) {
          weather.targetTemperature += (Math.random() - 0.5) * 1.0;
          weather.targetTemperature = Math.max(18, Math.min(32, weather.targetTemperature));
        }
        if (Math.random() < 0.01 && weather.targetRainIntensity > 0) {
          weather.targetRainIntensity -= 0.1;
          weather.targetRainIntensity = Math.max(0, weather.targetRainIntensity);
        }
      }
    } else {
      // If we are in an event, there is a chance it subsides
      if (Math.random() < 0.002) { // Event subsides over time
        weather.targetRainIntensity = 0;
        weather.targetTemperature = 25;
      }
    }

    return { weather };
  }
}
