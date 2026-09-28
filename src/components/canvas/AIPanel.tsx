import React, { useState } from 'react';
import { useDocumentStore } from '../../store/document-store';
import { useUIStore } from '../../store/ui-store';
import { buildGeneratePrompt } from '../../ai/prompt-builder';
import { validateAIOutput } from '../../ai/schema-validator';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
}

export const AIPanel: React.FC = () => {
  const { getActivePage, loadDocument, getDocument } = useDocumentStore();
  const { toggleAIPanel } = useUIStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '✦ Hermes Design AI. Describe the design you want and I will generate it. Example: "Create a dark blue event poster for an AI conference"' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const page = getActivePage();
  const doc = getDocument();

  const send = async () => {
    if (!input.trim() || loading || !page) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const prompt = buildGeneratePrompt(userMsg, page.width, page.height);
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode: 'generate' }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const { result } = await res.json();
      const validation = validateAIOutput(result);

      if (!validation.success) {
        setMessages(prev => [...prev, { role: 'error', content: `Design validation failed: ${validation.error}` }]);
        return;
      }

      // Apply to document
      if (doc) {
        const updatedDoc = {
          ...doc,
          pages: doc.pages.map(p => p.id === doc.activePage
            ? { ...p, backgroundColor: validation.data.backgroundColor, layers: validation.data.layers as any }
            : p
          ),
        };
        loadDocument(updatedDoc);
        setMessages(prev => [...prev, { role: 'assistant', content: `✓ Design generated with ${validation.data.layers.length} layers. All elements are now editable.` }]);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'error', content: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute bottom-4 right-4 w-80 h-96 bg-[#1e1e2e] border border-[#3b82f6]/30 rounded-xl shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#3a3a3a]">
        <div className="flex items-center gap-2 text-sm font-medium text-[#cccccc]">
          <Sparkles size={14} className="text-[#3b82f6]" />
          Hermes AI
        </div>
        <button onClick={toggleAIPanel} className="text-[#555] hover:text-[#aaa]"><X size={14} /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {messages.map((m, i) => (
          <div key={i} className={`text-xs rounded-lg px-3 py-2 max-w-full
            ${m.role === 'user' ? 'bg-[#3b82f6]/20 text-[#93c5fd] ml-4' :
              m.role === 'error' ? 'bg-red-500/10 text-red-400' :
              'bg-[#2a2a3a] text-[#cccccc]'}`}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#555]">
            <Loader2 size={12} className="animate-spin" />
            Hermes is generating design...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#3a3a3a] flex gap-2">
        <input
          className="flex-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-3 py-2 text-xs text-[#cccccc] placeholder-[#444] focus:outline-none focus:border-[#3b82f6]"
          placeholder={page ? "Describe your design..." : "Create a document first"}
          value={input}
          disabled={!page || loading}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button onClick={send} disabled={!input.trim() || loading || !page}
          className="p-2 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-30 transition-colors">
          <Send size={14} className="text-white" />
        </button>
      </div>
    </div>
  );
};
