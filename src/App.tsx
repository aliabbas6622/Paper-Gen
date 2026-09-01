import React, { useState, useRef, useEffect } from 'react';
import { ExamPaperData, CustomTemplate } from './types/exam';
import { DEFAULT_EXAM_DATA, PRESET_TEMPLATES } from './data/defaultExam';
import { ExamHeaderEditor } from './components/ExamHeaderEditor';
import { FormattingEditor } from './components/FormattingEditor';
import { SectionEditor } from './components/SectionEditor';
import { ExamPaperPreview } from './components/ExamPaperPreview';
import { Toolbar } from './components/Toolbar';
import { TemplateManagerModal } from './components/TemplateManagerModal';
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
  HelpCircle,
  BookmarkPlus,
  Eye,
  Edit3,
  Columns,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Main Exam Data state with localStorage persistence
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

  // Custom templates stored in localStorage
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(() => {
    const saved = localStorage.getItem('exam_custom_templates_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse custom templates', e);
      }
    }
    return [];
  });

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('exam_header_collapsed_v1');
    return saved === 'true';
  });

  const [activeTab, setActiveTab] = useState<'sections' | 'header' | 'formatting'>('sections');
  const [zoomFactor, setZoomFactor] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 0.7;
    }
    return 1;
  });
  const [previewMode, setPreviewMode] = useState<'split' | 'preview-only' | 'editor-only'>('split');
  const [showPrintTips, setShowPrintTips] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Auto-save exam state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('exam_paper_data_v1', JSON.stringify(examData));
    } catch (e) {
      console.warn('Unable to persist exam data to localStorage', e);
    }
  }, [examData]);

  // Persist custom templates
  useEffect(() => {
    try {
      localStorage.setItem('exam_custom_templates_v1', JSON.stringify(customTemplates));
    } catch (e) {
      console.warn('Unable to persist custom templates to localStorage', e);
    }
  }, [customTemplates]);

  // Persist header collapsed preference
  useEffect(() => {
    try {
      localStorage.setItem('exam_header_collapsed_v1', String(isHeaderCollapsed));
    } catch (e) {
      console.warn('Unable to persist header collapsed preference', e);
    }
  }, [isHeaderCollapsed]);

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

  const handleSaveTemplate = (newTemplate: CustomTemplate) => {
    setCustomTemplates((prev) => {
      const existingIdx = prev.findIndex((t) => t.id === newTemplate.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newTemplate;
        return updated;
      }
      return [newTemplate, ...prev];
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    setCustomTemplates((prev) => prev.filter((t) => t.id !== templateId));
  };

  const handleLoadCustomTemplate = (template: CustomTemplate) => {
    setExamData({
      ...examData,
      header: template.header,
      formatting: template.formatting,
      sections: template.sections,
      updatedAt: new Date().toISOString(),
    });
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
  };

  // Calculate question count and total marks
  const totalQuestionsCount = examData.sections
    .filter((s) => s.enabled)
    .reduce((acc, s) => acc + s.questions.length, 0);

  return (
    <div className="min-h-screen h-screen flex flex-col overflow-hidden bg-slate-100/70 font-ui selection:bg-slate-900 selection:text-white">
      {/* Top Application Toolbar (Collapsible) */}
      <Toolbar
        onExportWord={handleExportWord}
        onPrintPDF={handlePrintPDF}
        onReset={handleReset}
        onSelectPreset={handleSelectPreset}
        customTemplates={customTemplates}
        onLoadCustomTemplate={handleLoadCustomTemplate}
        onOpenTemplateManager={() => setIsTemplateModalOpen(true)}
        zoomFactor={zoomFactor}
        setZoomFactor={setZoomFactor}
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        totalMarksInfo={{
          total: totalQuestionsCount,
          target: examData.header.maxMarks,
        }}
        paperSubjectTitle={examData.header.subject || examData.header.examTitle}
        isHeaderCollapsed={isHeaderCollapsed}
        setIsHeaderCollapsed={setIsHeaderCollapsed}
      />

      {/* Mobile / Tablet Responsive Mode Switcher Bar */}
      <div className="lg:hidden no-print px-3 py-1.5 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shrink-0 z-20 shadow-2xs">
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setPreviewMode('editor-only')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              previewMode === 'editor-only'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewMode('split')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              previewMode === 'split'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewMode('preview-only')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              previewMode === 'preview-only'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsTemplateModalOpen(true)}
          className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
        >
          <BookmarkPlus className="w-3.5 h-3.5 text-amber-700" />
          <span className="hidden sm:inline">Templates</span>
        </button>
      </div>

      {/* Main Workspace Layout with Independent Left and Right Scrolling Containers */}
      <main className="flex-1 min-h-0 w-full max-w-[1750px] mx-auto p-2 sm:p-3.5 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 overflow-hidden">
        {/* Left Side: Customization & Content Editor (Independent Scroll Container) */}
        <div
          className={`${
            previewMode === 'preview-only'
              ? 'hidden'
              : previewMode === 'editor-only'
              ? 'lg:col-span-12'
              : 'lg:col-span-5'
          } h-full min-h-0 flex flex-col overflow-hidden no-print`}
        >
          {/* Editor Navigation Tabs - Geometric Segmented Control */}
          <div className="shrink-0 mb-2.5 bg-white p-1 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('sections')}
              className={`flex-1 py-1.5 sm:py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
              className={`flex-1 py-1.5 sm:py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
              className={`flex-1 py-1.5 sm:py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'formatting'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Margins & Font</span>
            </button>
          </div>

          {/* Active Tab Panel with Independent Vertical Scrollbar */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2 space-y-3 custom-scrollbar">
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

        {/* Right Side: Live Paper Document Preview (Independent Scroll Container) */}
        <div
          className={`${
            previewMode === 'editor-only'
              ? 'hidden'
              : previewMode === 'preview-only'
              ? 'lg:col-span-12'
              : 'lg:col-span-7'
          } h-full min-h-0 flex flex-col overflow-hidden`}
        >
          <div className="geometric-grid-bg h-full min-h-0 flex-1 overflow-y-auto overflow-x-auto p-2 sm:p-4 rounded-2xl border border-slate-300/80 flex flex-col items-center justify-start shadow-inner custom-scrollbar">
            {/* Top preview toolbar pill */}
            <div className="no-print w-full max-w-[8.5in] flex items-center justify-between mb-3 px-2 text-xs text-slate-600 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Document Canvas:
                </span>
                <span className="bg-white/95 px-2.5 py-0.5 rounded-md border border-slate-200 text-[11px] font-times font-bold text-slate-800 shadow-2xs">
                  {examData.formatting.fontFamily} • {examData.formatting.baseFontSize}pt
                </span>
                <span className="bg-white/95 px-2 py-0.5 rounded-md border border-slate-200 text-[11px] font-mono-code text-slate-600 shadow-2xs hidden sm:inline">
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
                  <span>PDF Print Guide</span>
                </button>
              </div>
            </div>

            {/* Print tips banner */}
            {showPrintTips && (
              <div className="no-print w-full max-w-[8.5in] mb-3 bg-white p-3.5 rounded-xl border border-slate-300 text-xs text-slate-700 shadow-sm space-y-2 animate-fadeIn shrink-0">
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

      {/* Save & Manage Custom Templates Modal */}
      <TemplateManagerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        currentExamData={examData}
        onLoadTemplate={handleLoadCustomTemplate}
        customTemplates={customTemplates}
        onSaveTemplate={handleSaveTemplate}
        onDeleteTemplate={handleDeleteTemplate}
      />
    </div>
  );
}
