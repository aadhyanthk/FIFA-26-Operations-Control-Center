import React, { useState } from 'react';
import type { StadiumEvent } from '../../simulation/EventEngine';
import { useStadiumStore } from '../../store/stadiumStore';
import { SeverityBadge } from '../common/SeverityBadge';

interface IncidentCardProps {
  incident: StadiumEvent;
  onClick?: (id: string) => void;
}

const typeIcons: Record<string, string> = {
  medical: '⚕️',
  security: '🛡️',
  crowd: '👥',
  maintenance: '🔧',
  cleaning: '🧹',
  weather: '⛈️',
  transport: '🚆',
  food: '🍔',
  default: '⚠️'
};

export const IncidentCard: React.FC<IncidentCardProps> = React.memo(({ incident, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCritical = incident.severity === 'critical' && incident.status !== 'resolved';
  const isResolved = incident.status === 'resolved';
  const icon = typeIcons[incident.type] || typeIcons.default;
  
  return (
    <div 
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label={`Incident: ${incident.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsExpanded(!isExpanded);
          if (onClick) onClick(incident.id);
        }
      }}
      onClick={() => {
        setIsExpanded(!isExpanded);
        if (onClick) onClick(incident.id);
      }}
      className={`card flex-col gap-sm ${isCritical ? 'card--critical' : ''}`}
      style={{
        border: `1px solid var(--${isResolved ? 'border' : incident.severity === 'critical' ? 'critical-border' : 'border'})`,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        opacity: isResolved ? 0.6 : 1
      }}
    >
      <div className="flex-row justify-between items-center">
        <div className="flex-row items-center gap-sm">
          <SeverityBadge severity={isResolved ? 'ok' : incident.severity} />
          <span style={{ fontSize: '1.2em' }}>{icon}</span>
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
          {incident.location} {incident.assignedTeam ? `• Assigned: ${incident.assignedTeam}` : ''}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-sm pt-sm flex-col gap-md" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="text-sm text-primary">
            {incident.description}
          </div>
          
          {!isResolved && (
            <div className="flex-row justify-end gap-sm mt-sm">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="btn btn--sm btn--ghost"
              >
                Acknowledge
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  useStadiumStore.getState().resolveIncident(incident.id);
                }}
                className="btn btn--sm btn--primary"
                style={{ backgroundColor: 'var(--ok)', color: '#000' }}
              >
                Resolve
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
