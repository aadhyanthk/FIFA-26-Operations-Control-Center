import React from 'react';
import type { StadiumEvent } from '../../simulation/EventEngine';

interface IncidentCardProps {
  incident: StadiumEvent;
  onClick: (id: string) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onClick }) => {
  const isCritical = incident.severity === 'critical';
  
  return (
    <div 
      onClick={() => onClick(incident.id)}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: `1px solid var(--${incident.severity}-border)`,
        padding: 'var(--space-md)',
        cursor: 'pointer',
        animation: isCritical ? 'criticalPulse 2s infinite' : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-sm)',
        transition: 'background-color 0.2s',
        opacity: incident.status === 'resolved' ? 0.6 : 1
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: `var(--${incident.severity})` 
          }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {incident.title}
          </span>
        </div>
        <span className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          T{incident.timestamp < 0 ? '-' : '+'}{Math.abs(Math.floor(incident.timestamp / 60))}m
        </span>
      </div>
      
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
        {incident.location} • {incident.type}
      </div>
    </div>
  );
};
