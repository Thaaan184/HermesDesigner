import React from 'react';
import { useDocumentStore } from '../../store/document-store';
import { useUIStore } from '../../store/ui-store';

export const Menubar: React.FC = () => {
  const { undo, redo, canUndo, canRedo, deleteSelected, duplicateSelected, copySelected, paste } = useDocumentStore();
  const { toggleGrid, toggleRulers, toggleSnap, toggleAIPanel, showGrid, showRulers, showSnap } = useUIStore();

  return (
    <div className="h-8 bg-[#2a2a2a] border-b border-[#3a3a3a] flex items-center px-2 gap-1 text-xs text-[#cccccc] select-none z-50">
      {/* File */}
      <MenuDropdown label="File">
        <MenuItem label="New Project" shortcut="Ctrl+N" onClick={() => {}} />
        <MenuItem label="Save" shortcut="Ctrl+S" onClick={() => useDocumentStore.getState().saveToDb()} />
        <MenuSeparator />
        <MenuItem label="Export PNG" shortcut="Ctrl+E" onClick={() => {}} />
      </MenuDropdown>

      {/* Edit */}
      <MenuDropdown label="Edit">
        <MenuItem label="Undo" shortcut="Ctrl+Z" onClick={undo} disabled={!canUndo()} />
        <MenuItem label="Redo" shortcut="Ctrl+Y" onClick={redo} disabled={!canRedo()} />
        <MenuSeparator />
        <MenuItem label="Copy" shortcut="Ctrl+C" onClick={copySelected} />
        <MenuItem label="Paste" shortcut="Ctrl+V" onClick={paste} />
        <MenuItem label="Duplicate" shortcut="Ctrl+D" onClick={duplicateSelected} />
        <MenuItem label="Delete" shortcut="Del" onClick={deleteSelected} />
      </MenuDropdown>

      {/* View */}
      <MenuDropdown label="View">
        <MenuItem label={showGrid ? "✓ Grid" : "Grid"} shortcut="" onClick={toggleGrid} />
        <MenuItem label={showRulers ? "✓ Rulers" : "Rulers"} shortcut="" onClick={toggleRulers} />
        <MenuItem label={showSnap ? "✓ Snap" : "Snap"} shortcut="" onClick={toggleSnap} />
        <MenuSeparator />
        <MenuItem label="Zoom to Fit" shortcut="Ctrl+0" onClick={() => {}} />
        <MenuItem label="Zoom 100%" shortcut="Ctrl+1" onClick={() => {}} />
      </MenuDropdown>

      {/* AI */}
      <MenuDropdown label="✦ Hermes AI">
        <MenuItem label="Open AI Panel" shortcut="" onClick={toggleAIPanel} />
      </MenuDropdown>

      {/* Right: zoom indicator */}
      <div className="ml-auto pr-2 text-[#888] text-[10px]">HermesDesigner v1.0</div>
    </div>
  );
};

interface MenuDropdownProps { label: string; children: React.ReactNode; }
const MenuDropdown: React.FC<MenuDropdownProps> = ({ label, children }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        className={`px-3 py-0.5 rounded hover:bg-[#3a3a3a] transition-colors ${open ? 'bg-[#3a3a3a]' : ''}`}
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen(v => !v)}
      >
        {label}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-0.5 w-52 bg-[#2a2a2a] border border-[#3a3a3a] rounded shadow-2xl z-[100] py-1">
          {children}
        </div>
      )}
    </div>
  );
};

interface MenuItemProps { label: string; shortcut: string; onClick: () => void; disabled?: boolean; }
const MenuItem: React.FC<MenuItemProps> = ({ label, shortcut, onClick, disabled }) => (
  <button
    className={`w-full flex justify-between px-4 py-1.5 hover:bg-[#3b82f6] transition-colors text-left ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
  >
    <span>{label}</span>
    {shortcut && <span className="text-[#888] ml-4">{shortcut}</span>}
  </button>
);
const MenuSeparator = () => <div className="border-t border-[#3a3a3a] my-1" />;
