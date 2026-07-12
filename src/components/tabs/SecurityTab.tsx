import React from 'react';
import { useStadiumStore } from '../../store/stadiumStore';
import { IncidentCard } from '../dashboard/IncidentCard';

export const SecurityTab: React.FC = () => {
  const { gates, teams, incidents } = useStadiumStore();

  const securityTeams = Object.values(teams).filter(t => t.department === 'security');
  const securityIncidents = incidents.filter(i => i.type === 'security' && i.status !== 'resolved');

  return (
    <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Security Operations</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {securityTeams.filter(t => t.status === 'busy').length} / {securityTeams.length} Teams Deployed
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-md)' }}>
        
        {/* Teams List */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', border: '1px solid var(--border)' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 var(--space-md) 0', fontSize: '16px' }}>Active Units</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {securityTeams.map(team => (
              <div key={team.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-sm)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: team.status === 'idle' ? 'var(--ok)' : 'var(--warning)' }}></div>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Unit {team.id.toUpperCase()}</span>
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

        {/* Gate Scanner Status */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', border: '1px solid var(--border)' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 var(--space-md) 0', fontSize: '16px' }}>Perimeter Scanners</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
            {Object.values(gates).map(gate => (
              <div key={gate.id} style={{ padding: 'var(--space-sm)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: `1px solid var(--${gate.scannerStatus === 'operational' ? 'ok' : gate.scannerStatus === 'degraded' ? 'warning' : 'critical'}-border)` }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '13px' }}>Gate {gate.id}</div>
                <div style={{ color: `var(--${gate.scannerStatus === 'operational' ? 'ok' : gate.scannerStatus === 'degraded' ? 'warning' : 'critical'})`, fontSize: '11px', textTransform: 'uppercase', marginTop: '2px' }}>
                  {gate.scannerStatus}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Incidents */}
      <div>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 var(--space-md) 0', fontSize: '16px' }}>Active Security Incidents</h3>
        {securityIncidents.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: 'var(--space-md)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            No active security incidents.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {securityIncidents.map(incident => (
              <IncidentCard key={incident.id} incident={incident} onClick={() => {}} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
