import type { StadiumState } from '../store/stadiumStore';
import { OCC_CONSTANTS } from '../utils/operationsConstants';

const { WEATHER } = OCC_CONSTANTS;

/**
 * Simulates real-world weather dynamics at MetLife Stadium on match day.
 *
 * ## Model
 * Weather values (`temperature`, `rainIntensity`, `windSpeed`, `humidity`)
 * are smoothly interpolated toward independently evolving *target* values.
 * Targets evolve through:
 *  - Spontaneous weather events (squalls, heatwaves) with low-probability triggers
 *  - Natural drift (small random walk each tick)
 *  - Automatic subsidence of extreme events over time
 *
 * This produces realistic, gradual weather changes rather than instant jumps.
 *
 * ## Causal Outputs
 * Weather state is read by `TransportEngine` (rain delays), `GateEngine`
 * (throughput penalties), `MedicalEngine` (heat/rain incident rates), and
 * `FoodEngine` (drink demand spikes).
 *
 * @param state - Full stadium state snapshot
 * @param deltaTime - Seconds elapsed since last tick
 * @returns Partial state containing updated `weather`
 */
export class WeatherEngine {
  tick(state: StadiumState, deltaTime: number): Partial<StadiumState> {
    const weather = { ...state.weather };

    // Smooth interpolation toward temperature target
    if (weather.temperature < weather.targetTemperature) {
      weather.temperature = Math.min(
        weather.targetTemperature,
        weather.temperature + WEATHER.TEMP_INTERPOLATION_RATE * deltaTime
      );
    } else if (weather.temperature > weather.targetTemperature) {
      weather.temperature = Math.max(
        weather.targetTemperature,
        weather.temperature - WEATHER.TEMP_INTERPOLATION_RATE * deltaTime
      );
    }

    // Smooth interpolation toward rain intensity target
    if (weather.rainIntensity < weather.targetRainIntensity) {
      weather.rainIntensity = Math.min(
        weather.targetRainIntensity,
        weather.rainIntensity + WEATHER.RAIN_INTERPOLATION_RATE * deltaTime
      );
    } else if (weather.rainIntensity > weather.targetRainIntensity) {
      weather.rainIntensity = Math.max(
        weather.targetRainIntensity,
        weather.rainIntensity - WEATHER.RAIN_INTERPOLATION_RATE * deltaTime
      );
    }

    // Wind speed random walk
    if (Math.random() < WEATHER.WIND_RANDOM_WALK_CHANCE) {
      weather.windSpeed += (Math.random() - 0.5) * 2;
      weather.windSpeed = Math.max(
        0,
        Math.min(WEATHER.MAX_WIND_SPEED, weather.windSpeed)
      );
    }

    // Humidity random walk
    if (Math.random() < WEATHER.HUMIDITY_RANDOM_WALK_CHANCE) {
      weather.humidity += (Math.random() - 0.5) * 1.5;
      weather.humidity = Math.max(
        WEATHER.MIN_HUMIDITY,
        Math.min(WEATHER.MAX_HUMIDITY, weather.humidity)
      );
    }

    // Weather event trigger logic
    const isQuiet =
      weather.targetRainIntensity < OCC_CONSTANTS.THRESHOLDS.SEVERE_WEATHER_RAIN &&
      weather.targetTemperature < OCC_CONSTANTS.THRESHOLDS.HEATWAVE_TEMP;

    if (isQuiet) {
      if (Math.random() < WEATHER.RAIN_SQUALL_CHANCE) {
        // Spontaneous squall
        weather.targetRainIntensity = WEATHER.SQUALL_RAIN_TARGET;
        weather.windSpeed = Math.max(weather.windSpeed, WEATHER.SQUALL_MIN_WIND);
      } else if (Math.random() < WEATHER.HEATWAVE_CHANCE) {
        // Spontaneous heatwave
        weather.targetTemperature = WEATHER.HEATWAVE_TEMP_TARGET;
      } else {
        // Natural drift
        if (Math.random() < WEATHER.TEMP_DRIFT_CHANCE) {
          weather.targetTemperature += (Math.random() - 0.5) * WEATHER.TEMP_DRIFT_RANGE;
          weather.targetTemperature = Math.max(
            WEATHER.TEMP_MIN,
            Math.min(WEATHER.TEMP_MAX, weather.targetTemperature)
          );
        }
        if (
          Math.random() < WEATHER.RAIN_CLEAR_CHANCE &&
          weather.targetRainIntensity > 0
        ) {
          weather.targetRainIntensity = Math.max(
            0,
            weather.targetRainIntensity - WEATHER.RAIN_CLEAR_STEP
          );
        }
      }
    } else {
      // Active weather event — chance it subsides
      if (Math.random() < WEATHER.EVENT_SUBSIDE_CHANCE) {
        weather.targetRainIntensity = 0;
        weather.targetTemperature = WEATHER.SUBSIDE_TEMP_TARGET;
      }
    }

    return { weather };
  }
}
