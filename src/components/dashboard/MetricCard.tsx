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
    <div className="card flex-col gap-sm">
      <div className="text-secondary text-xs font-medium uppercase tracking-wider">
        {title}
      </div>
      
      <div className="flex-row gap-md" style={{ alignItems: 'baseline' }}>
        <AnimatedCounter value={value} format={format} />
        
        {trend !== undefined && (
          <div className="text-sm font-semibold" style={{ color: trend > 0 ? 'var(--critical)' : 'var(--ok)' }}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="w-full mt-xs" style={{ 
        height: '4px', 
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div className="h-full" style={{
          width: '70%',
          backgroundColor: `var(--${status})`
        }} />
      </div>
    </div>
  );
};
