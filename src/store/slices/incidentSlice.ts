import type { StateCreator } from 'zustand';
import type { StadiumState } from '../stadiumStore';
import type { StadiumEvent } from '../../simulation/EventEngine';

export interface IncidentSlice {
  incidents: StadiumEvent[];
  addIncident: (event: StadiumEvent) => void;
  resolveIncident: (id: string) => void;
}

export const createIncidentSlice: StateCreator<StadiumState, [], [], IncidentSlice> = (set) => ({
  incidents: [],
  addIncident: (event) => set((state) => ({
    incidents: [event, ...state.incidents]
  })),
  resolveIncident: (id) => set((state) => ({
    incidents: state.incidents.map(i => i.id === id ? { ...i, status: 'resolved' } : i)
  }))
});
