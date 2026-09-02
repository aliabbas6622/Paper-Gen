import React, { useState, useEffect } from 'react';
import { ExamPaperData, CustomTemplate, ExamQuestion, ExamSection, ExamHeader, FormattingOptions } from './types/exam';
import { DEFAULT_EXAM_DATA, PRESET_TEMPLATES } from './data/defaultExam';
import { AppPage } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { QuestionsPage } from './pages/QuestionsPage';
import { PreviewPage } from './pages/PreviewPage';
import { HeaderPage } from './pages/HeaderPage';
import { FormattingPage } from './pages/FormattingPage';
import { JsonStudioPage } from './pages/JsonStudioPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { ExamPaperPreview } from './components/ExamPaperPreview';
import { exportToWord } from './utils/docxExport';
import confetti from 'canvas-confetti';

export default function App() {
  // Navigation: Active Page State (persisted in localStorage)
  const [activePage, setActivePage] = useState<AppPage>(() => {
    const saved = localStorage.getItem('exam_active_page_v2');
    if (saved && ['questions', 'preview', 'header', 'formatting', 'json-studio', 'templates'].includes(saved)) {
      return saved as AppPage;
    }
    return 'questions';
  });

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('exam_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Mobile sidebar open state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

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

  // Save active page preference
  useEffect(() => {
    try {
      localStorage.setItem('exam_active_page_v2', activePage);
    } catch (e) {
      console.warn('Unable to persist active page', e);
    }
  }, [activePage]);

  // Save sidebar collapse preference
  useEffect(() => {
    try {
      localStorage.setItem('exam_sidebar_collapsed', String(isSidebarCollapsed));
    } catch (e) {
      console.warn('Unable to persist sidebar state', e);
    }
  }, [isSidebarCollapsed]);

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

  // Global Export Handlers
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
      confetti({ particleCount: 30, spread: 50 });
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
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.8 } });
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

  const handleInsertJsonQuestions = (
    targetSecId: string,
    newQuestions: ExamQuestion[],
    mode: 'append' | 'prepend' | 'replace'
  ) => {
    const secIdx = examData.sections.findIndex((s) => s.id === targetSecId);
    if (secIdx === -1) return;

    const targetSec = examData.sections[secIdx];
    let updatedQuestions: ExamQuestion[] = [];

    if (mode === 'replace') {
      updatedQuestions = newQuestions;
    } else if (mode === 'prepend') {
      updatedQuestions = [...newQuestions, ...targetSec.questions];
    } else {
      updatedQuestions = [...targetSec.questions, ...newQuestions];
    }

    const newSections = [...examData.sections];
    newSections[secIdx] = {
      ...targetSec,
      questions: updatedQuestions,
    };
    setExamData({
      ...examData,
      sections: newSections,
      updatedAt: new Date().toISOString(),
    });
  };

  // Section update helper
  const handleUpdateSections = (newSections: ExamSection[]) => {
    setExamData({
      ...examData,
      sections: newSections,
      updatedAt: new Date().toISOString(),
    });
  };

  // Header update helper
  const handleUpdateHeader = (newHeader: ExamHeader) => {
    setExamData({
      ...examData,
      header: newHeader,
      updatedAt: new Date().toISOString(),
    });
  };

  // Formatting update helper
  const handleUpdateFormatting = (newFormatting: FormattingOptions) => {
    setExamData({
      ...examData,
      formatting: newFormatting,
      updatedAt: new Date().toISOString(),
    });
  };

  // Calculate totals
  const totalQuestionsCount = examData.sections
    .filter((s) => s.enabled)
    .reduce((acc, s) => acc + s.questions.length, 0);

  return (
    <div className="min-h-screen h-screen flex flex-row overflow-hidden bg-slate-100/70 font-ui selection:bg-slate-900 selection:text-white">
      {/* Persistent / Collapsible Left Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onExportWord={handleExportWord}
        onPrintPDF={handlePrintPDF}
        onReset={handleReset}
        totalQuestions={totalQuestionsCount}
        totalMarks={examData.header.maxMarks}
        subjectTitle={examData.header.subject || examData.header.examTitle}
        institutionName={examData.header.institutionName}
        templateCount={customTemplates.length}
        sectionsCount={examData.sections.length}
      />

      {/* Main App Content Viewport (Header + Page Body) */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <TopBar
          activePage={activePage}
          setActivePage={setActivePage}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          onExportWord={handleExportWord}
          onPrintPDF={handlePrintPDF}
          onReset={handleReset}
          subjectTitle={examData.header.subject || examData.header.examTitle}
          totalMarks={examData.header.maxMarks}
          totalQuestions={totalQuestionsCount}
        />

        {/* Main Multi-Page Screen Area */}
        <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Page 1: Questions & Sections */}
          {activePage === 'questions' && (
            <QuestionsPage
              examData={examData}
              onUpdateSections={handleUpdateSections}
              onNavigateToPreview={() => setActivePage('preview')}
              onNavigateToJsonStudio={() => setActivePage('json-studio')}
            />
          )}

          {/* Page 2: Preview & Print */}
          {activePage === 'preview' && (
            <PreviewPage examData={examData} />
          )}

          {/* Page 3: Exam Header & Identity */}
          {activePage === 'header' && (
            <HeaderPage
              header={examData.header}
              formatting={examData.formatting}
              onChangeHeader={handleUpdateHeader}
              onNavigateToPreview={() => setActivePage('preview')}
            />
          )}

          {/* Page 4: Page Setup & Typography */}
          {activePage === 'formatting' && (
            <FormattingPage
              formatting={examData.formatting}
              onChangeFormatting={handleUpdateFormatting}
              onNavigateToPreview={() => setActivePage('preview')}
            />
          )}

          {/* Page 5: JSON Script Studio */}
          {activePage === 'json-studio' && (
            <JsonStudioPage
              sections={examData.sections}
              onInsertQuestions={handleInsertJsonQuestions}
              onNavigateToQuestions={() => setActivePage('questions')}
            />
          )}

          {/* Page 6: Template Library */}
          {activePage === 'templates' && (
            <TemplatesPage
              currentExamData={examData}
              customTemplates={customTemplates}
              onLoadPreset={handleSelectPreset}
              onLoadCustomTemplate={handleLoadCustomTemplate}
              onSaveTemplate={handleSaveTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onNavigateToQuestions={() => setActivePage('questions')}
            />
          )}
        </main>
      </div>

      {/* Hidden print-only container: Ensures browser print always prints the exam paper regardless of which page the user is viewing */}
      <div className="hidden print-only">
        <ExamPaperPreview examData={examData} zoomFactor={1} />
      </div>
    </div>
  );
}
