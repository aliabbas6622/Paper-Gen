import React, { useState } from 'react';
import { ExamPaperData } from '../types/exam';
import { ExamPaperPreview } from '../components/ExamPaperPreview';
import { exportToWord } from '../utils/docxExport';
import {
  Printer,
  FileDown,
  ZoomIn,
  ZoomOut,
  HelpCircle,
  Maximize2,
  CheckCircle2,
  FileText,
  Sparkles,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PreviewPageProps {
  examData: ExamPaperData;
}

export const PreviewPage: React.FC<PreviewPageProps> = ({ examData }) => {
  const [zoomFactor, setZoomFactor] = useState<number>(1.0);
  const [showPrintTips, setShowPrintTips] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleExportWord = async () => {
    try {
      setIsExporting(true);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      await exportToWord(examData);
    } catch (error) {
      console.error('Word export error:', error);
      alert('Failed to generate Word document. Please check console.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.8 } });
    window.print();
  };

  const totalQuestions = examData.sections
    .filter((s) => s.enabled)
    .reduce((sum, s) => sum + s.questions.length, 0);

  return (
    <div className="w-full max-w-[1750px] mx-auto p-2 sm:p-4 flex flex-col flex-1 min-h-0 overflow-hidden font-ui">
      {/* Top Document Actions & Zoom Bar */}
      <div className="no-print mb-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Document Info Pills */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              Document Canvas & Export Center
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="bg-slate-100 text-slate-700 font-times font-bold text-xs px-2.5 py-0.5 rounded border border-slate-200">
              {examData.formatting.fontFamily} • {examData.formatting.baseFontSize}pt
            </span>
            <span className="bg-slate-100 text-slate-600 font-mono-code text-[11px] px-2 py-0.5 rounded border border-slate-200 hidden md:inline">
              Margins: {examData.formatting.marginTop}" / {examData.formatting.marginLeft}"
            </span>
            <span className="bg-slate-100 text-slate-600 font-mono-code text-[11px] px-2 py-0.5 rounded border border-slate-200">
              {totalQuestions} Qs • {examData.header.maxMarks} Marks
            </span>
          </div>
        </div>

        {/* Right: Zoom controls & Print / Export actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-slate-700 text-xs border border-slate-200">
            <button
              type="button"
              onClick={() => setZoomFactor((z) => Math.max(0.5, z - 0.1))}
              className="p-1.5 hover:bg-white rounded text-slate-700 transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono-code font-bold text-xs">
              {Math.round(zoomFactor * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomFactor((z) => Math.min(1.4, z + 0.1))}
              className="p-1.5 hover:bg-white rounded text-slate-700 transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomFactor(1.0)}
              className="px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 border-l border-slate-200"
              title="Reset Zoom to 100%"
            >
              100%
            </button>
          </div>

          {/* Print Guide Toggle */}
          <button
            type="button"
            onClick={() => setShowPrintTips(!showPrintTips)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="View instructions for saving as PDF or printing"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Print Tips</span>
          </button>

          {/* Export Word (.docx) */}
          <button
            type="button"
            onClick={handleExportWord}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            title="Download formatted Microsoft Word .docx file"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-700" />
            <span>{isExporting ? 'Exporting...' : 'Export Word'}</span>
          </button>

          {/* Print to PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer ring-1 ring-slate-800"
            title="Print or Save as Printer-Ready PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Optional Print Configuration Banner */}
      {showPrintTips && (
        <div className="no-print mb-3 bg-white p-4 rounded-xl border border-slate-300 text-xs text-slate-700 shadow-sm space-y-2 animate-fadeIn shrink-0">
          <div className="font-semibold text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-slate-700" />
              Official Academic Printing & PDF Guidelines:
            </span>
            <button
              onClick={() => setShowPrintTips(false)}
              className="text-slate-400 hover:text-slate-800 font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-slate-600">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 block mb-0.5">1. Destination:</span>
              Choose <strong>"Save as PDF"</strong> for digital copies, or select your laser/inkjet printer for physical handouts.
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 block mb-0.5">2. Print Margins:</span>
              In browser print dialog, set <strong>Margins: None</strong> or <strong>Default</strong> so paper margins match the page setup measurements.
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 block mb-0.5">3. Background Graphics:</span>
              Check the <strong>"Background graphics"</strong> box to ensure divider double-lines, badges, and watermark graphics print crisply.
            </div>
          </div>
        </div>
      )}

      {/* Main Centered Paper Canvas */}
      <div className="geometric-grid-bg flex-1 min-h-0 overflow-y-auto overflow-x-auto p-3 sm:p-6 rounded-2xl border border-slate-300/90 flex flex-col items-center custom-scrollbar shadow-inner">
        <div className="exam-sheet-container w-full flex justify-center py-2">
          <ExamPaperPreview
            examData={examData}
            zoomFactor={zoomFactor}
          />
        </div>
      </div>
    </div>
  );
};
