import React, { useState } from 'react';
import { useUIStore } from '../../store/uiStore';

export const CommandBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const { aiPanelOpen, setAiPanelOpen } = useUIStore();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      if (!aiPanelOpen) setAiPanelOpen(true);
      setQuery('');
    }
  };

  return (
    <div className="flex-row items-center p-sm" style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', width: '400px' }}>
      <span className="text-secondary" style={{ marginRight: '8px' }}>/</span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Query agent or enter command... (e.g. /summary)"
        aria-label="Command bar input"
        className="w-full text-primary mono text-base"
        style={{ background: 'none', border: 'none', outline: 'none' }}
      />
    </div>
  );
};
