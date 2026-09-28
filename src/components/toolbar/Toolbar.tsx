import React from 'react';
import { useToolStore } from '../../store/tool-store';
import { ToolType } from '../../types/canvas';
import {
  MousePointer2, Type, Square, Circle, Minus,
  PenTool, Pipette, Hand, ZoomIn, Move
} from 'lucide-react';

const TOOLS: { type: ToolType; icon: React.ReactNode; label: string; key: string }[] = [
  { type: 'move',       icon: <MousePointer2 size={16} />, label: 'Move (V)',       key: 'V' },
  { type: 'text',       icon: <Type size={16} />,          label: 'Text (T)',        key: 'T' },
  { type: 'rect',       icon: <Square size={16} />,        label: 'Rectangle (R)',   key: 'R' },
  { type: 'ellipse',    icon: <Circle size={16} />,        label: 'Ellipse (E)',     key: 'E' },
  { type: 'line',       icon: <Minus size={16} />,         label: 'Line (L)',        key: 'L' },
  { type: 'pen',        icon: <PenTool size={16} />,       label: 'Pen (P)',         key: 'P' },
  { type: 'eyedropper', icon: <Pipette size={16} />,       label: 'Eyedropper (I)', key: 'I' },
  { type: 'hand',       icon: <Hand size={16} />,          label: 'Hand (H)',        key: 'H' },
  { type: 'zoom',       icon: <ZoomIn size={16} />,        label: 'Zoom (Z)',        key: 'Z' },
];

export const Toolbar: React.FC = () => {
  const { activeTool, setTool } = useToolStore();
  return (
    <div className="w-12 bg-[#252525] border-r border-[#3a3a3a] flex flex-col items-center py-2 gap-1">
      {TOOLS.map(t => (
        <button
          key={t.type}
          title={t.label}
          onClick={() => setTool(t.type)}
          className={`w-9 h-9 rounded flex items-center justify-center transition-colors
            ${activeTool === t.type
              ? 'bg-[#3b82f6] text-white'
              : 'text-[#aaaaaa] hover:bg-[#3a3a3a] hover:text-white'
            }`}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
};
