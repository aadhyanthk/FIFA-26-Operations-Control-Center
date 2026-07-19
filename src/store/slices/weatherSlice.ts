import type { StateCreator } from 'zustand';
import type { StadiumState, WeatherState } from '../stadiumStore';

export interface WeatherSlice {
  weather: WeatherState;
}

export const createWeatherSlice: StateCreator<StadiumState, [], [], WeatherSlice> = () => ({
  weather: {
    temperature: 24,
    rainIntensity: 0,
    windSpeed: 10,
    humidity: 60,
    targetTemperature: 24,
    targetRainIntensity: 0
  }
});
