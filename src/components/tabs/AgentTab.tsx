import React from 'react';
import { AgentHistory } from '../agent/AgentHistory';
import { useAgentStore } from '../../store/agentStore';

export const AgentTab: React.FC = () => {
  const plans = useAgentStore(state => state.plans);

  return (
    <div className="p-md">
      <div className="flex-row justify-between items-center mb-md">
        <h2 className="text-primary m-0">Agent Hub</h2>
        <div className="flex-row gap-md">
          <button className="btn btn--primary" style={{ padding: '8px 16px' }}>
            Generate Handover Report
          </button>
          <button className="btn btn--ghost" style={{ padding: '8px 16px' }}>
            Query SOPs
          </button>
        </div>
      </div>
      
      <div style={{ maxWidth: '800px' }}>
        <div className="text-secondary mb-md">
          Total historical plans: {plans.length}
        </div>
        <AgentHistory />
      </div>
    </div>
  );
};
