import React from 'react';

type Severity = 'low' | 'medium' | 'high' | 'critical' | 'ok';

interface SeverityBadgeProps {
  severity: Severity;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  // Map our severity terms to CSS variable roots
  // low/medium/high -> warning/info based on your styling needs, but let's map:
  // critical -> critical
  // high -> warning
  // medium -> warning
  // low -> info
  // ok -> ok
  let colorClass = 'info';
  let label = severity.toUpperCase();
  let isPulsing = false;

  if (severity === 'critical') {
    colorClass = 'critical';
    isPulsing = true;
  } else if (severity === 'high' || severity === 'medium') {
    colorClass = 'warning';
  } else if (severity === 'ok') {
    colorClass = 'ok';
  }

  const baseStyle: React.CSSProperties = {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.05em',
    backgroundColor: `var(--${colorClass}-bg)`,
    color: `var(--${colorClass})`,
    border: `1px solid var(--${colorClass}-border)`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: isPulsing ? `var(--shadow-${colorClass})` : 'none',
    animation: isPulsing ? 'criticalPulse 2s infinite' : 'none'
  };

  return (
    <div style={baseStyle}>
      {label}
    </div>
  );
};
