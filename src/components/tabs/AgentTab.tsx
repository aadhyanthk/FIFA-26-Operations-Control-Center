import React from 'react';
import { AgentHistory } from '../agent/AgentHistory';
import { useAgentStore } from '../../store/agentStore';

export const AgentTab: React.FC = () => {
  const plans = useAgentStore(state => state.plans);

  return (
    <div style={{ padding: 'var(--space-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Agent Hub</h2>
        <div style={{
          display: 'flex',
          gap: 'var(--space-md)'
        }}>
          <button style={{
            backgroundColor: 'var(--accent)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontWeight: 500
          }}>
            Generate Handover Report
          </button>
          <button style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontWeight: 500
          }}>
            Query SOPs
          </button>
        </div>
      </div>
      
      <div style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
          Total historical plans: {plans.length}
        </div>
        <AgentHistory />
      </div>
    </div>
  );
};
