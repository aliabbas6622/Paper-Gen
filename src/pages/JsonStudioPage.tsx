import React, { useState } from 'react';
import { ExamSection, ExamQuestion, SectionId } from '../types/exam';
import {
  smartJsonParse,
  parseAndGenerateQuestions,
  JSON_QUESTION_PRESETS,
} from '../utils/jsonQuestionParser';
import { MathRenderer } from '../components/MathRenderer';
import {
  FileCode2,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  PlusCircle,
  Layers,
  ArrowRight,
  Info,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Code
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface JsonStudioPageProps {
  sections: ExamSection[];
  onInsertQuestions: (
    targetSecId: string,
    questions: ExamQuestion[],
    mode: 'append' | 'prepend' | 'replace'
  ) => void;
  onNavigateToQuestions: () => void;
}

export const JsonStudioPage: React.FC<JsonStudioPageProps> = ({
  sections,
  onInsertQuestions,
  onNavigateToQuestions,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('multi-question-set');
  const [jsonText, setJsonText] = useState<string>(() => JSON_QUESTION_PRESETS[0]?.json || '');
  const [targetSectionId, setTargetSectionId] = useState<string>(sections[0]?.id || 'section-a');
  const [insertMode, setInsertMode] = useState<'append' | 'prepend' | 'replace'>('append');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [insertSuccess, setInsertSuccess] = useState<boolean>(false);

  // Live parsed questions
  const parseResult = React.useMemo(() => {
    return parseAndGenerateQuestions(jsonText);
  }, [jsonText]);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = JSON_QUESTION_PRESETS.find((item) => item.id === presetId);
    if (p) {
      setJsonText(p.json);
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = smartJsonParse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
    } catch {
      // ignore
    }
  };

  const handleAddQuestionToJson = () => {
    try {
      let parsed: any;
      if (!jsonText.trim()) {
        parsed = [];
      } else {
        parsed = smartJsonParse(jsonText);
      }

      const newQ = {
        number: '',
        questionText: 'New question statement with math formula $x^2 + y^2 = r^2$',
        marks: '5',
        subText: '',
      };

      if (Array.isArray(parsed)) {
        newQ.number = `${parsed.length + 1}`;
        parsed.push(newQ);
        setJsonText(JSON.stringify(parsed, null, 2));
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.questions)) {
          newQ.number = `${parsed.questions.length + 1}`;
          parsed.questions.push(newQ);
          setJsonText(JSON.stringify(parsed, null, 2));
        } else {
          newQ.number = '2';
          setJsonText(JSON.stringify([parsed, newQ], null, 2));
        }
      } else {
        setJsonText(JSON.stringify([newQ], null, 2));
      }
    } catch {
      setJsonText(
        `[\n  {\n    "number": "1",\n    "questionText": "Question 1 statement",\n    "marks": "5"\n  },\n  {\n    "number": "2",\n    "questionText": "Question 2 statement with $\\\\begin{pmatrix} a & b \\\\\\\\ c & d \\\\end{pmatrix}$",\n    "marks": "5"\n  }\n]`
      );
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    setJsonText('[\n  {\n    "number": "1",\n    "questionText": "",\n    "marks": "5"\n  }\n]');
  };

  const handleExecuteInsert = () => {
    if (!parseResult.success || parseResult.questions.length === 0) return;
    onInsertQuestions(targetSectionId, parseResult.questions, insertMode);
    setInsertSuccess(true);
    confetti({ particleCount: 45, spread: 65, origin: { y: 0.8 } });
    setTimeout(() => {
      setInsertSuccess(false);
      onNavigateToQuestions();
    }, 700);
  };

  const targetSection = sections.find((s) => s.id === targetSectionId) || sections[0];

  return (
    <div className="w-full max-w-[1750px] mx-auto p-2 sm:p-4 flex flex-col flex-1 min-h-0 overflow-hidden font-ui">
      {/* Top Banner & Presets Bar */}
      <div className="no-print mb-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-cyan-700" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900">
            JSON Question Studio (LaTeX & Matrix Engine)
          </h2>
          <span className="text-xs text-slate-500 hidden md:inline">
            Paste or script multiple questions simultaneously with KaTeX math rendering.
          </span>
        </div>

        {/* Presets dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-600 font-semibold hidden sm:inline">
            Sample Presets:
          </span>
          <select
            value={selectedPresetId}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-medium cursor-pointer focus:outline-hidden max-w-[220px] sm:max-w-none"
          >
            {JSON_QUESTION_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 2-Pane Editor & Live Preview */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 overflow-hidden">
        {/* Left Column: Code Editor */}
        <div className="lg:col-span-6 h-full min-h-0 flex flex-col bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          {/* Editor Header Tools */}
          <div className="px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-mono-code font-bold text-slate-200">
                JSON Editor [ {parseResult.questions.length} Qs detected ]
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleAddQuestionToJson}
                className="px-2 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 hover:text-white text-xs font-mono-code transition-colors cursor-pointer border border-cyan-800 flex items-center gap-1"
                title="Append another question to this JSON array"
              >
                <PlusCircle className="w-3 h-3 text-cyan-400" />
                <span>+ Add Question</span>
              </button>

              <button
                type="button"
                onClick={handleFormatJson}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono-code transition-colors cursor-pointer border border-slate-700"
                title="Format & Prettify JSON indentation"
              >
                Prettify
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono-code transition-colors cursor-pointer border border-slate-700 flex items-center gap-1"
                title="Copy JSON to clipboard"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-slate-400 hover:text-rose-300 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                title="Clear editor"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Textarea Code Area */}
          <div className="flex-1 min-h-0 p-3 overflow-y-auto custom-scrollbar">
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='Paste or write multiple questions as an array [ { "questionText": "..." }, { "questionText": "..." } ]'
              spellCheck={false}
              className="w-full h-full min-h-[260px] bg-transparent text-slate-100 font-mono-code text-xs leading-relaxed focus:outline-hidden resize-none selection:bg-cyan-900 selection:text-white"
            />
          </div>

          {/* Multiple Qs format hint pill */}
          <div className="px-3 py-1.5 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400 font-mono-code flex items-center justify-between shrink-0">
            <span>
              Format: <strong className="text-cyan-300">[ &#123; "questionText": "..." &#125;, &#123; "questionText": "..." &#125; ]</strong>
            </span>
            <span>{jsonText.length} characters</span>
          </div>

          {/* Error Banner if invalid */}
          {!parseResult.success && parseResult.error && (
            <div className="px-3 py-2 bg-rose-950/90 border-t border-rose-800 text-rose-200 text-xs flex items-start gap-2 shrink-0">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">JSON Syntax Issue: </span>
                {parseResult.error}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live KaTeX Math & Document Preview */}
        <div className="lg:col-span-6 h-full min-h-0 flex flex-col bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <span className="text-xs font-bold text-slate-800">
                Live KaTeX Math & Matrix Preview
              </span>
            </div>
            <span className="text-xs font-mono-code font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {parseResult.questions.length} Questions Ready
            </span>
          </div>

          {/* Preview Scroll Container */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {parseResult.questions.length === 0 ? (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-slate-400 text-center p-6">
                <FileCode2 className="w-10 h-10 text-slate-300 mb-2" />
                <p className="font-semibold text-xs text-slate-600">No questions parsed yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                  Write or paste JSON on the left. The live parser supports equations, matrices, roots, and multi-part questions.
                </p>
              </div>
            ) : (
              parseResult.questions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs font-times text-slate-900 space-y-2"
                >
                  {/* Question number and statement */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="font-bold text-slate-900 font-mono-code text-xs mt-0.5">
                        {q.number || `Q${idx + 1}`}.
                      </span>
                      <div className="flex-1 leading-relaxed text-sm">
                        <MathRenderer latex={q.questionText} />
                      </div>
                    </div>

                    {q.marks && (
                      <span className="font-bold text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono-code text-slate-800 shrink-0">
                        [{q.marks}]
                      </span>
                    )}
                  </div>

                  {/* Subtext */}
                  {q.subText && (
                    <div className="italic text-xs text-slate-600 pl-5 border-l-2 border-slate-200">
                      <MathRenderer latex={q.subText} />
                    </div>
                  )}

                  {/* MCQ Options if present */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-5 pt-1 text-xs">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-1.5 rounded border flex items-center gap-2 ${
                            q.correctAnswerIndex === optIdx
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="font-mono-code font-bold text-[11px]">
                            ({String.fromCharCode(65 + optIdx)})
                          </span>
                          <span className="flex-1">
                            <MathRenderer latex={opt} />
                          </span>
                          {q.correctAnswerIndex === optIdx && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sub-questions if present */}
                  {q.subQuestions && q.subQuestions.length > 0 && (
                    <div className="pl-5 pt-1 space-y-1 text-xs">
                      {q.subQuestions.map((sub, sIdx) => (
                        <div key={sIdx} className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-1.5">
                            <span className="font-semibold text-slate-700 font-mono-code">
                              {sub.label || `(${String.fromCharCode(97 + sIdx)})`}
                            </span>
                            <span className="flex-1">
                              <MathRenderer latex={sub.text} />
                            </span>
                          </div>
                          {sub.marks && (
                            <span className="font-mono-code text-[10px] text-slate-500 font-semibold">
                              [{sub.marks}]
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Target Section & Execute Insert Bar */}
      <div className="no-print mt-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {/* Target Section */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Target Section:</span>
            <select
              value={targetSectionId}
              onChange={(e) => setTargetSectionId(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 cursor-pointer focus:outline-hidden"
            >
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name || `Section ${sec.letter}`} ({sec.questions.length} existing)
                </option>
              ))}
            </select>
          </div>

          {/* Insertion Mode */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Action:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs border border-slate-200">
              <button
                type="button"
                onClick={() => setInsertMode('append')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  insertMode === 'append'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Append to End
              </button>
              <button
                type="button"
                onClick={() => setInsertMode('prepend')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  insertMode === 'prepend'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Prepend to Top
              </button>
              <button
                type="button"
                onClick={() => setInsertMode('replace')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  insertMode === 'replace'
                    ? 'bg-rose-50 text-rose-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Replace Section
              </button>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNavigateToQuestions}
            className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
          >
            Back to Questions
          </button>

          <button
            type="button"
            onClick={handleExecuteInsert}
            disabled={!parseResult.success || parseResult.questions.length === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>
              {insertSuccess
                ? 'Questions Inserted!'
                : `Insert ${parseResult.questions.length} Questions into ${targetSection.name || `Section ${targetSection.letter}`}`}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
