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
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-sm)',
      padding: '8px',
      backgroundColor: 'var(--bg-tertiary)',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)'
    }}>
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: action.status === 'done' ? 'var(--ok)' :
                        action.status === 'failed' ? 'var(--critical)' :
                        action.status === 'executing' ? 'var(--warning)' : 'var(--text-muted)'
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
          {action.tool}
        </div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          {JSON.stringify(action.params)}
        </div>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        {action.status}
      </div>
    </div>
  );
};
