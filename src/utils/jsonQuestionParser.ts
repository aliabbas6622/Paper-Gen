import { ExamQuestion, ExamSubQuestion, SectionType } from '../types/exam';

export interface JsonQuestionInput {
  number?: string;
  questionText: string;
  marks?: string | number;
  subText?: string;
  options?: string[];
  correctAnswerIndex?: number;
  correctAnswerNote?: string;
  subQuestions?: Array<{
    label?: string;
    text: string;
    marks?: string | number;
  }>;
  answerLinesCount?: number;
  codeSnippet?: string;
  showDiagramBox?: boolean;
}

export interface ParseResult {
  success: boolean;
  questions: ExamQuestion[];
  error?: string;
  detectedType?: SectionType;
}

/**
 * Normalizes input string that may have raw single backslashes from LaTeX
 * or markdown code fences (```json ... ```)
 */
export function sanitizeJsonString(raw: string): string {
  let cleaned = raw.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/, '');
  }

  cleaned = cleaned.trim();
  return cleaned;
}

/**
 * Attempts to parse JSON string. If standard JSON.parse fails due to single backslashes
 * (common when users paste LaTeX like \begin{pmatrix} instead of \\begin{pmatrix}),
 * or multiple JSON objects concatenated together, this helper handles all variations.
 */
export function smartJsonParse(jsonString: string): any {
  const sanitized = sanitizeJsonString(jsonString);

  if (!sanitized) {
    throw new Error('Input is empty');
  }

  // 1. Try standard direct JSON parse
  try {
    return JSON.parse(sanitized);
  } catch (initialErr: any) {
    // 2. If it's multiple top-level objects like `{ ... } { ... }` or separated by commas without outer `[ ]`
    const trimmed = sanitized.trim();
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('{') && !trimmed.startsWith('['))
    ) {
      // Check if it's multiple objects separated by commas or whitespace without outer array brackets
      const wrappedAsArray = `[${trimmed.replace(/}\s*,\s*{/g, '},{').replace(/}\s+{/g, '},{')}]`;
      try {
        return JSON.parse(wrappedAsArray);
      } catch {
        // Continue to escape logic
      }
    }

    // 3. Attempt to escape unescaped LaTeX backslashes
    // Look for backslashes that are not followed by valid JSON escape characters: " \ / b f n r t u
    const escaped = sanitized.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
    try {
      return JSON.parse(escaped);
    } catch {
      // 4. Try wrapped as array with escaped backslashes
      if (!escaped.startsWith('[')) {
        const wrappedEscaped = `[${escaped.replace(/}\s*,\s*{/g, '},{').replace(/}\s+{/g, '},{')}]`;
        try {
          return JSON.parse(wrappedEscaped);
        } catch {
          // Pass through to final error
        }
      }
      // Re-throw initial error with helpful message
      throw initialErr;
    }
  }
}

/**
 * Converts a raw JSON object/array into strongly typed ExamQuestion objects.
 * Supports:
 * - Array of questions: `[ { "questionText": "Q1" }, { "questionText": "Q2" } ]`
 * - Object with questions/items/data: `{ "questions": [ ... ] }` or `{ "data": [ ... ] }`
 * - Single question object: `{ "questionText": "..." }`
 * - Multiple concatenated objects: `{...}, {...}` or `{...} {...}`
 */
