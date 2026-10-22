"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  children?: React.ReactNode;
  code?: string;
  language?: string;
  className?: string;
}

// Single-pass Python regex tokenizer
const PYTHON_TOKEN_REGEX =
  /(#.*$)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b(?:def|return|for|in|while|if|else|elif|import|from|as|class|pass|break|continue|try|except|finally|with|yield|lambda|True|False|None|and|or|not|is|assert|raise)\b)|(\b(?:range|len|print|int|float|str|list|dict|set|tuple|enumerate|zip|sum|min|max|abs|shape|stride|is_contiguous|tensor|zeros|ones|matmul)\b)|(\b\d+(?:\.\d+)?\b)|([+\-*/%=<>!&|^~@:;,.[\]{}()]+)|([a-zA-Z_]\w*)/g;

function highlightPythonLine(line: string, lineKey: number): React.ReactNode {
  if (!line) {
    return "\u00A0";
  }

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  PYTHON_TOKEN_REGEX.lastIndex = 0;

  while ((match = PYTHON_TOKEN_REGEX.exec(line)) !== null) {
    if (match.index > lastIndex) {
      elements.push(line.slice(lastIndex, match.index));
    }

    const [token, comment, str, kw, builtin, num, punct, ident] = match;

    if (comment) {
      elements.push(
        <span key={`${lineKey}-${match.index}`} className="text-[#857F72] italic">
          {token}
        </span>
      );
    } else if (str) {
      elements.push(
        <span key={`${lineKey}-${match.index}`} className="text-[#7EE787]">
          {token}
        </span>
      );
    } else if (kw) {
      elements.push(
        <span key={`${lineKey}-${match.index}`} className="text-[#E07A5F] font-semibold">
          {token}
        </span>
      );
    } else if (builtin) {
      elements.push(
        <span key={`${lineKey}-${match.index}`} className="text-[#79C0FF]">
          {token}
        </span>
      );
    } else if (num) {
      elements.push(
        <span key={`${lineKey}-${match.index}`} className="text-[#F6C177]">
          {token}
        </span>
      );
    } else if (punct) {
      elements.push(
        <span key={`${lineKey}-${match.index}`} className="text-[#A8A398]">
          {token}
        </span>
      );
    } else if (ident) {
      elements.push(
        <span key={`${lineKey}-${match.index}`} className="text-[#E6E4DF]">
          {token}
        </span>
      );
    } else {
      elements.push(token);
    }

    lastIndex = PYTHON_TOKEN_REGEX.lastIndex;
  }

  if (lastIndex < line.length) {
    elements.push(line.slice(lastIndex));
  }

  return elements.length > 0 ? elements : "\u00A0";
}

function extractText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return extractText(props?.children);
  }
  return "";
}

export default function CodeBlock({ children, code, language, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Extract raw code and detected language
  let rawCode = code || "";
  let detectedLang = language || "";

  if (!rawCode && children) {
    if (React.isValidElement(children)) {
      const childProps = children.props as { className?: string; children?: React.ReactNode };
      if (childProps?.className?.includes("language-")) {
        detectedLang = childProps.className.replace(/.*language-([a-zA-Z0-9_-]+).*/, "$1");
      }
      rawCode = extractText(childProps?.children);
    } else {
      rawCode = extractText(children);
    }
  }

  if (!detectedLang && className && className.includes("language-")) {
    detectedLang = className.replace(/.*language-([a-zA-Z0-9_-]+).*/, "$1");
  }

  if (!detectedLang) {
    detectedLang = "python";
  }

  // Trim trailing newline
  rawCode = rawCode.replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(rawCode);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = rawCode;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const lines = rawCode.split("\n");
  const isPython = detectedLang.toLowerCase() === "python" || detectedLang.toLowerCase() === "py";

  return (
    <div className="not-prose my-6 rounded-lg border border-[#33373B] bg-[#1C1F21] shadow-xs overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#33373B] bg-[#161819] select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E07A5F] inline-block"></span>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#857F72] font-semibold">
            {detectedLang}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono text-[#857F72] hover:text-[#F7F6F2] hover:bg-[#23272B] active:bg-[#2A2E32] transition-colors cursor-pointer"
          title="Copy code to clipboard"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[11px] font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <pre className="p-4 overflow-x-auto text-[13px] font-mono leading-relaxed bg-[#1C1F21] m-0 border-0 rounded-none text-[#E6E4DF]">
        <code className="table border-collapse w-full bg-transparent p-0">
          {lines.map((line, idx) => (
            <div key={idx} className="table-row leading-6">
              <span className="table-cell select-none pr-4 text-right text-[11px] font-mono text-[#555148] w-8">
                {idx + 1}
              </span>
              <span className="table-cell whitespace-pre font-mono text-[13px] text-[#E6E4DF]">
                {isPython ? highlightPythonLine(line, idx) : line || "\u00A0"}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
