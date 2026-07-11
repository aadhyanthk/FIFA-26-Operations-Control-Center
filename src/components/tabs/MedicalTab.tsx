import React from 'react';
import { useStadiumStore } from '../../store/stadiumStore';
import { IncidentCard } from '../dashboard/IncidentCard';

export const MedicalTab: React.FC = () => {
  const { teams, incidents } = useStadiumStore();

  const medicalTeams = Object.values(teams).filter(t => t.department === 'medical');
  const medicalIncidents = incidents.filter(i => i.type === 'medical' && i.status !== 'resolved');

  return (
    <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Medical Operations</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {medicalTeams.filter(t => t.status === 'busy').length} / {medicalTeams.length} Teams Deployed
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-md)' }}>
        
        {/* Teams List */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', border: '1px solid var(--border)' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 var(--space-md) 0', fontSize: '16px' }}>First Response Units</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {medicalTeams.map(team => (
              <div key={team.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-sm)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: team.status === 'idle' ? 'var(--ok)' : 'var(--warning)' }}></div>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Unit {team.id.toUpperCase()}</span>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{team.location}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Medical Incidents */}
      <div>
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 var(--space-md) 0', fontSize: '16px' }}>Active Medical Incidents</h3>
        {medicalIncidents.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: 'var(--space-md)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            No active medical incidents.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {medicalIncidents.map(incident => (
              <IncidentCard key={incident.id} event={incident} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
