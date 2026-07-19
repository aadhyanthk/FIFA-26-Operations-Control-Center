import { create } from 'zustand';
import type { StadiumEvent } from '../simulation/EventEngine';
import { stadiumLayout } from '../data/stadiumLayout';

// Basic state structures
export interface WeatherState {
  temperature: number; // Celsius
  rainIntensity: number; // 0 to 1
  windSpeed: number; // km/h
  humidity: number; // 30 to 95%
  targetTemperature: number;
  targetRainIntensity: number;
}

export interface TransportState {
  trainDelays: number; // minutes
  busDelays: number; // minutes
  incomingPassengers: number;
  dispersingCrowds: { amount: number; timeRemaining: number }[];
  newlyEntered?: number;
  departedPassengers?: number;
}

export interface GateState {
  id: string;
  isOpen: boolean;
  capacityPerHour: number;
  currentThroughput: number;
  queueLength: number;
  activeLanes: number;
  averageWaitTime: number; // minutes
  scannerStatus: 'operational' | 'degraded' | 'offline';
  scannerHealth: number; // 0-100
  mode: 'inflow' | 'outflow';
  inboundTransits?: { amount: number, timeRemaining: number }[];
}

export interface ZoneState {
  id: string;
  name: string;
  currentOccupancy: number;
  maxCapacity: number;
  density: number; // 0 to 1
  litterLevel: number; // 0 to 1
  restroomStatus: 'clean' | 'needs_attention' | 'critical';
  restroomUsage: number;
}

export interface FoodCourtState {
  id: string;
  name: string;
  location: string;
  headcount: number;
  drinkStock: number; // 0 to 100
  foodStock: number; // 0 to 100
  revenue: number;
  inboundTransits?: { amount: number, timeRemaining: number }[];
  equipmentStatus: 'operational' | 'failed';
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
  simTime: number; // seconds since start (0 = kickoff)
  tickCount: number;
  speed: 1 | 2 | 5 | 10;
  isPaused: boolean;
  announcementBanner: string | null;
  activeMatchPhase: string;

  // Subsystem states
  weather: WeatherState;
  transport: TransportState;
  gates: Record<string, GateState>;
  zones: Record<string, ZoneState>;
  teams: Record<string, TeamState>;
  foodCourts: Record<string, FoodCourtState>;

  // Events
  incidents: StadiumEvent[];

  // Historical Metrics (for dashboard trends)
  historicalMetrics: {
    occupancyTrend: number;
    queueTrend: number;
    lastOccupancy: number;
    lastQueue: number;
    lastTrendUpdate: number;
    lastTimelineUpdate: number;
    timeline: {
      time: number;
      occupancy: number;
      queue: number;
      incidents: number;
      teamsAvailable: number;
      gatesQueue: Record<string, number>;
    }[];
  };

  // Actions
  setSpeed: (speed: 1 | 2 | 5 | 10) => void;
  togglePause: () => void;
  tick: (deltaTime: number) => void;

  // Data actions
  updateState: (partial: Partial<StadiumState>) => void;
  addIncident: (event: StadiumEvent) => void;
  resolveIncident: (id: string) => void;
  setAnnouncementBanner: (message: string | null) => void;
}

