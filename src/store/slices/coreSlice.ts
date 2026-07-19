import type { StateCreator } from 'zustand';
import type { StadiumState } from '../stadiumStore';

/**
 * Core simulation slice. Handles the global simulation clock, 
 * execution speed multipliers, and pause/play states.
 */
export interface CoreSlice {
  simTime: number;
  tickCount: number;
  speed: 1 | 2 | 5 | 10;
  isPaused: boolean;
  announcementBanner: string | null;
  activeMatchPhase: string;
  setSpeed: (speed: 1 | 2 | 5 | 10) => void;
  togglePause: () => void;
  tick: (deltaTime: number) => void;
  setAnnouncementBanner: (message: string | null) => void;
}

export const createCoreSlice: StateCreator<StadiumState, [], [], CoreSlice> = (set) => ({
  simTime: -7200,
  tickCount: 0,
  speed: 1,
  isPaused: true,
  announcementBanner: null,
  activeMatchPhase: 'Pre-Game',
  setSpeed: (speed) => set({ speed }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  tick: (deltaTime) => set((state) => ({
    simTime: state.simTime + deltaTime,
    tickCount: state.tickCount + 1
  })),
  setAnnouncementBanner: (message) => set({ announcementBanner: message })
});
