import React, { useState } from 'react';
import { FormattingOptions } from '../types/exam';
import {
  Sliders,
  Type,
  Columns,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  BookCheck,
  ListOrdered,
  Maximize2
} from 'lucide-react';

interface FormattingEditorProps {
  formatting: FormattingOptions;
  onChange: (formatting: FormattingOptions) => void;
}

export const FormattingEditor: React.FC<FormattingEditorProps> = ({ formatting, onChange }) => {
  const [isTypographyOpen, setIsTypographyOpen] = useState(true);
  const [isMarginsOpen, setIsMarginsOpen] = useState(false);
  const [isBulletsOpen, setIsBulletsOpen] = useState(false);
  const [isAnswerKeyOpen, setIsAnswerKeyOpen] = useState(true);

  const update = (field: keyof FormattingOptions, value: any) => {
    onChange({ ...formatting, [field]: value });
  };

  const applyMarginPreset = (type: 'normal' | 'narrow' | 'moderate' | 'wide') => {
    if (type === 'normal') {
      onChange({ ...formatting, marginTop: 0.75, marginBottom: 0.75, marginLeft: 0.75, marginRight: 0.75 });
    } else if (type === 'narrow') {
      onChange({ ...formatting, marginTop: 0.5, marginBottom: 0.5, marginLeft: 0.5, marginRight: 0.5 });
    } else if (type === 'moderate') {
      onChange({ ...formatting, marginTop: 0.75, marginBottom: 0.75, marginLeft: 0.6, marginRight: 0.6 });
    } else if (type === 'wide') {
      onChange({ ...formatting, marginTop: 1.0, marginBottom: 1.0, marginLeft: 1.0, marginRight: 1.0 });
    }
  };

  return (
    <div className="space-y-3 font-ui">
      {/* Panel 1: Typography & Page Scale (Collapsible) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsTypographyOpen(!isTypographyOpen)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-xs">
              Typography & Font Dimensions
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono-code border border-slate-200">
              {formatting.fontFamily} • {formatting.baseFontSize} pt
            </span>
            <div className="p-1 text-slate-500">
              {isTypographyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </button>

        {isTypographyOpen && (
          <div className="p-4 pt-1 border-t border-slate-100 space-y-3 bg-white">
            {/* Font Family & Base Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-slate-500" /> Font Family
                </label>
                <select
                  value={formatting.fontFamily}
                  onChange={(e) => update('fontFamily', e.target.value as any)}
                  className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-medium"
                >
                  <option value="Times New Roman">Times New Roman (Standard Board & Univ.)</option>
                  <option value="Tinos">Tinos (Times New Roman Metric)</option>
                  <option value="Garamond">EB Garamond (Classic Academic)</option>
                  <option value="Georgia">Georgia (High Legibility Serif)</option>
                  <option value="Arial">Arial (Standard Sans)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Base Font Size: <span className="font-bold text-slate-900 font-mono-code bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{formatting.baseFontSize} pt</span>
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="range"
                    min="10"
                    max="15"
                    step="0.5"
                    value={formatting.baseFontSize}
                    onChange={(e) => update('baseFontSize', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Paper Size & Spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" /> Paper Size
                </label>
                <select
                  value={formatting.paperSize}
                  onChange={(e) => update('paperSize', e.target.value as any)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-medium"
                >
                  <option value="A4">A4 (210 × 297 mm) - Standard</option>
                  <option value="Letter">US Letter (8.5 × 11 in)</option>
                  <option value="Legal">Legal (8.5 × 14 in)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Line Spacing
                </label>
                <select
                  value={formatting.lineSpacing}
                  onChange={(e) => update('lineSpacing', e.target.value as any)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-medium"
                >
                  <option value="tight">Compact / Tight (1.15)</option>
                  <option value="normal">Standard (1.35 - 1.42)</option>
                  <option value="relaxed">Relaxed (1.65)</option>
                  <option value="double">Double Spacing (2.0)</option>
                </select>
              </div>
            </div>

            {/* Column Layout */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                <Columns className="w-3.5 h-3.5 text-slate-500" /> Document Multi-Column Layout
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => update('globalColumns', 1)}
                  className={`flex items-center justify-center gap-2 p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    formatting.globalColumns === 1
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Single Column (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => update('globalColumns', 2)}
                  className={`flex items-center justify-center gap-2 p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    formatting.globalColumns === 2
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Two Columns (Split)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel 2: Margins & Padding (Collapsible) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsMarginsOpen(!isMarginsOpen)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-xs">
              Margins & Paper Bounds
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono-code font-semibold">
              {formatting.marginTop}" T • {formatting.marginLeft}" L
            </span>
            <div className="p-1 text-slate-500">
              {isMarginsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </button>

        {isMarginsOpen && (
          <div className="p-4 pt-1 border-t border-slate-100 space-y-3 bg-white">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-800">Quick Margins Presets:</label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => applyMarginPreset('narrow')}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer border border-slate-200"
                >
                  Narrow (0.5")
                </button>
                <button
                  type="button"
                  onClick={() => applyMarginPreset('normal')}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer border border-slate-200"
                >
                  Standard (0.75")
                </button>
                <button
                  type="button"
                  onClick={() => applyMarginPreset('wide')}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer border border-slate-200"
                >
                  Wide (1.0")
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <span className="block text-[10px] text-slate-500 mb-0.5 text-center font-medium font-mono-code">Top (in)</span>
                <input
                  type="number"
                  min="0.2"
                  max="2.5"
                  step="0.05"
                  value={formatting.marginTop}
                  onChange={(e) => update('marginTop', parseFloat(e.target.value) || 0.5)}
                  className="w-full text-center text-xs px-1.5 py-1 border border-slate-300 rounded-lg focus:border-slate-800 focus:outline-hidden font-mono-code bg-white"
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 mb-0.5 text-center font-medium font-mono-code">Bottom (in)</span>
                <input
                  type="number"
                  min="0.2"
                  max="2.5"
                  step="0.05"
                  value={formatting.marginBottom}
                  onChange={(e) => update('marginBottom', parseFloat(e.target.value) || 0.5)}
                  className="w-full text-center text-xs px-1.5 py-1 border border-slate-300 rounded-lg focus:border-slate-800 focus:outline-hidden font-mono-code bg-white"
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 mb-0.5 text-center font-medium font-mono-code">Left (in)</span>
                <input
                  type="number"
                  min="0.2"
                  max="2.5"
                  step="0.05"
                  value={formatting.marginLeft}
                  onChange={(e) => update('marginLeft', parseFloat(e.target.value) || 0.5)}
                  className="w-full text-center text-xs px-1.5 py-1 border border-slate-300 rounded-lg focus:border-slate-800 focus:outline-hidden font-mono-code bg-white"
                />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 mb-0.5 text-center font-medium font-mono-code">Right (in)</span>
                <input
                  type="number"
                  min="0.2"
                  max="2.5"
                  step="0.05"
                  value={formatting.marginRight}
                  onChange={(e) => update('marginRight', parseFloat(e.target.value) || 0.5)}
                  className="w-full text-center text-xs px-1.5 py-1 border border-slate-300 rounded-lg focus:border-slate-800 focus:outline-hidden font-mono-code bg-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel 3: Question Bullets & Section Underlining (Collapsible) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsBulletsOpen(!isBulletsOpen)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-xs">
              Bullet Symbols & Header Underlines
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">
              {formatting.optionBulletStyle} • {formatting.questionNumberStyle}
            </span>
            <div className="p-1 text-slate-500">
              {isBulletsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </button>

        {isBulletsOpen && (
          <div className="p-4 pt-1 border-t border-slate-100 space-y-3 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  MCQ Option Bullet Style
                </label>
                <select
                  value={formatting.optionBulletStyle}
                  onChange={(e) => update('optionBulletStyle', e.target.value as any)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:border-slate-800 font-medium"
                >
                  <option value="bullet">• Bullet Dot (Standard)</option>
                  <option value="alpha-lower">(a), (b), (c), (d)</option>
                  <option value="alpha-upper">(A), (B), (C), (D)</option>
                  <option value="roman-lower">(i), (ii), (iii), (iv)</option>
                  <option value="numeric">(1), (2), (3), (4)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Question Numbering Style
                </label>
                <select
                  value={formatting.questionNumberStyle}
                  onChange={(e) => update('questionNumberStyle', e.target.value as any)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:border-slate-800 font-medium"
                >
                  <option value="roman-lower">i, ii, iii, iv (Lower Roman)</option>
                  <option value="numeric">1, 2, 3, 4 (Standard Numeric)</option>
                  <option value="alpha-lower">a, b, c, d (Lower Alpha)</option>
                  <option value="alpha-upper">A, B, C, D (Upper Alpha)</option>
                  <option value="roman-upper">I, II, III, IV (Upper Roman)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={formatting.underlineSectionHeaders}
                  onChange={(e) => update('underlineSectionHeaders', e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-800 accent-slate-900"
                />
                <span>Underline Section Titles</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={formatting.showPageNumbers}
                  onChange={(e) => update('showPageNumbers', e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-800 accent-slate-900"
                />
                <span>Show Page Number in Footer</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Panel 4: Teacher Answer Key & Solution Scheme (Collapsible) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsAnswerKeyOpen(!isAnswerKeyOpen)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <BookCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-xs">
              Teacher's Answer Key & Marking Scheme
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
              formatting.showAnswerKey
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {formatting.showAnswerKey ? 'Teacher Copy (Active)' : 'Student Copy (Clean)'}
            </span>
            <div className="p-1 text-slate-500">
              {isAnswerKeyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </button>

        {isAnswerKeyOpen && (
          <div className="p-4 pt-1 border-t border-slate-100 space-y-3 bg-white">
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Enable Answer Key / Teacher Copy Mode
                </div>
                <p className="text-[11px] text-emerald-800/80 leading-relaxed mt-0.5">
                  Highlights correct MCQ answers and appends an official Solution & Marking Scheme table.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={formatting.showAnswerKey}
                  onChange={(e) => update('showAnswerKey', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
