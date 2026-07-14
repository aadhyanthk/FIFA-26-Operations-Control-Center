import React from 'react';
import { useUIStore } from '../../store/uiStore';

const tabs = ['Overview', 'Gates', 'Security', 'Medical', 'Maintenance', 'Food', 'Agent'];

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <div className="tabbar" style={{ position: 'fixed', top: '48px', left: 0, right: 0, zIndex: 90 }}>
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <div 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`tab ${isActive ? 'tab--active' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            {tab}
          </div>
        );
      })}
    </div>
  );
};
