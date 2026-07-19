import React, { useState } from 'react';
import { useStadiumStore } from '../../store/stadiumStore';
import { useUIStore } from '../../store/uiStore';
import { Agent } from '../../agent/Agent';
import type { StadiumEvent } from '../../simulation/EventEngine';

const AiIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="AI Monitor" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);

export const PredictiveAlerts: React.FC = () => {
  const { gates, transport, incidents } = useStadiumStore();
  const setAiPanelOpen = useUIStore(state => state.setAiPanelOpen);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dismissedAlert, setDismissedAlert] = useState<string | null>(null);

  let alertMessage = null;
  let triggeringEvent: StadiumEvent | null = null;

  // Simple heuristic for predictive alerts
  const highWaitGates = Object.values(gates).filter(g => g.averageWaitTime > 15);
  const criticalIncidents = incidents.filter(i => i.status !== 'resolved' && (i.severity === 'critical' || i.severity === 'high'));
  const unresolvedIncidents = incidents.filter(i => i.status !== 'resolved');
  
  if (criticalIncidents.length > 0) {
    const latest = criticalIncidents[0];
    triggeringEvent = latest;
    alertMessage = `Critical ${latest.type} event detected at ${latest.location}. Predicting cascading effects on nearby zones. Re-routing recommended.`;
  } else if (transport.trainDelays > 10) {
    alertMessage = `Significant transport delays (${transport.trainDelays} mins) detected. Expect irregular crowd surges when resolved.`;
  } else if (highWaitGates.length > 0) {
    alertMessage = `Based on current arrival rates, Gate ${highWaitGates[0].id} queue is predicted to exceed 20 minutes wait time shortly.`;
  } else if (unresolvedIncidents.length > 0) {
    const latest = unresolvedIncidents[0];
    triggeringEvent = latest;
    alertMessage = `Active ${latest.severity} ${latest.type} event at ${latest.location}. Anticipate localized friction and adjust resource allocation if needed.`;
  }

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setAiPanelOpen(true);
    const agent = new Agent();
    
    const eventsToPass = triggeringEvent ? [triggeringEvent] : [];
    
    await agent.react(eventsToPass);
    setIsGenerating(false);
  };

  if (!alertMessage || alertMessage === dismissedAlert) {
    return (
      <div className="card flex-row gap-md items-center text-secondary">
        <div className="text-muted"><AiIcon /></div>
        <div>
          <div className="font-semibold text-primary">AI Predictive Monitor</div>
          <div className="text-base">Predictive Monitor active. No emerging risks detected.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card card--info flex-row gap-md items-start text-primary">
      <div className="text-info mt-xs"><AiIcon /></div>
      <div className="flex-1">
        <div className="font-semibold mb-xs">AI Predictive Alert</div>
        <div className="text-base text-secondary">
          {alertMessage}
        </div>
        <div className="mt-sm flex-row items-center">
          <button 
            className="btn btn--sm btn--primary" 
            onClick={handleGeneratePlan}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Plan'}
          </button>
          <button 
            className="btn btn--sm btn--ghost" 
            style={{ marginLeft: 'var(--space-sm)' }}
            onClick={() => setDismissedAlert(alertMessage)}
            disabled={isGenerating}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
