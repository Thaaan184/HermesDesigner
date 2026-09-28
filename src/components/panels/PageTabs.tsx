import React from 'react';
import { useDocumentStore } from '../../store/document-store';
import { Plus, X } from 'lucide-react';

export const PageTabs: React.FC = () => {
  const { getDocument, setActivePage, addPage, deletePage } = useDocumentStore();
  const doc = getDocument();
  if (!doc) return null;

  return (
    <div className="h-9 bg-[#252525] border-t border-[#3a3a3a] flex items-center gap-0.5 px-2 overflow-x-auto select-none">
      {doc.pages.map(page => (
        <div key={page.id}
          onClick={() => setActivePage(page.id)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs cursor-pointer transition-colors
            ${doc.activePage === page.id
              ? 'bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/40'
              : 'text-[#888] hover:bg-[#2f2f2f] hover:text-[#ccc]'}`}
        >
          <span>{page.name}</span>
          {doc.pages.length > 1 && (
            <button onClick={e => { e.stopPropagation(); deletePage(page.id); }}
              className="opacity-0 hover:opacity-100 text-[#555] hover:text-red-400 ml-1">
              <X size={10} />
            </button>
          )}
        </div>
      ))}
      <button onClick={addPage}
        className="ml-1 p-1 rounded text-[#555] hover:text-[#aaa] hover:bg-[#2f2f2f]">
        <Plus size={12} />
      </button>
    </div>
  );
};
