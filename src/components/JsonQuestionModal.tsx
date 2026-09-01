import React, { useState, useMemo, useEffect } from 'react';
import { ExamSection, ExamQuestion } from '../types/exam';
import {
  parseAndGenerateQuestions,
  JSON_QUESTION_PRESETS,
  smartJsonParse
} from '../utils/jsonQuestionParser';
import { MathRenderer } from './MathRenderer';
import {
  Code,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  Eye,
  FileJson,
  Layers,
  HelpCircle,
  Sigma,
  PlusCircle,
  Trash2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface JsonQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: ExamSection[];
  activeSectionId: string;
  onInsertQuestions: (
    targetSectionId: string,
    questions: ExamQuestion[],
    mode: 'append' | 'prepend' | 'replace'
  ) => void;
}

export const JsonQuestionModal: React.FC<JsonQuestionModalProps> = ({
  isOpen,
  onClose,
  sections,
  activeSectionId,
  onInsertQuestions,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('multi-question-set');
  const [jsonText, setJsonText] = useState<string>(() => {
    return JSON_QUESTION_PRESETS[0].json;
  });
  const [targetSectionId, setTargetSectionId] = useState<string>(activeSectionId);
  const [insertMode, setInsertMode] = useState<'append' | 'prepend' | 'replace'>('append');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeViewTab, setActiveViewTab] = useState<'both' | 'editor' | 'preview'>('both');

  // Update target section if activeSectionId changes
  useEffect(() => {
    if (activeSectionId) {
      setTargetSectionId(activeSectionId);
    }
  }, [activeSectionId]);

  // Live parsed questions from JSON input
  const parseResult = useMemo(() => {
    return parseAndGenerateQuestions(jsonText);
  }, [jsonText]);

  if (!isOpen) return null;

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = JSON_QUESTION_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setJsonText(preset.json);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormatJson = () => {
    try {
      const parsed = smartJsonParse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // If parsing fails, leave as is
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
        questionText: 'New question statement with math $x^2 + y^2 = r^2$',
        marks: '5',
        subText: ''
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
          // Convert single question to array of 2 questions
          newQ.number = '2';
          setJsonText(JSON.stringify([parsed, newQ], null, 2));
        }
      } else {
        setJsonText(JSON.stringify([newQ], null, 2));
      }
    } catch (e) {
      // If text cannot be parsed, convert to array with existing as item 1 if possible
      setJsonText(`[\n  {\n    "number": "1",\n    "questionText": "Question 1 statement",\n    "marks": "5"\n  },\n  {\n    "number": "2",\n    "questionText": "Question 2 statement with $\\\\begin{pmatrix} a & b \\\\\\\\ c & d \\\\end{pmatrix}$",\n    "marks": "5"\n  }\n]`);
    }
  };

  const handleClear = () => {
    setJsonText('[\n  {\n    "number": "1",\n    "questionText": "",\n    "marks": "5"\n  }\n]');
  };

  const handleExecuteInsert = () => {
    if (!parseResult.success || parseResult.questions.length === 0) {
      return;
    }

    onInsertQuestions(targetSectionId, parseResult.questions, insertMode);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    onClose();
  };

  const currentTargetSection = sections.find((s) => s.id === targetSectionId) || sections[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-ui animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[92vh] max-h-[850px] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <FileJson className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  JSON Question Generator & Importer
                </h2>
                <span className="bg-cyan-100 text-cyan-800 text-[10px] font-mono-code font-bold px-2 py-0.5 rounded-full border border-cyan-200">
                  LaTeX & Matrix Enabled
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Fill the structured JSON or select a math/matrix preset. Our engine parses formulas, sub-questions, and marks automatically.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher for tablets/desktops */}
            <div className="hidden md:flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveViewTab('both')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeViewTab === 'both' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Split View
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('editor')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeViewTab === 'editor' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                JSON Only
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('preview')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeViewTab === 'preview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rendered Preview
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preset Templates Selector Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 shrink-0 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Presets:
          </span>
          {JSON_QUESTION_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200/90'
                }`}
                title={preset.description}
              >
                <span>{preset.title}</span>
              </button>
            );
          })}
        </div>

        {/* Main Body: JSON Code Editor & Live Math Preview */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-hidden">
          {/* Left Column: JSON Editor */}
          <div
            className={`${
              activeViewTab === 'preview' ? 'hidden' : activeViewTab === 'editor' ? 'col-span-full' : ''
            } flex flex-col h-full min-h-0 bg-slate-900 text-slate-100 overflow-hidden`}
          >
            {/* Editor Action Toolbar */}
            <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0 text-xs">
              <div className="flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono-code text-[11px] text-slate-300 font-bold">question_schema.json</span>
                {parseResult.success ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-mono-code">
                    <CheckCircle2 className="w-3 h-3" /> Valid JSON ({parseResult.questions.length} question{parseResult.questions.length > 1 ? 's' : ''})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800 text-[10px] font-mono-code truncate max-w-[200px]">
                    <AlertCircle className="w-3 h-3 shrink-0" /> Syntax Error
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleAddQuestionToJson}
                  className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 hover:text-white text-[11px] font-mono-code transition-colors cursor-pointer border border-cyan-700 flex items-center gap-1"
                  title="Append another question to this JSON array"
                >
                  <PlusCircle className="w-3 h-3 text-cyan-400" />
                  <span>+ Add Question to JSON</span>
                </button>
                <button
                  type="button"
                  onClick={handleFormatJson}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono-code transition-colors cursor-pointer border border-slate-700"
                  title="Format / Prettify JSON"
                >
                  Prettify
                </button>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono-code transition-colors cursor-pointer flex items-center gap-1 border border-slate-700"
                  title="Copy JSON to Clipboard"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-rose-900/80 text-slate-400 hover:text-rose-200 text-[11px] font-mono-code transition-colors cursor-pointer border border-slate-700"
                  title="Clear input"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Editor Textarea */}
            <div className="flex-1 min-h-0 relative p-3 overflow-y-auto custom-scrollbar bg-slate-900">
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Paste or write multiple questions as an array [ { ... }, { ... } ] or single object..."
                spellCheck={false}
                className="w-full h-full min-h-[220px] bg-transparent text-slate-100 font-mono-code text-xs leading-relaxed focus:outline-hidden resize-none selection:bg-cyan-900 selection:text-white"
              />
            </div>

            {/* Hint for multiple questions */}
            <div className="px-3 py-1.5 bg-slate-950/70 border-t border-slate-800 text-[10px] text-slate-400 font-mono-code flex items-center justify-between shrink-0">
              <span>Multiple Qs format: <strong className="text-cyan-300">[ &#123; "questionText": "Q1" &#125;, &#123; "questionText": "Q2" &#125; ]</strong></span>
              <span className="text-slate-400">or <strong className="text-cyan-300">&#123; "questions": [ ... ] &#125;</strong></span>
            </div>

            {/* Error banner if invalid */}
            {!parseResult.success && parseResult.error && (
              <div className="px-3 py-2 bg-rose-950/90 border-t border-rose-800 text-rose-200 text-xs flex items-start gap-2 shrink-0">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="font-mono-code text-[11px] leading-snug">{parseResult.error}</div>
              </div>
            )}
          </div>

          {/* Right Column: Live Formatted LaTeX & Matrix Preview */}
          <div
            className={`${
              activeViewTab === 'editor' ? 'hidden' : activeViewTab === 'preview' ? 'col-span-full' : ''
            } flex flex-col h-full min-h-0 bg-white overflow-hidden`}
          >
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-700" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live Formatted Preview</span>
              </div>
              <span className="text-[11px] text-slate-500 italic">
                Times New Roman • KaTeX Real-time Rendering
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50">
              {parseResult.success && parseResult.questions.length > 0 ? (
                parseResult.questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2.5 font-times"
                  >
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-start gap-2 flex-1">
                        <span className="font-bold text-slate-900 text-sm">{q.number ? `${q.number}.` : `Q${idx + 1}.`}</span>
                        <div className="text-sm text-slate-900 flex-1 leading-relaxed">
                          <MathRenderer text={q.questionText} />
                        </div>
                      </div>
                      {q.marks && (
                        <span className="font-bold text-xs font-mono-code text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                          [{q.marks} {parseInt(q.marks) === 1 ? 'mark' : 'marks'}]
                        </span>
                      )}
                    </div>

                    {/* Subtext */}
                    {q.subText && (
                      <div className="text-xs italic text-slate-600 pl-4 border-l-2 border-slate-300">
                        <MathRenderer text={q.subText} />
                      </div>
                    )}

                    {/* MCQ Options if present */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-4 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = q.correctAnswerIndex === optIdx;
                          const letter = String.fromCharCode(65 + optIdx);
                          return (
                            <div
                              key={optIdx}
                              className={`p-1.5 rounded-lg border text-xs flex items-center gap-2 ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                                  : 'bg-white border-slate-200 text-slate-800'
                              }`}
                            >
                              <span className="font-bold font-mono-code text-slate-500">({letter})</span>
                              <div className="flex-1">
                                <MathRenderer text={opt} inline />
                              </div>
                              {isCorrect && (
                                <span className="text-[10px] text-emerald-700 font-mono-code font-bold bg-emerald-100 px-1 rounded">
                                  ✓ Correct
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Solution / Correct Answer Note */}
                    {q.correctAnswerNote && (
                      <div className="mt-1 p-2 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 font-ui">
                        <span className="font-bold font-sans">Teacher Solution Note: </span>
                        <MathRenderer text={q.correctAnswerNote} inline />
                      </div>
                    )}

                    {/* Sub-questions if present */}
                    {q.subQuestions && q.subQuestions.length > 0 && (
                      <div className="space-y-1.5 pl-4 pt-1">
                        {q.subQuestions.map((sub, sIdx) => (
                          <div key={sub.id || sIdx} className="flex items-start justify-between gap-2 text-xs">
                            <div className="flex items-start gap-1.5 flex-1">
                              <span className="font-bold font-sans text-slate-700">{sub.label}</span>
                              <div className="text-slate-900 flex-1">
                                <MathRenderer text={sub.text} />
                              </div>
                            </div>
                            {sub.marks && (
                              <span className="text-slate-500 font-mono-code text-[11px] italic shrink-0">
                                ({sub.marks} {parseInt(sub.marks) === 1 ? 'mark' : 'marks'})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <Sigma className="w-10 h-10 text-slate-300 stroke-1" />
                  <p className="text-xs font-semibold text-slate-500">No questions rendered yet.</p>
                  <p className="text-[11px] max-w-xs text-slate-400">
                    Fix any JSON syntax errors or select one of the matrix/calculus presets above to see the live rendered math paper questions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Target Section & Insertion Mode */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <div className="flex items-center gap-1 text-xs">
              <span className="font-semibold text-slate-700">Target Section:</span>
              <select
                value={targetSectionId}
                onChange={(e) => setTargetSectionId(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.title} ({sec.subtitle || sec.type}) - {sec.questions.length} Qs
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="font-semibold text-slate-700">Position:</span>
              <select
                value={insertMode}
                onChange={(e) => setInsertMode(e.target.value as any)}
                className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="append">Append to End (+)</option>
                <option value="prepend">Insert at Top (↑)</option>
                <option value="replace">Replace All in Section (⚠️)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!parseResult.success || parseResult.questions.length === 0}
              onClick={handleExecuteInsert}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                parseResult.success && parseResult.questions.length > 0
                  ? 'bg-slate-900 text-white hover:bg-slate-800 ring-1 ring-slate-800'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              <span>
                Generate & Insert {parseResult.questions.length || 0} Question{parseResult.questions.length === 1 ? '' : 's'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonQuestionModal;
