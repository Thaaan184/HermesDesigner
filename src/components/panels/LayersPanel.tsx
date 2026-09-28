import React from 'react';
import { useDocumentStore } from '../../store/document-store';
import { Layer } from '../../types/canvas';
import { Eye, EyeOff, Lock, Unlock, Type, Square, ImageIcon, Layers, Trash2, Copy } from 'lucide-react';

const layerIcon = (l: Layer) => {
  if (l.type === 'text')  return <Type size={12} />;
  if (l.type === 'image') return <ImageIcon size={12} />;
  if (l.type === 'group') return <Layers size={12} />;
  return <Square size={12} />;
};

export const LayersPanel: React.FC = () => {
  const { getActivePage, selectedIds, selectLayer, updateLayer, deleteSelected, duplicateSelected } = useDocumentStore();
  const page = getActivePage();
  if (!page) return <div className="p-3 text-[#888] text-xs">No active page</div>;

  const layers = [...page.layers].reverse();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3a3a3a]">
        <span className="text-xs font-semibold text-[#cccccc] uppercase tracking-wider">Layers</span>
        <div className="flex gap-1">
          <button title="Duplicate" onClick={duplicateSelected} className="p-1 rounded hover:bg-[#3a3a3a] text-[#888]">
            <Copy size={12} />
          </button>
          <button title="Delete" onClick={deleteSelected} className="p-1 rounded hover:bg-red-500/20 text-[#888] hover:text-red-400">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {layers.length === 0 && (
          <div className="p-4 text-xs text-[#555] text-center">No layers yet.<br/>Use AI or tools to add elements.</div>
        )}
        {layers.map(layer => (
          <div
            key={layer.id}
            onClick={() => selectLayer(layer.id)}
            className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-[#2a2a2a] text-xs
              ${selectedIds.includes(layer.id) ? 'bg-[#3b82f6]/20 border-l-2 border-l-[#3b82f6]' : 'hover:bg-[#2f2f2f]'}`}
          >
            <span className="text-[#666]">{layerIcon(layer)}</span>
            <span className="flex-1 truncate text-[#cccccc]">{layer.name}</span>
            <button
              onClick={e => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }}
              className="text-[#555] hover:text-[#aaa]"
            >
              {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <button
              onClick={e => { e.stopPropagation(); updateLayer(layer.id, { locked: !layer.locked }); }}
              className="text-[#555] hover:text-[#aaa]"
            >
              {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
