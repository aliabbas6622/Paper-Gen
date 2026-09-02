import React from 'react';
import { ExamHeader, FormattingOptions } from '../types/exam';
import { ExamHeaderEditor } from '../components/ExamHeaderEditor';
import { FileText, Eye, CheckCircle2, Building2, UserCheck, Sliders } from 'lucide-react';

interface HeaderPageProps {
  header: ExamHeader;
  formatting: FormattingOptions;
  onChangeHeader: (header: ExamHeader) => void;
  onNavigateToPreview: () => void;
}

export const HeaderPage: React.FC<HeaderPageProps> = ({
  header,
  formatting,
  onChangeHeader,
  onNavigateToPreview,
}) => {
  return (
    <div className="w-full max-w-[1750px] mx-auto p-2 sm:p-4 flex flex-col flex-1 min-h-0 overflow-hidden font-ui">
      {/* Top Banner */}
      <div className="no-print mb-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-700" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900">
            Examination Header & Board Identity Setup
          </h2>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Configure institutional titles, subject code, duration, candidate roll boxes, and divider lines.
          </span>
        </div>

        <button
          type="button"
          onClick={onNavigateToPreview}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Full Paper</span>
        </button>
      </div>

      {/* 2-Column Responsive Workspace */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left Column: Header Editor Form */}
        <div className="lg:col-span-6 h-full min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
            <ExamHeaderEditor
              header={header}
              onChange={onChangeHeader}
            />
          </div>
        </div>

        {/* Right Column: Live Header Preview Card */}
        <div className="lg:col-span-6 h-full min-h-0 flex flex-col overflow-hidden">
          <div className="bg-slate-900 text-slate-200 p-2.5 rounded-t-xl text-xs font-semibold flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Live Paper Header Rendering</span>
            </div>
            <span className="text-[11px] font-mono-code text-slate-400">
              Font: {formatting.fontFamily}
            </span>
          </div>

          <div className="geometric-grid-bg flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 rounded-b-xl border border-slate-300 flex flex-col items-center custom-scrollbar">
            <div className="bg-white p-6 rounded shadow-md border border-slate-200 w-full max-w-[720px] font-times text-slate-900">
              {/* Header Box Container */}
              <div
                className={`text-${header.headerAlignment || 'center'} space-y-1`}
                style={{ fontFamily: formatting.fontFamily }}
              >
                {/* Institution Name */}
                {header.institutionName && (
                  <h1 className="text-base sm:text-lg font-bold uppercase tracking-wide leading-tight">
                    {header.institutionName}
                  </h1>
                )}

                {/* Exam Title */}
                {header.examTitle && (
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider leading-tight">
                    {header.examTitle}
                  </h2>
                )}

                {/* Subtitle */}
                {header.subTitle && (
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide">
                    {header.subTitle}
                  </p>
                )}

                {/* Subject & Paper Code */}
                <div className="text-xs sm:text-sm font-bold uppercase tracking-wider pt-1 flex items-center justify-center gap-3 flex-wrap">
                  <span>{header.subject || 'SUBJECT TITLE'}</span>
                  {header.paperCode && (
                    <span>({header.paperCode})</span>
                  )}
                </div>

                {/* Candidate fields box if enabled */}
                {header.showCandidateFields && (
                  <div className="my-3 p-2.5 border border-black text-xs font-times text-left flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                      <span className="font-bold">{header.candidateRollLabel || 'Roll No:'}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(8)].map((_, i) => (
                          <span
                            key={i}
                            className="w-5 h-6 border border-black inline-block text-center"
                          ></span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                      <span className="font-bold">{header.candidateNameLabel || 'Candidate Name:'}</span>
                      <span className="border-b border-black flex-1 h-5 inline-block"></span>
                    </div>
                  </div>
                )}

                {/* Time Allowed & Max Marks Two-Column Row */}
                <div className="pt-2 flex items-center justify-between text-xs sm:text-sm font-bold border-t border-black/80 mt-2">
                  <div className="text-left">
                    <span>Time Allowed: {header.duration || '3 Hours'}</span>
                  </div>
                  <div className="text-right">
                    <span>Maximum Marks: {header.maxMarks || '100'}</span>
                  </div>
                </div>

                {/* Header Divider Line */}
                {header.dividerStyle !== 'none' && (
                  <div className="pt-1">
                    {header.dividerStyle === 'double' ? (
                      <div className="border-b-4 border-double border-black my-1" />
                    ) : header.dividerStyle === 'thick' ? (
                      <div className="border-b-2 border-black my-1" />
                    ) : header.dividerStyle === 'dashed' ? (
                      <div className="border-b border-dashed border-black my-1" />
                    ) : (
                      <div className="border-b border-black my-1" />
                    )}
                  </div>
                )}
              </div>

              {/* Helper tip under preview */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-ui text-slate-500 flex items-center justify-between">
                <span>Rendering at {formatting.baseFontSize}pt base font</span>
                <span className="font-mono-code text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                  Double Border Style
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
