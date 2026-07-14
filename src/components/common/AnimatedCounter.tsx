import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  format?: 'number' | 'time' | 'percent';
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, format = 'number' }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    // Simple transition for now, can be improved with digit flip animation
    setDisplayValue(value);
  }, [value]);

  let formatted = displayValue.toString();
  if (format === 'time') {
    const mins = Math.floor(displayValue);
    const secs = Math.floor((displayValue - mins) * 60);
    formatted = `${mins}:${secs.toString().padStart(2, '0')}`;
  } else if (format === 'percent') {
    formatted = `${Math.round(displayValue * 100)}%`;
  } else {
    formatted = displayValue.toLocaleString();
  }

  return (
    <span className="mono font-bold text-primary" style={{ fontSize: '28px', display: 'inline-block' }}>
      {formatted}
    </span>
  );
};
