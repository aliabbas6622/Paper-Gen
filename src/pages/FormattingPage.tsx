import React from 'react';
import { FormattingOptions } from '../types/exam';
import { FormattingEditor } from '../components/FormattingEditor';
import { Sliders, Eye, Type, CheckCircle2, Ruler } from 'lucide-react';
import { MathRenderer } from '../components/MathRenderer';

interface FormattingPageProps {
  formatting: FormattingOptions;
  onChangeFormatting: (formatting: FormattingOptions) => void;
  onNavigateToPreview: () => void;
}

export const FormattingPage: React.FC<FormattingPageProps> = ({
  formatting,
  onChangeFormatting,
  onNavigateToPreview,
}) => {
  return (
    <div className="w-full max-w-[1750px] mx-auto p-2 sm:p-4 flex flex-col flex-1 min-h-0 overflow-hidden font-ui">
      {/* Top Banner */}
      <div className="no-print mb-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-700" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900">
            Page Setup, Typography & Margins
          </h2>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Configure serif typography (Times New Roman), base font size, margins in inches, and paper specifications.
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
        {/* Left Column: Formatting Editor Form */}
        <div className="lg:col-span-6 h-full min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
            <FormattingEditor
              formatting={formatting}
              onChange={onChangeFormatting}
            />
          </div>
        </div>

        {/* Right Column: Live Typography & Specimen Card */}
        <div className="lg:col-span-6 h-full min-h-0 flex flex-col overflow-hidden">
          <div className="bg-slate-900 text-slate-200 p-2.5 rounded-t-xl text-xs font-semibold flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Type className="w-3.5 h-3.5 text-cyan-400" />
              <span>Live Typography & Math Specimen</span>
            </div>
            <span className="text-[11px] font-mono-code text-slate-400">
              {formatting.fontFamily} • {formatting.baseFontSize}pt
            </span>
          </div>

          <div className="geometric-grid-bg flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 rounded-b-xl border border-slate-300 flex flex-col items-center custom-scrollbar">
            <div
              className="bg-white p-6 rounded shadow-md border border-slate-200 w-full max-w-[650px] text-slate-900 space-y-4"
              style={{
                fontFamily: formatting.fontFamily,
                fontSize: `${formatting.baseFontSize}pt`,
                lineHeight:
                  formatting.lineSpacing === 'tight'
                    ? '1.25'
                    : formatting.lineSpacing === 'relaxed'
                    ? '1.6'
                    : formatting.lineSpacing === 'double'
                    ? '2.0'
                    : '1.4',
              }}
            >
              {/* Margin & Page info bar */}
              <div className="text-[10px] font-mono-code font-bold text-slate-500 uppercase pb-2 border-b border-slate-200 flex justify-between">
                <span>Margins: Top {formatting.marginTop}" • Left {formatting.marginLeft}"</span>
                <span>Size: {formatting.paperSize}</span>
              </div>

              {/* Sample Section Header */}
              <div className="text-center">
                <h3
                  className={`font-bold tracking-wider ${
                    formatting.underlineSectionHeaders ? 'underline' : ''
                  }`}
                  style={{ fontSize: `${formatting.baseFontSize * 1.15}pt` }}
                >
                  SECTION "B": SHORT QUESTIONS (30 MARKS)
                </h3>
                <p className="italic text-slate-700 text-sm">
                  Q2. Attempt any five questions. All questions carry equal marks.
                </p>
              </div>

              {/* Sample Question 1 */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>(i) Define invertible matrices and state the determinant criteria.</span>
                  <span>[04]</span>
                </div>
                <p className="text-slate-700">
                  <MathRenderer latex="Given a square matrix $A \in \mathbb{R}^{n \times n}$, it is non-singular if $\det(A) \neq 0$." />
                </p>
                <div className="py-1">
                  <MathRenderer
                    latex="A \cdot A^{-1} = I_n = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}"
                    displayMode={true}
                  />
                </div>
              </div>

              {/* Sample Question 2 (MCQ) */}
              <div className="space-y-1 pt-2 border-t border-slate-200">
                <div className="flex justify-between font-bold">
                  <span>(ii) What is the value of $\int_{0}^{1} 2x \, dx$?</span>
                  <span>[01]</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                  <div>(A) $0$</div>
                  <div>(B) $1$</div>
                  <div>(C) $2$</div>
                  <div>(D) $0.5$</div>
                </div>
              </div>

              {/* Watermark preview if active */}
              {formatting.watermarkText && (
                <div className="pt-2 text-center text-slate-400 text-xs italic font-ui">
                  Watermark Preview: "{formatting.watermarkText}" ({Math.round(formatting.watermarkOpacity * 100)}% opacity)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
