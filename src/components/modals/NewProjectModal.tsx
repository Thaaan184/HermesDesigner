import React, { useState } from 'react';
import { CANVAS_PRESETS } from '../../data/presets';
import { CanvasPreset } from '../../types/canvas';
import { useDocumentStore } from '../../store/document-store';

interface Props { onClose: () => void; }

export const NewProjectModal: React.FC<Props> = ({ onClose }) => {
  const [selected, setSelected] = useState<CanvasPreset>(CANVAS_PRESETS[0]);
  const [title, setTitle] = useState('Untitled Design');
  const [customW, setCustomW] = useState(1080);
  const [customH, setCustomH] = useState(1080);
  const { newDocument } = useDocumentStore();

  const grouped = CANVAS_PRESETS.reduce((acc, p) => {
    acc[p.category] = acc[p.category] || [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, CanvasPreset[]>);

  const create = () => {
    const w = selected.name === 'Custom' ? customW : selected.width;
    const h = selected.name === 'Custom' ? customH : selected.height;
    newDocument(w, h, selected.dpi, title);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200]">
      <div className="bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl w-[640px] max-h-[85vh] flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-[#3a3a3a]">
          <h2 className="text-white font-semibold text-lg">New Project</h2>
        </div>
        <div className="flex flex-1 overflow-hidden">
          {/* Left: presets */}
          <div className="w-64 border-r border-[#3a3a3a] overflow-y-auto py-2">
            {Object.entries(grouped).map(([cat, presets]) => (
              <div key={cat}>
                <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-[#555] font-semibold">{cat}</div>
                {presets.map(p => (
                  <button key={p.name} onClick={() => setSelected(p)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors
                      ${selected.name === p.name ? 'bg-[#3b82f6]/20 text-[#3b82f6]' : 'text-[#aaa] hover:bg-[#2a2a2a]'}`}>
                    {p.name}
                    {p.width > 0 && <span className="ml-2 text-[10px] text-[#555]">{p.width}×{p.height}</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>
          {/* Right: settings */}
          <div className="flex-1 p-6 flex flex-col gap-4">
            <div>
              <label className="text-xs text-[#888] block mb-1">Project Title</label>
              <input className="input-dark w-full" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            {selected.name === 'Custom' ? (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-[#888] block mb-1">Width (px)</label>
                  <input type="number" className="input-dark w-full" value={customW} onChange={e => setCustomW(+e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-[#888] block mb-1">Height (px)</label>
                  <input type="number" className="input-dark w-full" value={customH} onChange={e => setCustomH(+e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="bg-[#2a2a2a] rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-white">{selected.width} × {selected.height}</div>
                <div className="text-xs text-[#555] mt-1">{selected.dpi} DPI · {selected.category}</div>
              </div>
            )}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#3a3a3a] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#888] hover:text-white rounded-lg hover:bg-[#2a2a2a]">Cancel</button>
          <button onClick={create} className="px-6 py-2 text-sm bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg font-medium">Create Project</button>
        </div>
      </div>
    </div>
  );
};
