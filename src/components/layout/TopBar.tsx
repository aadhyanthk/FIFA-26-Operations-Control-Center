import React from 'react';
import { CommandBar } from '../agent/CommandBar';

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
      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '16px' }}>
        FIFA 26 <span style={{ color: 'var(--text-secondary)' }}>OCC</span>
      </div>
      <CommandBar />

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
