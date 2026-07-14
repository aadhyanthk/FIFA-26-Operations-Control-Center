import React from 'react';
import { CommandBar } from '../agent/CommandBar';

export const TopBar: React.FC = () => {
  return (
    <div className="topbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
      <div className="font-semibold text-primary text-lg">
        FIFA 26 <span className="text-secondary">OCC</span>
      </div>
      <CommandBar />

      <div className="flex-row items-center gap-md">
        <div className="flex-row items-center gap-xs text-sm text-secondary">
          <div className="status-dot status-dot--active"></div>
          Ollama
        </div>
        <div className="mono text-sm text-secondary">
          Speed: 2x
        </div>
      </div>
    </div>
  );
};
