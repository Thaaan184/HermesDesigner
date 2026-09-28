import { create } from 'zustand';

interface UIState {
  showGrid: boolean;
  showRulers: boolean;
  showSnap: boolean;
  showAIPanel: boolean;
  layersPanelOpen: boolean;
  historyPanelOpen: boolean;
  propertiesPanelOpen: boolean;
  assetsPanelOpen: boolean;
  toggleGrid: () => void;
  toggleRulers: () => void;
  toggleSnap: () => void;
  toggleAIPanel: () => void;
  setPanelOpen: (panel: 'layers'|'history'|'properties'|'assets', open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  showGrid: false,
  showRulers: true,
  showSnap: true,
  showAIPanel: false,
  layersPanelOpen: true,
  historyPanelOpen: true,
  propertiesPanelOpen: true,
  assetsPanelOpen: true,
  toggleGrid: () => set(s => ({ showGrid: !s.showGrid })),
  toggleRulers: () => set(s => ({ showRulers: !s.showRulers })),
  toggleSnap: () => set(s => ({ showSnap: !s.showSnap })),
  toggleAIPanel: () => set(s => ({ showAIPanel: !s.showAIPanel })),
  setPanelOpen: (panel, open) => set({ [`${panel}PanelOpen`]: open }),
}));
