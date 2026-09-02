import React, { useState } from 'react';
import { CustomTemplate, ExamPaperData } from '../types/exam';
import { PRESET_TEMPLATES } from '../data/defaultExam';
import {
  BookOpenText,
  BookmarkPlus,
  Save,
  Trash2,
  Download,
  Upload,
  Sparkles,
  Layers,
  FileText,
  Sliders,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TemplatesPageProps {
  currentExamData: ExamPaperData;
  customTemplates: CustomTemplate[];
  onLoadPreset: (presetIndex: number) => void;
  onLoadCustomTemplate: (template: CustomTemplate) => void;
  onSaveTemplate: (template: CustomTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onNavigateToQuestions: () => void;
}

export const TemplatesPage: React.FC<TemplatesPageProps> = ({
  currentExamData,
  customTemplates,
  onLoadPreset,
  onLoadCustomTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  onNavigateToQuestions,
}) => {
  const [templateName, setTemplateName] = useState(() => {
    const sub = currentExamData.header.subject || currentExamData.header.examTitle || 'Exam';
    return `${sub} Layout`;
  });
  const [templateDescription, setTemplateDescription] = useState(
    `${currentExamData.sections.length} sections (${currentExamData.formatting.fontFamily}, ${currentExamData.formatting.baseFontSize}pt)`
  );
  const [templateMode, setTemplateMode] = useState<'full' | 'structure-only'>('structure-only');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) return;

    let sectionsToSave = currentExamData.sections;
    if (templateMode === 'structure-only') {
      sectionsToSave = currentExamData.sections.map((sec) => ({
        ...sec,
        questions: sec.questions.map((q, idx) => ({
          id: `template-q-${idx + 1}`,
          number: q.number,
          questionText:
            sec.type === 'mcq'
              ? 'Sample multiple choice question statement goes here...'
              : 'Enter question statement here...',
          marks: q.marks,
          options:
            sec.type === 'mcq'
              ? q.options
                ? q.options.map((_, optIdx) => `Option ${String.fromCharCode(65 + optIdx)}`)
                : ['Option A', 'Option B', 'Option C', 'Option D']
              : undefined,
          correctAnswerIndex: 0,
          subQuestions: q.subQuestions
            ? q.subQuestions.map((sq) => ({
                id: sq.id,
                label: sq.label,
                text: 'Sub-question prompt...',
              }))
            : undefined,
        })),
      }));
    }

    const newTemplate: CustomTemplate = {
      id: `template-${Date.now()}`,
      name: templateName.trim(),
      description: templateDescription.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateType: templateMode,
      header: currentExamData.header,
      formatting: currentExamData.formatting,
      sections: sectionsToSave,
    };

    onSaveTemplate(newTemplate);
    setSaveSuccess(true);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  const handleExportJson = (template: CustomTemplate) => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(template, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${template.name.replace(/\s+/g, '_')}_template.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.header && imported.formatting && imported.sections) {
          const importedTemplate: CustomTemplate = {
            id: `template-${Date.now()}`,
            name: imported.name || file.name.replace('.json', ''),
            description: imported.description || 'Imported from JSON file',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            templateType: imported.templateType || 'full',
            header: imported.header,
            formatting: imported.formatting,
            sections: imported.sections,
          };
          onSaveTemplate(importedTemplate);
          alert(`Successfully imported "${importedTemplate.name}" template!`);
        } else {
          alert('Invalid exam template file format.');
        }
      } catch (err) {
        console.error('Error importing template:', err);
        alert('Failed to parse template JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-[1750px] mx-auto p-2 sm:p-4 flex flex-col flex-1 min-h-0 overflow-hidden font-ui">
      {/* Top Banner */}
      <div className="no-print mb-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpenText className="w-4 h-4 text-amber-700" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-900">
            Exam Template & Preset Library
          </h2>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Switch between official board formats or save your current layout for future exams.
          </span>
        </div>

        {/* Import template button */}
        <label className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0">
          <Upload className="w-3.5 h-3.5 text-slate-600" />
          <span>Import .json</span>
          <input
            type="file"
            accept=".json"
            onChange={handleImportJson}
            className="hidden"
          />
        </label>
      </div>

      {/* Main Grid: Presets, Saved Templates, Save Form */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2 space-y-5 custom-scrollbar">
        {/* Section 1: Official Standard Presets */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono-code">
              Official Academic Board Presets
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PRESET_TEMPLATES.map((preset, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Standard Preset
                    </span>
                    <span className="text-[11px] font-mono-code text-slate-500 font-bold">
                      {preset.data?.header?.maxMarks || '100'} Marks
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mb-1">
                    {preset.name}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {preset.description}
                  </p>

                  <div className="text-[11px] text-slate-500 space-y-0.5 font-mono-code bg-slate-50 p-2 rounded-lg border border-slate-100 mb-3">
                    <div>Sections: {preset.data?.sections?.length || 3} (MCQs + Theory)</div>
                    <div>Font: {preset.data?.formatting?.fontFamily || 'Times New Roman'}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onLoadPreset(idx);
                    onNavigateToQuestions();
                  }}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Load This Preset</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Saved Custom Templates */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <BookmarkPlus className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono-code">
                My Saved Custom Templates ({customTemplates.length})
              </h3>
            </div>
          </div>

          {customTemplates.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              <BookmarkPlus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-xs text-slate-700">No custom templates saved yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Use the form below to save your current layout, sections, and margins as a reusable template.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {customTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {template.templateType === 'structure-only' ? 'Structure Only' : 'Full Content'}
                      </span>
                      <span className="text-[10px] font-mono-code text-slate-400">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      {template.name}
                    </h4>
                    {template.description && (
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">
                        {template.description}
                      </p>
                    )}

                    <div className="text-[11px] text-slate-500 space-y-0.5 font-mono-code bg-slate-50 p-2 rounded-lg border border-slate-100 mb-3">
                      <div>Sections: {template.sections.length}</div>
                      <div>Typography: {template.formatting.fontFamily} ({template.formatting.baseFontSize}pt)</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadCustomTemplate(template);
                        onNavigateToQuestions();
                      }}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer text-center"
                    >
                      Load Template
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportJson(template)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition-colors cursor-pointer"
                      title="Export as JSON file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTemplate(template.id)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs transition-colors cursor-pointer"
                      title="Delete template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Save Current Paper as New Template Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <Save className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Save Current Exam Layout as Template
            </h3>
          </div>

          <form onSubmit={handleSave} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Physics First Term Exam"
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-slate-800 focus:outline-hidden font-medium bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Department (Optional)
                </label>
                <input
                  type="text"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="e.g. Department of Engineering, 3 Sections"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-slate-800 focus:outline-hidden font-medium bg-white"
                />
              </div>
            </div>

            {/* Template Mode radio */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                What would you like to preserve?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-start gap-2 ${
                    templateMode === 'structure-only'
                      ? 'bg-slate-50 border-slate-900 text-slate-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="templateMode"
                    value="structure-only"
                    checked={templateMode === 'structure-only'}
                    onChange={() => setTemplateMode('structure-only')}
                    className="mt-0.5 accent-slate-900"
                  />
                  <div>
                    <span>Layout & Structure Only</span>
                    <p className="text-[11px] font-normal text-slate-500 mt-0.5">
                      Saves headers, margins, typography, and clean section skeletons (ideal for reusable exam blueprints).
                    </p>
                  </div>
                </label>

                <label
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-start gap-2 ${
                    templateMode === 'full'
                      ? 'bg-slate-50 border-slate-900 text-slate-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="templateMode"
                    value="full"
                    checked={templateMode === 'full'}
                    onChange={() => setTemplateMode('full')}
                    className="mt-0.5 accent-slate-900"
                  />
                  <div>
                    <span>Full Content & Exact Questions</span>
                    <p className="text-[11px] font-normal text-slate-500 mt-0.5">
                      Saves everything including exact question statements, math equations, and MCQ choices.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {saveSuccess && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Template Saved Successfully!
                </span>
              )}

              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save to Template Library</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
