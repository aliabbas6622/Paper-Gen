import React from 'react';
import {
  Layers,
  Eye,
  FileText,
  Sliders,
  FileCode2,
  BookOpen,
  FileDown,
  Printer,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  FileCheck,
  Hash,
  Award
} from 'lucide-react';
import { AppPage } from './Navbar';
import confetti from 'canvas-confetti';

interface SidebarProps {
  activePage: AppPage;
  setActivePage: (page: AppPage) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onExportWord: () => void;
  onPrintPDF: () => void;
  onReset: () => void;
  totalQuestions: number;
  totalMarks: string;
  subjectTitle?: string;
  institutionName?: string;
  templateCount: number;
  sectionsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onExportWord,
  onPrintPDF,
  onReset,
  totalQuestions,
  totalMarks,
  subjectTitle,
  institutionName,
  templateCount,
  sectionsCount,
}) => {
  const handleExportWordWithConfetti = () => {
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.8 } });
    onExportWord();
  };

  const handlePrintPDFWithConfetti = () => {
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.8 } });
    onPrintPDF();
  };

  const navGroups = [
    {
      group: 'Workspace',
      items: [
        {
          id: 'questions' as AppPage,
          label: 'Questions & Sections',
          icon: Layers,
          badge: totalQuestions > 0 ? `${totalQuestions} Qs` : undefined,
          description: 'Compose sections, equations & questions',
        },
        {
          id: 'preview' as AppPage,
          label: 'Preview & Print',
          icon: Eye,
          badge: 'Canvas',
          description: 'Official A4 / Letter document layout',
        },
        {
          id: 'json-studio' as AppPage,
          label: 'JSON Studio',
          icon: FileCode2,
          badge: 'LaTeX',
          description: 'Batch scripts, matrices & formula parser',
        },
      ],
    },
    {
      group: 'Configuration',
      items: [
        {
          id: 'header' as AppPage,
          label: 'Exam Header',
          icon: FileText,
          description: 'Board title, duration & roll boxes',
        },
        {
          id: 'formatting' as AppPage,
          label: 'Page Setup & Fonts',
          icon: Sliders,
          description: 'Times New Roman, margins & sizes',
        },
        {
          id: 'templates' as AppPage,
          label: 'Template Library',
          icon: BookOpen,
          badge: templateCount > 0 ? templateCount : undefined,
          description: 'Standard presets & saved blueprints',
        },
      ],
    },
  ];

  const handleNavClick = (pageId: AppPage) => {
    setActivePage(pageId);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-slate-900 text-slate-100 select-none">
      {/* Top Header / Brand */}
      <div className="shrink-0 p-3 sm:p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-times font-bold text-lg shadow-md shrink-0">
              T
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-sm text-white tracking-tight font-ui truncate">
                    Exam Formatter
                  </h1>
                  <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono-code font-bold px-1.5 py-0.2 rounded border border-cyan-500/30">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  Academic Paper Designer
                </p>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          {isMobileOpen && (
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Desktop Collapse / Expand toggle button in header */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Current Exam Summary Badge (only when expanded) */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="mt-3.5 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs space-y-1.5">
            <div className="flex items-center justify-between gap-1 text-[11px]">
              <span className="text-slate-400 font-medium truncate">Current Paper:</span>
              <span className="font-bold text-cyan-300 font-mono-code text-[11px]">
                {totalMarks || '100'} Marks
              </span>
            </div>
            <div className="font-semibold text-white truncate text-xs">
              {subjectTitle || 'Examination Subject'}
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-700/60 text-[10px] text-slate-400 font-mono-code">
              <span>{sectionsCount} Secs</span>
              <span>•</span>
              <span>{totalQuestions} Questions</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2.5 py-3 space-y-4 custom-scrollbar">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {(!isCollapsed || isMobileOpen) && (
              <h2 className="px-2.5 text-[10px] font-mono-code font-bold uppercase tracking-wider text-slate-400 mb-1">
                {group.group}
              </h2>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group text-left ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/90'
                    }`}
                    title={isCollapsed && !isMobileOpen ? `${item.label} - ${item.description}` : undefined}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-300'
                      }`}
                    />

                    {(!isCollapsed || isMobileOpen) && (
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
                        <div className="truncate">
                          <div className="leading-tight truncate">{item.label}</div>
                        </div>

                        {item.badge && (
                          <span
                            className={`shrink-0 text-[10px] font-mono-code font-bold px-1.5 py-0.2 rounded-full leading-none ${
                              isActive
                                ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-400/40'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions: Export Word, Print PDF, Reset */}
      <div className="shrink-0 p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
        {(!isCollapsed || isMobileOpen) ? (
          <div className="space-y-1.5">
            {/* Export Word Button */}
            <button
              type="button"
              onClick={handleExportWordWithConfetti}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-100 border border-blue-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
              title="Download formatted Microsoft Word .docx file"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-400" />
              <span>Export Word (.docx)</span>
            </button>

            {/* Print / Save PDF Button */}
            <button
              type="button"
              onClick={handlePrintPDFWithConfetti}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              title="Print or Save as Printer-Ready PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-900" />
              <span>Print / Save PDF</span>
            </button>

            {/* Reset Exam Button */}
            <button
              type="button"
              onClick={onReset}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-rose-300 hover:bg-slate-800/60 rounded-lg text-[11px] transition-colors cursor-pointer"
              title="Reset exam to default preset"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Exam</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2 flex flex-col items-center">
            <button
              type="button"
              onClick={handleExportWordWithConfetti}
              className="p-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-xl transition-all cursor-pointer border border-blue-500/30"
              title="Export Word (.docx)"
            >
              <FileDown className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handlePrintPDFWithConfetti}
              className="p-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl transition-all cursor-pointer shadow-sm"
              title="Print / PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onReset}
              className="p-2 text-slate-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Reset Exam"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`no-print hidden lg:flex flex-col shrink-0 h-full border-r border-slate-800 transition-all duration-300 z-30 ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="no-print lg:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex animate-fadeIn"
          onClick={() => setIsMobileOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full shadow-2xl animate-slideRight"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
