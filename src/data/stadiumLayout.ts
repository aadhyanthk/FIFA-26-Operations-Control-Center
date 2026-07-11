export interface Coordinates {
  x: number; // 0 to 1 (relative to map width)
  y: number; // 0 to 1 (relative to map height)
}

export interface ZoneData {
  id: string;
  name: string;
  maxCapacity: number;
  center: Coordinates;
  path: Coordinates[]; // For drawing the polygon on the map
}

export interface GateData {
  id: string;
  name: string;
  location: Coordinates;
  type: 'general' | 'vip' | 'staff';
}

export const stadiumLayout = {
  gates: [
    { id: 'A', name: 'Gate A (North)', location: { x: 0.5, y: 0.1 }, type: 'general' },
    { id: 'B', name: 'Gate B (Northeast)', location: { x: 0.85, y: 0.25 }, type: 'vip' },
    { id: 'C', name: 'Gate C (East)', location: { x: 0.9, y: 0.5 }, type: 'general' },
    { id: 'D', name: 'Gate D (South)', location: { x: 0.5, y: 0.9 }, type: 'general' },
    { id: 'E', name: 'Gate E (Southwest)', location: { x: 0.15, y: 0.75 }, type: 'staff' },
    { id: 'F', name: 'Gate F (West)', location: { x: 0.1, y: 0.5 }, type: 'general' },
  ] as GateData[],

  zones: [
    // 100-Level (Lower Bowl - 6 sections)
    { id: '101-104', name: 'Section 101-104 (North)', maxCapacity: 4000, center: { x: 0.5, y: 0.25 }, path: [] },
    { id: '110-114', name: 'Section 110-114 (East)', maxCapacity: 4000, center: { x: 0.75, y: 0.5 }, path: [] },
    { id: '121-124', name: 'Section 121-124 (South)', maxCapacity: 4000, center: { x: 0.5, y: 0.75 }, path: [] },
    { id: '131-135', name: 'Section 131-135 (West)', maxCapacity: 4000, center: { x: 0.25, y: 0.5 }, path: [] },
    { id: '140-142', name: 'Section 140-142 (NW Corner)', maxCapacity: 2000, center: { x: 0.35, y: 0.35 }, path: [] },
    { id: '148-150', name: 'Section 148-150 (SE Corner)', maxCapacity: 2000, center: { x: 0.65, y: 0.65 }, path: [] },
    
    // 200-Level (Club - 2 sections)
    { id: 'club-east', name: 'East Club', maxCapacity: 5000, center: { x: 0.8, y: 0.5 }, path: [] },
    { id: 'club-west', name: 'West Club', maxCapacity: 5000, center: { x: 0.2, y: 0.5 }, path: [] },

    // 300-Level (Upper Bowl - 4 sections)
    { id: '301-310', name: 'Upper North', maxCapacity: 7500, center: { x: 0.5, y: 0.15 }, path: [] },
    { id: '311-320', name: 'Upper East', maxCapacity: 7500, center: { x: 0.85, y: 0.5 }, path: [] },
    { id: '321-330', name: 'Upper South', maxCapacity: 7500, center: { x: 0.5, y: 0.85 }, path: [] },
    { id: '331-340', name: 'Upper West', maxCapacity: 7500, center: { x: 0.15, y: 0.5 }, path: [] },

    // Concourses
    { id: 'concourse-n', name: 'North Concourse', maxCapacity: 8000, center: { x: 0.5, y: 0.05 }, path: [] },
    { id: 'concourse-e', name: 'East Concourse', maxCapacity: 8000, center: { x: 0.95, y: 0.5 }, path: [] },
    { id: 'concourse-s', name: 'South Concourse', maxCapacity: 8000, center: { x: 0.5, y: 0.95 }, path: [] },
    { id: 'concourse-w', name: 'West Concourse', maxCapacity: 8000, center: { x: 0.05, y: 0.5 }, path: [] },
  ] as ZoneData[]
};
