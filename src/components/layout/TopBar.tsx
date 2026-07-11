import React from 'react';

export const TopBar: React.FC = () => {
  return (
    <div style={{
      height: '48px',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-md)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>FIFA 26 OCC</div>
      </div>
      
      <div style={{ 
        width: '400px', 
        height: '28px', 
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-sm)',
        color: 'var(--text-muted)'
      }}>
        <span className="mono" style={{ fontSize: '12px' }}>⌘ Ask anything or type /command...</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--ok)' }}></div>
          Ollama
        </div>
        <div className="mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Speed: 2x
        </div>
      </div>
    </div>
  );
};
