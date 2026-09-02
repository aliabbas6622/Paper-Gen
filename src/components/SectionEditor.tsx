import React, { useState } from 'react';
import { ExamSection, ExamQuestion, SectionId, QuestionNumberStyle, SectionType } from '../types/exam';
import {
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ListOrdered,
  FileQuestion,
  Sparkles,
  Layers,
  Check,
  CheckCircle2,
  Columns,
  Settings2,
  Tag,
  Clock,
  Award,
  Sliders,
  Code2,
  ChevronsUpDown,
  Maximize2,
  Minimize2,
  HelpCircle,
  Sigma,
  FileJson
} from 'lucide-react';
import MathRenderer from './MathRenderer';
import EquationHelper from './EquationHelper';
import JsonQuestionModal from './JsonQuestionModal';

interface SectionEditorProps {
  sections: ExamSection[];
  onChange: (sections: ExamSection[]) => void;
  numberStyle: QuestionNumberStyle;
}

const SECTION_PRESETS: {
  label: string;
  name: string;
  title: string;
  subtitle: string;
  type: SectionType;
  prompt: string;
  choiceRule: string;
  fieldNote: string;
  marks: string;
}[] = [
  {
    label: 'Section A: Multiple Choice',
    name: 'Section A: Multiple Choice',
    title: 'SECTION "A"',
    subtitle: 'MULTIPLE CHOICE QUESTIONS',
    type: 'mcq',
    prompt: 'Q1. Attempt all questions from this section. Each question carries equal marks',
    choiceRule: 'All questions compulsory (1 mark each)',
    fieldNote: 'Note: Encircle the correct option or shade the corresponding circle. No marks for overwriting.',
    marks: '(10 marks)',
  },
  {
    label: 'Section B: Theoretical',
    name: 'Section B: Theoretical',
    title: 'SECTION "B"',
    subtitle: 'SHORT ANSWER & THEORETICAL QUESTIONS',
    type: 'short',
    prompt: 'Q2. Attempt all questions from the following. Each question carries equal marks',
    choiceRule: 'All 5 questions are compulsory (4 marks each)',
    fieldNote: 'Note: Answers should be concise, clear, and relevant to the point.',
    marks: '(20 marks)',
  },
  {
    label: 'Section C: Practical',
    name: 'Section C: Practical',
    title: 'SECTION "C"',
    subtitle: 'PRACTICAL & DETAILED ANSWER QUESTIONS',
    type: 'long',
    prompt: 'Q3. Attempt any TWO questions from this section. All questions carry equal marks (10 marks each)',
    choiceRule: 'Attempt any 2 questions (10 marks each)',
    fieldNote: 'Note: Support your explanations with diagrams, code blocks, or flowcharts where appropriate.',
    marks: '(20 marks)',
  },
  {
    label: 'Section D: Coding / Lab Tasks',
    name: 'Section D: Practical Lab & Code',
    title: 'SECTION "D"',
    subtitle: 'PROGRAMMING & LABORATORY EXPERIMENTS',
    type: 'practical',
    prompt: 'Q4. Execute the following programming or laboratory assignments:',
    choiceRule: 'Perform any 1 laboratory task (15 marks)',
    fieldNote: 'Note: Provide complete syntax, flowchart, input/output trace, and viva explanations.',
    marks: '(15 marks)',
  },
  {
    label: 'Section: Objective / Fill in Blanks',
    name: 'Part I: Objective & Blanks',
    title: 'PART "I"',
    subtitle: 'OBJECTIVE & FILL IN THE BLANKS',
    type: 'fill-blanks',
    prompt: 'Fill in the blanks with appropriate technical terms:',
    choiceRule: 'Compulsory — 1 mark each',
    fieldNote: 'Note: Write clear and legible answers in the provided spaces.',
    marks: '(10 marks)',
  },
];

