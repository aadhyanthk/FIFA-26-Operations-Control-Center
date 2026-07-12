import React from 'react';
import { useStadiumStore } from '../../store/stadiumStore';
import { IncidentCard } from '../dashboard/IncidentCard';

export const MaintenanceTab: React.FC = () => {
  const { teams, incidents } = useStadiumStore();

  const maintenanceTeams = Object.values(teams).filter(t => t.department === 'maintenance' || t.department === 'cleaning');
  const maintenanceIncidents = incidents.filter(i => (i.type === 'maintenance' || i.type === 'cleaning') && i.status !== 'resolved');

  return (
    <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Maintenance & Cleaning Operations</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {maintenanceTeams.filter(t => t.status === 'busy').length} / {maintenanceTeams.length} Crews Deployed
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-md)' }}>
        
        {/* Teams List */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', border: '1px solid var(--border)' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 var(--space-md) 0', fontSize: '16px' }}>Service Crews</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {maintenanceTeams.map(team => (
              <div key={team.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-sm)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: team.status === 'idle' ? 'var(--ok)' : 'var(--warning)' }}></div>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500, textTransform: 'capitalize' }}>{team.department} Unit {team.id.split('-')[1]}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{team.location}</span>
                  <button
                    onClick={() => {
                      const newStatus = team.status === 'idle' ? 'busy' : 'idle';
                      useStadiumStore.getState().updateState({
                        teams: {
                          ...useStadiumStore.getState().teams,
                          [team.id]: { ...team, status: newStatus }
                        }
                      });
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--accent)',
                      border: '1px solid var(--accent)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    {team.status === 'idle' ? 'Deploy' : 'Recall'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Incidents */}
      <div>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 var(--space-md) 0', fontSize: '16px' }}>Active Service Tickets</h3>
        {maintenanceIncidents.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: 'var(--space-md)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            No active maintenance or cleaning tickets.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {maintenanceIncidents.map(incident => (
              <IncidentCard key={incident.id} incident={incident} onClick={() => {}} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
