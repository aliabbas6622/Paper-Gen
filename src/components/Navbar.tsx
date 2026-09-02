import React from 'react';
import {
  Layers,
  Eye,
  FileText,
  Sliders,
  FileCode2,
  BookmarkPlus,
  FileDown,
  Printer,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type AppPage = 'questions' | 'preview' | 'header' | 'formatting' | 'json-studio' | 'templates';

interface NavbarProps {
  activePage: AppPage;
  setActivePage: (page: AppPage) => void;
  onExportWord: () => void;
  onPrintPDF: () => void;
  onReset: () => void;
  totalQuestions: number;
  totalMarks: string;
  subjectTitle?: string;
  templateCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  onExportWord,
  onPrintPDF,
  onReset,
  totalQuestions,
  totalMarks,
  subjectTitle,
  templateCount,
}) => {
  const handleExportWordWithConfetti = () => {
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.8 } });
    onExportWord();
  };

  const handlePrintPDFWithConfetti = () => {
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.8 } });
    onPrintPDF();
  };

  const navItems: { id: AppPage; label: string; icon: React.FC<{ className?: string }>; badge?: string | number }[] = [
    { id: 'questions', label: 'Questions & Sections', icon: Layers, badge: totalQuestions > 0 ? totalQuestions : undefined },
    { id: 'preview', label: 'Preview & Print', icon: Eye },
    { id: 'header', label: 'Exam Header', icon: FileText },
    { id: 'formatting', label: 'Page Setup & Fonts', icon: Sliders },
    { id: 'json-studio', label: 'JSON Studio', icon: FileCode2 },
    { id: 'templates', label: 'Template Library', icon: BookOpen, badge: templateCount > 0 ? templateCount : undefined },
  ];

  return (
    <header className="no-print bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
      {/* Top Bar: Brand, Current Subject, Marks & Quick Export Actions */}
      <div className="max-w-[1750px] mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-3 border-b border-slate-100">
        {/* Left: Brand & Subject */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-times font-bold text-base shadow-sm ring-1 ring-slate-800 shrink-0">
            T
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-900 text-xs sm:text-sm leading-tight tracking-tight font-ui">
                Exam Paper Formatter
              </span>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-1.5 py-0.2 rounded border border-slate-200 uppercase tracking-wider font-mono-code hidden xs:inline">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium truncate">
              <span className="truncate max-w-[180px] sm:max-w-[280px] text-slate-700 font-semibold">
                {subjectTitle || 'Examination Paper'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-mono-code text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                {totalMarks || '30'} Marks
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Global Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onReset}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200 hidden sm:flex items-center"
            title="Reset exam to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Export Word (.docx) */}
          <button
            type="button"
            onClick={handleExportWordWithConfetti}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            title="Download formatted Microsoft Word .docx file"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-700" />
            <span className="hidden sm:inline">Export Word</span>
            <span className="sm:hidden">Word</span>
          </button>

          {/* Print / Save PDF */}
          <button
            type="button"
            onClick={handlePrintPDFWithConfetti}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer ring-1 ring-slate-800"
            title="Print or Save as Printer-Ready PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Bottom Bar: Dedicated Multi-Page Navigation Tabs */}
      <div className="max-w-[1750px] mx-auto px-2 sm:px-4 py-1 flex items-center overflow-x-auto custom-scrollbar">
        <nav className="flex items-center gap-1 min-w-max py-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-300' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono-code font-bold px-1.5 py-0.2 rounded-full leading-none ${
                      isActive
                        ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
