import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
  UnderlineType,
  PageNumber,
  Footer,
} from 'docx';
import { saveAs } from 'file-saver';
import { ExamPaperData, ExamSection, ExamQuestion } from '../types/exam';

export function latexToUnicodeMath(raw: string): string {
  if (!raw) return '';
  let str = raw;

  // Handle standard display and inline math delimiters
  str = str.replace(/\$\$([\s\S]*?)\$\$/g, '$1');
  str = str.replace(/\$([^\$]+)\$/g, '$1');

  // Convert matrix environments: \begin{pmatrix} a & b \\ c & d \end{pmatrix} -> ( a  b ; c  d )
  str = str.replace(/\\begin\{(pmatrix|bmatrix|vmatrix|Vmatrix|matrix)\}([\s\S]*?)\\end\{\1\}/g, (_, type, inner) => {
    const rows = inner
      .trim()
      .split(/\\\\/)
      .map((row: string) => row.trim().split('&').map((cell: string) => cell.trim()).join('  '))
      .join(' ; ');
    
    if (type === 'pmatrix') return `( ${rows} )`;
    if (type === 'vmatrix') return `| ${rows} |`;
    if (type === 'Vmatrix') return `|| ${rows} ||`;
    return `[ ${rows} ]`;
  });

  // Convert piecewise cases: \begin{cases} ... \end{cases}
  str = str.replace(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g, (_, inner) => {
    const lines = inner
      .trim()
      .split(/\\\\/)
      .map((row: string) => row.trim().split('&').map((cell: string) => cell.trim()).join('   if   '))
      .join(',  ');
    return `{ ${lines} }`;
  });

  // Fractions: \frac{a}{b} -> (a)/(b)
  str = str.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)');
  str = str.replace(/\\dfrac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)');

  // Square roots: \sqrt{x} -> √(x), \sqrt[n]{x} -> ⁿ√(x)
  str = str.replace(/\\sqrt\[([^\]]+)\]\{([^{}]+)\}/g, '($1)√($2)');
  str = str.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)');

  // Common math symbols and Greek letters
  const symbolMap: Record<string, string> = {
    '\\pm': '±',
    '\\mp': '∓',
    '\\times': '×',
    '\\div': '÷',
    '\\cdot': '·',
    '\\approx': '≈',
    '\\neq': '≠',
    '\\ne': '≠',
    '\\le': '≤',
    '\\leq': '≤',
    '\\ge': '≥',
    '\\geq': '≥',
    '\\ll': '≪',
    '\\gg': '≫',
    '\\infty': '∞',
    '\\to': '→',
    '\\rightarrow': '→',
    '\\leftarrow': '←',
    '\\Rightarrow': '⇒',
    '\\Leftarrow': '⇐',
    '\\leftrightarrow': '↔',
    '\\sum': 'Σ',
    '\\prod': 'Π',
    '\\int': '∫',
    '\\iint': '∬',
    '\\oint': '∮',
    '\\partial': '∂',
    '\\nabla': '∇',
    '\\in': '∈',
    '\\notin': '∉',
    '\\subset': '⊂',
    '\\subseteq': '⊆',
    '\\cup': '∪',
    '\\cap': '∩',
    '\\alpha': 'α',
    '\\beta': 'β',
    '\\gamma': 'γ',
    '\\delta': 'δ',
    '\\epsilon': 'ε',
    '\\zeta': 'ζ',
    '\\eta': 'η',
    '\\theta': 'θ',
    '\\iota': 'ι',
    '\\kappa': 'κ',
    '\\lambda': 'λ',
    '\\mu': 'μ',
    '\\nu': 'ν',
    '\\xi': 'ξ',
    '\\pi': 'π',
    '\\rho': 'ρ',
    '\\sigma': 'σ',
    '\\tau': 'τ',
    '\\phi': 'φ',
    '\\chi': 'χ',
    '\\psi': 'ψ',
    '\\omega': 'ω',
    '\\Gamma': 'Γ',
    '\\Delta': 'Δ',
    '\\Theta': 'Θ',
    '\\Lambda': 'Λ',
    '\\Xi': 'Ξ',
    '\\Pi': 'Π',
    '\\Sigma': 'Σ',
    '\\Phi': 'Φ',
    '\\Psi': 'Ψ',
    '\\Omega': 'Ω',
    '\\degree': '°',
    '\\circ': '°',
    '\\quad': '  ',
    '\\qquad': '    ',
    '\\,': ' ',
    '\\;': ' ',
    '\\!': '',
    '\\{': '{',
    '\\}': '}',
  };

  for (const [tex, sym] of Object.entries(symbolMap)) {
    str = str.split(tex).join(sym);
  }

  // Superscripts replacement
  const superMap: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
    'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ'
  };

  str = str.replace(/\^{([^{}]+)}/g, (_, exp) => {
    return exp.split('').map((char: string) => superMap[char] || char).join('');
  });
  str = str.replace(/\^([0-9a-zA-Z+-])/g, (_, char) => superMap[char] || `^${char}`);

  // Subscripts replacement
  const subMap: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
    'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ',
    'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ',
    's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ'
  };

  str = str.replace(/_{([^{}]+)}/g, (_, exp) => {
    return exp.split('').map((char: string) => subMap[char] || char).join('');
  });
  str = str.replace(/_([0-9a-zA-Z+-])/g, (_, char) => subMap[char] || `_${char}`);

  // Clean remaining braces from standard LaTeX groups
  str = str.replace(/\\text\{([^{}]+)\}/g, '$1');
  str = str.replace(/\\mathbf\{([^{}]+)\}/g, '$1');
  str = str.replace(/\\mathit\{([^{}]+)\}/g, '$1');

  return str;
}

