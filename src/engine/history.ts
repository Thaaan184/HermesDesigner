import { CanvasDocument } from '../types/canvas';

const MAX_HISTORY = 50;

export interface HistoryState {
  past: CanvasDocument[];
  present: CanvasDocument;
  future: CanvasDocument[];
}

export function createHistory(initial: CanvasDocument): HistoryState {
  return { past: [], present: initial, future: [] };
}

export function pushHistory(state: HistoryState, next: CanvasDocument): HistoryState {
  const past = [...state.past, state.present].slice(-MAX_HISTORY);
  return { past, present: next, future: [] };
}

export function undoHistory(state: HistoryState): HistoryState {
  if (state.past.length === 0) return state;
  const past = [...state.past];
  const present = past.pop()!;
  return { past, present, future: [state.present, ...state.future] };
}

export function redoHistory(state: HistoryState): HistoryState {
  if (state.future.length === 0) return state;
  const [present, ...future] = state.future;
  return { past: [...state.past, state.present], present, future };
}

export function canUndo(state: HistoryState): boolean { return state.past.length > 0; }
export function canRedo(state: HistoryState): boolean { return state.future.length > 0; }
