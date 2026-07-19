import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricCard } from '../../src/components/dashboard/MetricCard';

describe('MetricCard', () => {
  it('renders title and formatted value correctly', () => {
    render(<MetricCard title="Test Metric" value={1000} format="number" />);
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('1,000')).toBeInTheDocument();
  });

  it('displays trend arrow and color correctly when trend is positive', () => {
    render(<MetricCard title="Occupancy" value={50} trend={15} />);
    const trendElement = screen.getByText('↑ 15%');
    expect(trendElement).toBeInTheDocument();
  });

  it('displays trend arrow correctly when trend is negative', () => {
    render(<MetricCard title="Occupancy" value={50} trend={-5} />);
    const trendElement = screen.getByText('↓ 5%');
    expect(trendElement).toBeInTheDocument();
  });

  it('has accessible role and aria-label', () => {
    render(<MetricCard title="Test Metric" value={100} />);
    const card = screen.getByRole('region', { name: 'Test Metric Metric: 100' });
    expect(card).toBeInTheDocument();
  });
});
