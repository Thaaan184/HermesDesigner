import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import { CanvasDocument, Layer, Page, Viewport } from '../types/canvas';
import { createNewDocument, addLayer, updateLayer, deleteLayer, reorderLayers, getActivePage } from '../engine/document';
import { createHistory, pushHistory, undoHistory, redoHistory, canUndo, canRedo, HistoryState } from '../engine/history';
import { db } from './db';

interface DocumentState {
  history: HistoryState | null;
  selectedIds: string[];
  viewport: Viewport;
  clipboard: Layer[];
  isLoading: boolean;
  // Actions
  newDocument: (width: number, height: number, dpi: number, title?: string) => void;
  loadDocument: (doc: CanvasDocument) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  selectLayer: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  addLayer: (layer: Omit<Layer, 'id'>) => void;
  updateLayer: (id: string, patch: Partial<Layer>) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  copySelected: () => void;
  paste: () => void;
  reorderLayers: (layers: Layer[]) => void;
  setViewport: (v: Partial<Viewport>) => void;
  getDocument: () => CanvasDocument | null;
  getActivePage: () => Page | undefined;
  saveToDb: () => Promise<void>;
  addPage: () => void;
  setActivePage: (id: string) => void;
  deletePage: (id: string) => void;
  renamePage: (id: string, name: string) => void;
}

export const useDocumentStore = create<DocumentState>()(
  immer((set, get) => ({
    history: null,
    selectedIds: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    clipboard: [],
    isLoading: false,

    newDocument: (width, height, dpi, title) => {
      const doc = createNewDocument(width, height, dpi, title);
      set(s => { s.history = createHistory(doc); s.selectedIds = []; });
    },

    loadDocument: (doc) => {
      set(s => { s.history = createHistory(doc); s.selectedIds = []; });
    },

    undo: () => set(s => {
      if (s.history && canUndo(s.history)) s.history = undoHistory(s.history);
    }),

    redo: () => set(s => {
      if (s.history && canRedo(s.history)) s.history = redoHistory(s.history);
    }),

    canUndo: () => { const h = get().history; return !!h && canUndo(h); },
    canRedo: () => { const h = get().history; return !!h && canRedo(h); },

    selectLayer: (id, multi) => set(s => {
      if (multi) {
        const idx = s.selectedIds.indexOf(id);
        if (idx >= 0) s.selectedIds.splice(idx, 1);
        else s.selectedIds.push(id);
      } else {
        s.selectedIds = [id];
      }
    }),

    clearSelection: () => set(s => { s.selectedIds = []; }),

    addLayer: (layer) => {
      const { history } = get();
      if (!history) return;
      const newLayer = { ...layer, id: uuidv4() } as Layer;
      const next = addLayer(history.present, history.present.activePage, newLayer);
      set(s => {
        s.history = pushHistory(history, next);
        s.selectedIds = [newLayer.id];
      });
    },

    updateLayer: (id, patch) => {
      const { history } = get();
      if (!history) return;
      const next = updateLayer(history.present, history.present.activePage, id, patch);
      set(s => { s.history = pushHistory(history, next); });
    },

    deleteSelected: () => {
      const { history, selectedIds } = get();
      if (!history) return;
      let doc = history.present;
      for (const id of selectedIds) {
        doc = deleteLayer(doc, doc.activePage, id);
      }
      set(s => { s.history = pushHistory(history, doc); s.selectedIds = []; });
    },

    duplicateSelected: () => {
      const { history, selectedIds } = get();
      if (!history) return;
      const page = getActivePage(history.present);
      if (!page) return;
      let doc = history.present;
      const newIds: string[] = [];
      for (const id of selectedIds) {
        const layer = page.layers.find(l => l.id === id);
        if (!layer) continue;
        const newLayer = { ...layer, id: uuidv4(), x: layer.x + 10, y: layer.y + 10, name: layer.name + ' copy' };
        doc = addLayer(doc, doc.activePage, newLayer as Layer);
        newIds.push(newLayer.id);
      }
      set(s => { s.history = pushHistory(history, doc); s.selectedIds = newIds; });
    },

    copySelected: () => {
      const { history, selectedIds } = get();
      if (!history) return;
      const page = getActivePage(history.present);
      if (!page) return;
      const layers = page.layers.filter(l => selectedIds.includes(l.id));
      set(s => { s.clipboard = layers; });
    },

    paste: () => {
      const { history, clipboard } = get();
      if (!history || clipboard.length === 0) return;
      let doc = history.present;
      const newIds: string[] = [];
      for (const layer of clipboard) {
        const newLayer = { ...layer, id: uuidv4(), x: layer.x + 10, y: layer.y + 10, name: layer.name + ' copy' };
        doc = addLayer(doc, doc.activePage, newLayer as Layer);
        newIds.push(newLayer.id);
      }
      set(s => { s.history = pushHistory(history, doc); s.selectedIds = newIds; });
    },

    reorderLayers: (layers) => {
      const { history } = get();
      if (!history) return;
      const next = reorderLayers(history.present, history.present.activePage, layers);
      set(s => { s.history = pushHistory(history, next); });
    },

    setViewport: (v) => set(s => { Object.assign(s.viewport, v); }),

    getDocument: () => get().history?.present ?? null,

    getActivePage: () => {
      const doc = get().history?.present;
      return doc ? getActivePage(doc) : undefined;
    },

    saveToDb: async () => {
      const doc = get().history?.present;
      if (!doc) return;
      await db.projects.put({
        id: 'current',
        name: doc.metadata.title,
        document: JSON.stringify(doc),
        updatedAt: new Date().toISOString(),
      });
    },

    addPage: () => {
      const { history } = get();
      if (!history) return;
      const activePage = getActivePage(history.present);
      const newPage: Page = {
        id: uuidv4(),
        name: `Page ${history.present.pages.length + 1}`,
        width: activePage?.width ?? 1080,
        height: activePage?.height ?? 1080,
        dpi: activePage?.dpi ?? 72,
        backgroundColor: '#ffffff',
        layers: [],
      };
      const next = {
        ...history.present,
        pages: [...history.present.pages, newPage],
        activePage: newPage.id,
      };
      set(s => { s.history = pushHistory(history, next); });
    },

    setActivePage: (id) => {
      const { history } = get();
      if (!history) return;
      const next = { ...history.present, activePage: id };
      set(s => { s.history = pushHistory(history, next); });
    },

    deletePage: (id) => {
      const { history } = get();
      if (!history || history.present.pages.length <= 1) return;
      const pages = history.present.pages.filter(p => p.id !== id);
      const activePage = history.present.activePage === id ? pages[0].id : history.present.activePage;
      const next = { ...history.present, pages, activePage };
      set(s => { s.history = pushHistory(history, next); });
    },

    renamePage: (id, name) => {
      const { history } = get();
      if (!history) return;
      const next = {
        ...history.present,
        pages: history.present.pages.map(p => p.id === id ? { ...p, name } : p),
      };
      set(s => { s.history = pushHistory(history, next); });
    },
  }))
);
