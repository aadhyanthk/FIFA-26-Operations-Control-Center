import React from 'react';
import { useAgentStore } from '../../store/agentStore';
import { ExecutionPlan } from './ExecutionPlan';

export const AgentHistory: React.FC = () => {
  const plans = useAgentStore(state => state.plans);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {plans.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 'var(--space-xl)' }}>
          No agent execution plans yet.
        </div>
      ) : (
        plans.map(plan => (
          <ExecutionPlan key={plan.id} plan={plan} />
        ))
      )}
    </div>
  );
};
