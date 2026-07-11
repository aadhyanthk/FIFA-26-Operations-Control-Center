import React from 'react';
import { useUIStore } from '../../store/uiStore';

const tabs = ['Overview', 'Gates', 'Security', 'Medical', 'Maintenance', 'Agent'];

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore();

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
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <div 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </div>
        );
      })}
    </div>
  );
};
