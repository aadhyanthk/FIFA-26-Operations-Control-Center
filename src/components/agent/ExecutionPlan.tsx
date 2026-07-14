import React from 'react';
import type { ExecutionPlan as IExecutionPlan } from '../../store/agentStore';
import { PlanAction } from './PlanAction';
import { Agent } from '../../agent/Agent';

interface ExecutionPlanProps {
  plan: IExecutionPlan;
}

export const ExecutionPlan: React.FC<ExecutionPlanProps> = ({ plan }) => {
  const handleApprove = async () => {
    const agent = new Agent();
    await agent.execute(plan);
  };

  return (
    <div className="card flex-col gap-md" style={{ border: `1px solid var(--${plan.severity}-border)` }}>
      <div className="flex-row justify-between items-start">
        <div>
          <div className="font-semibold text-primary" style={{ fontSize: '14px' }}>
            {plan.title}
          </div>
          <div className="text-sm mt-xs" style={{ color: `var(--${plan.severity})` }}>
            Severity: {plan.severity.toUpperCase()}
          </div>
        </div>
        <div className="text-xs text-secondary uppercase p-sm" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
          {plan.status.replace('_', ' ')}
        </div>
      </div>

      <div className="text-base text-secondary">
        <strong>Reasoning:</strong> {plan.reasoning}
      </div>

      <div className="flex-col gap-sm">
        {plan.actions.map(action => (
          <PlanAction key={action.id} action={action} />
        ))}
      </div>

      {plan.status === 'pending_approval' && (
        <div className="flex-row gap-sm mt-sm">
          <button
            onClick={handleApprove}
            className="btn btn--primary flex-1"
            style={{ backgroundColor: 'var(--ok)' }}
          >
            Approve & Execute
          </button>
          <button className="btn btn--ghost flex-1 text-primary">
            Reject
          </button>
        </div>
      )}
    </div>
  );
};
