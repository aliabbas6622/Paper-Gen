import React from 'react';
import {
  Printer,
  FileDown,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCode,
  Sparkles,
  Copy,
  Check,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ToolbarProps {
  onExportWord: () => void;
  onPrintPDF: () => void;
  onReset: () => void;
  onSelectPreset: (presetIndex: number) => void;
  zoomFactor: number;
  setZoomFactor: (zoom: number | ((prev: number) => number)) => void;
  previewMode: 'split' | 'preview-only';
  setPreviewMode: (mode: 'split' | 'preview-only') => void;
  totalMarksInfo: { total: number; target: string };
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onExportWord,
  onPrintPDF,
  onReset,
  onSelectPreset,
  zoomFactor,
  setZoomFactor,
  previewMode,
  setPreviewMode,
  totalMarksInfo,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleExportWordWithConfetti = () => {
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    onExportWord();
  };

  const handlePrintPDFWithConfetti = () => {
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    onPrintPDF();
  };

  return (
    <header className="no-print bg-white border-b border-slate-200/90 px-4 py-2.5 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Brand & Presets */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-times font-bold text-base shadow-sm ring-1 ring-slate-800">
              T
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-slate-900 text-sm leading-tight font-ui tracking-tight">
                  Exam Paper Formatter
                </h1>
                <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-1.5 py-0.2 rounded border border-slate-200 uppercase tracking-wider font-mono-code">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-ui font-medium">
                Times New Roman • Printer & DOCX Export
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Preset Selector */}
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
            <select
              onChange={(e) => onSelectPreset(parseInt(e.target.value))}
              defaultValue="0"
              className="text-xs px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 focus:ring-1 focus:ring-slate-400 focus:outline-hidden font-medium cursor-pointer transition-colors"
            >
              <option value="0">Preset: Computer Science (Sample)</option>
              <option value="1">Preset: Physics (Theory Paper)</option>
              <option value="2">Preset: Mathematics Board Paper</option>
            </select>
          </div>
        </div>

        {/* Center: Zoom & View Mode Controls */}
        <div className="flex items-center gap-2.5">
          {/* Marks summary chip */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className="font-medium">Total Marks:</span>
            <span className="font-bold text-slate-900 font-mono-code bg-white px-1.5 py-0.5 rounded border border-slate-200">{totalMarksInfo.target || '30'}</span>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-slate-700 text-xs border border-slate-200">
            <button
              type="button"
              onClick={() => setZoomFactor((prev) => Math.max(0.6, prev - 0.1))}
              className="p-1 hover:bg-white rounded-md hover:text-slate-900 transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-semibold text-[11px] font-mono-code">
              {Math.round(zoomFactor * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomFactor((prev) => Math.min(1.4, prev + 0.1))}
              className="p-1 hover:bg-white rounded-md hover:text-slate-900 transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs border border-slate-200">
            <button
              type="button"
              onClick={() => setPreviewMode('split')}
              className={`px-2.5 py-1 rounded-md transition-all font-semibold cursor-pointer ${
                previewMode === 'split'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Split Editor
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('preview-only')}
              className={`px-2.5 py-1 rounded-md transition-all font-semibold cursor-pointer ${
                previewMode === 'preview-only'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Preview
            </button>
          </div>
        </div>

        {/* Right: Export Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={onReset}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            title="Reset to default template"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Export Word (.docx) Button */}
          <button
            type="button"
            onClick={handleExportWordWithConfetti}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50/80 text-blue-900 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            title="Download formatted Microsoft Word .docx file"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-700" />
            <span>Export Word (.docx)</span>
          </button>

          {/* Print / Export PDF Button */}
          <button
            type="button"
            onClick={handlePrintPDFWithConfetti}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer ring-1 ring-slate-800"
            title="Print or Save as Printer-Ready PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF Export</span>
          </button>
        </div>
      </div>
    </header>
  );
};
