import React from 'react';
import {
  Menu,
  FileDown,
  Printer,
  RotateCcw,
  Sparkles,
  Layers,
  Eye,
  FileText,
  Sliders,
  FileCode2,
  BookOpenText,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { AppPage } from './Navbar';
import confetti from 'canvas-confetti';

interface TopBarProps {
  activePage: AppPage;
  setActivePage: (page: AppPage) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  setIsMobileSidebarOpen: (open: boolean) => void;
  onExportWord: () => void;
  onPrintPDF: () => void;
  onReset: () => void;
  subjectTitle?: string;
  totalMarks: string;
  totalQuestions: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activePage,
  setActivePage,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  setIsMobileSidebarOpen,
  onExportWord,
  onPrintPDF,
  onReset,
  subjectTitle,
  totalMarks,
  totalQuestions,
}) => {
  const handleExportWord = () => {
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.8 } });
    onExportWord();
  };

  const handlePrintPDF = () => {
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.8 } });
    onPrintPDF();
  };

  const pageMeta: Record<AppPage, { title: string; subtitle: string; icon: React.FC<{ className?: string }> }> = {
    questions: {
      title: 'Questions & Sections',
      subtitle: 'Compose sections, equations, choices, and mark allocations',
      icon: Layers,
    },
    preview: {
      title: 'Preview & Print',
      subtitle: 'Official academic paper preview, scaling, and PDF printing',
      icon: Eye,
    },
    header: {
      title: 'Exam Header',
      subtitle: 'Board/Institution name, course code, duration, and candidate roll boxes',
      icon: FileText,
    },
    formatting: {
      title: 'Page Setup & Fonts',
      subtitle: 'Times New Roman typography, base font size, and paper margins',
      icon: Sliders,
    },
    'json-studio': {
      title: 'JSON Script Studio',
      subtitle: 'High-speed LaTeX, matrices, and batch question scripts',
      icon: FileCode2,
    },
    templates: {
      title: 'Template Library',
      subtitle: 'Official board presets, exam blueprints, and custom saved layouts',
      icon: BookOpenText,
    },
  };

  const current = pageMeta[activePage];
  const CurrentIcon = current.icon;

  return (
    <header className="no-print bg-[#fbfaf6] border-b border-[#d9d5ca] sticky top-0 z-20 h-16 shrink-0 flex items-center justify-between px-3 sm:px-6">
      {/* Left: Sidebar Toggle & Page Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Desktop Collapse / Expand Toggle */}
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Active Page Indicator & Breadcrumb */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center shrink-0">
            <CurrentIcon className="w-3.5 h-3.5 text-slate-700" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-tight">
                {current.title}
              </h1>
              <span className="hidden md:inline-block text-[11px] text-slate-400">•</span>
              <span className="hidden md:inline text-[11px] text-slate-500 truncate max-w-sm">
                {current.subtitle}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Quick Stats & Export Buttons */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Current Paper Metadata Pill */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
          <span className="font-semibold text-slate-700 truncate max-w-[160px]">
            {subjectTitle || 'Exam Paper'}
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-mono-code font-bold text-slate-800">
            {totalMarks || '100'}M
          </span>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200 hidden md:flex items-center"
          title="Reset exam to default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Export Word (.docx) */}
        <button
          type="button"
          onClick={handleExportWord}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          title="Download formatted Microsoft Word .docx file"
        >
          <FileDown className="w-3.5 h-3.5 text-blue-700" />
          <span className="hidden xs:inline">Word</span>
        </button>

        {/* Print / Save PDF */}
        <button
          type="button"
          onClick={handlePrintPDF}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer ring-1 ring-slate-800"
          title="Print or Save as Printer-Ready PDF"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / PDF</span>
        </button>
      </div>
    </header>
  );
};
