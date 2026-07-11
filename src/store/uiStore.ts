import { create } from 'zustand';

interface UIState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  aiPanelOpen: boolean;
  setAiPanelOpen: (isOpen: boolean) => void;
  
  commandBarQuery: string;
  setCommandBarQuery: (query: string) => void;
  commandBarFocused: boolean;
  setCommandBarFocused: (focused: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'Overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  aiPanelOpen: false,
  setAiPanelOpen: (isOpen) => set({ aiPanelOpen: isOpen }),
  
  commandBarQuery: '',
  setCommandBarQuery: (query) => set({ commandBarQuery: query }),
  commandBarFocused: false,
  setCommandBarFocused: (focused) => set({ commandBarFocused: focused })
}));
