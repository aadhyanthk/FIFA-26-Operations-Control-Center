import React from 'react';

export const StatusBar: React.FC = () => {
  return (
    <div style={{
      height: '32px',
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-md)',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
          Sim: 14:32 (T-28min)
        </div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          Tick: 847
        </div>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          Events: 23
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <button style={{ 
          color: 'var(--text-primary)', 
          fontSize: '12px', 
          backgroundColor: 'var(--bg-tertiary)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)'
        }}>
          ▶ 2x
        </button>
        <button style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '12px', 
          backgroundColor: 'transparent',
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid transparent'
        }}>
          ⏸
        </button>
        <button style={{ 
          color: 'var(--accent)', 
          fontSize: '12px', 
          backgroundColor: 'transparent',
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--accent)',
          marginLeft: 'var(--space-md)'
        }}>
          + Event
        </button>
      </div>
    </div>
  );
};
