import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { WeatherStrip } from '../dashboard/WeatherStrip';

const tabs = ['Overview', 'Gates', 'Security', 'Medical', 'Maintenance', 'Food', 'Agent'];

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <div className="tabbar" style={{ position: 'fixed', top: '48px', left: 0, right: 0, zIndex: 90, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '16px' }}>
      <div style={{ display: 'flex' }}>
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
      <WeatherStrip />
    </div>
  );
};
