import React, { useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Text, Rect, Circle, Image as KonvaImage, Transformer, Group } from 'react-konva';
import { useDocumentStore } from '../../store/document-store';
import { useToolStore } from '../../store/tool-store';
import { useUIStore } from '../../store/ui-store';
import { v4 as uuidv4 } from 'uuid';
import { Layer as LayerType, TextLayer, ShapeLayer, ImageLayer } from '../../types/canvas';
import Konva from 'konva';

export const CanvasViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const { getActivePage, selectedIds, selectLayer, clearSelection, addLayer, updateLayer, viewport, setViewport } = useDocumentStore();
  const { activeTool } = useToolStore();
  const { showGrid } = useUIStore();
  const [stageSize, setStageSize] = React.useState({ width: 800, height: 600 });

  const page = getActivePage();

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const e = entries[0];
      setStageSize({ width: e.contentRect.width, height: e.contentRect.height });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Sync transformer to selected nodes
  useEffect(() => {
    const tr = transformerRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    const nodes = selectedIds.map(id => stage.findOne(`#${id}`)).filter(Boolean) as Konva.Node[];
    tr.nodes(nodes);
    tr.getLayer()?.batchDraw();
  }, [selectedIds]);

  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      clearSelection();
      return;
    }
    const id = e.target.id();
    if (!id) return;
    const multi = e.evt.shiftKey || e.evt.ctrlKey;
    selectLayer(id, multi);
  }, [clearSelection, selectLayer]);

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const scaleBy = 1.05;
    const oldScale = viewport.zoom;
    const pointer = stage.getPointerPosition()!;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.min(Math.max(newScale, 0.05), 32);
    const mousePointTo = {
      x: (pointer.x - viewport.x) / oldScale,
      y: (pointer.y - viewport.y) / oldScale,
    };
    setViewport({
      zoom: clampedScale,
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  }, [viewport, setViewport]);

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
    <div ref={containerRef} className="flex-1 bg-[#1a1a1a] overflow-hidden relative">
      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-4 text-[10px] text-[#555] z-10 select-none">
        {Math.round(viewport.zoom * 100)}%
      </div>
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onWheel={handleWheel}
        onClick={handleStageClick}
      >
        {/* Canvas background */}
        <Layer x={canvasX} y={canvasY} scaleX={viewport.zoom} scaleY={viewport.zoom}>
          {/* Document background */}
          <Rect
            x={0} y={0}
            width={page.width} height={page.height}
            fill={page.backgroundColor}
            shadowColor="rgba(0,0,0,0.5)"
            shadowBlur={20}
            shadowOffset={{ x: 4, y: 4 }}
          />

          {/* Grid */}
          {showGrid && Array.from({ length: Math.floor(page.width / 40) }).map((_, i) => (
            <React.Fragment key={`vg-${i}`}>
              <Rect x={(i + 1) * 40} y={0} width={0.5} height={page.height} fill="rgba(255,255,255,0.05)" />
            </React.Fragment>
          ))}

          {/* Render layers */}
          {page.layers.map(layer => (
            <RenderLayer
              key={layer.id}
              layer={layer}
              selected={selectedIds.includes(layer.id)}
              onDragEnd={(e) => handleDragEnd(e, layer.id)}
              onTransformEnd={(e) => handleTransformEnd(e, layer)}
            />
          ))}

          {/* Transformer */}
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

const RenderLayer: React.FC<RenderLayerProps> = ({ layer, selected, onDragEnd, onTransformEnd }) => {
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
    if (s.shapeType === 'circle') {
      return <Circle {...shapeProps} radius={Math.min(s.width, s.height) / 2} />;
    }
    return <Rect {...shapeProps} width={s.width} height={s.height} cornerRadius={s.cornerRadius} />;
  }

  return null;
};