export const useStadiumStore = create<StadiumState>((set) => ({
  simTime: -7200, // Start 2 hours before kickoff (-7200 seconds)
  tickCount: 0,
  speed: 1,
  isPaused: true,
  announcementBanner: null,
  activeMatchPhase: 'Pre-Game',

  weather: {
    temperature: 24,
    rainIntensity: 0,
    windSpeed: 10,
    humidity: 60,
    targetTemperature: 24,
    targetRainIntensity: 0
  },

  transport: {
    trainDelays: 0,
    busDelays: 0,
    incomingPassengers: 0,
    dispersingCrowds: []
  },

  gates: {
    'A': { id: 'A', isOpen: true, capacityPerHour: 12000, currentThroughput: 0, queueLength: 1500, activeLanes: 8, averageWaitTime: 0, scannerStatus: 'operational', scannerHealth: 100, mode: 'inflow' },
    'B': { id: 'B', isOpen: true, capacityPerHour: 6000, currentThroughput: 0, queueLength: 800, activeLanes: 4, averageWaitTime: 0, scannerStatus: 'operational', scannerHealth: 100, mode: 'inflow' },
    'C': { id: 'C', isOpen: true, capacityPerHour: 10000, currentThroughput: 0, queueLength: 2200, activeLanes: 6, averageWaitTime: 0, scannerStatus: 'operational', scannerHealth: 100, mode: 'inflow' },
    'D': { id: 'D', isOpen: true, capacityPerHour: 12000, currentThroughput: 0, queueLength: 400, activeLanes: 8, averageWaitTime: 0, scannerStatus: 'operational', scannerHealth: 100, mode: 'inflow' },
    'E': { id: 'E', isOpen: true, capacityPerHour: 3000, currentThroughput: 0, queueLength: 300, activeLanes: 2, averageWaitTime: 0, scannerStatus: 'operational', scannerHealth: 100, mode: 'inflow' },
    'F': { id: 'F', isOpen: true, capacityPerHour: 10000, currentThroughput: 0, queueLength: 600, activeLanes: 6, averageWaitTime: 0, scannerStatus: 'operational', scannerHealth: 100, mode: 'inflow' },
  },

  zones: stadiumLayout.zones.reduce((acc, z) => {
    acc[z.id] = {
      id: z.id,
      name: z.name,
      currentOccupancy: 0,
      maxCapacity: z.maxCapacity,
      density: 0,
      litterLevel: 0,
      restroomStatus: 'clean',
      restroomUsage: 0
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
    'cln-2': { id: 'cln-2', department: 'cleaning', location: 'North Concourse', status: 'idle' },
    'cln-3': { id: 'cln-3', department: 'cleaning', location: 'East Concourse', status: 'idle' },
    'cln-4': { id: 'cln-4', department: 'cleaning', location: 'West Concourse', status: 'idle' },
  },

  foodCourts: {
    'fc-1': { id: 'fc-1', name: 'North Concourse Food', location: 'North Concourse', headcount: 0, drinkStock: 100, foodStock: 100, revenue: 0, equipmentStatus: 'operational' },
    'fc-2': { id: 'fc-2', name: 'South Concourse Food', location: 'South Concourse', headcount: 0, drinkStock: 100, foodStock: 100, revenue: 0, equipmentStatus: 'operational' },
    'fc-3': { id: 'fc-3', name: 'East Concourse Food', location: 'East Concourse', headcount: 0, drinkStock: 100, foodStock: 100, revenue: 0, equipmentStatus: 'operational' },
    'fc-4': { id: 'fc-4', name: 'West Concourse Food', location: 'West Concourse', headcount: 0, drinkStock: 100, foodStock: 100, revenue: 0, equipmentStatus: 'operational' },
    'fc-5': { id: 'fc-5', name: 'East Club Grill', location: 'East Club', headcount: 0, drinkStock: 100, foodStock: 100, revenue: 0, equipmentStatus: 'operational' },
    'fc-6': { id: 'fc-6', name: 'West Club Grill', location: 'West Club', headcount: 0, drinkStock: 100, foodStock: 100, revenue: 0, equipmentStatus: 'operational' },
    'fc-7': { id: 'fc-7', name: 'Lower Bowl Snacks', location: 'Section 101-104', headcount: 0, drinkStock: 100, foodStock: 100, revenue: 0, equipmentStatus: 'operational' },
    'fc-8': { id: 'fc-8', name: 'Upper Bowl Snacks', location: 'Section 301-304', headcount: 0, drinkStock: 100, foodStock: 100, revenue: 0, equipmentStatus: 'operational' },
  },

  incidents: [],

  historicalMetrics: {
    occupancyTrend: 0,
    queueTrend: 0,
    lastOccupancy: 0,
    lastQueue: 0,
    lastTrendUpdate: -7200,
    lastTimelineUpdate: -7200,
    timeline: []
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
  })),
  
  setAnnouncementBanner: (message) => set({ announcementBanner: message })
}));
