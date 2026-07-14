import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  format?: 'number' | 'time' | 'percent';
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, format = 'number' }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 600; // ms
    const startValue = displayValue;
    const endValue = value;

    if (startValue === endValue) return;

    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setDisplayValue(startValue + (endValue - startValue) * easeProgress);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  let formatted = displayValue.toString();
  if (format === 'time') {
    const mins = Math.floor(displayValue);
    const secs = Math.floor((displayValue - mins) * 60);
    formatted = `${mins}:${secs.toString().padStart(2, '0')}`;
  } else if (format === 'percent') {
    formatted = `${Math.round(displayValue * 100)}%`;
  } else {
    formatted = Math.round(displayValue).toLocaleString();
  }

  return (
    <span className="mono font-bold text-primary" style={{ fontSize: '28px', display: 'inline-block' }}>
      {formatted}
    </span>
  );
};
