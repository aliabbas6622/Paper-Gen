import React, { useState } from 'react';
import { ExamHeader } from '../types/exam';
import {
  Building2,
  Calendar,
  Clock,
  Award,
  AlignCenter,
  AlignLeft,
  ChevronDown,
  ChevronUp,
  UserCheck,
  SplitSquareVertical
} from 'lucide-react';

interface ExamHeaderEditorProps {
  header: ExamHeader;
  onChange: (header: ExamHeader) => void;
}

export const ExamHeaderEditor: React.FC<ExamHeaderEditorProps> = ({ header, onChange }) => {
  const [isMainHeaderOpen, setIsMainHeaderOpen] = useState(true);
  const [isMetadataOpen, setIsMetadataOpen] = useState(true);
  const [isCandidateFieldsOpen, setIsCandidateFieldsOpen] = useState(false);

  const update = (field: keyof ExamHeader, value: any) => {
    onChange({ ...header, [field]: value });
  };

  return (
    <div className="space-y-3 font-ui">
      {/* Panel 1: Main Header & Alignment (Collapsible) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors select-none">
          <button
            type="button"
            onClick={() => setIsMainHeaderOpen(!isMainHeaderOpen)}
            className="flex items-center gap-2 flex-1 text-left cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-slate-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-xs">
                Main Examination Title & Headers
              </h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[280px]">
                {header.examTitle || 'EXAMINATION 2026-27'}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {/* Header Alignment quick switch */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs border border-slate-200">
              <button
                type="button"
                onClick={() => update('headerAlignment', 'center')}
                className={`p-1 rounded-md cursor-pointer transition-all ${
                  header.headerAlignment === 'center'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Center Align Header"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => update('headerAlignment', 'left')}
                className={`p-1 rounded-md cursor-pointer transition-all ${
                  header.headerAlignment === 'left'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Left Align Header"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsMainHeaderOpen(!isMainHeaderOpen)}
              className="p-1 text-slate-500 cursor-pointer"
            >
              {isMainHeaderOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isMainHeaderOpen && (
          <div className="p-4 pt-1 border-t border-slate-100 space-y-3 bg-white">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Main Examination Title (Header Line 1)
              </label>
              <input
                type="text"
                value={header.examTitle}
                onChange={(e) => update('examTitle', e.target.value)}
                placeholder="e.g. INTERMEDIATE EXAMINATION 2026-27"
                className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-times uppercase tracking-wide bg-white font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Term / Month Sub-heading (Header Line 2)
                </label>
                <input
                  type="text"
                  value={header.subTitle}
                  onChange={(e) => update('subTitle', e.target.value)}
                  placeholder="e.g. MONTHLY EXAMINATION: AUGUST"
                  className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-times uppercase bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Name (Header Line 3)
                </label>
                <input
                  type="text"
                  value={header.subject}
                  onChange={(e) => update('subject', e.target.value)}
                  placeholder="e.g. COMPUTER SCIENCE"
                  className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-times uppercase font-bold bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Paper Code / Title (Header Line 4)
                </label>
                <input
                  type="text"
                  value={header.paperCode}
                  onChange={(e) => update('paperCode', e.target.value)}
                  placeholder="e.g. SUBJECT: COMPUTER PAPER I"
                  className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-times uppercase bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institution / School Name (Optional)
                </label>
                <input
                  type="text"
                  value={header.institutionName}
                  onChange={(e) => update('institutionName', e.target.value)}
                  placeholder="e.g. BOARD OF SECONDARY EDUCATION"
                  className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-times bg-white font-bold"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel 2: Paper Metadata Bar (Date, Duration, Max Marks) (Collapsible) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsMetadataOpen(!isMetadataOpen)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-xs">
              Paper Metadata Bar (Date, Duration, Marks)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono-code font-semibold">
              {header.date || 'Date'} • {header.duration || 'Duration'} • {header.maxMarks} Marks
            </span>
            <div className="p-1 text-slate-500">
              {isMetadataOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </button>

        {isMetadataOpen && (
          <div className="p-4 pt-1 border-t border-slate-100 space-y-3 bg-white">
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" /> Date
                </label>
                <input
                  type="text"
                  value={header.date}
                  onChange={(e) => update('date', e.target.value)}
                  placeholder="11-AUGUST-2026"
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-times bg-white font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" /> Duration
                </label>
                <input
                  type="text"
                  value={header.duration}
                  onChange={(e) => update('duration', e.target.value)}
                  placeholder="1 Hour"
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-times bg-white font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Award className="w-3 h-3 text-slate-500" /> Max. Marks
                </label>
                <input
                  type="text"
                  value={header.maxMarks}
                  onChange={(e) => update('maxMarks', e.target.value)}
                  placeholder="30"
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-times font-bold bg-white"
                />
              </div>
            </div>

            {/* Header Divider Line Style */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <SplitSquareVertical className="w-3.5 h-3.5 text-slate-500" /> Divider Line Style:
              </span>
              <div className="flex gap-1">
                {(['solid', 'double', 'thick', 'dashed', 'none'] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => update('dividerStyle', style)}
                    className={`text-[11px] px-2.5 py-1 rounded-md border font-semibold capitalize transition-colors cursor-pointer ${
                      header.dividerStyle === style
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel 3: Candidate Details & Answer Sheet Fields (Collapsible) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsCandidateFieldsOpen(!isCandidateFieldsOpen)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-xs">
              Candidate Fields (Name, Roll No. blanks)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">
              {header.showCandidateFields ? 'Enabled' : 'Disabled'}
            </span>
            <div className="p-1 text-slate-500">
              {isCandidateFieldsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </button>

        {isCandidateFieldsOpen && (
          <div className="p-4 pt-1 border-t border-slate-100 space-y-3 bg-white">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={header.showCandidateFields}
                onChange={(e) => update('showCandidateFields', e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-800 accent-slate-900 w-4 h-4"
              />
              <span>Print Candidate Name & Roll No blanks on paper header</span>
            </label>

            {header.showCandidateFields && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Candidate Name Label
                  </label>
                  <input
                    type="text"
                    value={header.candidateNameLabel || 'Name:'}
                    onChange={(e) => update('candidateNameLabel', e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Roll No Label
                  </label>
                  <input
                    type="text"
                    value={header.candidateRollLabel || 'Roll No:'}
                    onChange={(e) => update('candidateRollLabel', e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