export const SectionEditor: React.FC<SectionEditorProps> = ({ sections, onChange, numberStyle }) => {
  const [activeSectionId, setActiveSectionId] = useState<SectionId>(sections[0]?.id || 'section-a');
  const [bulkModalSection, setBulkModalSection] = useState<SectionId | null>(null);
  const [bulkText, setBulkText] = useState('');
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  
  // Collapsible panels state for Section settings
  const [isSectionDetailsOpen, setIsSectionDetailsOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isMcqSettingsOpen, setIsMcqSettingsOpen] = useState(false);

  // Collapsible state for individual question cards: map of questionId -> boolean (true = expanded)
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  // Equation helper modal target state
  const [equationTarget, setEquationTarget] = useState<{
    qId: string;
    field: 'questionText' | 'subText' | 'option' | 'subQuestion';
    optIdx?: number;
    subIdx?: number;
  } | null>(null);

  const currentSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  const updateSection = (id: SectionId, updates: Partial<ExamSection>) => {
    onChange(
      sections.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleInsertJsonQuestions = (
    targetSecId: string,
    newQuestions: ExamQuestion[],
    mode: 'append' | 'prepend' | 'replace'
  ) => {
    const secIdx = sections.findIndex((s) => s.id === targetSecId);
    if (secIdx === -1) return;

    const targetSec = sections[secIdx];
    let updatedQuestions: ExamQuestion[] = [];

    if (mode === 'replace') {
      updatedQuestions = newQuestions;
    } else if (mode === 'prepend') {
      updatedQuestions = [...newQuestions, ...targetSec.questions];
    } else {
      updatedQuestions = [...targetSec.questions, ...newQuestions];
    }

    const newSections = [...sections];
    newSections[secIdx] = {
      ...targetSec,
      questions: updatedQuestions,
    };
    onChange(newSections);
    setActiveSectionId(targetSecId);
  };

  const handleInsertEquationFromModal = (latex: string) => {
    if (!equationTarget) return;
    const { qId, field, optIdx, subIdx } = equationTarget;
    const q = currentSection.questions.find((item) => item.id === qId);
    if (!q) return;

    if (field === 'questionText') {
      const current = q.questionText || '';
      const updated = current ? `${current} ${latex}` : latex;
      handleUpdateQuestion(qId, { questionText: updated });
    } else if (field === 'subText') {
      const current = q.subText || '';
      const updated = current ? `${current} ${latex}` : latex;
      handleUpdateQuestion(qId, { subText: updated });
    } else if (field === 'option' && optIdx !== undefined && q.options) {
      const newOpts = [...q.options];
      const current = newOpts[optIdx] || '';
      newOpts[optIdx] = current ? `${current} ${latex}` : latex;
      handleUpdateQuestion(qId, { options: newOpts });
    } else if (field === 'subQuestion' && subIdx !== undefined && q.subQuestions) {
      const newSubs = [...q.subQuestions];
      const current = newSubs[subIdx].text || '';
      newSubs[subIdx] = {
        ...newSubs[subIdx],
        text: current ? `${current} ${latex}` : latex,
      };
      handleUpdateQuestion(qId, { subQuestions: newSubs });
    }
  };

  const handleQuickInsertSymbol = (qId: string, symbol: string, field: 'questionText' | 'subText' = 'questionText') => {
    const q = currentSection.questions.find((item) => item.id === qId);
    if (!q) return;
    if (field === 'questionText') {
      handleUpdateQuestion(qId, { questionText: (q.questionText || '') + symbol });
    } else if (field === 'subText') {
      handleUpdateQuestion(qId, { subText: (q.subText || '') + symbol });
    }
  };

  const toggleQuestionExpanded = (qId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [qId]: prev[qId] === undefined ? false : !prev[qId], // default is expanded if not in record
    }));
  };

  const isQuestionExpanded = (qId: string) => {
    // Keep the canvas calm: show only the first question until the user opens another.
    if (expandedQuestions[qId] !== undefined) {
      return expandedQuestions[qId];
    }
    return currentSection.questions[0]?.id === qId;
  };

  const collapseAllQuestions = () => {
    const newRecord: Record<string, boolean> = {};
    currentSection.questions.forEach((q) => {
      newRecord[q.id] = false;
    });
    setExpandedQuestions(newRecord);
  };

  const expandAllQuestions = () => {
    const newRecord: Record<string, boolean> = {};
    currentSection.questions.forEach((q) => {
      newRecord[q.id] = true;
    });
    setExpandedQuestions(newRecord);
  };

  const getRomanNumber = (index: number): string => {
    const romans = [
      'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x',
      'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx'
    ];
    return romans[index] || `${index + 1}`;
  };

  const formatNumberByStyle = (index: number, style: QuestionNumberStyle) => {
    if (style === 'roman-lower') return getRomanNumber(index);
    if (style === 'roman-upper') return getRomanNumber(index).toUpperCase();
    if (style === 'numeric') return `${index + 1}`;
    if (style === 'alpha-lower') return String.fromCharCode(97 + index);
    if (style === 'alpha-upper') return String.fromCharCode(65 + index);
    return `${index + 1}`;
  };

  // Add question to current section
  const handleAddQuestion = (type: SectionType) => {
    const newIdx = currentSection.questions.length;
    const newNum = formatNumberByStyle(newIdx, numberStyle);
    const defaultOptCount = currentSection.defaultOptionCount || 4;

    let newQuestion: ExamQuestion;

    if (type === 'mcq') {
      const options = Array.from({ length: defaultOptCount }, (_, i) => `Option ${String.fromCharCode(65 + i)} text`);
      newQuestion = {
        id: `q-${Date.now()}`,
        number: newNum,
        questionText: 'Which statement is correct regarding this concept?',
        options,
        correctAnswerIndex: 0,
        marks: currentSection.marksPerQuestion || '1',
      };
    } else if (type === 'short' || type === 'fill-blanks' || type === 'true-false') {
      newQuestion = {
        id: `q-${Date.now()}`,
        number: newNum,
        questionText: 'Define the core principles and give two real-world examples.',
        marks: '4',
        answerLinesCount: 0,
      };
    } else if (type === 'practical') {
      newQuestion = {
        id: `q-${Date.now()}`,
        number: newNum,
        questionText: 'Write a program or flowchart to perform the specified algorithm.',
        marks: '10',
        codeSnippet: '// Example initial code stub or template\nfunction processData(input) {\n  // Implementation here\n}',
        subQuestions: [
          { id: `sub-1-${Date.now()}`, label: '(a)', text: 'State the inputs, processing logic, and expected outputs.', marks: '3' },
          { id: `sub-2-${Date.now()}`, label: '(b)', text: 'Provide test cases and time complexity analysis.', marks: '7' },
        ],
      };
    } else {
      newQuestion = {
        id: `q-${Date.now()}`,
        number: newNum,
        questionText: 'Write a comprehensive essay / detailed answer on the topic.',
        marks: '10',
        subQuestions: [
          { id: `sub-1-${Date.now()}`, label: '(a)', text: 'Explain the fundamental theory and architecture.', marks: '5' },
          { id: `sub-2-${Date.now()}`, label: '(b)', text: 'Illustrate with a neat diagram and step-by-step procedure.', marks: '5' },
        ],
      };
    }

    // Auto expand newly added question
    setExpandedQuestions((prev) => ({ ...prev, [newQuestion.id]: true }));

    updateSection(currentSection.id, {
      questions: [...currentSection.questions, newQuestion],
    });
  };

  const handleUpdateQuestion = (qId: string, updates: Partial<ExamQuestion>) => {
    updateSection(currentSection.id, {
      questions: currentSection.questions.map((q) => (q.id === qId ? { ...q, ...updates } : q)),
    });
  };

  const handleDeleteQuestion = (qId: string) => {
    const updated = currentSection.questions.filter((q) => q.id !== qId);
    updateSection(currentSection.id, { questions: updated });
  };

  const handleDuplicateQuestion = (question: ExamQuestion) => {
    const newId = `q-${Date.now()}`;
    const duplicated: ExamQuestion = {
      ...question,
      id: newId,
      number: formatNumberByStyle(currentSection.questions.length, numberStyle),
      options: question.options ? [...question.options] : undefined,
      subQuestions: question.subQuestions ? question.subQuestions.map((sq) => ({ ...sq, id: `sub-${Date.now()}-${Math.random()}` })) : undefined,
    };
    setExpandedQuestions((prev) => ({ ...prev, [newId]: true }));
    updateSection(currentSection.id, {
      questions: [...currentSection.questions, duplicated],
    });
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...currentSection.questions];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newQuestions.length) return;

    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIdx];
    newQuestions[targetIdx] = temp;

    // renumber
    newQuestions.forEach((q, idx) => {
      q.number = formatNumberByStyle(idx, numberStyle);
    });

    updateSection(currentSection.id, { questions: newQuestions });
  };

  const autoRenumberCurrentSection = () => {
    const newQuestions = currentSection.questions.map((q, idx) => ({
      ...q,
      number: formatNumberByStyle(idx, numberStyle),
    }));
    updateSection(currentSection.id, { questions: newQuestions });
  };

  const applyOptionCountToAllQuestions = (count: number) => {
    const updatedQuestions = currentSection.questions.map((q) => {
      if (!q.options) return q;
      let newOpts = [...q.options];
      if (newOpts.length < count) {
        while (newOpts.length < count) {
          newOpts.push(`Option ${String.fromCharCode(65 + newOpts.length)}`);
        }
      } else if (newOpts.length > count) {
        newOpts = newOpts.slice(0, count);
      }
      // adjust correct answer index if out of range
      let correctIdx = q.correctAnswerIndex;
      if (correctIdx !== undefined && correctIdx >= count) {
        correctIdx = 0;
      }
      return { ...q, options: newOpts, correctAnswerIndex: correctIdx };
    });
    updateSection(currentSection.id, {
      defaultOptionCount: count,
      questions: updatedQuestions,
    });
  };

  const handleApplyPreset = (preset: typeof SECTION_PRESETS[0]) => {
    updateSection(currentSection.id, {
      name: preset.name,
      title: preset.title,
      subtitle: preset.subtitle,
      type: preset.type,
      instructionPrompt: preset.prompt,
      choiceRule: preset.choiceRule,
      fieldNote: preset.fieldNote,
      marks: preset.marks,
    });
  };

  const handleAddNewSection = () => {
    const nextLetter = String.fromCharCode(65 + sections.length);
    const newId = `section-${nextLetter.toLowerCase()}-${Date.now()}`;
    const newSection: ExamSection = {
      id: newId,
      letter: nextLetter,
      name: `Section ${nextLetter}: Practical / Specialized`,
      enabled: true,
      title: `SECTION "${nextLetter}"`,
      subtitle: 'PRACTICAL & APPLICATION QUESTIONS',
      marks: '(15 marks)',
      instructionPrompt: `Q${sections.length + 1}. Attempt all questions from this section.`,
      choiceRule: 'All questions compulsory',
      fieldNote: 'Note: Provide clear solutions and necessary working.',
      type: 'long',
      columnLayout: 'inherit',
      mcqColumns: 2,
      defaultOptionCount: 4,
      questions: [
        {
          id: `q-${Date.now()}-1`,
          number: 'i',
          questionText: 'Explain the core methodology and implement the given solution.',
          marks: '15',
          subQuestions: [
            { id: `sq-1-${Date.now()}`, label: '(a)', text: 'Theoretical analysis and state diagram.', marks: '7' },
            { id: `sq-2-${Date.now()}`, label: '(b)', text: 'Step-by-step calculations and conclusions.', marks: '8' },
          ],
        },
      ],
    };
    onChange([...sections, newSection]);
    setActiveSectionId(newId);
  };

  const handleDeleteCurrentSection = () => {
    if (sections.length <= 1) {
      alert('You must have at least one section in the examination paper.');
      return;
    }
    if (window.confirm(`Are you sure you want to remove Section ${currentSection.letter}?`)) {
      const remaining = sections.filter((s) => s.id !== currentSection.id);
      onChange(remaining);
      setActiveSectionId(remaining[0].id);
    }
  };

  const handleProcessBulkMCQ = () => {
    if (!bulkText.trim()) return;
    const blocks = bulkText.split(/\n\s*\n/);
    const parsedQuestions: ExamQuestion[] = [];
    const optCount = currentSection.defaultOptionCount || 4;

    blocks.forEach((block, idx) => {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) return;

      const qText = lines[0].replace(/^(Q\d+[:.]?|\d+[:.]?|[ivx]+[:.]?)\s*/i, '');
      const rawOptions = lines.slice(1);
      const options: string[] = [];
      let correctAnswerIdx = 0;

      rawOptions.forEach((optLine, oIdx) => {
        // detect asterisk or [x] or (correct)
        const isMarkedCorrect = /\*|\[x\]|\(correct\)/i.test(optLine);
        const cleaned = optLine.replace(/^([a-d\d•\-*)]+[.)\s]+)/i, '').replace(/(\*|\[x\]|\(correct\))/gi, '').trim();
        if (cleaned) {
          options.push(cleaned);
          if (isMarkedCorrect) {
            correctAnswerIdx = options.length - 1;
          }
        }
      });

      while (options.length < optCount) {
        options.push(`Option ${String.fromCharCode(65 + options.length)}`);
      }

      parsedQuestions.push({
        id: `q-bulk-${Date.now()}-${idx}`,
        number: formatNumberByStyle(currentSection.questions.length + idx, numberStyle),
        questionText: qText,
        options: options.slice(0, optCount),
        correctAnswerIndex: correctAnswerIdx,
        marks: currentSection.marksPerQuestion || '1',
      });
    });

    updateSection(currentSection.id, {
      questions: [...currentSection.questions, ...parsedQuestions],
    });
    setBulkModalSection(null);
    setBulkText('');
  };

  const totalSectionMarks = currentSection.questions.reduce((sum, q) => {
    const val = parseFloat(q.marks || '0');
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div className="space-y-3 font-ui">
      {/* Top Section Tabs & Section Selector */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-1.5 overflow-x-auto">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {sections.map((section) => {
            const isActive = section.id === activeSectionId;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSectionId(section.id)}
                className={`flex-1 min-w-[130px] py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold font-mono-code shrink-0 ${
                    isActive ? 'bg-white text-slate-900' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {section.letter}
                  </span>
                  <div className="text-left truncate">
                    <div className="leading-tight truncate">
                      {section.name || (section.letter === 'A' ? 'Section A: Multiple Choice' : section.letter === 'B' ? 'Section B: Theoretical' : 'Section C: Practical')}
                    </div>
                    <div className={`text-[10px] font-normal ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                      {section.questions.length} Qs • {section.type.toUpperCase()}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={section.enabled}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateSection(section.id, { enabled: e.target.checked });
                  }}
                  className="w-3.5 h-3.5 rounded text-slate-900 border-slate-300 focus:ring-0 cursor-pointer accent-slate-900 shrink-0 ml-1"
                  title="Enable / Disable Section in paper"
                />
              </button>
            );
          })}
        </div>

        {/* Add New Section button */}
        <button
          type="button"
          onClick={handleAddNewSection}
          className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-dashed border-slate-300 hover:border-slate-400 text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
          title="Add a new custom section (e.g. Section D)"
        >
          <Plus className="w-4 h-4 text-slate-600" />
          <span className="hidden sm:inline">Add Section</span>
        </button>
      </div>

      {/* COLLAPSIBLE PANEL 1: Section Identity, Naming & Type */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsSectionDetailsOpen(!isSectionDetailsOpen)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-mono-code">
              {currentSection.letter}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight flex items-center gap-2">
                <span>{currentSection.name || `Section ${currentSection.letter}`}</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono-code border border-slate-200">
                  {currentSection.type}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {currentSection.title} • {currentSection.subtitle} • {currentSection.marks}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
              {isSectionDetailsOpen ? 'Collapse' : 'Expand Details'}
            </span>
            <div className="p-1 text-slate-500">
              {isSectionDetailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </button>

        {isSectionDetailsOpen && (
          <div className="p-4 pt-1 border-t border-slate-100 space-y-3.5 bg-white">
            {/* Quick Section Preset Selector */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-500" /> Quick Section Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SECTION_PRESETS.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="text-[11px] px-2 py-1 bg-white hover:bg-slate-200 border border-slate-300 rounded-md font-medium text-slate-800 transition-colors cursor-pointer shadow-2xs"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Section Name & Question Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Section Display Name / Label
                </label>
                <input
                  type="text"
                  value={currentSection.name || ''}
                  onChange={(e) => updateSection(currentSection.id, { name: e.target.value })}
                  placeholder="e.g. Section A: Multiple Choice, Section B: Theoretical"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-medium bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Question Type for this Section
                </label>
                <select
                  value={currentSection.type}
                  onChange={(e) => updateSection(currentSection.id, { type: e.target.value as SectionType })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-semibold bg-white cursor-pointer"
                >
                  <option value="mcq">Multiple Choice Questions (MCQ Options)</option>
                  <option value="short">Short Answer / Conceptual Questions</option>
                  <option value="long">Long Answer / Essay / Theoretical</option>
                  <option value="practical">Practical / Coding / Lab Assignment</option>
                  <option value="fill-blanks">Fill in the Blanks / One-word</option>
                  <option value="true-false">True / False Statements</option>
                  <option value="custom">Custom Structured Questions</option>
                </select>
              </div>
            </div>

            {/* Document Header Rendering Titles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Paper Header Title (e.g. SECTION "A")
                </label>
                <input
                  type="text"
                  value={currentSection.title}
                  onChange={(e) => updateSection(currentSection.id, { title: e.target.value })}
                  placeholder='SECTION "A"'
                  className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-times font-bold bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Paper Header Subtitle
                </label>
                <input
                  type="text"
                  value={currentSection.subtitle}
                  onChange={(e) => updateSection(currentSection.id, { subtitle: e.target.value })}
                  placeholder="MULTIPLE CHOICE QUESTIONS"
                  className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-times font-bold bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Section Marks Badge
                </label>
                <input
                  type="text"
                  value={currentSection.marks}
                  onChange={(e) => updateSection(currentSection.id, { marks: e.target.value })}
                  placeholder="(10 marks)"
                  className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-times font-bold bg-white"
                />
              </div>
            </div>

            {/* Delete section button if multiple exist */}
            {sections.length > 1 && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleDeleteCurrentSection}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Section {currentSection.letter}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* COLLAPSIBLE PANEL 2: Specific Instructions & Choice Rules */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-xs">
              Section Instructions & Choice Rules
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px] hidden sm:inline">
              {currentSection.choiceRule || currentSection.instructionPrompt || 'Standard instructions'}
            </span>
            <div className="p-1 text-slate-500">
              {isInstructionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </button>

        {isInstructionsOpen && (
          <div className="p-4 pt-1 border-t border-slate-100 space-y-3 bg-white">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Main Question Instruction Prompt (e.g. Q1. Attempt all questions...)
              </label>
              <input
                type="text"
                value={currentSection.instructionPrompt}
                onChange={(e) => updateSection(currentSection.id, { instructionPrompt: e.target.value })}
                placeholder="Q1. Attempt all questions from this section. Each question carries equal marks"
                className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-times font-bold bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Choice Rule / Compulsory Status
                </label>
                <input
                  type="text"
                  value={currentSection.choiceRule || ''}
                  onChange={(e) => updateSection(currentSection.id, { choiceRule: e.target.value })}
                  placeholder="e.g. Attempt any 5 questions out of 8 (4 marks each)"
                  className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-medium bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" /> Section Time Allocation (Optional)
                </label>
                <input
                  type="text"
                  value={currentSection.timeAllowed || ''}
                  onChange={(e) => updateSection(currentSection.id, { timeAllowed: e.target.value })}
                  placeholder="e.g. 20 Minutes (Hand over OMR sheet)"
                  className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-medium bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Field Note Under Section (Student Notes, Warnings, Overwriting rules)
              </label>
              <input
                type="text"
                value={currentSection.fieldNote || ''}
                onChange={(e) => updateSection(currentSection.id, { fieldNote: e.target.value })}
                placeholder="Note: Overwriting, cutting or erasing is not allowed. Write answers clearly."
                className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-times italic text-slate-800 bg-slate-50"
              />
            </div>
          </div>
        )}
      </div>

      {/* COLLAPSIBLE PANEL 3: MCQ Options Settings & Marking Scheme (For Section A or MCQ Sections) */}
      {currentSection.type === 'mcq' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={() => setIsMcqSettingsOpen(!isMcqSettingsOpen)}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-xs">
                MCQ Options & Answer Key Settings
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                {currentSection.defaultOptionCount || 4} Options • {currentSection.mcqColumns} Cols
              </span>
              <div className="p-1 text-slate-500">
                {isMcqSettingsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </button>

          {isMcqSettingsOpen && (
            <div className="p-4 pt-1 border-t border-slate-100 space-y-3.5 bg-white">
              {/* Option Count per MCQ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Default Options Count per MCQ:
                  </label>
                  <div className="flex gap-1.5">
                    {[2, 3, 4, 5].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => applyOptionCountToAllQuestions(cnt)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          (currentSection.defaultOptionCount || 4) === cnt
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cnt} {cnt === 2 ? '(T/F)' : `(${cnt} opts)`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Columns className="w-3.5 h-3.5 text-slate-500" /> MCQ Layout Columns in Document:
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateSection(currentSection.id, { mcqColumns: 2 })}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        currentSection.mcqColumns === 2
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      2 Columns (Grid)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSection(currentSection.id, { mcqColumns: 1 })}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        currentSection.mcqColumns === 1
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      1 Column (Stacked)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSection(currentSection.id, { mcqColumns: 4 })}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        currentSection.mcqColumns === 4
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      4 Columns (Inline)
                    </button>
                  </div>
                </div>
              </div>

              {/* Marks & Negative Marking */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Marks per Correct MCQ (e.g. 1 mark)
                  </label>
                  <input
                    type="text"
                    value={currentSection.marksPerQuestion || '1'}
                    onChange={(e) => updateSection(currentSection.id, { marksPerQuestion: e.target.value })}
                    placeholder="1"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Negative Marking Rule (if applicable)
                  </label>
                  <input
                    type="text"
                    value={currentSection.negativeMarking || ''}
                    onChange={(e) => updateSection(currentSection.id, { negativeMarking: e.target.value })}
                    placeholder="e.g. -0.25 mark per wrong answer (Optional)"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 font-medium bg-white"
                  />
                </div>
              </div>

              {/* Quick Bulk Paste Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-600">
                  Quickly import a full batch of MCQs with automatic option parsing:
                </span>
                <button
                  type="button"
                  onClick={() => setBulkModalSection(currentSection.id)}
                  className="text-xs text-slate-800 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-semibold cursor-pointer border border-slate-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                  Bulk Paste MCQs
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QUESTION MANAGEMENT HEADER WITH COLLAPSE / EXPAND ALL */}
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider font-mono-code">
            {currentSection.name || `Section ${currentSection.letter}`} Questions ({currentSection.questions.length})
          </span>
          <span className="text-[10px] font-medium bg-slate-800 px-2 py-0.5 rounded text-slate-300">
            Total {totalSectionMarks} Marks
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Collapse All / Expand All Toggles */}
          <button
            type="button"
            onClick={collapseAllQuestions}
            className="text-[11px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-medium flex items-center gap-1 cursor-pointer transition-colors"
            title="Collapse all questions into compact summary cards"
          >
            <Minimize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Collapse All</span>
          </button>

          <button
            type="button"
            onClick={expandAllQuestions}
            className="text-[11px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-medium flex items-center gap-1 cursor-pointer transition-colors"
            title="Expand all questions to view full options and subparts"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Expand All</span>
          </button>

          <button
            type="button"
            onClick={autoRenumberCurrentSection}
            className="text-[11px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-medium flex items-center gap-1 cursor-pointer transition-colors"
            title="Renumber questions sequentially"
          >
            <ListOrdered className="w-3 h-3" />
            <span className="hidden sm:inline">Renumber</span>
          </button>

          <button
            type="button"
            onClick={() => setIsJsonModalOpen(true)}
            className="text-[11px] px-2.5 py-1 bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded-md font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            title="Fill JSON structure to generate questions with LaTeX and Matrix support"
          >
            <FileJson className="w-3.5 h-3.5 text-cyan-400" />
            <span>JSON Script / Importer</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddQuestion(currentSection.type)}
            className="text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 px-3 py-1 rounded-md transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* INDIVIDUAL COLLAPSIBLE QUESTION CARDS LIST */}
      <div className="space-y-2.5">
        {currentSection.questions.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
            <FileQuestion className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-xs text-slate-600 font-medium">No questions in this section yet</div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleAddQuestion(currentSection.type)}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                + Add Single Question
              </button>
              <button
                type="button"
                onClick={() => setIsJsonModalOpen(true)}
                className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileJson className="w-3.5 h-3.5 text-cyan-700" />
                <span>Fill JSON Structure (LaTeX & Matrix)</span>
              </button>
            </div>
          </div>
        ) : (
          currentSection.questions.map((question, qIdx) => {
            const isExpanded = isQuestionExpanded(question.id);
            const correctOptLetter = question.correctAnswerIndex !== undefined && question.options
              ? ['A', 'B', 'C', 'D', 'E'][question.correctAnswerIndex] || 'None'
              : undefined;

            return (
              <div
                key={question.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
              >
                {/* COLLAPSED QUESTION HEADER / SUMMARY BAR */}
                <div
                  onClick={() => toggleQuestionExpanded(question.id)}
                  className="p-3 flex items-center justify-between gap-2.5 hover:bg-slate-50/80 cursor-pointer transition-colors select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Expand/Collapse Chevron Indicator */}
                    <div className="text-slate-400 shrink-0">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-700" /> : <ChevronRight className="w-4 h-4" />}
                    </div>

                    {/* Question Number Badge */}
                    <span className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold font-times text-slate-900 shrink-0">
                      {question.number || `${qIdx + 1}`}
                    </span>

                    {/* Truncated Question Text preview */}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-times text-slate-900 truncate leading-snug">
                        {question.questionText ? (
                          <MathRenderer text={question.questionText} inline />
                        ) : (
                          <span className="italic text-slate-400">Empty question text...</span>
                        )}
                      </div>
                      {/* Sub-info if collapsed */}
                      {!isExpanded && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          {currentSection.type === 'mcq' && question.options && (
                            <span>{question.options.length} options</span>
                          )}
                          {question.subQuestions && question.subQuestions.length > 0 && (
                            <span>{question.subQuestions.length} sub-parts</span>
                          )}
                          {question.codeSnippet && <span>Contains Code</span>}
                        </div>
                      )}
                    </div>

                    {/* Correct Answer Key Chip for MCQs */}
                    {currentSection.type === 'mcq' && correctOptLetter && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold font-mono-code bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
                        <Check className="w-3 h-3 text-emerald-600" /> Key: ({correctOptLetter})
                      </span>
                    )}

                    {/* Question Marks Badge */}
                    {question.marks && (
                      <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md shrink-0 font-times">
                        {question.marks}m
                      </span>
                    )}
                  </div>

                  {/* Reorder and management icons */}
                  <div
                    className="flex items-center gap-0.5 text-slate-400 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      disabled={qIdx === 0}
                      onClick={() => handleMoveQuestion(qIdx, 'up')}
                      className="p-1 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={qIdx === currentSection.questions.length - 1}
                      onClick={() => handleMoveQuestion(qIdx, 'down')}
                      className="p-1 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateQuestion(question)}
                      className="p-1 hover:text-slate-800 cursor-pointer"
                      title="Duplicate question"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="p-1 hover:text-rose-600 cursor-pointer"
                      title="Delete question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* EXPANDED DETAILED EDITOR PANEL */}
                {isExpanded && (
                  <div className="p-3.5 pt-2 border-t border-slate-100 space-y-3 bg-white">
                    {/* Math & Quick Symbols Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEquationTarget({ qId: question.id, field: 'questionText' })}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-white border border-slate-300 hover:border-cyan-600 hover:text-cyan-700 rounded-md shadow-2xs transition-colors cursor-pointer text-slate-800"
                          title="Open Equation Helper & Math Formulas Palette"
                        >
                          <Sigma className="w-3.5 h-3.5 text-cyan-600" />
                          <span>Insert Equation / Formula</span>
                        </button>
                      </div>

                      {/* Quick symbols */}
                      <div className="flex items-center flex-wrap gap-1">
                        <span className="text-[10px] text-slate-400 font-semibold mr-0.5">Quick:</span>
                        {['±', '×', '÷', '√', '²', '³', 'π', 'θ', 'Δ', '∫', 'Σ', '→', '≈', '≠', '≤', '≥', '°', '½'].map((sym) => (
                          <button
                            key={sym}
                            type="button"
                            onClick={() => handleQuickInsertSymbol(question.id, sym, 'questionText')}
                            className="w-5 h-5 flex items-center justify-center text-xs font-mono-code bg-white hover:bg-slate-200 border border-slate-200 rounded hover:border-slate-400 text-slate-800 transition-all cursor-pointer"
                            title={`Insert ${sym}`}
                          >
                            {sym}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Row 1: Number, Question Text & Marks */}
                    <div className="flex items-start gap-2">
                      <div className="w-14 shrink-0">
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5 text-center">
                          Label / #
                        </label>
                        <input
                          type="text"
                          value={question.number}
                          onChange={(e) => handleUpdateQuestion(question.id, { number: e.target.value })}
                          className="w-full text-center text-xs font-bold font-times px-1 py-1.5 border border-slate-300 rounded-lg bg-slate-50 focus:border-slate-800 focus:outline-hidden"
                          title="Question number / label (e.g. i, 1, a)"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="block text-[10px] font-semibold text-slate-500">
                            Question Statement (Supports multi-line, LaTeX $...$ & $$...$$)
                          </label>
                          <span className="text-[10px] text-slate-400 italic">Enter key for new lines</span>
                        </div>
                        <textarea
                          rows={2}
                          value={question.questionText}
                          onChange={(e) => handleUpdateQuestion(question.id, { questionText: e.target.value })}
                          placeholder="Enter question text here (e.g. Solve the equation: $x^2 - 5x + 6 = 0$)..."
                          className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-times leading-relaxed bg-white"
                        />

                        {/* Live Rendered Math Preview if equation or newlines detected */}
                        {question.questionText && (question.questionText.includes('$') || question.questionText.includes('\n') || question.questionText.includes('\\')) && (
                          <div className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-times text-slate-900 leading-normal">
                            <div className="text-[10px] font-sans font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-cyan-600" /> Live Formatted Preview:
                            </div>
                            <MathRenderer text={question.questionText} />
                          </div>
                        )}
                      </div>

                      {/* Marks input */}
                      <div className="w-16 shrink-0">
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5 text-center">
                          Marks
                        </label>
                        <input
                          type="text"
                          value={question.marks || ''}
                          onChange={(e) => handleUpdateQuestion(question.id, { marks: e.target.value })}
                          placeholder="Marks"
                          className="w-full text-center text-xs px-1.5 py-1.5 border border-slate-300 rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-times bg-white"
                          title="Marks for this question"
                        />
                      </div>
                    </div>

                    {/* SubText / Context / Note */}
                    <div>
                      <input
                        type="text"
                        value={question.subText || ''}
                        onChange={(e) => handleUpdateQuestion(question.id, { subText: e.target.value })}
                        placeholder="Optional context, hint, or sub-instruction..."
                        className="w-full text-xs px-3 py-1 border border-slate-200 rounded-lg focus:border-slate-800 focus:outline-hidden font-times italic text-slate-700 bg-slate-50/60"
                      />
                    </div>

                    {/* Code Snippet for Practical / Programming Questions */}
                    {(currentSection.type === 'practical' || question.codeSnippet !== undefined) && (
                      <div className="space-y-1 bg-slate-900 text-white p-3 rounded-xl">
                        <div className="flex items-center justify-between text-xs text-slate-300 font-mono-code">
                          <span className="flex items-center gap-1.5 font-bold">
                            <Code2 className="w-3.5 h-3.5 text-cyan-400" /> Code Snippet / Problem Stub:
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={question.codeSnippet || ''}
                          onChange={(e) => handleUpdateQuestion(question.id, { codeSnippet: e.target.value })}
                          placeholder="// Enter code snippet, algorithm, or function header..."
                          className="w-full text-xs font-mono-code p-2.5 bg-slate-950 text-slate-100 rounded-lg border border-slate-800 focus:outline-hidden focus:border-cyan-500"
                        />
                      </div>
                    )}

                    {/* MCQ Options Editor with Correct Answer Radio Selector */}
                    {currentSection.type === 'mcq' && question.options && (
                      <div className="space-y-2 pt-1 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                            <span>MCQ Options & Answer Key:</span>
                            <span className="text-[10px] font-normal text-slate-500">
                              (Select circle to mark correct answer)
                            </span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {question.options.map((opt, optIdx) => {
                            const bulletLabel = ['A', 'B', 'C', 'D', 'E', 'F'][optIdx] || `${optIdx + 1}`;
                            const isCorrect = question.correctAnswerIndex === optIdx;

                            return (
                              <div
                                key={optIdx}
                                className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition-all ${
                                  isCorrect
                                    ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                {/* Correct Answer Radio Button */}
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuestion(question.id, { correctAnswerIndex: optIdx })}
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono-code transition-all cursor-pointer shrink-0 ${
                                    isCorrect
                                      ? 'bg-emerald-600 text-white shadow-2xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
                                  }`}
                                  title={`Mark Option ${bulletLabel} as Correct Answer`}
                                >
                                  {isCorrect ? '✓' : bulletLabel}
                                </button>

                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const newOpts = [...(question.options || [])];
                                    newOpts[optIdx] = e.target.value;
                                    handleUpdateQuestion(question.id, { options: newOpts });
                                  }}
                                  placeholder={`Option ${bulletLabel}`}
                                  className={`flex-1 text-xs px-2.5 py-1 border rounded-lg focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden font-times bg-white ${
                                    isCorrect ? 'border-emerald-300 font-semibold' : 'border-slate-300'
                                  }`}
                                />

                                {/* Formula button for option */}
                                <button
                                  type="button"
                                  onClick={() => setEquationTarget({ qId: question.id, field: 'option', optIdx })}
                                  className="text-slate-400 hover:text-cyan-600 p-0.5 cursor-pointer"
                                  title="Insert math formula into this option"
                                >
                                  <Sigma className="w-3.5 h-3.5" />
                                </button>

                                {question.options && question.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newOpts = question.options?.filter((_, i) => i !== optIdx);
                                      let newCorrect = question.correctAnswerIndex;
                                      if (newCorrect === optIdx) newCorrect = 0;
                                      else if (newCorrect !== undefined && newCorrect > optIdx) newCorrect -= 1;
                                      handleUpdateQuestion(question.id, { options: newOpts, correctAnswerIndex: newCorrect });
                                    }}
                                    className="text-slate-300 hover:text-rose-600 p-0.5 cursor-pointer"
                                    title="Remove option"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Add Option Button & Answer Explanation */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          {question.options.length < 5 && (
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdateQuestion(question.id, {
                                  options: [...(question.options || []), `Option ${String.fromCharCode(65 + (question.options?.length || 0))}`],
                                });
                              }}
                              className="text-[11px] text-slate-700 hover:text-slate-900 flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Add Option ({String.fromCharCode(65 + question.options.length)})
                            </button>
                          )}

                          {/* Optional Answer Note / Solution Explanation */}
                          <div className="flex-1 min-w-[200px] text-right">
                            <input
                              type="text"
                              value={question.correctAnswerNote || ''}
                              onChange={(e) => handleUpdateQuestion(question.id, { correctAnswerNote: e.target.value })}
                              placeholder="Optional teacher explanation / solution note..."
                              className="w-full text-[11px] px-2 py-0.5 border border-slate-200 rounded-md text-slate-600 italic bg-slate-50 focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sub-Questions for Short and Long Questions */}
                    {currentSection.type !== 'mcq' && (
                      <div className="space-y-2 pt-1 border-t border-slate-100">
                        {question.subQuestions && question.subQuestions.length > 0 && (
                          <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                            <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                              <span>Sub-parts / Sub-questions:</span>
                            </div>
                            {question.subQuestions.map((subQ, subIdx) => (
                              <div key={subQ.id} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={subQ.label}
                                  onChange={(e) => {
                                    const newSubs = [...(question.subQuestions || [])];
                                    newSubs[subIdx].label = e.target.value;
                                    handleUpdateQuestion(question.id, { subQuestions: newSubs });
                                  }}
                                  className="w-10 text-xs font-bold text-center border border-slate-300 rounded-md px-1 py-1 font-times bg-white"
                                />
                                <input
                                  type="text"
                                  value={subQ.text}
                                  onChange={(e) => {
                                    const newSubs = [...(question.subQuestions || [])];
                                    newSubs[subIdx].text = e.target.value;
                                    handleUpdateQuestion(question.id, { subQuestions: newSubs });
                                  }}
                                  placeholder="Sub-question text (supports math $...$)..."
                                  className="flex-1 text-xs border border-slate-300 rounded-md px-2 py-1 font-times bg-white focus:outline-hidden focus:border-slate-800"
                                />
                                <button
                                  type="button"
                                  onClick={() => setEquationTarget({ qId: question.id, field: 'subQuestion', subIdx })}
                                  className="text-slate-400 hover:text-cyan-600 p-1 cursor-pointer"
                                  title="Insert math formula into sub-question"
                                >
                                  <Sigma className="w-3.5 h-3.5" />
                                </button>
                                <input
                                  type="text"
                                  value={subQ.marks || ''}
                                  onChange={(e) => {
                                    const newSubs = [...(question.subQuestions || [])];
                                    newSubs[subIdx].marks = e.target.value;
                                    handleUpdateQuestion(question.id, { subQuestions: newSubs });
                                  }}
                                  placeholder="Marks"
                                  className="w-14 text-xs text-center border border-slate-300 rounded-md px-1 py-1 font-times bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSubs = question.subQuestions?.filter((_, i) => i !== subIdx);
                                    handleUpdateQuestion(question.id, { subQuestions: newSubs });
                                  }}
                                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              const count = question.subQuestions?.length || 0;
                              const defaultLabel = currentSection.type === 'short' ? `${count + 1})` : `(${String.fromCharCode(97 + count)})`;
                              const newSub = {
                                id: `sub-${Date.now()}`,
                                label: defaultLabel,
                                text: '',
                                marks: '',
                              };
                              handleUpdateQuestion(question.id, {
                                subQuestions: [...(question.subQuestions || []), newSub],
                              });
                            }}
                            className="text-[11px] text-slate-700 hover:text-slate-900 flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Add Sub-part (a / b or 1 / 2)
                          </button>

                          {/* Answer Lines Toggle for Student Sheet */}
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium">
                            <span>Answer lines:</span>
                            <select
                              value={question.answerLinesCount || 0}
                              onChange={(e) => handleUpdateQuestion(question.id, { answerLinesCount: parseInt(e.target.value) })}
                              className="text-[11px] border border-slate-300 rounded-md px-2 py-0.5 bg-white focus:outline-hidden"
                            >
                              <option value="0">None (Questions only)</option>
                              <option value="3">3 Blank Lines</option>
                              <option value="5">5 Blank Lines</option>
                              <option value="8">8 Blank Lines</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bulk MCQ Import Modal */}
      {bulkModalSection && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                Bulk Add Multiple Choice Questions
              </h4>
              <button
                type="button"
                onClick={() => setBulkModalSection(null)}
                className="text-slate-400 hover:text-slate-800 text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Paste questions separated by a blank line. Mark correct options with an asterisk (<code>*</code>) or <code>(correct)</code>:
            </p>

            <textarea
              rows={8}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`Which OS function manages memory?
File management
CPU management
* Memory management
User interface

Which control structure chooses between alternatives?
Sequence
* Selection
Iteration
Input`}
              className="w-full text-xs font-mono-code p-3 border border-slate-300 rounded-xl focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden bg-slate-50"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBulkModalSection(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessBulkMCQ}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-xs cursor-pointer ring-1 ring-slate-800"
              >
                Import Questions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Equation & Math Formula Palette Modal */}
      <EquationHelper
        isOpen={!!equationTarget}
        onClose={() => setEquationTarget(null)}
        onInsert={handleInsertEquationFromModal}
      />

      {/* JSON Question Structure Generator & Importer Modal */}
      <JsonQuestionModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        sections={sections}
        activeSectionId={activeSectionId}
        onInsertQuestions={handleInsertJsonQuestions}
      />
    </div>
  );
};
