import React, { useState } from 'react';
import { ExamSection, ExamPaperData, ExamQuestion, SectionId } from '../types/exam';
import { SectionEditor } from '../components/SectionEditor';
import { ExamPaperPreview } from '../components/ExamPaperPreview';
import {
  Layers,
  Eye,
  FileCode2,
  Columns,
  Maximize2,
  Minimize2,
  Sparkles,
  ArrowRight,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface QuestionsPageProps {
  examData: ExamPaperData;
  onUpdateSections: (sections: ExamSection[]) => void;
  onNavigateToPreview: () => void;
  onNavigateToJsonStudio: () => void;
}

export const QuestionsPage: React.FC<QuestionsPageProps> = ({
  examData,
  onUpdateSections,
  onNavigateToPreview,
  onNavigateToJsonStudio,
}) => {
  const [showSidePreview, setShowSidePreview] = useState<boolean>(false);
  const [previewZoom, setPreviewZoom] = useState<number>(0.75);

  const totalQuestions = examData.sections
    .filter((s) => s.enabled)
    .reduce((sum, s) => sum + s.questions.length, 0);

  const totalMarks = examData.sections
    .filter((s) => s.enabled)
    .reduce((sum, s) => {
      const secTotal = s.questions.reduce((qSum, q) => {
        const val = parseFloat(q.marks || '0');
        return qSum + (isNaN(val) ? 0 : val);
      }, 0);
      return sum + secTotal;
    }, 0);

  return (
    <div className="w-full max-w-[1750px] mx-auto p-2 sm:p-4 flex flex-col flex-1 min-h-0 overflow-hidden font-ui">
      {/* Top Page Action & Context Banner */}
      <div className="no-print mb-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900">
              Questions & Section Management
            </h2>
          </div>
          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="bg-slate-100 px-2 py-0.5 rounded font-mono-code font-semibold text-slate-800">
              {examData.sections.length} Sections
            </span>
            <span className="bg-slate-100 px-2 py-0.5 rounded font-mono-code font-semibold text-slate-800">
              {totalQuestions} Questions
            </span>
            <span className="bg-slate-100 px-2 py-0.5 rounded font-mono-code font-semibold text-slate-800 hidden md:inline">
              {totalMarks} Total Marks
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick link to JSON Script Studio */}
          <button
            type="button"
            onClick={onNavigateToJsonStudio}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Open JSON Studio to write or import questions with matrices & LaTeX"
          >
            <FileCode2 className="w-3.5 h-3.5 text-cyan-700" />
            <span className="hidden sm:inline">JSON Script Studio</span>
            <span className="sm:hidden">JSON</span>
          </button>

          {/* Toggle Side-by-Side Preview */}
          <button
            type="button"
            onClick={() => setShowSidePreview(!showSidePreview)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              showSidePreview
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
            title="Toggle side-by-side live document preview"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{showSidePreview ? 'Hide Side Preview' : 'Split Preview'}</span>
          </button>

          {/* Jump to Full Document Preview */}
          <button
            type="button"
            onClick={onNavigateToPreview}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Switch to full-page paper preview & export view"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Full Document</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        {/* Editor Area (Full width by default, or 7 cols if side preview active) */}
        <div
          className={`${
            showSidePreview ? 'lg:col-span-7' : 'lg:col-span-12'
          } h-full min-h-0 flex flex-col overflow-hidden`}
        >
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
            <SectionEditor
              sections={examData.sections}
              onChange={onUpdateSections}
              numberStyle={examData.formatting.questionNumberStyle}
            />
          </div>
        </div>

        {/* Optional Side-by-Side Document Preview */}
        {showSidePreview && (
          <div className="lg:col-span-5 h-full min-h-0 flex flex-col overflow-hidden animate-fadeIn">
            <div className="geometric-grid-bg h-full min-h-0 flex-1 overflow-y-auto overflow-x-auto p-2 sm:p-3 rounded-2xl border border-slate-300 flex flex-col items-center custom-scrollbar">
              {/* Mini preview bar */}
              <div className="w-full flex items-center justify-between mb-2 text-xs text-slate-600 px-2 shrink-0">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-[11px]">
                  <Eye className="w-3.5 h-3.5 text-slate-600" /> Live Paper Snippet:
                </span>
                <div className="flex items-center gap-1 bg-white/90 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPreviewZoom((z) => Math.max(0.4, z - 0.1))}
                    className="p-1 hover:bg-slate-100 rounded text-slate-700"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </button>
                  <span className="px-1 text-[10px] font-mono-code font-bold text-slate-800">
                    {Math.round(previewZoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom((z) => Math.min(1.2, z + 0.1))}
                    className="p-1 hover:bg-slate-100 rounded text-slate-700"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Render Paper Preview */}
              <div className="exam-sheet-container w-full flex justify-center py-1">
                <ExamPaperPreview
                  examData={examData}
                  zoomFactor={previewZoom}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
