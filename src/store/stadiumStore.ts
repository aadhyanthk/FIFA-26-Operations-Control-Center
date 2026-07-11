import { create } from 'zustand';
import { StadiumEvent } from '../simulation/EventEngine';

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
}

export interface GateState {
  id: string;
  isOpen: boolean;
  capacityPerHour: number;
  queueLength: number;
  activeLanes: number;
  averageWaitTime: number; // minutes
  scannerStatus: 'operational' | 'degraded' | 'failed';
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
    incomingPassengers: 0
  },
  
  gates: {
    'A': { id: 'A', isOpen: true, capacityPerHour: 1000, queueLength: 0, activeLanes: 3, averageWaitTime: 0, scannerStatus: 'operational' },
    'B': { id: 'B', isOpen: true, capacityPerHour: 800, queueLength: 0, activeLanes: 2, averageWaitTime: 0, scannerStatus: 'operational' },
    'C': { id: 'C', isOpen: true, capacityPerHour: 1200, queueLength: 0, activeLanes: 4, averageWaitTime: 0, scannerStatus: 'operational' },
    'D': { id: 'D', isOpen: true, capacityPerHour: 1000, queueLength: 0, activeLanes: 3, averageWaitTime: 0, scannerStatus: 'operational' },
    'E': { id: 'E', isOpen: true, capacityPerHour: 800, queueLength: 0, activeLanes: 2, averageWaitTime: 0, scannerStatus: 'operational' },
    'F': { id: 'F', isOpen: true, capacityPerHour: 1200, queueLength: 0, activeLanes: 4, averageWaitTime: 0, scannerStatus: 'operational' },
  },
  
  zones: {},
  teams: {},
  incidents: [],
  
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
