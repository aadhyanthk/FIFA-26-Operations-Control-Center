import React, { useState } from 'react';
import { useUIStore } from '../../store/uiStore';

export const CommandBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const { aiPanelOpen, setAiPanelOpen } = useUIStore();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      if (!aiPanelOpen) setAiPanelOpen(true);
      // In a real app, this would dispatch the query to the agent
      console.log('Dispatching query to Agent:', query);
      setQuery('');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'var(--bg-tertiary)',
      borderRadius: 'var(--radius-md)',
      padding: '4px 12px',
      border: '1px solid var(--border)',
      width: '400px'
    }}>
      <span style={{ color: 'var(--text-secondary)', marginRight: '8px' }}>/</span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Query agent or enter command... (e.g. /summary)"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-primary)',
          fontSize: '13px',
          width: '100%',
          outline: 'none',
          fontFamily: 'JetBrains Mono, monospace'
        }}
      />
    </div>
  );
};
