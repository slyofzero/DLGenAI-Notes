import React, { useMemo } from "react";
import katex from "katex";

/**
 * Parses a string containing inline `$math$` delimiters and converts them to rendered KaTeX HTML.
 */
export function renderMathText(text: string): string {
  if (!text.includes("$")) return text;
  return text.replace(/\$([^$]+)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      return `$${math}$`;
    }
  });
}

/**
 * Component that parses mixed text containing `$math$` and renders it with KaTeX.
 */
export function MathText({
  text,
  className = "",
  as: Component = "span",
}: {
  text: string;
  className?: string;
  as?: React.ElementType;
}) {
  const html = useMemo(() => renderMathText(text), [text]);
  return <Component className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Component that renders pure LaTeX math directly via KaTeX.
 */
export function InlineMath({
  math,
  className = "",
}: {
  math: string;
  className?: string;
}) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      return math;
    }
  }, [math]);

  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default MathText;
