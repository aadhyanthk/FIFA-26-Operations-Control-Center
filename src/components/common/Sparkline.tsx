import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: any[];
  dataKey: string;
  color?: string;
  width?: string | number;
  height?: string | number;
}

export const Sparkline: React.FC<SparklineProps> = ({ 
  data, dataKey, color = '#3b82f6', width = '100%', height = '40px' 
}) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width, height }}>
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
