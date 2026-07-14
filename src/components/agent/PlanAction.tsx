import React from 'react';

interface PlanActionProps {
  action: {
    id: string;
    tool: string;
    params: Record<string, any>;
    status: 'pending' | 'executing' | 'done' | 'failed';
  };
}

export const PlanAction: React.FC<PlanActionProps> = ({ action }) => {
  return (
    <div className="flex-row items-center gap-sm p-sm" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: action.status === 'done' ? 'var(--ok)' :
                        action.status === 'failed' ? 'var(--critical)' :
                        action.status === 'executing' ? 'var(--warning)' : 'var(--text-muted)'
      }} />
      <div className="flex-1">
        <div className="text-base font-medium text-primary">
          {action.tool}
        </div>
        <div className="mono text-xs text-secondary">
          {JSON.stringify(action.params)}
        </div>
      </div>
      <div className="text-sm text-muted uppercase">
        {action.status}
      </div>
    </div>
  );
};
