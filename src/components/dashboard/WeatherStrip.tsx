import React from 'react';
import { useStadiumStore } from '../../store/stadiumStore';

export const WeatherStrip: React.FC = () => {
  const weather = useStadiumStore(state => state.weather);

  return (
    <div className="card flex-row gap-lg" style={{ 
      padding: 'var(--space-sm) var(--space-md)', 
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: 'var(--bg-tertiary)'
    }}>
      <div className="flex-row gap-xs" style={{ alignItems: 'center' }}>
        <span style={{ fontSize: '1.2em' }}>🌡️</span>
        <span className="mono font-semibold">{Math.round(weather.temperature)}°C</span>
      </div>
      
      <div className="flex-row gap-xs" style={{ alignItems: 'center' }}>
        <span style={{ fontSize: '1.2em' }}>🌧️</span>
        <span className="mono font-semibold">{Math.round(weather.rainIntensity * 100)}%</span>
      </div>
      
      <div className="flex-row gap-xs" style={{ alignItems: 'center' }}>
        <span style={{ fontSize: '1.2em' }}>💨</span>
        <span className="mono font-semibold">{Math.round(weather.windSpeed)} km/h</span>
      </div>
      
      <div className="flex-row gap-xs" style={{ alignItems: 'center' }}>
        <span style={{ fontSize: '1.2em' }}>💧</span>
        <span className="mono font-semibold">{Math.round(weather.humidity)}%</span>
      </div>
    </div>
  );
};
