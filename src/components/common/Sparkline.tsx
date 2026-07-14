import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: any[];
  dataKey: string;
  color?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({ data, dataKey, color = '#3b82f6' }) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%', height: '40px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={2} 
            dot={false}
            isAnimationActive={false} // Prevents weird bouncing on rapid updates
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
