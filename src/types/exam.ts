export type SectionId = string;

export type SectionType =
  | 'mcq'
  | 'short'
  | 'long'
  | 'practical'
  | 'fill-blanks'
  | 'true-false'
  | 'custom';

export type OptionBulletStyle = 'bullet' | 'alpha-lower' | 'alpha-upper' | 'roman-lower' | 'numeric';
export type QuestionNumberStyle = 'roman-lower' | 'roman-upper' | 'numeric' | 'alpha-lower' | 'alpha-upper';

export interface ExamHeader {
  institutionName: string;
  examTitle: string;
  subTitle: string;
  subject: string;
  paperCode: string;
  date: string;
  duration: string;
  maxMarks: string;
  extraFieldLeft?: string;
  extraFieldRight?: string;
  showCandidateFields: boolean;
  candidateNameLabel: string;
  candidateRollLabel: string;
  dividerStyle: 'double' | 'solid' | 'dashed' | 'thick' | 'none';
  headerAlignment: 'center' | 'left';
}

export interface ExamSubQuestion {
  id: string;
  label: string; // e.g. "a)", "1)"
  text: string;
  marks?: string;
}

export interface ExamQuestion {
  id: string;
  number: string; // e.g. "i", "1", "a"
  questionText: string;
  marks?: string;
  subText?: string;
  options?: string[]; // For Section A (MCQs)
  correctAnswerIndex?: number; // 0 for A, 1 for B, 2 for C, 3 for D etc.
  correctAnswerNote?: string; // Optional answer note / rationale / solution
  subQuestions?: ExamSubQuestion[]; // For multi-part / descriptive questions
  answerLinesCount?: number; // 0 for none, 3, 5, 8 for student answer sheet space
  codeSnippet?: string; // For practical / programming questions
  showDiagramBox?: boolean;
}

export interface ExamSection {
  id: SectionId;
  letter: string; // 'A' | 'B' | 'C' | 'D' | 'E' etc.
  name?: string; // e.g. 'Section A: Multiple Choice', 'Section B: Theoretical', 'Section C: Practical'
  enabled: boolean;
  title: string; // e.g., 'SECTION "A"' or 'SECTION A: MULTIPLE CHOICE'
  subtitle: string; // e.g., 'MULTIPLE CHOICE QUESTIONS' or 'THEORETICAL' or 'PRACTICAL'
  marks: string; // e.g., '(10 marks)'
  instructionPrompt: string; // e.g., 'Q1. Attempt all questions from this section. Each question carries equal marks'
  choiceRule?: string; // e.g., 'Attempt all questions' | 'Attempt any 5 out of 8' | 'Compulsory'
  fieldNote?: string; // Custom instruction / field under section (e.g., 'Overwriting is not allowed')
  type: SectionType;
  columnLayout: '1-col' | '2-col' | 'inherit';
  mcqColumns: 1 | 2 | 4;
  defaultOptionCount?: number; // 2, 3, 4, 5 options
  negativeMarking?: string; // e.g. '0.25 mark per wrong answer'
  marksPerQuestion?: string; // e.g. '1 mark each'
  timeAllowed?: string; // e.g. '15 minutes'
  questions: ExamQuestion[];
}

export interface FormattingOptions {
  fontFamily: 'Times New Roman' | 'Georgia' | 'Garamond' | 'Arial' | 'Tinos';
  baseFontSize: number; // 10, 11, 12, 13, 14 pt
  headerScale: number; // 1.0 - 1.4
  lineSpacing: 'tight' | 'normal' | 'relaxed' | 'double';
  paperSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  marginTop: number; // in inches
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  marginUnit: 'in' | 'cm' | 'mm';
  globalColumns: 1 | 2;
  columnGap: number; // in px or pt
  showPageNumbers: boolean;
  pageNumberPosition: 'bottom-center' | 'bottom-right' | 'top-right';
  watermarkText: string;
  watermarkOpacity: number;
  optionBulletStyle: OptionBulletStyle;
  questionNumberStyle: QuestionNumberStyle;
  underlineSectionHeaders: boolean;
  allCapsHeaders: boolean;
  showSectionBorders: boolean;
  showAnswerKey: boolean; // Teacher answer key / solution marking scheme mode
  answerKeyDisplayMode: 'inline' | 'appendix' | 'both'; // inline checkmark/underline, or appendix table at bottom
}

export interface ExamPaperData {
  id: string;
  name: string;
  header: ExamHeader;
  formatting: FormattingOptions;
  sections: ExamSection[];
  createdAt: string;
  updatedAt: string;
}
