import React, { forwardRef } from 'react';
import { ExamPaperData, ExamSection, ExamQuestion, OptionBulletStyle } from '../types/exam';
import MathRenderer from './MathRenderer';

interface ExamPaperPreviewProps {
  examData: ExamPaperData;
  zoomFactor?: number;
  isPrintMode?: boolean;
}

export const ExamPaperPreview = forwardRef<HTMLDivElement, ExamPaperPreviewProps>(
  ({ examData, zoomFactor = 1, isPrintMode = false }, ref) => {
    const { header, formatting, sections } = examData;

    const getBulletSymbol = (idx: number, style: OptionBulletStyle): string => {
      if (style === 'alpha-lower') return `(${String.fromCharCode(97 + idx)})`;
      if (style === 'alpha-upper') return `(${String.fromCharCode(65 + idx)})`;
      if (style === 'roman-lower') {
        const romans = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii'];
        return `(${romans[idx] || idx + 1})`;
      }
      if (style === 'numeric') return `(${idx + 1})`;
      return '•';
    };

    // Calculate line height style
    const getLineHeight = () => {
      switch (formatting.lineSpacing) {
        case 'tight':
          return '1.25';
        case 'relaxed':
          return '1.65';
        case 'double':
          return '2.0';
        case 'normal':
        default:
          return '1.42';
      }
    };

    const getFontFamilyClass = () => {
      switch (formatting.fontFamily) {
        case 'Georgia':
          return 'font-georgia';
        case 'Garamond':
          return 'font-garamond';
        case 'Arial':
          return 'font-arial';
        case 'Times New Roman':
        case 'Tinos':
        default:
          return 'font-times';
      }
    };

    // Paper styling in inches converted to css inline
    const marginStyle = {
      paddingTop: `${formatting.marginTop}in`,
      paddingBottom: `${formatting.marginBottom}in`,
      paddingLeft: `${formatting.marginLeft}in`,
      paddingRight: `${formatting.marginRight}in`,
    };

    const enabledSections = sections.filter((s) => s.enabled);

    return (
      <div className="flex justify-center p-2 sm:p-6 overflow-auto">
        <div
          ref={ref}
          id="exam-paper-document"
          style={{
            transform: zoomFactor !== 1 ? `scale(${zoomFactor})` : undefined,
            transformOrigin: 'top center',
            fontSize: `${formatting.baseFontSize}pt`,
            lineHeight: getLineHeight(),
            ...marginStyle,
          }}
          className={`exam-paper-page bg-white text-black min-h-[11in] w-full max-w-[8.5in] paper-shadow relative selection:bg-stone-200 transition-transform ${getFontFamilyClass()}`}
        >
          {/* Watermark */}
          {formatting.watermarkText?.trim() && (
            <div
              className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden z-0"
              style={{ opacity: formatting.watermarkOpacity || 0.08 }}
            >
              <span className="text-7xl font-bold uppercase tracking-widest -rotate-45 font-times text-stone-900">
                {formatting.watermarkText}
              </span>
            </div>
          )}

          {/* Teacher Copy Banner (when Answer Key is enabled) */}
          {formatting.showAnswerKey && (
            <div className="mb-3 py-1 px-3 bg-amber-50 border border-amber-300 rounded text-amber-900 text-xs font-bold text-center uppercase tracking-wider font-mono-code no-print">
              ★ TEACHER COPY / MARKING SCHEME & SOLUTION KEY ACTIVE ★
            </div>
          )}

          <div className="relative z-10">
            {/* Header Section */}
            <div className={`exam-header-block mb-4 ${header.headerAlignment === 'center' ? 'text-center' : 'text-left'}`}>
              {/* Institution Name */}
              {header.institutionName?.trim() && (
                <div
                  className="font-bold tracking-wide uppercase mb-1"
                  style={{ fontSize: `${formatting.baseFontSize * 1.15}pt` }}
                >
                  {header.institutionName}
                </div>
              )}

              {/* Main Examination Title */}
              <h1
                className="font-bold tracking-wide uppercase mb-1 text-black"
                style={{ fontSize: `${formatting.baseFontSize * (formatting.headerScale || 1.25)}pt` }}
              >
                {header.examTitle || 'EXAMINATION 2026-27'}
              </h1>

              {/* Term / Month Subtitle */}
              {header.subTitle?.trim() && (
                <div
                  className="font-bold tracking-wide uppercase mb-0.5 text-black"
                  style={{ fontSize: `${formatting.baseFontSize * 1.05}pt` }}
                >
                  {header.subTitle}
                </div>
              )}

              {/* Subject */}
              {header.subject?.trim() && (
                <div
                  className="font-bold tracking-wide uppercase mb-0.5 text-black"
                  style={{ fontSize: `${formatting.baseFontSize * 1.1}pt` }}
                >
                  {header.subject}
                </div>
              )}

              {/* Paper Code / Name */}
              {header.paperCode?.trim() && (
                <div
                  className="font-bold tracking-wide uppercase mb-3 text-black"
                  style={{ fontSize: `${formatting.baseFontSize * 1.02}pt` }}
                >
                  {header.paperCode}
                </div>
              )}

              {/* Metadata Bar (Date, Duration, Max Marks) */}
              <div
                className="flex items-center justify-between font-bold pt-1 pb-1.5 text-black text-left"
                style={{ fontSize: `${formatting.baseFontSize * 0.98}pt` }}
              >
                <div>
                  <span>Date:</span> <span className="font-normal font-times">{header.date || '—'}</span>
                </div>
                <div className="text-center">
                  <span>Duration:</span> <span className="font-normal font-times">{header.duration || '—'}</span>
                </div>
                <div className="text-right">
                  <span>Max. Marks:</span> <span className="font-normal font-times">{header.maxMarks || '—'}</span>
                </div>
              </div>

              {/* Candidate Info Fields if enabled */}
              {header.showCandidateFields && (
                <div
                  className="flex items-center justify-between pt-2 pb-1 text-black font-times border-t border-dashed border-stone-400 mt-1"
                  style={{ fontSize: `${formatting.baseFontSize * 0.95}pt` }}
                >
                  <div>
                    <span className="font-bold">{header.candidateNameLabel || 'Name:'}</span> ______________________________
                  </div>
                  <div>
                    <span className="font-bold">{header.candidateRollLabel || 'Roll No:'}</span> ____________________
                  </div>
                </div>
              )}

              {/* Header Divider Line */}
              {header.dividerStyle !== 'none' && (
                <div
                  className={`mt-1 mb-5 border-black ${
                    header.dividerStyle === 'double'
                      ? 'border-b-4 border-double'
                      : header.dividerStyle === 'thick'
                      ? 'border-b-2'
                      : header.dividerStyle === 'dashed'
                      ? 'border-b border-dashed'
                      : 'border-b'
                  }`}
                />
              )}
            </div>

            {/* Document Body (Sections) */}
            <div
              className={`space-y-6 ${
                formatting.globalColumns === 2 ? 'columns-2' : ''
              }`}
              style={{ columnGap: `${formatting.columnGap || 24}px` }}
            >
              {enabledSections.map((section) => (
                <div key={section.id} className="exam-section-block mb-6">
                  {/* Section Title Header */}
                  <div className="text-center mb-3">
                    <h2
                      className={`font-bold uppercase tracking-wide inline-block ${
                        formatting.underlineSectionHeaders ? 'underline underline-offset-2' : ''
                      }`}
                      style={{ fontSize: `${formatting.baseFontSize * 1.22}pt` }}
                    >
                      {section.title}
                    </h2>

                    {/* Section Subtitle & Marks */}
                    <div className="flex items-center justify-center relative mt-0.5">
                      <h3
                        className={`font-bold uppercase tracking-wide inline-block ${
                          formatting.underlineSectionHeaders ? 'underline underline-offset-2' : ''
                        }`}
                        style={{ fontSize: `${formatting.baseFontSize * 1.08}pt` }}
                      >
                        {section.subtitle}
                      </h3>

                      {section.marks?.trim() && (
                        <span
                          className="absolute right-0 font-bold text-black font-times"
                          style={{ fontSize: `${formatting.baseFontSize}pt` }}
                        >
                          {section.marks}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Section Main Prompt / Q1 / Q2 & Choice Rule */}
                  <div className="flex items-start justify-between gap-2 mb-2 text-left">
                    {section.instructionPrompt?.trim() && (
                      <div
                        className="font-bold text-black leading-snug flex-1"
                        style={{ fontSize: `${formatting.baseFontSize}pt` }}
                      >
                        <MathRenderer text={section.instructionPrompt} />
                      </div>
                    )}
                    {section.choiceRule && (
                      <div
                        className="font-bold italic text-black shrink-0 text-right"
                        style={{ fontSize: `${formatting.baseFontSize * 0.95}pt` }}
                      >
                        [<MathRenderer text={section.choiceRule} inline />]
                      </div>
                    )}
                  </div>

                  {/* Field Note Under Each Section */}
                  {section.fieldNote?.trim() && (
                    <div
                      className="italic text-black/85 mb-3.5 text-left text-xs sm:text-[11.5pt] leading-normal"
                      style={{ fontSize: `${formatting.baseFontSize * 0.9}pt` }}
                    >
                      <MathRenderer text={section.fieldNote} />
                    </div>
                  )}

                  {/* Section Questions */}
                  <div className="space-y-3.5">
                    {section.questions.map((question) => (
                      <div key={question.id} className="exam-question-item text-black">
                        {/* Question Title & Number */}
                        <div className="flex items-start gap-1.5 leading-snug">
                          <span className="font-bold shrink-0 min-w-[22px]">
                            {question.number ? `${question.number}.` : ''}
                          </span>
                          <div className="flex-1">
                            <span className="font-normal">
                              <MathRenderer text={question.questionText} />
                            </span>
                            {question.marks?.trim() && (
                              <span className="font-bold italic text-[0.9em] ml-2">
                                [{question.marks} marks]
                              </span>
                            )}
                          </div>
                        </div>

                        {/* SubText if any */}
                        {question.subText?.trim() && (
                          <div className="ml-7 mt-1 italic text-stone-800 text-[0.95em]">
                            <MathRenderer text={question.subText} />
                          </div>
                        )}

                        {/* Practical Code Snippet Box */}
                        {question.codeSnippet?.trim() && (
                          <div className="ml-7 mt-2 p-2.5 bg-stone-50 border border-stone-300 rounded font-mono text-[0.85em] leading-relaxed whitespace-pre-wrap text-stone-900">
                            {question.codeSnippet}
                          </div>
                        )}

                        {/* MCQ Options */}
                        {section.type === 'mcq' && question.options && question.options.length > 0 && (
                          <div className="ml-7 mt-1.5">
                            {section.mcqColumns === 2 ? (
                              /* 2-column grid options */
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                                {question.options.map((opt, optIdx) => {
                                  const isCorrect = formatting.showAnswerKey && question.correctAnswerIndex === optIdx;
                                  return (
                                    <div
                                      key={optIdx}
                                      className={`flex items-start gap-2 py-0.5 rounded px-1 -mx-1 ${
                                        isCorrect ? 'bg-emerald-50 text-emerald-950 font-semibold' : ''
                                      }`}
                                    >
                                      <span className="font-bold shrink-0 text-black leading-snug">
                                        {getBulletSymbol(optIdx, formatting.optionBulletStyle)}
                                      </span>
                                      <span className={`leading-snug ${isCorrect ? 'underline decoration-emerald-600 font-bold' : ''}`}>
                                        <MathRenderer text={opt} inline />
                                        {isCorrect && (
                                          <span className="text-emerald-700 font-bold ml-1.5 text-xs font-mono-code no-print">
                                            ✓ [Ans]
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : section.mcqColumns === 4 ? (
                              /* 4-column inline options */
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1">
                                {question.options.map((opt, optIdx) => {
                                  const isCorrect = formatting.showAnswerKey && question.correctAnswerIndex === optIdx;
                                  return (
                                    <div
                                      key={optIdx}
                                      className={`flex items-start gap-1.5 py-0.5 rounded px-1 -mx-1 ${
                                        isCorrect ? 'bg-emerald-50 text-emerald-950 font-semibold' : ''
                                      }`}
                                    >
                                      <span className="font-bold shrink-0 text-black leading-snug">
                                        {getBulletSymbol(optIdx, formatting.optionBulletStyle)}
                                      </span>
                                      <span className={`leading-snug ${isCorrect ? 'underline decoration-emerald-600 font-bold' : ''}`}>
                                        <MathRenderer text={opt} inline />
                                        {isCorrect && (
                                          <span className="text-emerald-700 font-bold ml-1 text-[10px] font-mono-code no-print">
                                            ✓
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              /* 1-column stacked list */
                              <div className="space-y-1">
                                {question.options.map((opt, optIdx) => {
                                  const isCorrect = formatting.showAnswerKey && question.correctAnswerIndex === optIdx;
                                  return (
                                    <div
                                      key={optIdx}
                                      className={`flex items-start gap-2 py-0.5 rounded px-1 -mx-1 ${
                                        isCorrect ? 'bg-emerald-50 text-emerald-950 font-semibold' : ''
                                      }`}
                                    >
                                      <span className="font-bold shrink-0 text-black leading-snug">
                                        {getBulletSymbol(optIdx, formatting.optionBulletStyle)}
                                      </span>
                                      <span className={`leading-snug ${isCorrect ? 'underline decoration-emerald-600 font-bold' : ''}`}>
                                        <MathRenderer text={opt} inline />
                                        {isCorrect && (
                                          <span className="text-emerald-700 font-bold ml-1.5 text-xs font-mono-code no-print">
                                            ✓ [Ans]
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Sub-Questions (For Section B Short and Section C Long) */}
                        {section.type !== 'mcq' && question.subQuestions && question.subQuestions.length > 0 && (
                          <div className="ml-7 mt-1.5 space-y-1">
                            {question.subQuestions.map((subQ) => (
                              <div key={subQ.id} className="flex items-start gap-2 leading-snug">
                                <span className="font-bold shrink-0">{subQ.label}</span>
                                <div className="flex-1">
                                  <span>
                                    <MathRenderer text={subQ.text} />
                                  </span>
                                  {subQ.marks?.trim() && (
                                    <span className="italic text-[0.9em] ml-1.5">
                                      ({subQ.marks} marks)
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Student Answer Sheet Lines */}
                        {question.answerLinesCount && question.answerLinesCount > 0 ? (
                          <div className="ml-7 mt-2 space-y-3 pb-2">
                            {Array.from({ length: question.answerLinesCount }).map((_, lIdx) => (
                              <div key={lIdx} className="border-b border-dashed border-stone-300 h-4" />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* TEACHER ANSWER KEY & MARKING SCHEME APPENDIX TABLE (if Answer Key Mode is enabled) */}
            {formatting.showAnswerKey && (
              <div className="mt-8 pt-6 border-t-2 border-dashed border-stone-400">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-base uppercase tracking-wider underline underline-offset-2">
                    ANSWER KEY & MARKING SCHEME (TEACHER'S COPY)
                  </h3>
                  <p className="text-xs italic text-stone-600 mt-0.5">
                    Official Solutions and Step-wise Evaluation Scheme
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse border border-black font-times">
                    <thead>
                      <tr className="bg-stone-100 font-bold border-b border-black">
                        <th className="p-1.5 border-r border-black w-24">Section</th>
                        <th className="p-1.5 border-r border-black w-14 text-center">Q #</th>
                        <th className="p-1.5 border-r border-black">Correct Answer / Key Points</th>
                        <th className="p-1.5 border-r border-black w-16 text-center">Marks</th>
                        <th className="p-1.5 w-36">Solution Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enabledSections.map((sec) =>
                        sec.questions.map((q, qIndex) => {
                          let answerText = 'Descriptive / Derivation solution';
                          let correctBadge = '';

                          if (sec.type === 'mcq' && q.options && q.correctAnswerIndex !== undefined) {
                            const optLetter = ['A', 'B', 'C', 'D', 'E'][q.correctAnswerIndex] || '';
                            const optText = q.options[q.correctAnswerIndex] || '';
                            correctBadge = `(${optLetter})`;
                            answerText = optText;
                          } else if (q.subQuestions && q.subQuestions.length > 0) {
                            answerText = `${q.subQuestions.length} sub-parts evaluation scheme`;
                          }

                          return (
                            <tr key={`${sec.id}-${q.id}`} className="border-b border-stone-300">
                              <td className="p-1.5 border-r border-black font-semibold">
                                {sec.letter} ({sec.type})
                              </td>
                              <td className="p-1.5 border-r border-black font-bold text-center font-mono-code">
                                {q.number || qIndex + 1}
                              </td>
                              <td className="p-1.5 border-r border-black">
                                {correctBadge && <span className="font-bold mr-1">{correctBadge}</span>}
                                <MathRenderer text={answerText} inline />
                              </td>
                              <td className="p-1.5 border-r border-black text-center font-bold">
                                {q.marks || sec.marksPerQuestion || '—'}
                              </td>
                              <td className="p-1.5 italic text-stone-600">
                                <MathRenderer text={q.correctAnswerNote || 'Accurate explanation'} inline />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Document Footer (Page number) */}
            {formatting.showPageNumbers && (
              <div
                className={`pt-6 mt-6 border-t border-stone-200 text-stone-600 text-xs ${
                  formatting.pageNumberPosition === 'bottom-right'
                    ? 'text-right'
                    : formatting.pageNumberPosition === 'top-right'
                    ? 'text-right'
                    : 'text-center'
                }`}
                style={{ fontSize: `${formatting.baseFontSize * 0.8}pt` }}
              >
                Page 1 of 1
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ExamPaperPreview.displayName = 'ExamPaperPreview';
