import React from 'react';
import { useStadiumStore } from '../../store/stadiumStore';

export const PredictiveAlerts: React.FC = () => {
  const { gates, transport, incidents } = useStadiumStore();

  let alertMessage = null;

  // Simple heuristic for predictive alerts
  const highWaitGates = Object.values(gates).filter(g => g.averageWaitTime > 15);
  const criticalIncidents = incidents.filter(i => i.status !== 'resolved' && (i.severity === 'critical' || i.severity === 'high'));
  const unresolvedIncidents = incidents.filter(i => i.status !== 'resolved');
  
  if (criticalIncidents.length > 0) {
    const latest = criticalIncidents[0];
    alertMessage = `Critical ${latest.type} event detected at ${latest.location}. Predicting cascading effects on nearby zones. Re-routing recommended.`;
  } else if (transport.trainDelays > 10) {
    alertMessage = `Significant transport delays (${transport.trainDelays} mins) detected. Expect irregular crowd surges when resolved.`;
  } else if (highWaitGates.length > 0) {
    alertMessage = `Based on current arrival rates, Gate ${highWaitGates[0].id} queue is predicted to exceed 20 minutes wait time shortly.`;
  } else if (unresolvedIncidents.length > 0) {
    const latest = unresolvedIncidents[0];
    alertMessage = `Active ${latest.severity} ${latest.type} event at ${latest.location}. Anticipate localized friction and adjust resource allocation if needed.`;
  }

  if (!alertMessage) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-md)',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)'
      }}>
        <div style={{ fontSize: '18px', filter: 'grayscale(100%)' }}>🤖</div>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>AI Predictive Monitor</div>
          <div style={{ fontSize: '13px' }}>All systems nominal. No predictive risks detected.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--info-bg)',
      border: '1px solid var(--info)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-md)',
      color: 'var(--text-primary)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-md)'
    }}>
      <div style={{ fontSize: '18px' }}>🤖</div>
      <div>
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>AI Predictive Alert</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {alertMessage}
        </div>
        <div style={{ marginTop: 'var(--space-sm)' }}>
          <button style={{
            backgroundColor: 'var(--accent)',
            color: 'white',
            border: 'none',
            padding: '4px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer'
          }}>
            Generate Plan
          </button>
        </div>
      </div>
    </div>
  );
};
