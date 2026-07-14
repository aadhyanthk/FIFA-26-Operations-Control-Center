import React from 'react';
import { useStadiumStore } from '../../store/stadiumStore';
import { IncidentCard } from '../dashboard/IncidentCard';

export const MaintenanceTab: React.FC = () => {
  const { teams, incidents } = useStadiumStore();

  const maintenanceTeams = Object.values(teams).filter(t => t.department === 'maintenance' || t.department === 'cleaning');
  const maintenanceIncidents = incidents.filter(i => (i.type === 'maintenance' || i.type === 'cleaning') && i.status !== 'resolved');

  return (
    <div className="p-md flex-col gap-xl">
      <div className="flex-row justify-between items-center">
        <div>
          <h2 className="text-primary m-0">Maintenance & Cleaning Operations</h2>
          <div className="text-secondary text-base mt-xs">
            {maintenanceTeams.filter(t => t.status === 'busy').length} / {maintenanceTeams.length} Crews Deployed
          </div>
        </div>
      </div>

      <div className="grid-auto gap-md">
        
        {/* Teams List */}
        <div className="card">
          <h3 className="text-primary text-lg m-0 mb-md">Service Crews</h3>
          <div className="flex-col gap-sm">
            {maintenanceTeams.map(team => (
              <div key={team.id} className="flex-row justify-between items-center p-sm" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <div className="flex-row items-center gap-sm">
                  <div className={`status-dot ${team.status === 'idle' ? 'status-dot--active' : 'status-dot--warning'}`}></div>
                  <span className="text-primary font-medium" style={{ textTransform: 'capitalize' }}>{team.department} Unit {team.id.toUpperCase()}</span>
                </div>
                <div className="flex-row items-center gap-sm">
                  <span className="text-secondary text-sm">{team.location}</span>
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
                    className="btn btn--sm"
                    style={{ color: 'var(--accent)', border: '1px solid var(--accent)' }}
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
        <h3 className="text-primary text-lg m-0 mb-md">Active Service Tickets</h3>
        {maintenanceIncidents.length === 0 ? (
          <div className="text-muted text-base p-md text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            No active maintenance or cleaning tickets.
          </div>
        ) : (
          <div className="flex-col gap-sm">
            {maintenanceIncidents.map(incident => (
              <IncidentCard key={incident.id} incident={incident} onClick={() => {}} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
