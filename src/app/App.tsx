import React, { useEffect, useRef, useState } from 'react';
import { Menubar } from '../components/menubar/Menubar';
import { Toolbar } from '../components/toolbar/Toolbar';
import { CanvasViewport } from '../components/canvas/CanvasViewport';
import { AIPanel } from '../components/canvas/AIPanel';
import { LayersPanel } from '../components/panels/LayersPanel';
import { PropertiesPanel } from '../components/panels/PropertiesPanel';
import { HistoryPanel } from '../components/panels/HistoryPanel';
import { PageTabs } from '../components/panels/PageTabs';
import { NewProjectModal } from '../components/modals/NewProjectModal';
import { useUIStore } from '../store/ui-store';
import { useDocumentStore } from '../store/document-store';
import { matchShortcut } from '../engine/shortcuts';
import Konva from 'konva';

export const App: React.FC = () => {
  const { showAIPanel } = useUIStore();
  const { getDocument, undo, redo, deleteSelected, duplicateSelected, copySelected, paste } = useDocumentStore();
  const doc = getDocument();
  const [showNewProject, setShowNewProject] = useState(!doc);
  const stageRef = useRef<Konva.Stage | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const action = matchShortcut(e);
      if (!action) return;
      e.preventDefault();
      switch (action) {
        case 'edit:undo':        undo(); break;
        case 'edit:redo':        redo(); break;
        case 'edit:delete':      deleteSelected(); break;
        case 'edit:duplicate':   duplicateSelected(); break;
        case 'edit:copy':        copySelected(); break;
        case 'edit:paste':       paste(); break;
        case 'file:new':         setShowNewProject(true); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, deleteSelected, duplicateSelected, copySelected, paste]);

  // Auto-save every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (getDocument()) useDocumentStore.getState().saveToDb();
    }, 10_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-[#cccccc] overflow-hidden">
      {/* Top menubar - pass stageRef for export */}
      <Menubar stageRef={stageRef} />

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left toolbar */}
        <Toolbar />

        {/* Center canvas */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <CanvasViewport stageRef={stageRef} />
          <PageTabs />
        </div>

        {/* Right panels */}
        <div className="w-64 bg-[#252525] border-l border-[#3a3a3a] flex flex-col overflow-hidden">
          {/* Layers */}
          <div className="h-64 border-b border-[#3a3a3a] overflow-hidden flex flex-col">
            <LayersPanel />
          </div>
          {/* Properties */}
          <div className="flex-1 overflow-y-auto border-b border-[#3a3a3a]">
            <PropertiesPanel />
          </div>
          {/* History */}
          <div className="h-40 overflow-hidden flex flex-col">
            <HistoryPanel />
          </div>
        </div>
      </div>

      {/* AI Panel */}
      {showAIPanel && <AIPanel />}

      {/* New Project Modal */}
      {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} />}
    </div>
  );
};
