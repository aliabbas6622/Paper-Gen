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
    <div className="w-full max-w-[1750px] mx-auto p-3 sm:p-6 flex flex-col flex-1 min-h-0 overflow-hidden font-ui">
      {/* Top Page Action & Context Banner */}
      <div className="no-print mb-4 studio-surface p-4 sm:p-5 rounded-2xl flex flex-wrap items-end justify-between gap-4 shrink-0">
        <div className="flex flex-col gap-1.5">
          <span className="studio-kicker">Paper workspace</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#172522] text-balance">
            Build your paper
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] font-mono-code text-stone-500">
            <span><strong className="text-[#172522]">{examData.sections.length}</strong> sections</span>
            <span><strong className="text-[#172522]">{totalQuestions}</strong> questions</span>
            <span><strong className="text-[#172522]">{totalMarks}</strong> marks</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSidePreview(!showSidePreview)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              showSidePreview
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
            }`}
            title="Toggle side-by-side live document preview"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showSidePreview ? 'Hide Preview' : 'Split Preview'}</span>
            <span className="sm:hidden">Preview</span>
          </button>

          <details className="relative">
            <summary className="list-none px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer select-none">
              More
            </summary>
            <div className="absolute right-0 top-full mt-2 z-20 min-w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
              <button type="button" onClick={onNavigateToJsonStudio} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                <FileCode2 className="w-3.5 h-3.5 text-cyan-700" /> JSON Studio
              </button>
              <button type="button" onClick={onNavigateToPreview} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5" /> Full Document <ArrowRight className="w-3 h-3 ml-auto text-slate-500" />
              </button>
            </div>
          </details>
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
