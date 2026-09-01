import React, { useState, useEffect } from 'react';
import { CustomTemplate, ExamPaperData, ExamSection } from '../types/exam';
import {
  BookmarkPlus,
  FolderHeart,
  Save,
  Trash2,
  Download,
  Upload,
  Check,
  Sparkles,
  Layers,
  FileText,
  Sliders,
  Calendar,
  X,
  Copy,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExamData: ExamPaperData;
  onLoadTemplate: (template: CustomTemplate) => void;
  customTemplates: CustomTemplate[];
  onSaveTemplate: (template: CustomTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
}

export const TemplateManagerModal: React.FC<TemplateManagerModalProps> = ({
  isOpen,
  onClose,
  currentExamData,
  onLoadTemplate,
  customTemplates,
  onSaveTemplate,
  onDeleteTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'save' | 'saved-list'>('save');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateMode, setTemplateMode] = useState<'full' | 'structure-only'>('structure-only');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Default suggested template name on open
  useEffect(() => {
    if (isOpen) {
      const subject = currentExamData.header.subject || currentExamData.header.examTitle || 'Exam Layout';
      setTemplateName(`${subject} Template`);
      setTemplateDescription(`${currentExamData.sections.length} sections (${currentExamData.formatting.fontFamily}, ${currentExamData.formatting.baseFontSize}pt)`);
      setSaveSuccess(false);
    }
  }, [isOpen, currentExamData]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) return;

    let sectionsToSave = currentExamData.sections;
    
    // If structure-only, create clean blank questions or blueprint
    if (templateMode === 'structure-only') {
      sectionsToSave = currentExamData.sections.map((sec) => ({
        ...sec,
        questions: sec.questions.map((q, idx) => ({
          id: `template-q-${idx + 1}`,
          number: q.number,
          questionText: sec.type === 'mcq' ? 'Sample multiple choice question text goes here...' : 'Enter question text here...',
          marks: q.marks,
          options: sec.type === 'mcq' ? (q.options ? q.options.map((_, optIdx) => `Option ${String.fromCharCode(65 + optIdx)}`) : ['Option A', 'Option B', 'Option C', 'Option D']) : undefined,
          correctAnswerIndex: 0,
          subQuestions: q.subQuestions ? q.subQuestions.map((sq) => ({ id: sq.id, label: sq.label, text: 'Sub-question prompt...' })) : undefined,
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
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.7 } });

    setTimeout(() => {
      setSaveSuccess(false);
      setActiveTab('saved-list');
    }, 1000);
  };

  const handleExportJson = (template: CustomTemplate) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(template, null, 2));
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
          setActiveTab('saved-list');
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

  const filteredTemplates = customTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn no-print">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden font-ui animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <BookmarkPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Custom Exam Layout & Templates</h2>
              <p className="text-xs text-slate-500">Save and reuse your formatting and section structures</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Tab Switcher */}
        <div className="px-4 pt-3 border-b border-slate-200 bg-slate-50/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('save')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'save'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Current Layout</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('saved-list')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'saved-list'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FolderHeart className="w-3.5 h-3.5" />
              <span>Saved Custom Templates</span>
              <span className="ml-1 bg-slate-200 text-slate-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono-code font-bold">
                {customTemplates.length}
              </span>
            </button>
          </div>

          <label className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1 cursor-pointer transition-colors mb-2">
            <Upload className="w-3 h-3" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'save' ? (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Snapshot Summary of Current Layout */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Current Layout Blueprint to be Saved:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-slate-500 block text-[10px]">Font & Size</span>
                    <span className="font-bold text-slate-900 font-times">{currentExamData.formatting.fontFamily} {currentExamData.formatting.baseFontSize}pt</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-slate-500 block text-[10px]">Margins</span>
                    <span className="font-bold text-slate-900 font-mono-code">{currentExamData.formatting.marginTop}" T / {currentExamData.formatting.marginLeft}" L</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-slate-500 block text-[10px]">Sections</span>
                    <span className="font-bold text-slate-900">{currentExamData.sections.length} Sections ({currentExamData.sections.map(s => s.letter).join(', ')})</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-slate-500 block text-[10px]">Max Marks</span>
                    <span className="font-bold text-slate-900 font-mono-code">{currentExamData.header.maxMarks} Marks</span>
                  </div>
                </div>
              </div>

              {/* Template Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Template Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Matric Board Science Layout (100 Marks)"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-medium bg-white"
                />
              </div>

              {/* Template Description */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Description / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="e.g. Standard 3-section layout for monthly departmental exams"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden text-slate-700 bg-white"
                />
              </div>

              {/* Mode Selection: Structure-only vs Full */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Template Content Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label
                    className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      templateMode === 'structure-only'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="templateMode"
                      checked={templateMode === 'structure-only'}
                      onChange={() => setTemplateMode('structure-only')}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="block text-xs font-bold">Structural Blueprint Only (Recommended)</span>
                      <span className={`text-[11px] leading-snug mt-0.5 block ${templateMode === 'structure-only' ? 'text-slate-300' : 'text-slate-500'}`}>
                        Preserves your headers, margins, typography, section setup, choice rules, and option counts with clean placeholder questions.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                      templateMode === 'full'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="templateMode"
                      checked={templateMode === 'full'}
                      onChange={() => setTemplateMode('full')}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="block text-xs font-bold">Full Exam Copy</span>
                      <span className={`text-[11px] leading-snug mt-0.5 block ${templateMode === 'full' ? 'text-slate-300' : 'text-slate-500'}`}>
                        Saves exact questions, answers, and sub-questions currently entered in the paper.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveSuccess}
                  className="px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Saved to Local Storage!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save as Custom Template</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Saved Custom Templates List */
            <div className="space-y-3">
              {/* Search Bar */}
              {customTemplates.length > 0 && (
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search saved templates..."
                    className="w-full text-xs px-3 py-1.5 pl-8 border border-slate-300 rounded-lg focus:border-slate-800 focus:outline-hidden bg-white"
                  />
                  <BookmarkPlus className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              )}

              {customTemplates.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-3">
                  <FolderHeart className="w-10 h-10 text-slate-400 mx-auto" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">No Custom Templates Saved Yet</h3>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                      Save your current exam layout using the "Save Current Layout" tab above to reuse your exact sections, fonts, and styling on future papers.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('save')}
                    className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer transition-colors inline-flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Current Layout Now</span>
                  </button>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  No templates match "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{template.name}</h4>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border uppercase font-mono-code ${
                            template.templateType === 'structure-only'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}>
                            {template.templateType === 'structure-only' ? 'Blueprint' : 'Full Exam'}
                          </span>
                        </div>

                        {template.description && (
                          <p className="text-[11px] text-slate-500 leading-snug">{template.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10px] text-slate-600">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium border border-slate-200">
                            {template.sections.length} Sections ({template.sections.map(s => s.letter).join(', ')})
                          </span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium border border-slate-200 font-times font-bold">
                            {template.formatting.fontFamily} {template.formatting.baseFontSize}pt
                          </span>
                          <span className="text-slate-400">
                            Saved {new Date(template.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleExportJson(template)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Export to JSON file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete custom template "${template.name}"?`)) {
                              onDeleteTemplate(template.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Load template "${template.name}"? This will replace your current paper formatting and sections.`)) {
                              onLoadTemplate(template);
                              onClose();
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>Apply</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <BookmarkPlus className="w-3 h-3 text-slate-400" />
            Saved securely in browser local storage
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
