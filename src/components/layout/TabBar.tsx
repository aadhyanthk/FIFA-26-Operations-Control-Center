import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { WeatherStrip } from '../dashboard/WeatherStrip';

const tabs = ['Overview', 'Gates', 'Security', 'Medical', 'Maintenance', 'Food', 'Agent'];

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <div className="tabbar" style={{ position: 'fixed', top: '48px', left: 0, right: 0, zIndex: 90, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '16px' }}>
      <div role="tablist" style={{ display: 'flex' }}>
        {tabs.map((tab, index) => {
          const isActive = tab === activeTab;
          
          const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              const nextIndex = (index + 1) % tabs.length;
              setActiveTab(tabs[nextIndex]);
              document.getElementById(`tab-${tabs[nextIndex]}`)?.focus();
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              const prevIndex = (index - 1 + tabs.length) % tabs.length;
              setActiveTab(tabs[prevIndex]);
              document.getElementById(`tab-${tabs[prevIndex]}`)?.focus();
            }
          };

          return (
            <button 
              key={tab} 
              id={`tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              onKeyDown={handleKeyDown}
              className={`tab ${isActive ? 'tab--active' : ''}`}
              style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', font: 'inherit' }}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
            >
              {tab}
            </button>
          );
        })}
      </div>
      <WeatherStrip />
    </div>
  );
};
