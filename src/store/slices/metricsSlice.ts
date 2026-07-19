import type { StateCreator } from 'zustand';
import type { StadiumState } from '../stadiumStore';

export interface MetricsSlice {
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
}

export const createMetricsSlice: StateCreator<StadiumState, [], [], MetricsSlice> = (set) => ({
  historicalMetrics: {
    occupancyTrend: 0,
    queueTrend: 0,
    lastOccupancy: 0,
    lastQueue: 0,
    lastTrendUpdate: -7200,
    lastTimelineUpdate: -7200,
    timeline: []
  }
});
