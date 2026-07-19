import React from 'react';
// @ts-ignore
import FocusTrap from 'focus-trap-react';
import { useUIStore } from '../../store/uiStore';
import { AgentHistory } from '../agent/AgentHistory';

export const AIPanel: React.FC = () => {
  const { aiPanelOpen, setAiPanelOpen } = useUIStore();

  if (!aiPanelOpen) return null;

  return (
    <FocusTrap active={aiPanelOpen}>
      <div className="panel" style={{ width: '350px', height: '100%', animation: 'panelSlideIn 0.3s ease-out' }}>
        <div className="panel-header">
          <div className="font-semibold text-primary">
            AI Agent Activity
          </div>
          <button
            className="text-secondary text-lg"
            onClick={() => setAiPanelOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="panel-body">
          <AgentHistory />
        </div>
      </div>
    </FocusTrap>
  );
};
