import React from 'react';
import { AnimatedCounter } from '../common/AnimatedCounter';

interface MetricCardProps {
  title: string;
  value: number;
  format?: 'number' | 'time' | 'percent';
  trend?: number; // percentage change
  status?: 'ok' | 'warning' | 'critical';
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, value, format = 'number', trend, status = 'ok' 
}) => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      padding: 'var(--space-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-sm)'
    }}>
      <div style={{ 
        color: 'var(--text-secondary)', 
        fontSize: '12px',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.08em'
      }}>
        {title}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-md)' }}>
        <AnimatedCounter value={value} format={format} />
        
        {trend !== undefined && (
          <div style={{ 
            fontSize: '12px', 
            fontWeight: 600,
            color: trend > 0 ? 'var(--critical)' : 'var(--ok)' 
          }}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div style={{ 
        width: '100%', 
        height: '4px', 
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '2px',
        marginTop: 'var(--space-xs)',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '70%',
          height: '100%',
          backgroundColor: `var(--${status})`
        }} />
      </div>
    </div>
  );
};
