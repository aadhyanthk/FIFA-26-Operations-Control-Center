import React from 'react';
import type { StadiumEvent } from '../../simulation/EventEngine';
import { useStadiumStore } from '../../store/stadiumStore';

interface IncidentCardProps {
  incident: StadiumEvent;
  onClick: (id: string) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onClick }) => {
  const isCritical = incident.severity === 'critical' && incident.status !== 'resolved';
  
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
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {incident.location} • {incident.type}
        </div>
        
        {incident.status !== 'resolved' && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              useStadiumStore.getState().resolveIncident(incident.id);
            }}
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Resolve
          </button>
        )}
      </div>
    </div>
  );
};
