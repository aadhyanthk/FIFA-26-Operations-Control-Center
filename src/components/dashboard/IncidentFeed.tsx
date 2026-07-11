import React from 'react';
import { useStadiumStore } from '../../store/stadiumStore';
import { IncidentCard } from './IncidentCard';

export const IncidentFeed: React.FC = () => {
  const incidents = useStadiumStore(state => state.incidents);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: 'var(--space-md)',
        borderBottom: '1px solid var(--border)',
        fontWeight: 600,
        color: 'var(--text-primary)'
      }}>
        Incident Feed
      </div>
      
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--space-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-sm)'
      }}>
        {incidents.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 'var(--space-xl)' }}>
            No active incidents
          </div>
        ) : (
          incidents.map(incident => (
            <div key={incident.id} style={{ animation: 'slideInRight 0.3s ease-out' }}>
              <IncidentCard incident={incident} onClick={(id) => console.log('clicked', id)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