export function parseAndGenerateQuestions(
  jsonInput: string | object,
  startingIndex: number = 0,
  defaultMarks: string = ''
): ParseResult {
  try {
    let parsed: any;
    if (typeof jsonInput === 'string') {
      if (!jsonInput.trim()) {
        return {
          success: false,
          questions: [],
          error: 'JSON string is empty. Please paste or enter question JSON data.',
        };
      }
      parsed = smartJsonParse(jsonInput);
    } else {
      parsed = jsonInput;
    }

    // Extract raw questions list from various possible JSON structures
    let rawQuestions: any[] = [];
    if (Array.isArray(parsed)) {
      rawQuestions = parsed;
    } else if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.questions)) {
        rawQuestions = parsed.questions;
      } else if (Array.isArray(parsed.items)) {
        rawQuestions = parsed.items;
      } else if (Array.isArray(parsed.data)) {
        rawQuestions = parsed.data;
      } else if (Array.isArray(parsed.list)) {
        rawQuestions = parsed.list;
      } else if (parsed.questionText !== undefined || parsed.text !== undefined || parsed.question !== undefined) {
        rawQuestions = [parsed];
      } else {
        // Check if values of the object are question objects (e.g. { "q1": {...}, "q2": {...} })
        const values = Object.values(parsed);
        if (values.length > 0 && typeof values[0] === 'object' && values[0] !== null && (
          (values[0] as any).questionText !== undefined || 
          (values[0] as any).text !== undefined || 
          (values[0] as any).question !== undefined
        )) {
          rawQuestions = values;
        } else {
          return {
            success: false,
            questions: [],
            error: 'Invalid format: Provide an array `[ { "questionText": "..." }, { "questionText": "..." } ]` or `{ "questions": [ ... ] }`.',
          };
        }
      }
    } else {
      return {
        success: false,
        questions: [],
        error: 'Input must be a valid JSON array or object.',
      };
    }

    if (rawQuestions.length === 0) {
      return {
        success: false,
        questions: [],
        error: 'No questions found in the provided JSON data.',
      };
    }

    const generatedQuestions: ExamQuestion[] = [];
    let detectedType: SectionType = 'short';

    rawQuestions.forEach((qObj: any, idx: number) => {
      if (!qObj || typeof qObj !== 'object') return;

      const qIndex = startingIndex + idx;
      const questionId = `q-json-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`;

      // Validate questionText (allow questionText, question, or text)
      const rawText = qObj.questionText ?? qObj.question ?? qObj.text ?? qObj.title;
      const questionText = rawText !== undefined && rawText !== null
        ? String(rawText)
        : `Question ${qIndex + 1}`;

      // Handle marks
      let marks = '';
      if (qObj.marks !== undefined && qObj.marks !== null) {
        marks = String(qObj.marks).replace(/[\[\]]/g, '').trim();
      } else if (qObj.mark !== undefined && qObj.mark !== null) {
        marks = String(qObj.mark).replace(/[\[\]]/g, '').trim();
      } else if (defaultMarks) {
        marks = defaultMarks;
      }

      // Handle number
      const number = qObj.number ? String(qObj.number) : `${qIndex + 1}`;

      // Handle options for MCQs
      let options: string[] | undefined = undefined;
      const rawOptions = qObj.options ?? qObj.choices ?? qObj.answers;
      if (Array.isArray(rawOptions) && rawOptions.length > 0) {
        options = rawOptions.map((opt: any) => String(opt));
        detectedType = 'mcq';
      }

      // Handle correct answer index
      let correctAnswerIndex: number | undefined = undefined;
      const rawCorrect = qObj.correctAnswerIndex ?? qObj.correctIndex ?? qObj.answerIndex;
      if (typeof rawCorrect === 'number') {
        correctAnswerIndex = rawCorrect;
      } else if (rawCorrect !== undefined && !isNaN(Number(rawCorrect))) {
        correctAnswerIndex = Number(rawCorrect);
      } else if (typeof qObj.correctAnswer === 'string' && options) {
        // e.g. "A" or exact string match
        const letterIdx = qObj.correctAnswer.toUpperCase().charCodeAt(0) - 65;
        if (letterIdx >= 0 && letterIdx < options.length) {
          correctAnswerIndex = letterIdx;
        } else {
          const matchIdx = options.indexOf(qObj.correctAnswer);
          if (matchIdx !== -1) correctAnswerIndex = matchIdx;
        }
      }

      // Handle sub-questions
      let subQuestions: ExamSubQuestion[] | undefined = undefined;
      const rawSub = qObj.subQuestions ?? qObj.parts ?? qObj.subparts;
      if (Array.isArray(rawSub) && rawSub.length > 0) {
        subQuestions = rawSub.map((sub: any, sIdx: number) => ({
          id: `sub-json-${Date.now()}-${sIdx}-${Math.random().toString(36).substr(2, 3)}`,
          label: sub.label ? String(sub.label) : `(${String.fromCharCode(97 + sIdx)})`,
          text: sub.text ? String(sub.text) : (sub.questionText ? String(sub.questionText) : ''),
          marks: sub.marks ? String(sub.marks).replace(/[\[\]\(\)]/g, '').trim() : undefined,
        }));
        if (detectedType !== 'mcq') {
          detectedType = 'long';
        }
      }

      const examQuestion: ExamQuestion = {
        id: questionId,
        number,
        questionText,
        marks: marks || undefined,
        subText: qObj.subText ? String(qObj.subText) : (qObj.note ? String(qObj.note) : undefined),
        options,
        correctAnswerIndex,
        correctAnswerNote: qObj.correctAnswerNote ? String(qObj.correctAnswerNote) : undefined,
        subQuestions,
        answerLinesCount: typeof qObj.answerLinesCount === 'number' ? qObj.answerLinesCount : undefined,
        codeSnippet: qObj.codeSnippet ? String(qObj.codeSnippet) : undefined,
        showDiagramBox: Boolean(qObj.showDiagramBox),
      };

      generatedQuestions.push(examQuestion);
    });

    return {
      success: true,
      questions: generatedQuestions,
      detectedType,
    };
  } catch (err: any) {
    return {
      success: false,
      questions: [],
      error: `JSON Parse Error: ${err.message || 'Malformed JSON syntax'}`,
    };
  }
}

