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


import { createCoreSlice } from './slices/coreSlice';
import type { CoreSlice } from './slices/coreSlice';
import { createWeatherSlice } from './slices/weatherSlice';
import type { WeatherSlice } from './slices/weatherSlice';
import { createIncidentSlice } from './slices/incidentSlice';
import type { IncidentSlice } from './slices/incidentSlice';
import { createOperationalSlice } from './slices/operationalSlice';
import type { OperationalSlice } from './slices/operationalSlice';
import { createMetricsSlice } from './slices/metricsSlice';
import type { MetricsSlice } from './slices/metricsSlice';

export type StadiumState = CoreSlice & WeatherSlice & IncidentSlice & OperationalSlice & MetricsSlice & {
  updateState: (partial: Partial<StadiumState>) => void;
};

export const useStadiumStore = create<StadiumState>((set, get, api) => ({
  ...createCoreSlice(set, get, api),
  ...createWeatherSlice(set, get, api),
  ...createIncidentSlice(set, get, api),
  ...createOperationalSlice(set, get, api),
  ...createMetricsSlice(set, get, api),
  
  updateState: (partial) => set((state) => ({ ...state, ...partial })),
}));
