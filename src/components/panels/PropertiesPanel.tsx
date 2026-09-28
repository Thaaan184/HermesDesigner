import React from 'react';
import { useDocumentStore } from '../../store/document-store';
import { Layer, TextLayer, ShapeLayer } from '../../types/canvas';

export const PropertiesPanel: React.FC = () => {
  const { getActivePage, selectedIds, updateLayer } = useDocumentStore();
  const page = getActivePage();
  if (!page || selectedIds.length === 0) {
    return <div className="p-3 text-[#555] text-xs">Select a layer to edit its properties.</div>;
  }
  const layer = page.layers.find(l => l.id === selectedIds[0]);
  if (!layer) return null;

  const update = (patch: Partial<Layer>) => updateLayer(layer.id, patch);

  return (
    <div className="flex flex-col gap-0 text-xs text-[#cccccc]">
      <div className="px-3 py-2 border-b border-[#3a3a3a] font-semibold uppercase tracking-wider text-[10px] text-[#888]">
        Properties — {layer.name}
      </div>

      {/* Common: Position & Size */}
      <Section title="Transform">
        <Row label="X"><NumberInput value={layer.x} onChange={v => update({ x: v })} /></Row>
        <Row label="Y"><NumberInput value={layer.y} onChange={v => update({ y: v })} /></Row>
        {'width' in layer && <Row label="W"><NumberInput value={(layer as ShapeLayer).width} onChange={v => update({ width: v } as Partial<Layer>)} /></Row>}
        {'height' in layer && <Row label="H"><NumberInput value={(layer as ShapeLayer).height} onChange={v => update({ height: v } as Partial<Layer>)} /></Row>}
        <Row label="Rot"><NumberInput value={layer.rotation} onChange={v => update({ rotation: v })} /></Row>
        <Row label="Opacity">
          <input type="range" min={0} max={1} step={0.01} value={layer.opacity}
            onChange={e => update({ opacity: parseFloat(e.target.value) })}
            className="w-full accent-[#3b82f6]" />
        </Row>
      </Section>

      {/* Text-specific */}
      {layer.type === 'text' && (
        <Section title="Typography">
          <Row label="Font"><input className="input-dark w-full" value={(layer as TextLayer).fontFamily}
            onChange={e => update({ fontFamily: e.target.value } as Partial<Layer>)} /></Row>
          <Row label="Size"><NumberInput value={(layer as TextLayer).fontSize} onChange={v => update({ fontSize: v } as Partial<Layer>)} /></Row>
          <Row label="Color"><ColorInput value={(layer as TextLayer).fill} onChange={v => update({ fill: v } as Partial<Layer>)} /></Row>
          <Row label="Leading"><NumberInput value={(layer as TextLayer).lineHeight} step={0.1} onChange={v => update({ lineHeight: v } as Partial<Layer>)} /></Row>
        </Section>
      )}

      {/* Shape-specific */}
      {layer.type === 'shape' && (
        <Section title="Fill & Stroke">
          <Row label="Fill"><ColorInput value={(layer as ShapeLayer).fill} onChange={v => update({ fill: v } as Partial<Layer>)} /></Row>
          <Row label="Stroke"><ColorInput value={(layer as ShapeLayer).stroke} onChange={v => update({ stroke: v } as Partial<Layer>)} /></Row>
          <Row label="Stroke W"><NumberInput value={(layer as ShapeLayer).strokeWidth} onChange={v => update({ strokeWidth: v } as Partial<Layer>)} /></Row>
          <Row label="Radius"><NumberInput value={(layer as ShapeLayer).cornerRadius} onChange={v => update({ cornerRadius: v } as Partial<Layer>)} /></Row>
        </Section>
      )}

      {/* Blend mode */}
      <Section title="Blend">
        <Row label="Mode">
          <select className="input-dark w-full" value={layer.blendMode}
            onChange={e => update({ blendMode: e.target.value as Layer['blendMode'] })}>
            {['normal','multiply','screen','overlay','darken','lighten','color-dodge','color-burn'].map(m =>
              <option key={m} value={m}>{m}</option>
            )}
          </select>
        </Row>
      </Section>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border-b border-[#2a2a2a]">
    <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#555] font-semibold">{title}</div>
    <div className="px-3 pb-2 flex flex-col gap-1.5">{children}</div>
  </div>
);

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center gap-2">
    <span className="w-16 text-[#666] shrink-0">{label}</span>
    <div className="flex-1">{children}</div>
  </div>
);

const NumberInput: React.FC<{ value: number; onChange: (v: number) => void; step?: number }> = ({ value, onChange, step = 1 }) => (
  <input type="number" step={step} value={value}
    onChange={e => onChange(parseFloat(e.target.value) || 0)}
    className="input-dark w-full" />
);

const ColorInput: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div className="flex gap-1 items-center">
    <input type="color" value={value.startsWith('#') ? value.slice(0,7) : '#000000'}
      onChange={e => onChange(e.target.value)} className="w-8 h-6 rounded border border-[#3a3a3a] cursor-pointer" />
    <input type="text" value={value} onChange={e => onChange(e.target.value)} className="input-dark flex-1" />
  </div>
);
