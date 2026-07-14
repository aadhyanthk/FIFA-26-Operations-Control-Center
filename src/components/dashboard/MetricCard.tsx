import React from 'react';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { Sparkline } from '../common/Sparkline';

interface MetricCardProps {
  title: string;
  value: number;
  format?: 'number' | 'time' | 'percent';
  trend?: number; // percentage change
  status?: 'ok' | 'warning' | 'critical';
  progress?: number; // 0 to 100
  history?: any[];
  dataKey?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, value, format = 'number', trend, status = 'ok', progress, history, dataKey
}) => {
  const statusColor = `var(--${status})`;

  return (
    <div className="card flex-col gap-sm" style={{ borderColor: status !== 'ok' ? statusColor : undefined }}>
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

      {history && dataKey && (
        <div className="mt-xs">
          <Sparkline data={history} dataKey={dataKey} color={statusColor} />
        </div>
      )}

      {progress !== undefined && (
        <div className="w-full mt-xs" style={{ 
          height: '4px', 
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div className="h-full transition-all duration-300" style={{
            width: `${Math.min(100, Math.max(0, progress))}%`,
            backgroundColor: statusColor
          }} />
        </div>
      )}
    </div>
  );
};
