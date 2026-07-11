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
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: `1px solid var(--${plan.severity}-border)`,
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-md)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {plan.title}
          </div>
          <div style={{ fontSize: '12px', color: `var(--${plan.severity})`, marginTop: '4px' }}>
            Severity: {plan.severity.toUpperCase()}
          </div>
        </div>
        <div style={{
          padding: '4px 8px',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase'
        }}>
          {plan.status.replace('_', ' ')}
        </div>
      </div>

      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
        <strong>Reasoning:</strong> {plan.reasoning}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {plan.actions.map(action => (
          <PlanAction key={action.id} action={action} />
        ))}
      </div>

      {plan.status === 'pending_approval' && (
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
          <button
            onClick={handleApprove}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: 'var(--ok)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Approve & Execute
          </button>
          <button style={{
            flex: 1,
            padding: '8px',
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontWeight: 500
          }}>
            Reject
          </button>
        </div>
      )}
    </div>
  );
};
