import { create } from 'zustand';
import type { StadiumEvent } from '../simulation/EventEngine';
import { stadiumLayout } from '../data/stadiumLayout';

// Basic state structures
export interface WeatherState {
  temperature: number; // Celsius
  rainIntensity: number; // 0 to 1
  windSpeed: number; // km/h
}

export interface TransportState {
  trainDelays: number; // minutes
  busDelays: number; // minutes
  incomingPassengers: number;
  dispersingCrowds: { amount: number; timeRemaining: number }[];
}

export interface GateState {
  id: string;
  isOpen: boolean;
  capacityPerHour: number;
  queueLength: number;
  activeLanes: number;
  averageWaitTime: number; // minutes
  scannerStatus: 'operational' | 'degraded' | 'failed';
  scannerHealth: number; // 0-100
}

export interface ZoneState {
  id: string;
  name: string;
  currentOccupancy: number;
  maxCapacity: number;
  density: number; // 0 to 1
}

export interface TeamState {
  id: string;
  department: 'security' | 'medical' | 'cleaning' | 'maintenance';
  location: string;
  status: 'idle' | 'busy';
  currentAssignment?: string;
  targetLocation?: string;
  arrivalTick?: number;
  resolveTick?: number;
}

export interface StadiumState {
  // Simulation control
  simTime: number;
  tickCount: number;
  speed: 1 | 2 | 5 | 10;
  isPaused: boolean;
  
  // Subsystem states
  weather: WeatherState;
  transport: TransportState;
  gates: Record<string, GateState>;
  zones: Record<string, ZoneState>;
  teams: Record<string, TeamState>;
  
  // Events
  incidents: StadiumEvent[];
  
  // Historical Metrics (for dashboard trends)
  historicalMetrics: {
    occupancyTrend: number;
    queueTrend: number;
    lastOccupancy: number;
    lastQueue: number;
    lastTrendUpdate: number;
  };
  
  // Actions
  setSpeed: (speed: 1 | 2 | 5 | 10) => void;
  togglePause: () => void;
  tick: (deltaTime: number) => void;
  
  // Data actions
  updateState: (partial: Partial<StadiumState>) => void;
  addIncident: (event: StadiumEvent) => void;
  resolveIncident: (id: string) => void;
}

export const useStadiumStore = create<StadiumState>((set) => ({
  simTime: -7200, // Start 2 hours before kickoff (-7200 seconds)
  tickCount: 0,
  speed: 1,
  isPaused: true,
  
  weather: {
    temperature: 24,
    rainIntensity: 0,
    windSpeed: 10
  },
  
  transport: {
    trainDelays: 0,
    busDelays: 0,
    incomingPassengers: 0,
    dispersingCrowds: []
  },
  
  gates: {
    'A': { id: 'A', isOpen: true, capacityPerHour: 8000, queueLength: 0, activeLanes: 4, averageWaitTime: 0, scannerStatus: 'operational', scannerHealth: 100 },
    'B': { id: 'B', isOpen: true, capacityPerHour: 6000, queueLength: 0, activeLanes: 4, averageWaitTime: 0, scannerStatus: 'operational', scannerHealth: 100 },
    'C': { id: 'C', isOpen: true, capacityPerHour: 10000, queueLength: 0, activeLanes: 4, averageWaitTime: 0, scannerStatus: 'operational', scannerHealth: 100 },
    'D': { id: 'D', isOpen: true, capacityPerHour: 8000, queueLength: 0, activeLanes: 4, averageWaitTime: 0, scannerStatus: 'operational', scannerHealth: 100 },
    'E': { id: 'E', isOpen: true, capacityPerHour: 6000, queueLength: 0, activeLanes: 4, averageWaitTime: 0, scannerStatus: 'operational', scannerHealth: 100 },
    'F': { id: 'F', isOpen: true, capacityPerHour: 10000, queueLength: 0, activeLanes: 4, averageWaitTime: 0, scannerStatus: 'operational', scannerHealth: 100 },
  },
  
  zones: stadiumLayout.zones.reduce((acc, z) => {
    acc[z.id] = {
      id: z.id,
      name: z.name,
      currentOccupancy: 0,
      maxCapacity: z.maxCapacity,
      density: 0
    };
    return acc;
  }, {} as Record<string, ZoneState>),
  
  teams: {
    'sec-1': { id: 'sec-1', department: 'security', location: 'Gate A', status: 'idle' },
    'sec-2': { id: 'sec-2', department: 'security', location: 'Section 101-104', status: 'idle' },
    'sec-3': { id: 'sec-3', department: 'security', location: 'Gate C', status: 'idle' },
    'sec-4': { id: 'sec-4', department: 'security', location: 'East Concourse', status: 'idle' },
    'sec-5': { id: 'sec-5', department: 'security', location: 'Gate F', status: 'idle' },
    'sec-6': { id: 'sec-6', department: 'security', location: 'West Concourse', status: 'idle' },
    'med-1': { id: 'med-1', department: 'medical', location: 'East Concourse', status: 'idle' },
    'med-2': { id: 'med-2', department: 'medical', location: 'West Concourse', status: 'idle' },
    'med-3': { id: 'med-3', department: 'medical', location: 'North Concourse', status: 'idle' },
    'med-4': { id: 'med-4', department: 'medical', location: 'South Concourse', status: 'idle' },
    'mnt-1': { id: 'mnt-1', department: 'maintenance', location: 'Gate C', status: 'idle' },
    'cln-1': { id: 'cln-1', department: 'cleaning', location: 'South Concourse', status: 'idle' },
  },
  
  incidents: [],
  
  historicalMetrics: {
    occupancyTrend: 0,
    queueTrend: 0,
    lastOccupancy: 0,
    lastQueue: 0,
    lastTrendUpdate: -7200
  },
  
  setSpeed: (speed) => set({ speed }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  tick: (deltaTime) => set((state) => ({ 
    simTime: state.simTime + deltaTime, 
    tickCount: state.tickCount + 1 
  })),
  
  updateState: (partial) => set((state) => ({ ...state, ...partial })),
  
  addIncident: (event) => set((state) => ({
    incidents: [event, ...state.incidents]
  })),
  
  resolveIncident: (id) => set((state) => ({
    incidents: state.incidents.map(i => i.id === id ? { ...i, status: 'resolved' } : i)
  }))
}));
