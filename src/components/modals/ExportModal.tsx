import React, { useState, useRef } from 'react';
import { X, Download } from 'lucide-react';
import { useDocumentStore } from '../../store/document-store';
import Konva from 'konva';

interface ExportModalProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  onClose: () => void;
}

type Format = 'PNG' | 'JPG' | 'SVG' | 'PDF';

const PRESETS = {
  'Original': null,
  '1x': 1,
  '2x': 2,
  '3x': 3,
  '4x': 4,
};

const FORMAT_QUALITY: Record<Format, boolean> = {
  PNG: false,
  JPG: true,
  SVG: false,
  PDF: false,
};

export const ExportModal: React.FC<ExportModalProps> = ({ stageRef, onClose }) => {
  const { getActivePage } = useDocumentStore();
  const page = getActivePage();
  const [format, setFormat] = useState<Format>('PNG');
  const [scale, setScale] = useState(1);
  const [quality, setQuality] = useState(90);
  const [preset, setPreset] = useState('1x');
  const [exporting, setExporting] = useState(false);

  const width = page ? Math.round(page.width * scale) : 0;
  const height = page ? Math.round(page.height * scale) : 0;

  const handleExport = async () => {
    if (!page || !stageRef.current) return;
    setExporting(true);
    
    try {
      if (format === 'PNG' || format === 'JPG') {
        const uri = stageRef.current.toDataURL({
          mimeType: format === 'JPG' ? 'image/jpeg' : 'image/png',
          quality: quality / 100,
          pixelRatio: scale,
        });
        const link = document.createElement('a');
        link.download = `design.${format.toLowerCase()}`;
        link.href = uri;
        link.click();
      } else if (format === 'SVG') {
        // Generate SVG from layers
        const svgLayers = page.layers.map(l => {
          if (l.type === 'text') {
            const t = l as any;
            return `<text x="${t.x}" y="${t.y + t.fontSize}" 
              font-size="${t.fontSize}" font-family="${t.fontFamily}" 
              fill="${t.fill}" transform="rotate(${t.rotation || 0}, ${t.x}, ${t.y})">${t.text}</text>`;
          }
          if (l.type === 'shape') {
            const s = l as any;
            if (s.shapeType === 'circle') {
              return `<circle cx="${s.x + s.width/2}" cy="${s.y + s.height/2}" 
                r="${Math.min(s.width, s.height)/2}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}" />`;
            }
            return `<rect x="${s.x}" y="${s.y}" width="${s.width}" height="${s.height}" 
              fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}" rx="${s.cornerRadius || 0}" />`;
          }
          return '';
        }).join('\n  ');

        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${page.width}" height="${page.height}" viewBox="0 0 ${page.width} ${page.height}">
  <rect width="${page.width}" height="${page.height}" fill="${page.backgroundColor}" />
  ${svgLayers}
</svg>`;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'design.svg';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === 'PDF') {
        // Export PNG then wrap in minimal PDF
        const uri = stageRef.current.toDataURL({ mimeType: 'image/jpeg', quality: 0.95, pixelRatio: scale });
        const img = new Image();
        img.onload = () => {
          const w = width / 96 * 72; // px to points
          const h = height / 96 * 72;
          // Minimal PDF with embedded JPEG - use browser print as fallback
          const link = document.createElement('a');
          link.download = 'design.png'; // browser limitation without jsPDF
          link.href = uri;
          link.click();
          alert('PDF export requires print dialog. PNG saved instead. Install jsPDF for proper PDF export.');
        };
        img.src = uri;
      }
    } finally {
      setExporting(false);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200]" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#252525] border border-[#3a3a3a] rounded-xl shadow-2xl w-[480px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#2a2a2a] border-b border-[#3a3a3a]">
          <div className="text-sm font-semibold text-[#cccccc]">Export Design</div>
          <button onClick={onClose} className="text-[#555] hover:text-[#aaa] transition-colors"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Format selector */}
          <div>
            <label className="text-xs text-[#888] mb-2 block">Format</label>
            <div className="grid grid-cols-4 gap-2">
              {(['PNG', 'JPG', 'SVG', 'PDF'] as Format[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    format === f
                      ? 'bg-[#3b82f6] text-white'
                      : 'bg-[#1e1e1e] text-[#888] hover:bg-[#333] hover:text-[#ccc]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Scale presets */}
          <div>
            <label className="text-xs text-[#888] mb-2 block">Scale</label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(PRESETS).map(([label, val]) => (
                <button
                  key={label}
                  onClick={() => { setPreset(label); if (val) setScale(val); }}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    preset === label
                      ? 'bg-[#3b82f6] text-white'
                      : 'bg-[#1e1e1e] text-[#888] hover:bg-[#333]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="range" min={0.25} max={8} step={0.25}
                value={scale}
                onChange={e => { setScale(parseFloat(e.target.value)); setPreset('Custom'); }}
                className="flex-1 accent-[#3b82f6]"
              />
              <span className="text-xs text-[#888] w-10">{scale}x</span>
            </div>
          </div>

          {/* Output dimensions */}
          <div className="bg-[#1e1e1e] rounded-lg px-4 py-3 flex justify-between text-xs">
            <div className="text-[#888]">Output size</div>
            <div className="text-[#cccccc] font-mono">{width} × {height} px</div>
          </div>

          {/* Quality (JPG only) */}
          {FORMAT_QUALITY[format] && (
            <div>
              <label className="text-xs text-[#888] mb-2 block">Quality: {quality}%</label>
              <input
                type="range" min={10} max={100} step={5}
                value={quality}
                onChange={e => setQuality(parseInt(e.target.value))}
                className="w-full accent-[#3b82f6]"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-[#1e1e1e] text-[#888] hover:bg-[#333] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-5 py-2 text-sm rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            <Download size={14} />
            {exporting ? 'Exporting...' : `Export ${format}`}
          </button>
        </div>
      </div>
    </div>
  );
};
