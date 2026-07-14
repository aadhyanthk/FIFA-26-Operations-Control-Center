import React from 'react';
import { useStadiumStore } from '../../store/stadiumStore';
import { IncidentCard } from './IncidentCard';

export const IncidentFeed: React.FC = () => {
  const incidents = useStadiumStore(state => state.incidents);

  return (
    <div className="card flex-col p-0 h-full" style={{ overflow: 'hidden' }}>
      <div className="font-semibold text-primary p-md" style={{ borderBottom: '1px solid var(--border)' }}>
        Incident Feed
      </div>
      
      <div className="flex-1 p-md flex-col gap-sm" style={{ overflowY: 'auto' }}>
        {incidents.length === 0 ? (
          <div className="text-muted text-center mt-xl">
            No active incidents
          </div>
        ) : (
          incidents.map(incident => (
            <div key={incident.id}>
              <IncidentCard incident={incident} onClick={(id) => console.log('clicked', id)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
