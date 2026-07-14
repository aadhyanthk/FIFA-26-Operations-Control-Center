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

function createWedge(innerRx: number, innerRy: number, outerRx: number, outerRy: number, startAngle: number, endAngle: number): Coordinates[] {
  const path: Coordinates[] = [];
  const segments = 12;
  // Outer curve
  for (let i = 0; i <= segments; i++) {
    const t = startAngle + (endAngle - startAngle) * (i / segments);
    const rad = (t * Math.PI) / 180;
    path.push({ x: 0.5 + outerRx * Math.cos(rad), y: 0.5 + outerRy * Math.sin(rad) });
  }
  // Inner curve
  for (let i = segments; i >= 0; i--) {
    const t = startAngle + (endAngle - startAngle) * (i / segments);
    const rad = (t * Math.PI) / 180;
    path.push({ x: 0.5 + innerRx * Math.cos(rad), y: 0.5 + innerRy * Math.sin(rad) });
  }
  return path;
}

export const stadiumLayout = {
  gates: [
    { id: 'A', name: 'Gate A (North)', location: { x: 0.5, y: 0.05 }, type: 'general' },
    { id: 'B', name: 'Gate B (Northeast)', location: { x: 0.85, y: 0.15 }, type: 'vip' },
    { id: 'C', name: 'Gate C (East)', location: { x: 0.95, y: 0.5 }, type: 'general' },
    { id: 'D', name: 'Gate D (South)', location: { x: 0.5, y: 0.95 }, type: 'general' },
    { id: 'E', name: 'Gate E (Southwest)', location: { x: 0.15, y: 0.85 }, type: 'staff' },
    { id: 'F', name: 'Gate F (West)', location: { x: 0.05, y: 0.5 }, type: 'general' },
  ] as GateData[],

  zones: [
    // 100-Level (Lower Bowl - 6 sections) - innerRx 0.12, innerRy 0.22 | outerRx 0.18, outerRy 0.28
    { id: '101-104', name: 'Section 101-104 (North)', maxCapacity: 4000, center: { x: 0.5, y: 0.25 }, path: createWedge(0.12, 0.22, 0.18, 0.28, -135, -45) },
    { id: '110-114', name: 'Section 110-114 (East)', maxCapacity: 4000, center: { x: 0.65, y: 0.5 }, path: createWedge(0.12, 0.22, 0.18, 0.28, -45, 45) },
    { id: '121-124', name: 'Section 121-124 (South)', maxCapacity: 4000, center: { x: 0.5, y: 0.75 }, path: createWedge(0.12, 0.22, 0.18, 0.28, 45, 135) },
    { id: '131-135', name: 'Section 131-135 (West)', maxCapacity: 4000, center: { x: 0.35, y: 0.5 }, path: createWedge(0.12, 0.22, 0.18, 0.28, 135, 225) },
    { id: '140-142', name: 'Section 140-142 (NW Corner)', maxCapacity: 2000, center: { x: 0.38, y: 0.32 }, path: createWedge(0.18, 0.28, 0.24, 0.34, 180, 270) }, // Corners sit between rings
    { id: '148-150', name: 'Section 148-150 (SE Corner)', maxCapacity: 2000, center: { x: 0.62, y: 0.68 }, path: createWedge(0.18, 0.28, 0.24, 0.34, 0, 90) },
    
    // 200-Level (Club - 2 sections) - innerRx 0.18, innerRy 0.28 | outerRx 0.24, outerRy 0.34
    { id: 'club-east', name: 'East Club', maxCapacity: 5000, center: { x: 0.71, y: 0.5 }, path: createWedge(0.18, 0.28, 0.24, 0.34, -90, 0) },
    { id: 'club-west', name: 'West Club', maxCapacity: 5000, center: { x: 0.29, y: 0.5 }, path: createWedge(0.18, 0.28, 0.24, 0.34, 90, 180) },

    // 300-Level (Upper Bowl - 4 sections) - innerRx 0.24, innerRy 0.34 | outerRx 0.32, outerRy 0.42
    { id: '301-310', name: 'Upper North', maxCapacity: 7500, center: { x: 0.5, y: 0.11 }, path: createWedge(0.24, 0.34, 0.32, 0.42, -135, -45) },
    { id: '311-320', name: 'Upper East', maxCapacity: 7500, center: { x: 0.78, y: 0.5 }, path: createWedge(0.24, 0.34, 0.32, 0.42, -45, 45) },
    { id: '321-330', name: 'Upper South', maxCapacity: 7500, center: { x: 0.5, y: 0.89 }, path: createWedge(0.24, 0.34, 0.32, 0.42, 45, 135) },
    { id: '331-340', name: 'Upper West', maxCapacity: 7500, center: { x: 0.22, y: 0.5 }, path: createWedge(0.24, 0.34, 0.32, 0.42, 135, 225) },

    // Concourses - innerRx 0.32, innerRy 0.42 | outerRx 0.42, outerRy 0.52 (Outermost Ring)
    { id: 'concourse-n', name: 'North Concourse', maxCapacity: 8000, center: { x: 0.5, y: 0.03 }, path: createWedge(0.32, 0.42, 0.42, 0.50, -135, -45) },
    { id: 'concourse-e', name: 'East Concourse', maxCapacity: 8000, center: { x: 0.88, y: 0.5 }, path: createWedge(0.32, 0.42, 0.42, 0.50, -45, 45) },
    { id: 'concourse-s', name: 'South Concourse', maxCapacity: 8000, center: { x: 0.5, y: 0.97 }, path: createWedge(0.32, 0.42, 0.42, 0.50, 45, 135) },
    { id: 'concourse-w', name: 'West Concourse', maxCapacity: 8000, center: { x: 0.12, y: 0.5 }, path: createWedge(0.32, 0.42, 0.42, 0.50, 135, 225) },
  ] as ZoneData[]
};