export function createTextRunsWithMathAndBreaks(
  text: string,
  font: string,
  size: number,
  options?: {
    bold?: boolean;
    italics?: boolean;
    underline?: boolean;
  }
): TextRun[] {
  if (!text) return [];
  const converted = latexToUnicodeMath(text);
  const lines = converted.split('\n');

  const runs: TextRun[] = [];
  lines.forEach((line, index) => {
    runs.push(
      new TextRun({
        text: line,
        font,
        size,
        bold: options?.bold,
        italics: options?.italics,
        underline: options?.underline ? { type: UnderlineType.SINGLE } : undefined,
        break: index > 0 ? 1 : undefined,
      })
    );
  });

  return runs;
}

export async function exportToWord(examData: ExamPaperData) {
  const { header, formatting, sections } = examData;
  const font = formatting.fontFamily === 'Tinos' ? 'Times New Roman' : formatting.fontFamily;
  const baseSizePt = formatting.baseFontSize || 12;
  const halfPt = baseSizePt * 2; // docx font sizes are in half-points

  const children: (Paragraph | Table)[] = [];

  // Top header text
  if (header.institutionName?.trim()) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: header.institutionName.toUpperCase(),
            font,
            size: Math.round(halfPt * 1.15),
            bold: true,
          }),
        ],
      })
    );
  }

  // Exam Title (e.g. INTERMEDIATE EXAMINATION 2026-27)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: header.examTitle.toUpperCase(),
          font,
          size: Math.round(halfPt * 1.3),
          bold: true,
        }),
      ],
    })
  );

  // Subtitle (e.g. MONTHLY EXAMINATION: AUGUST)
  if (header.subTitle?.trim()) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: header.subTitle.toUpperCase(),
            font,
            size: Math.round(halfPt * 1.05),
            bold: true,
          }),
        ],
      })
    );
  }

  // Subject (e.g. COMPUTER SCIENCE)
  if (header.subject?.trim()) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: header.subject.toUpperCase(),
            font,
            size: Math.round(halfPt * 1.1),
            bold: true,
          }),
        ],
      })
    );
  }

  // Paper Code (e.g. SUBJECT: COMPUTER PAPER I)
  if (header.paperCode?.trim()) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: header.paperCode.toUpperCase(),
            font,
            size: Math.round(halfPt * 1.05),
            bold: true,
          }),
        ],
      })
    );
  }

  // Metadata Row: Date / Duration / Max Marks (Table with 3 cells, borderless)
  const metaCells: TableCell[] = [
    new TableCell({
      width: { size: 33, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [
            new TextRun({ text: 'Date: ', font, size: halfPt, bold: true }),
            new TextRun({ text: header.date || '—', font, size: halfPt }),
          ],
        }),
      ],
    }),
    new TableCell({
      width: { size: 34, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'Duration: ', font, size: halfPt, bold: true }),
            new TextRun({ text: header.duration || '—', font, size: halfPt }),
          ],
        }),
      ],
    }),
    new TableCell({
      width: { size: 33, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
        right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: 'Max. Marks: ', font, size: halfPt, bold: true }),
            new TextRun({ text: header.maxMarks || '—', font, size: halfPt }),
          ],
        }),
      ],
    }),
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ children: metaCells })],
    })
  );

  // Candidate Name & Roll No Fields
  if (header.showCandidateFields) {
    children.push(
      new Paragraph({
        spacing: { before: 80, after: 80 },
        children: [
          new TextRun({ text: `${header.candidateNameLabel || 'Name:'} `, font, size: halfPt, bold: true }),
          new TextRun({ text: '__________________________________        ', font, size: halfPt }),
          new TextRun({ text: `${header.candidateRollLabel || 'Roll No:'} `, font, size: halfPt, bold: true }),
          new TextRun({ text: '____________________', font, size: halfPt }),
        ],
      })
    );
  }

  // Divider Line
  if (header.dividerStyle !== 'none') {
    children.push(
      new Paragraph({
        spacing: { before: 40, after: 180 },
        border: {
          bottom: {
            color: '000000',
            space: 1,
            style: header.dividerStyle === 'double' ? BorderStyle.DOUBLE : BorderStyle.SINGLE,
            size: header.dividerStyle === 'thick' ? 16 : 8,
          },
        },
      })
    );
  } else {
    children.push(new Paragraph({ spacing: { after: 160 } }));
  }

  // Render Sections (A, B, C)
  const enabledSections = sections.filter((s) => s.enabled);

  enabledSections.forEach((section, sIndex) => {
    // Section Header Title (e.g. SECTION "A")
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: sIndex > 0 ? 240 : 60, after: 40 },
        children: [
          new TextRun({
            text: section.title.toUpperCase(),
            font,
            size: Math.round(halfPt * 1.25),
            bold: true,
            underline: formatting.underlineSectionHeaders ? { type: UnderlineType.SINGLE } : undefined,
          }),
        ],
      })
    );

    // Section Subtitle & Marks (e.g. MULTIPLE CHOICE QUESTIONS (10 marks))
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: section.subtitle.toUpperCase(),
            font,
            size: Math.round(halfPt * 1.1),
            bold: true,
            underline: formatting.underlineSectionHeaders ? { type: UnderlineType.SINGLE } : undefined,
          }),
          ...(section.marks?.trim()
            ? [
                new TextRun({
                  text: `   ${section.marks}`,
                  font,
                  size: halfPt,
                  bold: true,
                }),
              ]
            : []),
        ],
      })
    );

    // Instruction Prompt & Choice Rule (e.g. Q1. Attempt all questions... [Attempt any 5])
    if (section.instructionPrompt?.trim() || section.choiceRule) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            ...(section.instructionPrompt?.trim()
              ? createTextRunsWithMathAndBreaks(section.instructionPrompt, font, halfPt, { bold: true })
              : []),
            ...(section.choiceRule
              ? [
                  new TextRun({
                    text: `   [${section.choiceRule}]`,
                    font,
                    size: Math.round(halfPt * 0.95),
                    italics: true,
                    bold: true,
                  }),
                ]
              : []),
          ],
        })
      );
    }

    // Field Note under section
    if (section.fieldNote?.trim()) {
      children.push(
        new Paragraph({
          spacing: { after: 100 },
          children: createTextRunsWithMathAndBreaks(section.fieldNote, font, Math.round(halfPt * 0.92), { italics: true }),
        })
      );
    }

    // Questions
    section.questions.forEach((question) => {
      renderQuestionInDocx(children, question, section, font, halfPt, formatting);
    });
  });

  // TEACHER ANSWER KEY / MARKING SCHEME APPENDIX IN WORD
  if (formatting.showAnswerKey) {
    children.push(
      new Paragraph({
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 60 },
        children: [
          new TextRun({
            text: 'TEACHER ANSWER KEY & MARKING SCHEME',
            font,
            size: Math.round(halfPt * 1.3),
            bold: true,
            underline: { type: UnderlineType.SINGLE },
          }),
        ],
      })
    );

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: 'Confidential Teacher Solution Guide & Step-wise Evaluation Scheme',
            font,
            size: Math.round(halfPt * 0.95),
            italics: true,
          }),
        ],
      })
    );

    // Table of answers
    const keyRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Section', font, size: halfPt, bold: true })] })],
          }),
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Q #', font, size: halfPt, bold: true })] })],
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Correct Option / Solution Key', font, size: halfPt, bold: true })] })],
          }),
          new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Marks', font, size: halfPt, bold: true })] })],
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [new TextRun({ text: 'Evaluation Note', font, size: halfPt, bold: true })] })],
          }),
        ],
      }),
    ];

    enabledSections.forEach((sec) => {
      sec.questions.forEach((q, qIndex) => {
        let answerText = 'Descriptive / Derivation solution';
        let correctBadge = '';

        if (sec.type === 'mcq' && q.options && q.correctAnswerIndex !== undefined) {
          const optLetter = ['A', 'B', 'C', 'D', 'E'][q.correctAnswerIndex] || '';
          const optText = q.options[q.correctAnswerIndex] || '';
          correctBadge = `(${optLetter}) `;
          answerText = optText;
        } else if (q.subQuestions && q.subQuestions.length > 0) {
          answerText = `${q.subQuestions.length} sub-parts evaluation scheme`;
        }

        keyRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: `${sec.letter} (${sec.type})`, font, size: halfPt })] })],
              }),
              new TableCell({
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${q.number || qIndex + 1}`, font, size: halfPt, bold: true })] })],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      ...(correctBadge ? [new TextRun({ text: correctBadge, font, size: halfPt, bold: true })] : []),
                      new TextRun({ text: answerText, font, size: halfPt }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${q.marks || sec.marksPerQuestion || '—'}`, font, size: halfPt, bold: true })] })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: q.correctAnswerNote || 'Full credit for standard logic', font, size: halfPt, italics: true })] })],
              }),
            ],
          })
        );
      });
    });

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: keyRows,
      })
    );
  }

  // Margins conversion (Twips: 1 in = 1440 twips)
  const topTwip = convertInchesToTwip(formatting.marginTop || 0.75);
  const bottomTwip = convertInchesToTwip(formatting.marginBottom || 0.75);
  const leftTwip = convertInchesToTwip(formatting.marginLeft || 0.75);
  const rightTwip = convertInchesToTwip(formatting.marginRight || 0.75);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: topTwip,
              bottom: bottomTwip,
              left: leftTwip,
              right: rightTwip,
            },
          },
        },
        footers: formatting.showPageNumbers
          ? {
              default: new Footer({
                children: [
                  new Paragraph({
                    alignment:
                      formatting.pageNumberPosition === 'bottom-right'
                        ? AlignmentType.RIGHT
                        : AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES],
                        font,
                        size: Math.round(halfPt * 0.85),
                      }),
                    ],
                  }),
                ],
              }),
            }
          : undefined,
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanTitle = (examData.header.subject || examData.header.examTitle || 'Exam_Paper')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  saveAs(blob, `${cleanTitle}.docx`);
}

