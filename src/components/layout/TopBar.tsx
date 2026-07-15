import React, { useEffect, useState } from 'react';
import { CommandBar } from '../agent/CommandBar';

export const TopBar: React.FC = () => {
  const [ollamaStatus, setOllamaStatus] = useState<'idle' | 'active' | 'error'>('idle');

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const res = await fetch('http://127.0.0.1:11434/api/version');
        if (isMounted) {
          if (res.ok) {
            setOllamaStatus('active');
          } else {
            setOllamaStatus('error');
          }
        }
      } catch (err) {
        if (isMounted) {
          setOllamaStatus('error');
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  let dotClass = 'status-dot--idle';
  let statusText = 'Ollama Checking...';
  if (ollamaStatus === 'active') {
    dotClass = 'status-dot--active bg-green-500'; // Or whatever your active class sets for color
    statusText = 'Ollama Connected';
  } else if (ollamaStatus === 'error') {
    dotClass = 'status-dot--error bg-red-500'; // Make sure this CSS class exists or inline style
    statusText = 'Ollama Offline';
  }

  return (
    <div className="topbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
      <div className="font-semibold text-primary text-lg">
        FIFA 26 <span className="text-secondary">OCC</span>
      </div>
      <CommandBar />

      <div className="flex-row items-center gap-md">
        <div className="flex-row items-center gap-xs text-sm text-secondary">
          <div 
            className={`status-dot ${dotClass}`} 
            style={ollamaStatus === 'error' ? { backgroundColor: 'var(--critical)' } : ollamaStatus === 'active' ? { backgroundColor: 'var(--ok)' } : {}}
          ></div>
          {statusText}
        </div>
        <div className="mono text-sm text-secondary">
          Speed: 2x
        </div>
      </div>
    </div>
  );
};
