import React from 'react';
import { useStadiumStore } from '../../store/stadiumStore';
import { IncidentCard } from '../dashboard/IncidentCard';

export const SecurityTab: React.FC = () => {
  const { gates, teams, incidents } = useStadiumStore();

  const securityTeams = Object.values(teams).filter(t => t.department === 'security');
  const securityIncidents = incidents.filter(i => i.type === 'security' && i.status !== 'resolved');

  return (
    <div className="p-md flex-col gap-xl">
      <div className="flex-row justify-between items-center">
        <div>
          <h2 className="text-primary m-0">Security Operations</h2>
          <div className="text-secondary text-base mt-xs">
            {securityTeams.filter(t => t.status === 'busy').length} / {securityTeams.length} Teams Deployed
          </div>
        </div>
      </div>

      <div className="grid-auto gap-md">
        
        {/* Teams List */}
        <div className="card">
          <h3 className="text-primary text-lg m-0 mb-md">Active Units</h3>
          <div className="flex-col gap-sm">
            {securityTeams.map(team => (
              <div key={team.id} className="flex-row justify-between items-center p-sm" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <div className="flex-row items-center gap-sm">
                  <div className={`status-dot ${team.status === 'idle' ? 'status-dot--active' : 'status-dot--warning'}`}></div>
                  <span className="text-primary font-medium">Unit {team.id.toUpperCase()}</span>
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

        {/* Gate Scanner Status */}
        <div className="card">
          <h3 className="text-primary text-lg m-0 mb-md">Perimeter Scanners</h3>
          <div className="grid-2 gap-sm">
            {Object.values(gates).map(gate => (
              <div key={gate.id} className="p-sm" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: `1px solid var(--${gate.scannerStatus === 'operational' ? 'ok' : gate.scannerStatus === 'degraded' ? 'warning' : 'critical'}-border)` }}>
                <div className="text-primary font-medium text-base">Gate {gate.id}</div>
                <div className="text-xs uppercase mt-xs" style={{ color: `var(--${gate.scannerStatus === 'operational' ? 'ok' : gate.scannerStatus === 'degraded' ? 'warning' : 'critical'})` }}>
                  {gate.scannerStatus}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Incidents */}
      <div>
        <h3 className="text-primary text-lg m-0 mb-md">Active Security Incidents</h3>
        {securityIncidents.length === 0 ? (
          <div className="text-muted text-base p-md text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            No active security incidents.
          </div>
        ) : (
          <div className="flex-col gap-sm">
            {securityIncidents.map(incident => (
              <IncidentCard key={incident.id} incident={incident} onClick={() => {}} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
