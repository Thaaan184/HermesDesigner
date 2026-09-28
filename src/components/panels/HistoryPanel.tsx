import React from 'react';
import { useDocumentStore } from '../../store/document-store';

export const HistoryPanel: React.FC = () => {
  const { history, undo, redo, canUndo, canRedo } = useDocumentStore();
  const past = history?.past ?? [];

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-[#3a3a3a] text-[10px] font-semibold uppercase tracking-wider text-[#888]">
        History
      </div>
      <div className="flex gap-2 px-3 py-2 border-b border-[#2a2a2a]">
        <button onClick={undo} disabled={!canUndo()}
          className="flex-1 py-1 rounded bg-[#2f2f2f] hover:bg-[#3a3a3a] text-xs disabled:opacity-30">← Undo</button>
        <button onClick={redo} disabled={!canRedo()}
          className="flex-1 py-1 rounded bg-[#2f2f2f] hover:bg-[#3a3a3a] text-xs disabled:opacity-30">Redo →</button>
      </div>
      <div className="flex-1 overflow-y-auto text-xs text-[#666]">
        {past.length === 0 && <div className="p-4 text-center text-[#444]">No history yet.</div>}
        {past.map((_, i) => (
          <div key={i} className="px-3 py-1.5 border-b border-[#222] hover:bg-[#2f2f2f] cursor-pointer">
            Step {i + 1}
          </div>
        ))}
        <div className="px-3 py-1.5 bg-[#3b82f6]/10 border-l-2 border-[#3b82f6] text-[#3b82f6]">
          Current State
        </div>
      </div>
    </div>
  );
};
