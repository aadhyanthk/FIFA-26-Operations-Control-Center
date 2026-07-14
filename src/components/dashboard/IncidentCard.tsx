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
      className={`card flex-col gap-sm ${isCritical ? 'card--critical' : ''}`}
      style={{
        border: `1px solid var(--${incident.severity}-border)`,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        opacity: incident.status === 'resolved' ? 0.6 : 1
      }}
    >
      <div className="flex-row justify-between items-center">
        <div className="flex-row items-center gap-sm">
          <div className="status-dot" style={{ backgroundColor: `var(--${incident.severity})` }} />
          <span className="text-sm font-semibold text-primary">
            {incident.title}
          </span>
        </div>
        <span className="mono text-xs text-secondary">
          T{incident.timestamp < 0 ? '-' : '+'}{Math.abs(Math.floor(incident.timestamp / 60))}m
        </span>
      </div>
      
      <div className="flex-row justify-between items-center">
        <div className="text-base text-secondary">
          {incident.location} • {incident.type}
        </div>
        
        {incident.status !== 'resolved' && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              useStadiumStore.getState().resolveIncident(incident.id);
            }}
            className="btn btn--sm btn--ghost"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            Resolve
          </button>
        )}
      </div>
    </div>
  );
};
