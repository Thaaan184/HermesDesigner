export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn';
export type TextAlign = 'left' | 'center' | 'right';
export type ShapeType = 'rect' | 'circle' | 'path' | 'line' | 'ellipse';
export type LayerType = 'text' | 'shape' | 'image' | 'group';
export type ToolType = 'move' | 'marquee' | 'text' | 'rect' | 'ellipse' | 'line' | 'pen' | 'eyedropper' | 'hand' | 'zoom';
export type ExportFormat = 'png' | 'jpeg' | 'svg' | 'pdf' | 'json';

export interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  blendMode: BlendMode;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number | string;
  fontStyle: 'normal' | 'italic';
  fill: string;
  align: TextAlign;
  letterSpacing: number;
  lineHeight: number;
  width: number;
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shapeType: ShapeType;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
  pathData?: string;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string;
  width: number;
  height: number;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  filters?: string[];
}

export interface GroupLayer extends BaseLayer {
  type: 'group';
  children: Layer[];
  width: number;
  height: number;
}

export type Layer = TextLayer | ShapeLayer | ImageLayer | GroupLayer;

export interface Page {
  id: string;
  name: string;
  width: number;
  height: number;
  dpi: number;
  backgroundColor: string;
  layers: Layer[];
}

export interface DocumentMetadata {
  title: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  presetName?: string;
}

export interface CanvasDocument {
  version: string;
  metadata: DocumentMetadata;
  pages: Page[];
  activePage: string;
}

export interface CanvasPreset {
  name: string;
  width: number;
  height: number;
  dpi: number;
  category: string;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface AIDesignRequest {
  prompt: string;
  targetLayerIds?: string[];
  mode: 'generate' | 'revise' | 'suggest';
}