function renderQuestionInDocx(
  children: (Paragraph | Table)[],
  question: ExamQuestion,
  section: ExamSection,
  font: string,
  halfPt: number,
  formatting: ExamPaperData['formatting']
) {
  const numPrefix = question.number ? `${question.number}. ` : '';

  // Question header text line with LaTeX and line break support
  children.push(
    new Paragraph({
      spacing: { before: 100, after: 40 },
      indent: { left: 240, hanging: 240 },
      children: [
        new TextRun({
          text: numPrefix,
          font,
          size: halfPt,
          bold: true,
        }),
        ...createTextRunsWithMathAndBreaks(question.questionText, font, halfPt),
        ...(question.marks
          ? [
              new TextRun({
                text: `  [${question.marks} marks]`,
                font,
                size: Math.round(halfPt * 0.9),
                italics: true,
              }),
            ]
          : []),
      ],
    })
  );

  // SubText
  if (question.subText?.trim()) {
    children.push(
      new Paragraph({
        spacing: { after: 40 },
        indent: { left: 480 },
        children: createTextRunsWithMathAndBreaks(question.subText, font, Math.round(halfPt * 0.95), { italics: true }),
      })
    );
  }

  // Code Snippet Box for Practical Questions
  if (question.codeSnippet?.trim()) {
    children.push(
      new Paragraph({
        spacing: { before: 40, after: 60 },
        indent: { left: 480 },
        border: {
          left: { style: BorderStyle.SINGLE, size: 12, color: '888888' },
        },
        children: [
          new TextRun({
            text: question.codeSnippet,
            font: 'Courier New',
            size: Math.round(halfPt * 0.88),
          }),
        ],
      })
    );
  }

  // MCQs Options Rendering
  if (section.type === 'mcq' && question.options && question.options.length > 0) {
    if (section.mcqColumns === 2 && question.options.length === 4) {
      // 2x2 borderless table for neat options
      const opt1 = question.options[0];
      const opt2 = question.options[1];
      const opt3 = question.options[2];
      const opt4 = question.options[3];

      const getBullet = (idx: number) => {
        if (formatting.optionBulletStyle === 'alpha-lower') return `(${String.fromCharCode(97 + idx)}) `;
        if (formatting.optionBulletStyle === 'alpha-upper') return `(${String.fromCharCode(65 + idx)}) `;
        if (formatting.optionBulletStyle === 'roman-lower') {
          const roman = ['i', 'ii', 'iii', 'iv'][idx] || `${idx + 1}`;
          return `(${roman}) `;
        }
        if (formatting.optionBulletStyle === 'numeric') return `(${idx + 1}) `;
        return '• ';
      };

      const isOpt1Correct = formatting.showAnswerKey && question.correctAnswerIndex === 0;
      const isOpt2Correct = formatting.showAnswerKey && question.correctAnswerIndex === 1;
      const isOpt3Correct = formatting.showAnswerKey && question.correctAnswerIndex === 2;
      const isOpt4Correct = formatting.showAnswerKey && question.correctAnswerIndex === 3;

      const table = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                  bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                  left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                  right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                },
                children: [
                  new Paragraph({
                    indent: { left: 480 },
                    spacing: { after: 30 },
                    children: [
                      new TextRun({ text: getBullet(0), font, size: halfPt, bold: true }),
                      ...createTextRunsWithMathAndBreaks(opt1, font, halfPt, {
                        bold: isOpt1Correct,
                        underline: isOpt1Correct,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                  bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                  left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                  right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                },
                children: [
                  new Paragraph({
                    indent: { left: 240 },
                    spacing: { after: 30 },
                    children: [
                      new TextRun({ text: getBullet(1), font, size: halfPt, bold: true }),
                      ...createTextRunsWithMathAndBreaks(opt2, font, halfPt, {
                        bold: isOpt2Correct,
                        underline: isOpt2Correct,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                  bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                  left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                  right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                },
                children: [
                  new Paragraph({
                    indent: { left: 480 },
                    spacing: { after: 40 },
                    children: [
                      new TextRun({ text: getBullet(2), font, size: halfPt, bold: true }),
                      ...createTextRunsWithMathAndBreaks(opt3, font, halfPt, {
                        bold: isOpt3Correct,
                        underline: isOpt3Correct,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                  bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                  left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                  right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                },
                children: [
                  new Paragraph({
                    indent: { left: 240 },
                    spacing: { after: 40 },
                    children: [
                      new TextRun({ text: getBullet(3), font, size: halfPt, bold: true }),
                      ...createTextRunsWithMathAndBreaks(opt4, font, halfPt, {
                        bold: isOpt4Correct,
                        underline: isOpt4Correct,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      });
      children.push(table);
    } else {
      // 1-column list of options
      question.options.forEach((opt, idx) => {
        let bullet = '• ';
        if (formatting.optionBulletStyle === 'alpha-lower') bullet = `(${String.fromCharCode(97 + idx)}) `;
        if (formatting.optionBulletStyle === 'alpha-upper') bullet = `(${String.fromCharCode(65 + idx)}) `;
        if (formatting.optionBulletStyle === 'roman-lower') {
          const roman = ['i', 'ii', 'iii', 'iv', 'v', 'vi'][idx] || `${idx + 1}`;
          bullet = `(${roman}) `;
        }
        if (formatting.optionBulletStyle === 'numeric') bullet = `(${idx + 1}) `;

        const isCorrect = formatting.showAnswerKey && question.correctAnswerIndex === idx;

        children.push(
          new Paragraph({
            spacing: { after: 20 },
            indent: { left: 480 },
            children: [
              new TextRun({ text: bullet, font, size: halfPt, bold: true }),
              ...createTextRunsWithMathAndBreaks(opt, font, halfPt, {
                bold: isCorrect,
                underline: isCorrect,
              }),
              ...(isCorrect ? [new TextRun({ text: '  [✓ Correct]', font, size: Math.round(halfPt * 0.85), bold: true })] : []),
            ],
          })
        );
      });
    }
  }

  // Sub-questions (e.g. 1) Read A, B, C or (a) Define...)
  if (question.subQuestions && question.subQuestions.length > 0) {
    question.subQuestions.forEach((subQ) => {
      children.push(
        new Paragraph({
          spacing: { before: 20, after: 20 },
          indent: { left: 600, hanging: 300 },
          children: [
            new TextRun({ text: `${subQ.label} `, font, size: halfPt, bold: true }),
            ...createTextRunsWithMathAndBreaks(subQ.text, font, halfPt),
            ...(subQ.marks
              ? [new TextRun({ text: ` (${subQ.marks} marks)`, font, size: Math.round(halfPt * 0.9), italics: true })]
              : []),
          ],
        })
      );
    });
  }

  // Blank lines for student writing
  if (question.answerLinesCount && question.answerLinesCount > 0) {
    for (let i = 0; i < question.answerLinesCount; i++) {
      children.push(
        new Paragraph({
          spacing: { before: 40, after: 40 },
          indent: { left: 480 },
          border: {
            bottom: {
              color: 'BBBBBB',
              space: 1,
              style: BorderStyle.DASHED,
              size: 4,
            },
          },
        })
      );
    }
  }
}
