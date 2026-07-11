import React from 'react';

const tabs = ['Overview', 'Gates', 'Security', 'Medical', 'Maintenance', 'Agent'];

export const TabBar: React.FC = () => {
  return (
    <div style={{
      height: '40px',
      backgroundColor: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'flex-end',
      padding: '0 var(--space-md)',
      position: 'fixed',
      top: '48px',
      left: 0,
      right: 0,
      zIndex: 90,
      gap: 'var(--space-md)'
    }}>
      {tabs.map((tab, idx) => (
        <div key={tab} style={{
          padding: '8px 16px',
          color: idx === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
          borderBottom: idx === 0 ? '2px solid var(--accent)' : '2px solid transparent',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer'
        }}>
          {tab}
        </div>
      ))}
    </div>
  );
};
