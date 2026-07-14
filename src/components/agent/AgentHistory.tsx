import React from 'react';
import { useAgentStore } from '../../store/agentStore';
import { ExecutionPlan } from './ExecutionPlan';

export const AgentHistory: React.FC = () => {
  const plans = useAgentStore(state => state.plans);

  return (
    <div className="flex-col gap-md">
      {plans.length === 0 ? (
        <div className="text-muted text-center mt-xl">
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
