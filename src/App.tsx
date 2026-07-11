import { useState } from 'react';
import { TopBar } from './components/layout/TopBar';
import { TabBar } from './components/layout/TabBar';
import { StatusBar } from './components/layout/StatusBar';

function App() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      <TopBar />
      <TabBar />
      
      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginTop: '88px', // TopBar(48) + TabBar(40)
        marginBottom: '32px', // StatusBar(32)
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden'
      }}>
        {/* Tab Content Placeholder */}
        <div style={{
          flex: 1,
          padding: 'var(--space-md)',
          overflowY: 'auto'
        }}>
          <div style={{ color: 'var(--text-secondary)' }}>
            Overview content will go here...
          </div>
        </div>

        {/* AI Panel Placeholder */}
        <div style={{
          width: '350px',
          borderLeft: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'none' // Hidden for now
        }}>
        </div>
      </div>

      <StatusBar />
    </div>
  );
}

export default App;
