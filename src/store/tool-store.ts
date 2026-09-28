import { create } from 'zustand';
import { ToolType } from '../types/canvas';

interface ToolState {
  activeTool: ToolType;
  setTool: (t: ToolType) => void;
  temporaryTool: ToolType | null;
  setTemporaryTool: (t: ToolType | null) => void;
}

export const useToolStore = create<ToolState>((set) => ({
  activeTool: 'move',
  setTool: (t) => set({ activeTool: t }),
  temporaryTool: null,
  setTemporaryTool: (t) => set({ temporaryTool: t }),
}));
