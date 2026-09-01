import React, { useState } from 'react';
import { Sigma, Copy, Check, Sparkles, BookOpen, X } from 'lucide-react';
import MathRenderer from './MathRenderer';

interface EquationHelperProps {
  onInsertEquation?: (latex: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface EquationSnippet {
  name: string;
  latex: string;
  category: string;
  description?: string;
}

const EQUATION_CATEGORIES = [
  'Common & Basic',
  'Fractions & Roots',
  'Algebra & Powers',
  'Calculus & Series',
  'Greek Letters',
  'Matrices & Cases',
  'Physics & Chemistry',
];

const EQUATION_PRESETS: EquationSnippet[] = [
  // Common & Basic
  { name: 'Plus-Minus', latex: '$\\pm$', category: 'Common & Basic' },
  { name: 'Multiplication Dot', latex: '$\\cdot$', category: 'Common & Basic' },
  { name: 'Division', latex: '$\\div$', category: 'Common & Basic' },
  { name: 'Not Equal', latex: '$\\neq$', category: 'Common & Basic' },
  { name: 'Less/Greater Equal', latex: '$\\le \\quad \\ge$', category: 'Common & Basic' },
  { name: 'Approximately Equal', latex: '$\\approx$', category: 'Common & Basic' },
  { name: 'Infinity', latex: '$\\infty$', category: 'Common & Basic' },
  { name: 'Right Arrow', latex: '$\\rightarrow$', category: 'Common & Basic' },
  { name: 'Degree Symbol', latex: '$90^\\circ$', category: 'Common & Basic' },
  { name: 'Angle', latex: '$\\angle ABC = 45^\\circ$', category: 'Common & Basic' },

  // Fractions & Roots
  { name: 'Standard Fraction', latex: '$\\frac{a}{b}$', category: 'Fractions & Roots', description: 'Fraction with numerator and denominator' },
  { name: 'Complex Fraction', latex: '$\\frac{x^2 + 2x + 1}{x - 3}$', category: 'Fractions & Roots' },
  { name: 'Square Root', latex: '$\\sqrt{x}$', category: 'Fractions & Roots' },
  { name: 'N-th Root', latex: '$\\sqrt[n]{x}$', category: 'Fractions & Roots' },
  { name: 'Derivative Fraction', latex: '$\\frac{dy}{dx}$', category: 'Fractions & Roots' },
  { name: 'Partial Derivative', latex: '$\\frac{\\partial f}{\\partial x}$', category: 'Fractions & Roots' },

  // Algebra & Powers
  { name: 'Superscript (Power)', latex: '$x^2 + y^2 = r^2$', category: 'Algebra & Powers' },
  { name: 'Subscript (Index)', latex: '$x_1, x_2, \\dots, x_n$', category: 'Algebra & Powers' },
  { name: 'Quadratic Formula', latex: '$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$', category: 'Algebra & Powers', description: 'Standard quadratic equation roots' },
  { name: 'Binomial Expansion', latex: '$(a + b)^2 = a^2 + 2ab + b^2$', category: 'Algebra & Powers' },
  { name: 'Logarithm', latex: '$\\log_b(x) = \\frac{\\ln x}{\\ln b}$', category: 'Algebra & Powers' },
  { name: 'Trigonometric Identity', latex: '$\\sin^2(\\theta) + \\cos^2(\\theta) = 1$', category: 'Algebra & Powers' },

  // Calculus & Series
  { name: 'Indefinite Integral', latex: '$\\int f(x)\\,dx$', category: 'Calculus & Series' },
  { name: 'Definite Integral', latex: '$\\int_{0}^{\\pi} \\sin(x)\\,dx = 2$', category: 'Calculus & Series' },
  { name: 'Summation Series', latex: '$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$', category: 'Calculus & Series' },
  { name: 'Infinite Series', latex: '$\\sum_{n=0}^{\\infty} \\frac{x^n}{n!} = e^x$', category: 'Calculus & Series' },
  { name: 'Limit Function', latex: '$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$', category: 'Calculus & Series' },
  { name: 'Double Integral', latex: '$\\iint_D f(x, y)\\,dx\\,dy$', category: 'Calculus & Series' },

  // Greek Letters
  { name: 'Alpha, Beta, Gamma', latex: '$\\alpha, \\beta, \\gamma$', category: 'Greek Letters' },
  { name: 'Theta, Phi, Psi', latex: '$\\theta, \\phi, \\psi$', category: 'Greek Letters' },
  { name: 'Lambda, Mu, Pi', latex: '$\\lambda, \\mu, \\pi$', category: 'Greek Letters' },
  { name: 'Sigma, Delta, Omega', latex: '$\\sigma, \\Delta, \\Omega$', category: 'Greek Letters' },
  { name: 'Epsilon, Rho, Tau', latex: '$\\epsilon, \\rho, \\tau$', category: 'Greek Letters' },
  { name: 'Capital Sigma (Sum)', latex: '$\\Sigma$', category: 'Greek Letters' },

  // Matrices & Cases
  { name: '2x2 Matrix', latex: '$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$', category: 'Matrices & Cases' },
  { name: '3x3 Determinant', latex: '$\\begin{vmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{vmatrix}$', category: 'Matrices & Cases' },
  { name: 'Piecewise Cases', latex: '$f(x) = \\begin{cases} x^2 & \\text{if } x \\ge 0 \\\\ -x & \\text{if } x < 0 \\end{cases}$', category: 'Matrices & Cases' },
  { name: 'Vector Notation', latex: '$\\vec{v} = \\langle x, y, z \\rangle$', category: 'Matrices & Cases' },

  // Physics & Chemistry
  { name: 'Einstein Mass-Energy', latex: '$E = mc^2$', category: 'Physics & Chemistry' },
  { name: 'Newton Second Law', latex: '$\\vec{F} = m\\vec{a}$', category: 'Physics & Chemistry' },
  { name: 'Kinematic Equation', latex: '$v^2 = u^2 + 2as$', category: 'Physics & Chemistry' },
  { name: 'Water Molecule', latex: '$\\text{H}_2\\text{O}$', category: 'Physics & Chemistry' },
  { name: 'Chemical Reaction', latex: '$\\text{CH}_4 + 2\\text{O}_2 \\rightarrow \\text{CO}_2 + 2\\text{H}_2\\text{O}$', category: 'Physics & Chemistry' },
  { name: 'De Broglie Wavelength', latex: '$\\lambda = \\frac{h}{p}$', category: 'Physics & Chemistry' },
];

export const EquationHelper: React.FC<EquationHelperProps> = ({
  onInsertEquation,
  isOpen,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Common & Basic');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const filteredPresets = EQUATION_PRESETS.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.latex.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopyOrInsert = (latex: string, index: number) => {
    if (onInsertEquation) {
      onInsertEquation(latex);
    } else {
      navigator.clipboard.writeText(latex);
    }
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs font-ui">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Sigma className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                Equation & Math Symbols Palette
              </h3>
              <p className="text-[11px] text-slate-500">
                Click any formula to insert into your exam question or copy the LaTeX markup.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Search & Categories */}
        <div className="space-y-2.5 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search math formulas (e.g. fraction, square root, quadratic, integral, alpha)..."
              className="w-full text-xs pl-3 pr-8 py-2 border border-slate-300 rounded-xl focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden bg-slate-50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Formulas
            </button>
            {EQUATION_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Formulas Grid */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
          {filteredPresets.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No formulas found matching "{searchQuery}". You can type raw LaTeX formulas in any question text using <code>$formula$</code>.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredPresets.map((preset, idx) => {
                const isCopied = copiedIndex === idx;
                return (
                  <div
                    key={`${preset.name}-${idx}`}
                    onClick={() => handleCopyOrInsert(preset.latex, idx)}
                    className="p-3 bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xs rounded-xl transition-all cursor-pointer flex flex-col justify-between group text-left"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-800 group-hover:text-slate-900">
                        {preset.name}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
                        isCopied ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white'
                      }`}>
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3" /> Inserted
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5" /> {onInsertEquation ? 'Insert' : 'Copy'}
                          </>
                        )}
                      </span>
                    </div>

                    {/* Formula Render Box */}
                    <div className="py-2 px-2.5 bg-white rounded-lg border border-slate-200/80 min-h-[38px] flex items-center justify-center font-times text-slate-950 overflow-x-auto text-sm">
                      <MathRenderer text={preset.latex} inline />
                    </div>

                    {/* Raw LaTeX representation */}
                    <div className="mt-1.5 text-[10px] font-mono-code text-slate-500 truncate">
                      {preset.latex}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
            <span>
              Tip: Wrap inline formulas in <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">$...$</code> or block equations in <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">$$...$$</code>.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquationHelper;
