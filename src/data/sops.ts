export interface StandardOperatingProcedure {
  id: string;
  title: string;
  department: 'security' | 'medical' | 'cleaning' | 'maintenance' | 'operations';
  tags: string[];
  content: string;
}

export const sops: StandardOperatingProcedure[] = [
  {
    id: 'SOP-SEC-01',
    title: 'Severe Gate Overcrowding',
    department: 'security',
    tags: ['gate', 'crowd', 'security'],
    content: `
1. If queue average wait time exceeds 15 minutes, open all available lanes.
2. If wait time exceeds 25 minutes, dispatch 1 additional security team to the gate for crowd control.
3. Broadcast PA announcement to redirect fans to less congested gates.
4. If density at concourse exceeds 0.85, temporarily pause entry at the gate.
    `
  },
  {
    id: 'SOP-MED-01',
    title: 'Medical Emergency Dispatch',
    department: 'medical',
    tags: ['medical', 'emergency'],
    content: `
1. Upon report of a medical incident, instantly dispatch the nearest idle medical team.
2. If the incident is 'critical' (e.g. cardiac), dispatch a second team as backup.
3. Reserve emergency route if evacuation is required.
    `
  },
  {
    id: 'SOP-MAINT-01',
    title: 'Scanner Failure at Gate',
    department: 'maintenance',
    tags: ['gate', 'scanner', 'maintenance'],
    content: `
1. If scanner status becomes 'degraded', log a maintenance ticket (Priority: Medium).
2. If scanner status becomes 'failed', log a maintenance ticket (Priority: High) and manually verify tickets using backup handheld devices.
3. Reduce effective gate capacity in planning by 50%.
    `
  },
  {
    id: 'SOP-OPS-01',
    title: 'Severe Weather (Lightning/Heavy Rain)',
    department: 'operations',
    tags: ['weather', 'rain', 'lightning'],
    content: `
1. If rain intensity > 0.8 or lightning detected within 8 miles, trigger Shelter in Place.
2. Update all digital signage to direct fans to covered concourses.
3. Halt food service in exposed areas.
    `
  }
];
