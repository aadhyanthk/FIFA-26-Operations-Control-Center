import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { AgentHistory } from '../agent/AgentHistory';

export const AIPanel: React.FC = () => {
  const { isAIPanelOpen, setAIPanelOpen } = useUIStore();

  if (!isAIPanelOpen) return null;

  return (
    <div style={{
      width: '350px',
      height: '100%',
      backgroundColor: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      animation: 'panelSlideIn 0.3s ease-out'
    }}>
      <div style={{
        padding: 'var(--space-md)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          AI Agent Activity
        </div>
        <button
          onClick={() => setAIPanelOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ×
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-md)' }}>
        <AgentHistory />
      </div>
    </div>
  );
};
