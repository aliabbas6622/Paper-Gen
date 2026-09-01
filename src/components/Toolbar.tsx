import React, { useState } from 'react';
import {
  Printer,
  FileDown,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileCode,
  Sparkles,
  BookmarkPlus,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FolderHeart,
  Smartphone,
  Monitor
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomTemplate } from '../types/exam';

interface ToolbarProps {
  onExportWord: () => void;
  onPrintPDF: () => void;
  onReset: () => void;
  onSelectPreset: (presetIndex: number) => void;
  customTemplates: CustomTemplate[];
  onLoadCustomTemplate: (template: CustomTemplate) => void;
  onOpenTemplateManager: () => void;
  zoomFactor: number;
  setZoomFactor: (zoom: number | ((prev: number) => number)) => void;
  previewMode: 'split' | 'preview-only' | 'editor-only';
  setPreviewMode: (mode: 'split' | 'preview-only' | 'editor-only') => void;
  totalMarksInfo: { total: number; target: string };
  paperSubjectTitle?: string;
  isHeaderCollapsed: boolean;
  setIsHeaderCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onExportWord,
  onPrintPDF,
  onReset,
  onSelectPreset,
  customTemplates,
  onLoadCustomTemplate,
  onOpenTemplateManager,
  zoomFactor,
  setZoomFactor,
  previewMode,
  setPreviewMode,
  totalMarksInfo,
  paperSubjectTitle,
  isHeaderCollapsed,
  setIsHeaderCollapsed,
}) => {
  const [selectedPresetValue, setSelectedPresetValue] = useState('preset-0');

  const handleExportWordWithConfetti = () => {
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    onExportWord();
  };

  const handlePrintPDFWithConfetti = () => {
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    onPrintPDF();
  };

  const handleDropdownChange = (value: string) => {
    setSelectedPresetValue(value);
    if (value.startsWith('preset-')) {
      const idx = parseInt(value.replace('preset-', ''), 10);
      onSelectPreset(idx);
    } else if (value.startsWith('custom-')) {
      const templateId = value.replace('custom-', '');
      const t = customTemplates.find((item) => item.id === templateId);
      if (t) {
        onLoadCustomTemplate(t);
      }
    } else if (value === 'manage-templates') {
      onOpenTemplateManager();
    }
  };

  // If header is collapsed, render minimal slim header bar
  if (isHeaderCollapsed) {
    return (
      <header className="no-print bg-white/95 backdrop-blur-xs border-b border-slate-200/90 px-3 py-1.5 sticky top-0 z-40 shadow-xs flex items-center justify-between gap-2 text-xs font-ui">
        {/* Left: Expand toggle + App Title */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsHeaderCollapsed(false)}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold text-[11px] border border-slate-200 shadow-2xs"
            title="Expand Full Application Header"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Expand Bar</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 text-xs truncate max-w-[140px] sm:max-w-[220px]">
              {paperSubjectTitle || 'Exam Paper Formatter'}
            </span>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded border border-slate-200 hidden md:inline">
              {totalMarksInfo.target || '30'} Marks
            </span>
          </div>
        </div>

        {/* Center: Presets & Save Template */}
        <div className="flex items-center gap-1.5">
          <select
            value={selectedPresetValue}
            onChange={(e) => handleDropdownChange(e.target.value)}
            className="text-[11px] px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden font-medium cursor-pointer max-w-[140px] sm:max-w-[200px] truncate"
          >
            <optgroup label="Default Presets">
              <option value="preset-0">Computer Science</option>
              <option value="preset-1">Physics Theory</option>
              <option value="preset-2">Mathematics Board</option>
            </optgroup>
            {customTemplates.length > 0 && (
              <optgroup label="⭐ Saved Custom Templates">
                {customTemplates.map((ct) => (
                  <option key={ct.id} value={`custom-${ct.id}`}>
                    ⭐ {ct.name}
                  </option>
                ))}
              </optgroup>
            )}
            <option value="manage-templates">+ Manage Templates...</option>
          </select>

          <button
            type="button"
            onClick={onOpenTemplateManager}
            className="p-1.5 sm:px-2.5 sm:py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            title="Save or Load Custom Templates"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden md:inline">Save Template</span>
          </button>
        </div>

        {/* Right: Quick Exports */}
        <div className="flex items-center gap-1.5">
          {/* Zoom */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg text-slate-700 text-xs border border-slate-200">
            <button
              type="button"
              onClick={() => setZoomFactor((prev) => Math.max(0.5, prev - 0.1))}
              className="p-1 hover:bg-white rounded hover:text-slate-900"
              title="Zoom out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="px-1.5 text-[10px] font-mono-code font-bold">
              {Math.round(zoomFactor * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomFactor((prev) => Math.min(1.4, prev + 0.1))}
              className="p-1 hover:bg-white rounded hover:text-slate-900"
              title="Zoom in"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportWordWithConfetti}
            className="px-2.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            title="Export Word (.docx)"
          >
            <FileDown className="w-3 h-3 text-blue-700" />
            <span className="hidden sm:inline">Word</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPDFWithConfetti}
            className="px-2.5 py-1 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            title="Print or Save PDF"
          >
            <Printer className="w-3 h-3" />
            <span>PDF</span>
          </button>
        </div>
      </header>
    );
  }

  // Full Expanded Header Bar
  return (
    <header className="no-print bg-white border-b border-slate-200/90 px-3 sm:px-4 py-2.5 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
        {/* Left: Brand, Presets & Custom Template Button */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-start flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-times font-bold text-sm sm:text-base shadow-sm ring-1 ring-slate-800 shrink-0">
              T
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight font-ui tracking-tight">
                  Exam Paper Formatter
                </h1>
                <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-1.5 py-0.2 rounded border border-slate-200 uppercase tracking-wider font-mono-code hidden xs:inline">
                  PRO
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-ui font-medium truncate max-w-[200px] sm:max-w-none">
                Times New Roman • Authentic Academic Style
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Preset & Custom Template Dropdown */}
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-500 hidden md:block" />
            <select
              value={selectedPresetValue}
              onChange={(e) => handleDropdownChange(e.target.value)}
              className="text-xs px-2 sm:px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 focus:ring-1 focus:ring-slate-400 focus:outline-hidden font-medium cursor-pointer transition-colors max-w-[170px] sm:max-w-[220px] truncate"
            >
              <optgroup label="Standard Presets">
                <option value="preset-0">Preset: Computer Science</option>
                <option value="preset-1">Preset: Physics Theory</option>
                <option value="preset-2">Preset: Mathematics Board</option>
              </optgroup>
              {customTemplates.length > 0 && (
                <optgroup label="⭐ Saved Custom Templates">
                  {customTemplates.map((ct) => (
                    <option key={ct.id} value={`custom-${ct.id}`}>
                      ⭐ {ct.name}
                    </option>
                  ))}
                </optgroup>
              )}
              <option value="manage-templates">⚙️ Manage Custom Templates...</option>
            </select>
          </div>

          {/* Save Layout as Template Button */}
          <button
            type="button"
            onClick={onOpenTemplateManager}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            title="Save current layout & formatting to local storage"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-amber-700" />
            <span className="whitespace-nowrap">Save Template</span>
            {customTemplates.length > 0 && (
              <span className="bg-amber-200/80 text-amber-950 text-[10px] px-1.5 py-0.2 rounded-full font-mono-code font-bold">
                {customTemplates.length}
              </span>
            )}
          </button>
        </div>

        {/* Center: Zoom, Marks, View Modes */}
        <div className="flex items-center gap-2 sm:gap-2.5 w-full md:w-auto justify-between md:justify-center">
          {/* Marks summary chip */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className="font-medium">Total Marks:</span>
            <span className="font-bold text-slate-900 font-mono-code bg-white px-1.5 py-0.5 rounded border border-slate-200">
              {totalMarksInfo.target || '30'}
            </span>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-slate-700 text-xs border border-slate-200">
            <button
              type="button"
              onClick={() => setZoomFactor((prev) => Math.max(0.5, prev - 0.1))}
              className="p-1 hover:bg-white rounded-md hover:text-slate-900 transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 sm:px-2 font-semibold text-[11px] font-mono-code">
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

          {/* Desktop View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg text-xs border border-slate-200">
            <button
              type="button"
              onClick={() => setPreviewMode('split')}
              className={`px-2.5 py-1 rounded-md transition-all font-semibold cursor-pointer ${
                previewMode === 'split'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Split View
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

        {/* Right: Reset & Export Actions & Collapse Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={onReset}
            className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            title="Reset to default template"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Export Word (.docx) Button */}
          <button
            type="button"
            onClick={handleExportWordWithConfetti}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-blue-50/90 text-blue-900 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            title="Download formatted Microsoft Word .docx file"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-700" />
            <span className="hidden sm:inline">Export Word</span>
            <span className="sm:hidden">Word</span>
          </button>

          {/* Print / Export PDF Button */}
          <button
            type="button"
            onClick={handlePrintPDFWithConfetti}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer ring-1 ring-slate-800"
            title="Print or Save as Printer-Ready PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>

          {/* Collapse Header Toggle Button */}
          <button
            type="button"
            onClick={() => setIsHeaderCollapsed(true)}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ml-1 border border-slate-200"
            title="Collapse Header to maximize vertical editing area"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
