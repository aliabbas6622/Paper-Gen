import React, { useState, useRef, useEffect } from 'react';
import { ExamPaperData } from './types/exam';
import { DEFAULT_EXAM_DATA, PRESET_TEMPLATES } from './data/defaultExam';
import { ExamHeaderEditor } from './components/ExamHeaderEditor';
import { FormattingEditor } from './components/FormattingEditor';
import { SectionEditor } from './components/SectionEditor';
import { ExamPaperPreview } from './components/ExamPaperPreview';
import { Toolbar } from './components/Toolbar';
import { exportToWord } from './utils/docxExport';
import {
  FileText,
  Sliders,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Download,
  Printer,
  HelpCircle
} from 'lucide-react';

export default function App() {
  const [examData, setExamData] = useState<ExamPaperData>(() => {
    const saved = localStorage.getItem('exam_paper_data_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved exam data', e);
      }
    }
    return DEFAULT_EXAM_DATA;
  });

  const [activeTab, setActiveTab] = useState<'sections' | 'header' | 'formatting'>('sections');
  const [zoomFactor, setZoomFactor] = useState<number>(1);
  const [previewMode, setPreviewMode] = useState<'split' | 'preview-only'>('split');
  const [showPrintTips, setShowPrintTips] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Auto-save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('exam_paper_data_v1', JSON.stringify(examData));
    } catch (e) {
      console.warn('Unable to persist exam data to localStorage', e);
    }
  }, [examData]);

  const handleExportWord = async () => {
    try {
      await exportToWord(examData);
    } catch (error) {
      console.error('Word export error:', error);
      alert('Failed to generate Word file. Please check console for details.');
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleReset = () => {
    if (window.confirm('Reset all exam contents back to the default Intermediate Computer Science sample?')) {
      setExamData(DEFAULT_EXAM_DATA);
    }
  };

  const handleSelectPreset = (index: number) => {
    const preset = PRESET_TEMPLATES[index];
    if (preset && preset.data) {
      setExamData({
        ...DEFAULT_EXAM_DATA,
        ...preset.data,
        updatedAt: new Date().toISOString(),
      } as ExamPaperData);
    }
  };

  // Calculate question count and marks
  const totalQuestionsCount = examData.sections
    .filter((s) => s.enabled)
    .reduce((acc, s) => acc + s.questions.length, 0);

  return (
    <div className="min-h-screen bg-slate-100/80 flex flex-col font-ui selection:bg-slate-900 selection:text-white">
      {/* Top Application Toolbar */}
      <Toolbar
        onExportWord={handleExportWord}
        onPrintPDF={handlePrintPDF}
        onReset={handleReset}
        onSelectPreset={handleSelectPreset}
        zoomFactor={zoomFactor}
        setZoomFactor={setZoomFactor}
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        totalMarksInfo={{
          total: totalQuestionsCount,
          target: examData.header.maxMarks,
        }}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Customization & Content Editor */}
        {previewMode === 'split' && (
          <div className="no-print lg:col-span-5 flex flex-col space-y-3">
            {/* Editor Navigation Tabs - Geometric Segmented Control */}
            <div className="bg-white p-1 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('sections')}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'sections'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Sections (A, B, C)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('header')}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'header'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Exam Header</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('formatting')}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'formatting'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Margins & Font</span>
              </button>
            </div>

            {/* Active Tab Panel */}
            <div className="overflow-y-auto max-h-[calc(100vh-145px)] pr-1 space-y-3">
              {activeTab === 'sections' && (
                <SectionEditor
                  sections={examData.sections}
                  onChange={(newSections) => setExamData({ ...examData, sections: newSections })}
                  numberStyle={examData.formatting.questionNumberStyle}
                />
              )}

              {activeTab === 'header' && (
                <ExamHeaderEditor
                  header={examData.header}
                  onChange={(newHeader) => setExamData({ ...examData, header: newHeader })}
                />
              )}

              {activeTab === 'formatting' && (
                <FormattingEditor
                  formatting={examData.formatting}
                  onChange={(newFormatting) => setExamData({ ...examData, formatting: newFormatting })}
                />
              )}

              {/* Quick helper note - Geometric Callout */}
              <div className="bg-slate-900 text-slate-100 rounded-xl p-3 text-xs flex items-start gap-2.5 shadow-xs border border-slate-800">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-semibold text-white">Printer & Export Ready:</span> Section A features dedicated MCQ matrix layouts (1, 2, or 4 columns), Section B formats short questions, and Section C organizes long multi-part theory questions in authentic Times New Roman.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Live Paper Document Preview */}
        <div
          className={`${
            previewMode === 'split' ? 'lg:col-span-7' : 'lg:col-span-12'
          } flex flex-col`}
        >
          <div className="geometric-grid-bg p-2 sm:p-4 rounded-2xl border border-slate-300/80 min-h-[calc(100vh-110px)] flex flex-col items-center justify-start overflow-auto shadow-inner">
            {/* Top preview toolbar pill */}
            <div className="no-print w-full max-w-[8.5in] flex items-center justify-between mb-3 px-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Document Canvas:
                </span>
                <span className="bg-white/95 px-2.5 py-0.5 rounded-md border border-slate-200 text-[11px] font-times font-bold text-slate-800 shadow-2xs">
                  {examData.formatting.fontFamily} • {examData.formatting.baseFontSize}pt
                </span>
                <span className="bg-white/95 px-2 py-0.5 rounded-md border border-slate-200 text-[11px] font-mono-code text-slate-600 shadow-2xs">
                  Margins: {examData.formatting.marginTop}" / {examData.formatting.marginLeft}"
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrintTips(!showPrintTips)}
                  className="text-slate-700 hover:text-slate-900 bg-white/90 hover:bg-white px-2.5 py-1 rounded-md border border-slate-200 text-[11px] font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  PDF Print Guide
                </button>
              </div>
            </div>

            {/* Print tips banner */}
            {showPrintTips && (
              <div className="no-print w-full max-w-[8.5in] mb-3 bg-white p-3.5 rounded-xl border border-slate-300 text-xs text-slate-700 shadow-sm space-y-2 animate-fadeIn">
                <div className="font-semibold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Printer className="w-3.5 h-3.5 text-slate-700" />
                    PDF & Physical Print Configuration Guide:
                  </span>
                  <button onClick={() => setShowPrintTips(false)} className="text-slate-400 hover:text-slate-800 font-bold p-1">✕</button>
                </div>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>Destination:</strong> Select <em>"Save as PDF"</em> or choose your connected printer.</li>
                  <li><strong>Margins:</strong> In the browser print dialog, select <em>Margins: None</em> or <em>Default</em> so it strictly respects the inch measurements defined in this editor.</li>
                  <li><strong>Background graphics:</strong> Check the box for <em>"Background graphics"</em> to ensure header divider lines and watermarks render crisply.</li>
                </ul>
              </div>
            )}

            {/* Render Actual Document Paper */}
            <div className="exam-sheet-container w-full flex justify-center py-2">
              <ExamPaperPreview
                ref={previewRef}
                examData={examData}
                zoomFactor={zoomFactor}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
