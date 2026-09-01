import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  text: string;
  className?: string;
  inline?: boolean;
  preserveNewlines?: boolean;
}

interface TextSegment {
  type: 'text' | 'inline-math' | 'block-math' | 'newline';
  content: string;
}

/**
 * Parses a string containing LaTeX formulas ($...$, $$...$$, \(...\), \[...\])
 * and newlines (\n) into structured segments.
 */
function parseMathAndLines(text: string): TextSegment[] {
  if (!text) return [];

  const segments: TextSegment[] = [];
  
  // Match block math ($$...$$ or \[...\]), inline math ($...$ or \(...\)), or newlines
  // Note: For inline math $, we require non-empty content and avoid matching isolated currency like "$50".
  const mathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$(?!\s)[^$\n]+(?<!\s)\$|\\\([\s\S]*?\\\))/g;

  // First split by math matches
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mathRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    const matchStr = match[0];

    // Push preceding plain text if any
    if (matchIndex > lastIndex) {
      const plainText = text.substring(lastIndex, matchIndex);
      pushTextWithLines(segments, plainText);
    }

    // Determine math type
    if (matchStr.startsWith('$$') && matchStr.endsWith('$$')) {
      segments.push({
        type: 'block-math',
        content: matchStr.slice(2, -2).trim(),
      });
    } else if (matchStr.startsWith('\\[') && matchStr.endsWith('\\]')) {
      segments.push({
        type: 'block-math',
        content: matchStr.slice(2, -2).trim(),
      });
    } else if (matchStr.startsWith('\\(') && matchStr.endsWith('\\)')) {
      segments.push({
        type: 'inline-math',
        content: matchStr.slice(2, -2).trim(),
      });
    } else if (matchStr.startsWith('$') && matchStr.endsWith('$')) {
      segments.push({
        type: 'inline-math',
        content: matchStr.slice(1, -1).trim(),
      });
    } else {
      pushTextWithLines(segments, matchStr);
    }

    lastIndex = matchIndex + matchStr.length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    pushTextWithLines(segments, text.substring(lastIndex));
  }

  return segments;
}

function pushTextWithLines(segments: TextSegment[], text: string) {
  const parts = text.split(/(\r?\n)/);
  for (const part of parts) {
    if (part === '\n' || part === '\r\n') {
      segments.push({ type: 'newline', content: '' });
    } else if (part.length > 0) {
      segments.push({ type: 'text', content: part });
    }
  }
}

/**
 * Renders formatted content supporting LaTeX equations ($x^2$, $$\frac{a}{b}$$)
 * and newline breaks (\n).
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  text,
  className = '',
  inline = false,
  preserveNewlines = true,
}) => {
  const segments = useMemo(() => parseMathAndLines(text), [text]);

  if (!text) {
    return null;
  }

  const renderedElements = segments.map((seg, idx) => {
    if (seg.type === 'newline') {
      if (!preserveNewlines) return ' ';
      return <br key={`br-${idx}`} className="leading-relaxed" />;
    }

    if (seg.type === 'inline-math' || seg.type === 'block-math') {
      const isBlock = seg.type === 'block-math';
      try {
        const html = katex.renderToString(seg.content, {
          displayMode: isBlock,
          throwOnError: false,
          strict: false,
          output: 'htmlAndMathml',
        });

        return (
          <span
            key={`math-${idx}`}
            className={isBlock ? 'my-2 block text-center' : 'inline-math-item inline-block align-baseline mx-0.5'}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (err) {
        console.warn('KaTeX render error:', err);
        return (
          <span key={`math-err-${idx}`} className="font-mono text-rose-700 bg-rose-50 px-1 rounded text-[0.9em]">
            ${seg.content}$
          </span>
        );
      }
    }

    return <span key={`text-${idx}`}>{seg.content}</span>;
  });

  const WrapperTag = inline ? 'span' : 'div';

  return <WrapperTag className={`math-renderer-content ${className}`}>{renderedElements}</WrapperTag>;
};

export default MathRenderer;