/**
 * Built-in Preset JSON templates for quick selection
 */
export const JSON_QUESTION_PRESETS = [
  {
    id: 'multi-question-set',
    title: 'Multiple Questions Array (3 Math Questions)',
    description: 'Array of multiple questions [ {...}, {...}, {...} ] including matrices, derivatives, and integrals',
    json: JSON.stringify(
      [
        {
          number: '1',
          questionText: 'Given the matrices $A = \\begin{pmatrix} 2 & -1 \\\\ 3 & 4 \\end{pmatrix}$ and $B = \\begin{pmatrix} 1 & 0 \\\\ -2 & 5 \\end{pmatrix}$:\nEvaluate $AB - 2I_2$, where $I_2 = \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}$.',
          marks: '5',
          subText: 'Show all intermediate multiplication steps.'
        },
        {
          number: '2',
          questionText: 'Evaluate the definite integral: $\\int_{0}^{\\frac{\\pi}{2}} \\sin^2(x) \\cos(x) \\, dx$.',
          marks: '5',
          subText: 'Use the substitution method with $u = \\sin(x)$.'
        },
        {
          number: '3',
          questionText: 'Solve the system of linear equations using Cramer\'s Rule:\n$\\begin{cases} 2x + 3y = 7 \\\\ 4x - y = 7 \\end{cases}$',
          marks: '6',
          subQuestions: [
            {
              label: '(a)',
              text: 'Find coefficient determinant $D = \\begin{vmatrix} 2 & 3 \\\\ 4 & -1 \\end{vmatrix}$.',
              marks: '2'
            },
            {
              label: '(b)',
              text: 'Find $D_x$ and $D_y$, then solve for $(x, y)$.',
              marks: '4'
            }
          ]
        }
      ],
      null,
      2
    ),
  },
  {
    id: 'matrix-mcq',
    title: 'Multiple MCQs Array (5 Choice Questions)',
    description: 'Array of multiple choice questions with options and answer keys',
    json: JSON.stringify(
      [
        {
          number: 'i',
          questionText: 'What is the determinant of $M = \\begin{bmatrix} 4 & 2 \\\\ 1 & 3 \\end{bmatrix}$?',
          marks: '1',
          options: [
            '$10$',
            '$14$',
            '$8$',
            '$-10$'
          ],
          correctAnswerIndex: 0,
          correctAnswerNote: '$\\det(M) = (4)(3) - (2)(1) = 12 - 2 = 10$'
        },
        {
          number: 'ii',
          questionText: 'If $\\det(A) = 5$ for a $3 \\times 3$ matrix $A$, what is $\\det(2A)$?',
          marks: '1',
          options: [
            '$10$',
            '$40$',
            '$25$',
            '$80$'
          ],
          correctAnswerIndex: 1,
          correctAnswerNote: '$\\det(kA) = k^n \\det(A) = 2^3 \\times 5 = 40$'
        },
        {
          number: 'iii',
          questionText: 'The derivative $\\frac{d}{dx} \\left( e^{x^2} \\right)$ is equal to:',
          marks: '1',
          options: [
            '$e^{x^2}$',
            '$2x e^{x^2}$',
            '$x e^{x^2}$',
            '$2e^{x^2}$'
          ],
          correctAnswerIndex: 1
        }
      ],
      null,
      2
    ),
  },
  {
    id: 'matrix-algebra',
    title: 'Single Multi-Part Problem (with (a), (b), (c))',
    description: 'Single question with multi-part subquestions and matrix proofs',
    json: JSON.stringify(
      {
        number: '1',
        questionText: 'Given the matrices $A = \\begin{pmatrix} 2 & -1 \\\\ 3 & 4 \\end{pmatrix}$ and $B = \\begin{pmatrix} 1 & 0 \\\\ -2 & 5 \\end{pmatrix}$:\nEvaluate the matrix operations and determine the invertibility of $A$.',
        marks: '8',
        subText: 'Show all step-by-step matrix multiplication and determinant calculations.',
        subQuestions: [
          {
            label: '(a)',
            text: 'Compute the matrix product $AB = \\begin{pmatrix} 2 & -1 \\\\ 3 & 4 \\end{pmatrix} \\begin{pmatrix} 1 & 0 \\\\ -2 & 5 \\end{pmatrix}$.',
            marks: '3'
          },
          {
            label: '(b)',
            text: 'Calculate the determinant $\\det(A) = \\begin{vmatrix} 2 & -1 \\\\ 3 & 4 \\end{vmatrix}$ and find the inverse matrix $A^{-1}$.',
            marks: '3'
          },
          {
            label: '(c)',
            text: 'Verify the matrix equation: $A \\cdot A^{-1} = I_2$, where $I_2 = \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}$.',
            marks: '2'
          }
        ]
      },
      null,
      2
    ),
  },
  {
    id: 'calculus-integrals',
    title: 'Calculus & Integration (Multi-Part)',
    description: 'Definite integrals, derivatives, limits, and piecewise functions',
    json: JSON.stringify(
      {
        number: '2',
        questionText: 'Evaluate the following calculus problems using fundamental theorems:',
        marks: '10',
        subQuestions: [
          {
            label: '(a)',
            text: 'Evaluate the definite integral: $I = \\int_{0}^{\\frac{\\pi}{2}} \\sin^2(x) \\cos(x) \\, dx$.',
            marks: '4'
          },
          {
            label: '(b)',
            text: 'Find $\\frac{dy}{dx}$ for the implicit function $x^3 + y^3 = 3axy$.',
            marks: '3'
          },
          {
            label: '(c)',
            text: 'Determine the limit: $\\lim_{x \\to 0} \\frac{\\sqrt{1 + x} - \\sqrt{1 - x}}{x}$.',
            marks: '3'
          }
        ]
      },
      null,
      2
    ),
  },
  {
    id: 'empty-multi-template',
    title: 'Blank Multiple Questions Template [ {...}, {...} ]',
    description: 'Clean array template with 2 skeleton questions ready to fill',
    json: JSON.stringify(
      [
        {
          number: '1',
          questionText: 'First question text here with optional math like $E = mc^2$ or $\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$.',
          marks: '5',
          subText: 'Optional instructions or hints for question 1.'
        },
        {
          number: '2',
          questionText: 'Second question text here with formula $\\int f(x) dx$.',
          marks: '5',
          subQuestions: [
            {
              label: '(a)',
              text: 'Sub-part A statement',
              marks: '2'
            },
            {
              label: '(b)',
              text: 'Sub-part B statement',
              marks: '3'
            }
          ]
        }
      ],
      null,
      2
    ),
  },
];
