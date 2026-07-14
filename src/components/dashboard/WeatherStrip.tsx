import React from 'react';
import { useStadiumStore } from '../../store/stadiumStore';

export const WeatherStrip: React.FC = () => {
  const weather = useStadiumStore(state => state.weather);

  return (
    <div className="flex-row gap-lg text-secondary" style={{ 
      alignItems: 'center',
      justifyContent: 'flex-start',
      fontSize: '0.9em'
    }}>
      <div className="flex-row gap-xs" style={{ alignItems: 'center' }}>
        <span style={{ fontSize: '1.2em' }}>🌡️</span>
        <span className="mono font-semibold text-primary">{Math.round(weather.temperature)}°C</span>
      </div>
      
      <div className="flex-row gap-xs" style={{ alignItems: 'center' }}>
        <span style={{ fontSize: '1.2em' }}>🌧️</span>
        <span className="mono font-semibold text-primary">{Math.round(weather.rainIntensity * 100)}%</span>
      </div>
      
      <div className="flex-row gap-xs" style={{ alignItems: 'center' }}>
        <span style={{ fontSize: '1.2em' }}>💨</span>
        <span className="mono font-semibold text-primary">{Math.round(weather.windSpeed)} km/h</span>
      </div>
      
      <div className="flex-row gap-xs" style={{ alignItems: 'center' }}>
        <span style={{ fontSize: '1.2em' }}>💧</span>
        <span className="mono font-semibold text-primary">{Math.round(weather.humidity)}%</span>
      </div>
    </div>
  );
};
