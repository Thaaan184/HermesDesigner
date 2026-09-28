import { v4 as uuidv4 } from 'uuid';
import { CanvasDocument, Page, Layer } from '../types/canvas';

export function createNewDocument(width: number, height: number, dpi: number, title = 'Untitled'): CanvasDocument {
  const pageId = uuidv4();
  const now = new Date().toISOString();
  const page: Page = {
    id: pageId,
    name: 'Page 1',
    width,
    height,
    dpi,
    backgroundColor: '#ffffff',
    layers: [],
  };
  return {
    version: '1.0.0',
    metadata: { title, author: 'Thaaan184', createdAt: now, updatedAt: now },
    pages: [page],
    activePage: pageId,
  };
}

export function getActivePage(doc: CanvasDocument): Page | undefined {
  return doc.pages.find(p => p.id === doc.activePage);
}

export function updateLayer(doc: CanvasDocument, pageId: string, layerId: string, patch: Partial<Layer>): CanvasDocument {
  return {
    ...doc,
    pages: doc.pages.map(page =>
      page.id !== pageId ? page : {
        ...page,
        layers: page.layers.map(l => l.id !== layerId ? l : { ...l, ...patch } as Layer),
      }
    ),
  };
}

export function addLayer(doc: CanvasDocument, pageId: string, layer: Layer): CanvasDocument {
  return {
    ...doc,
    pages: doc.pages.map(p =>
      p.id !== pageId ? p : { ...p, layers: [...p.layers, layer] }
    ),
  };
}

export function deleteLayer(doc: CanvasDocument, pageId: string, layerId: string): CanvasDocument {
  return {
    ...doc,
    pages: doc.pages.map(p =>
      p.id !== pageId ? p : { ...p, layers: p.layers.filter(l => l.id !== layerId) }
    ),
  };
}

export function reorderLayers(doc: CanvasDocument, pageId: string, layers: Layer[]): CanvasDocument {
  return {
    ...doc,
    pages: doc.pages.map(p => p.id !== pageId ? p : { ...p, layers }),
  };
}
