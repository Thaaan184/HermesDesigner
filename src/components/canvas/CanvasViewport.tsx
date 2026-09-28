import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Stage, Layer, Text, Rect, Circle, Transformer } from 'react-konva';
import { useDocumentStore } from '../../store/document-store';
import { useUIStore } from '../../store/ui-store';
import { Layer as LayerType, TextLayer, ShapeLayer } from '../../types/canvas';
import Konva from 'konva';

interface CanvasViewportProps {
  stageRef?: React.RefObject<Konva.Stage | null>;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({ stageRef: externalStageRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalStageRef = useRef<Konva.Stage>(null);
  const stageRef = externalStageRef ?? internalStageRef;
  const transformerRef = useRef<Konva.Transformer>(null);
  const { getActivePage, selectedIds, selectLayer, clearSelection, updateLayer, viewport, setViewport } = useDocumentStore();
  const { showGrid } = useUIStore();
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [spaceDown, setSpaceDown] = useState(false);
  const panStart = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);

  const page = getActivePage();

  // Resize observer
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const e = entries[0];
      setStageSize({ width: e.contentRect.width, height: e.contentRect.height });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Spacebar for pan tool
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); setSpaceDown(true); }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceDown(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // Sync transformer to selected nodes
  useEffect(() => {
    const tr = transformerRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    const nodes = selectedIds.map(id => stage.findOne(`#${id}`)).filter(Boolean) as Konva.Node[];
    tr.nodes(nodes);
    tr.getLayer()?.batchDraw();
  }, [selectedIds, stageRef]);

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    if (e.evt.ctrlKey || e.evt.metaKey) {
      const scaleBy = 1.06;
      const oldScale = viewport.zoom;
      const pointer = stage.getPointerPosition()!;
      const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const clamped = Math.min(Math.max(newScale, 0.05), 32);
      const mousePointTo = { x: (pointer.x - viewport.x) / oldScale, y: (pointer.y - viewport.y) / oldScale };
      setViewport({ zoom: clamped, x: pointer.x - mousePointTo.x * clamped, y: pointer.y - mousePointTo.y * clamped });
    } else {
      setViewport({ x: viewport.x - e.evt.deltaX, y: viewport.y - e.evt.deltaY });
    }
  }, [viewport, setViewport, stageRef]);

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (spaceDown || e.evt.button === 1) {
      setIsPanning(true);
      panStart.current = { x: e.evt.clientX, y: e.evt.clientY, vx: viewport.x, vy: viewport.y };
      e.evt.preventDefault();
    }
  }, [spaceDown, viewport]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isPanning || !panStart.current) return;
    const dx = e.evt.clientX - panStart.current.x;
    const dy = e.evt.clientY - panStart.current.y;
    setViewport({ x: panStart.current.vx + dx, y: panStart.current.vy + dy });
  }, [isPanning, setViewport]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    panStart.current = null;
  }, []);

  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanning) return;
    if (e.target === e.target.getStage()) { clearSelection(); return; }
    const id = e.target.id();
    if (!id) return;
    selectLayer(id, e.evt.shiftKey || e.evt.ctrlKey);
  }, [clearSelection, selectLayer, isPanning]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
    updateLayer(id, { x: e.target.x(), y: e.target.y() });
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>, layer: LayerType) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    updateLayer(layer.id, {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      ...('width' in layer ? { width: Math.max(5, (layer as ShapeLayer).width * scaleX) } : {}),
      ...('height' in layer ? { height: Math.max(5, (layer as ShapeLayer).height * scaleY) } : {}),
      ...('fontSize' in layer ? { fontSize: Math.max(1, (layer as TextLayer).fontSize * scaleX) } : {}),
    } as Partial<LayerType>);
  };

  if (!page) {
    return (
      <div className="flex-1 bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-[#555] text-sm">No document open. Create a new project to start.</div>
      </div>
    );
  }

  const canvasX = viewport.x + (stageSize.width - page.width * viewport.zoom) / 2;
  const canvasY = viewport.y + (stageSize.height - page.height * viewport.zoom) / 2;

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-[#1a1a1a] overflow-hidden relative"
      style={{ cursor: spaceDown ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
    >
      {/* Zoom + hint */}
      <div className="absolute bottom-3 right-4 text-[10px] text-[#555] z-10 select-none pointer-events-none">
        {Math.round(viewport.zoom * 100)}%
        {spaceDown ? ' ✋ Pan' : ' · Ctrl+scroll to zoom · Space+drag to pan'}
      </div>

      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer x={canvasX} y={canvasY} scaleX={viewport.zoom} scaleY={viewport.zoom}>
          <Rect
            x={0} y={0}
            width={page.width} height={page.height}
            fill={page.backgroundColor}
            shadowColor="rgba(0,0,0,0.5)"
            shadowBlur={20}
            shadowOffset={{ x: 4, y: 4 }}
          />

          {showGrid && Array.from({ length: Math.floor(page.width / 40) }).map((_, i) => (
            <Rect key={`vg-${i}`} x={(i + 1) * 40} y={0} width={0.5} height={page.height} fill="rgba(255,255,255,0.05)" />
          ))}

          {page.layers.map(layer => (
            <RenderLayer
              key={layer.id}
              layer={layer}
              selected={selectedIds.includes(layer.id)}
              onDragEnd={(e) => handleDragEnd(e, layer.id)}
              onTransformEnd={(e) => handleTransformEnd(e, layer)}
            />
          ))}

          <Transformer
            ref={transformerRef}
            borderStroke="#3b82f6"
            borderStrokeWidth={1}
            anchorFill="#3b82f6"
            anchorStroke="#fff"
            anchorSize={8}
            anchorCornerRadius={2}
            rotateAnchorOffset={20}
            enabledAnchors={['top-left','top-right','bottom-left','bottom-right','top-center','bottom-center','middle-left','middle-right']}
          />
        </Layer>
      </Stage>
    </div>
  );
};

interface RenderLayerProps {
  layer: LayerType;
  selected: boolean;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}

const RenderLayer: React.FC<RenderLayerProps> = ({ layer, onDragEnd, onTransformEnd }) => {
  const commonProps = {
    id: layer.id,
    x: layer.x,
    y: layer.y,
    rotation: layer.rotation,
    opacity: layer.opacity,
    visible: layer.visible,
    draggable: !layer.locked,
    onDragEnd,
    onTransformEnd,
  };

  if (layer.type === 'text') {
    const t = layer as TextLayer;
    return (
      <Text {...commonProps}
        text={t.text}
        fontSize={t.fontSize}
        fontFamily={t.fontFamily}
        fontStyle={`${t.fontStyle} ${t.fontWeight}`}
        fill={t.fill}
        align={t.align}
        letterSpacing={t.letterSpacing}
        lineHeight={t.lineHeight}
        width={t.width}
      />
    );
  }

  if (layer.type === 'shape') {
    const s = layer as ShapeLayer;
    const shapeProps = { ...commonProps, fill: s.fill, stroke: s.stroke, strokeWidth: s.strokeWidth };
    if (s.shapeType === 'circle') return <Circle {...shapeProps} radius={Math.min(s.width, s.height) / 2} />;
    return <Rect {...shapeProps} width={s.width} height={s.height} cornerRadius={s.cornerRadius} />;
  }

  return null;
};
