import React from 'react';

export const PredictiveAlerts: React.FC = () => {
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
          Based on current transport delays and arrival rates, Gate C queue is predicted to exceed 20 minutes wait time in approximately 12 minutes.
        </div>
        <div style={{ marginTop: 'var(--space-sm)' }}>
          <button style={{
            backgroundColor: 'var(--accent)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: 500
          }}>
            Generate Plan
          </button>
        </div>
      </div>
    </div>
  );
};
