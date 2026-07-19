import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { IncidentCard } from '../../src/components/dashboard/IncidentCard';
import type { StadiumEvent } from '../../src/simulation/EventEngine';

describe('IncidentCard', () => {
  const mockEvent: StadiumEvent = {
    id: 'ev-1',
    timestamp: 0,
    type: 'security',
    severity: 'critical',
    title: 'Test Incident',
    description: 'Test description',
    location: 'Gate A',
    relatedEvents: [],
    status: 'new'
  };

  it('renders basic incident details', () => {
    render(<IncidentCard incident={mockEvent} />);
    expect(screen.getByText('Test Incident')).toBeInTheDocument();
    expect(screen.getByText('Gate A')).toBeInTheDocument();
  });

  it('expands to show description on click', () => {
    render(<IncidentCard incident={mockEvent} />);
    
    // Description shouldn't be visible initially
    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
    
    // Click the card (which has role="button")
    const cardButton = screen.getByRole('button', { name: 'Incident: Test Incident' });
    fireEvent.click(cardButton);
    
    // Description should now be visible
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('fires onClick callback with incident id', () => {
    const handleClick = vi.fn();
    render(<IncidentCard incident={mockEvent} onClick={handleClick} />);
    
    const cardButton = screen.getByRole('button', { name: 'Incident: Test Incident' });
    fireEvent.click(cardButton);
    
    expect(handleClick).toHaveBeenCalledWith('ev-1');
  });
});
