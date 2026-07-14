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
      <div className="card flex-row gap-md items-center text-secondary">
        <div className="text-lg" style={{ filter: 'grayscale(100%)' }}>🤖</div>
        <div>
          <div className="font-semibold text-primary">AI Predictive Monitor</div>
          <div className="text-base">All systems nominal. No predictive risks detected.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card flex-row gap-md items-start text-primary" style={{ backgroundColor: 'var(--info-bg)', borderColor: 'var(--info)' }}>
      <div className="text-lg">🤖</div>
      <div>
        <div className="font-semibold mb-xs">AI Predictive Alert</div>
        <div className="text-base text-secondary">
          {alertMessage}
        </div>
        <div className="mt-sm">
          <button className="btn btn--sm btn--primary">
            Generate Plan
          </button>
        </div>
      </div>
    </div>
  );
};
