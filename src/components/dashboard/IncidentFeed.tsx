import React, { useState, useRef, useEffect } from 'react';
import { useStadiumStore } from '../../store/stadiumStore';
import { IncidentCard } from './IncidentCard';

export const IncidentFeed: React.FC = () => {
  const incidents = useStadiumStore(state => state.incidents);
  const [filter, setFilter] = useState<string>('All');
  const feedRef = useRef<HTMLDivElement>(null);
  const [resolvedExpanded, setResolvedExpanded] = useState(false);

  // Auto-scroll when new critical event occurs
  const prevCriticalCount = useRef(0);
  useEffect(() => {
    const currentCritical = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
    if (currentCritical > prevCriticalCount.current && feedRef.current) {
      feedRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    prevCriticalCount.current = currentCritical;
  }, [incidents]);

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');

  const filters = ['All', 'Critical', 'Medical', 'Security', 'Crowd', 'Maintenance'];
  
  const getFilteredActive = () => {
    let filtered = activeIncidents;
    if (filter === 'Critical') filtered = activeIncidents.filter(i => i.severity === 'critical');
    else if (filter !== 'All') filtered = activeIncidents.filter(i => i.type.toLowerCase() === filter.toLowerCase());

    return filtered.sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (a.severity !== 'critical' && b.severity === 'critical') return 1;
      return b.timestamp - a.timestamp;
    });
  };

  const filteredActive = getFilteredActive();

  return (
    <div className="card flex-col p-0 h-full" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header and Filters */}
      <div className="flex-col gap-sm p-md" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="font-semibold text-primary">Incident Feed</div>
        <div className="flex-row gap-xs" style={{ overflowX: 'auto', paddingBottom: '4px' }}>
          {filters.map(f => {
            const count = f === 'All' 
              ? activeIncidents.length 
              : f === 'Critical' 
                ? activeIncidents.filter(i => i.severity === 'critical').length
                : activeIncidents.filter(i => i.type.toLowerCase() === f.toLowerCase()).length;
            
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`btn btn--sm ${isActive ? 'btn--primary' : 'btn--ghost'}`}
                style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {f}
                {count > 0 && (
                  <span style={{ 
                    backgroundColor: isActive ? 'rgba(0,0,0,0.2)' : 'var(--border-active)', 
                    padding: '2px 6px', 
                    borderRadius: '10px', 
                    fontSize: '0.85em' 
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Scrollable Feed */}
      <div ref={feedRef} className="flex-1 p-md flex-col gap-sm" style={{ overflowY: 'auto' }} aria-live="polite">
        
        {/* Active Incidents */}
        {filteredActive.length === 0 && filter === 'All' ? (
          <div className="text-muted text-center mt-xl">All Clear - No active incidents</div>
        ) : filteredActive.length === 0 ? (
          <div className="text-muted text-center mt-xl">No active incidents matching filter</div>
        ) : (
          filteredActive.map(incident => (
            <IncidentCard key={incident.id} incident={incident} />
          ))
        )}

        {/* Resolved Section (Only show if 'All' filter or if we want to filter resolved too, let's keep it simple for now) */}
        {resolvedIncidents.length > 0 && filter === 'All' && (
          <div className="mt-md pt-sm" style={{ borderTop: '1px dashed var(--border)' }}>
            <button 
              onClick={() => setResolvedExpanded(!resolvedExpanded)}
              className="btn btn--ghost w-full justify-between items-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span>Resolved ({resolvedIncidents.length})</span>
              <span>{resolvedExpanded ? '▲' : '▼'}</span>
            </button>
            
            {resolvedExpanded && (
              <div className="flex-col gap-sm mt-sm">
                {resolvedIncidents.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20).map(incident => (
                  <IncidentCard key={incident.id} incident={incident} />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
