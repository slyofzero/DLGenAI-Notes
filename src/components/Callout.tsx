import React from "react";

interface CalloutProps {
  type?: "note" | "tip" | "warning" | "danger" | "proof" | "theorem";
  title?: string;
  children: React.ReactNode;
}

export default function Callout({ type = "note", title, children }: CalloutProps) {
  const configs = {
    note: {
      accentBorder: "border-l-label",
      tagColor: "text-label",
      defaultTitle: "Note",
    },
    tip: {
      accentBorder: "border-l-terracotta",
      tagColor: "text-terracotta",
      defaultTitle: "Key Intuition",
    },
    warning: {
      accentBorder: "border-l-[#B57E75] dark:border-l-[#E07A5F]",
      tagColor: "text-[#B57E75] dark:text-[#E07A5F]",
      defaultTitle: "Pathology & Caution",
    },
    danger: {
      accentBorder: "border-l-[#9F5656] dark:border-l-[#F87171]",
      tagColor: "text-[#9F5656] dark:text-[#F87171]",
      defaultTitle: "Critical Pitfall",
    },
    proof: {
      accentBorder: "border-l-terracotta",
      tagColor: "text-terracotta",
      defaultTitle: "Mathematical Derivation",
    },
    theorem: {
      accentBorder: "border-l-terracotta",
      tagColor: "text-terracotta",
      defaultTitle: "Formal Theorem",
    },
  };

  const config = configs[type] || configs.note;

  return (
    <div className={`not-prose my-6 rounded border border-stone-border border-l-4 ${config.accentBorder} bg-card p-4.5 shadow-2xs`}>
      <div className="space-y-1.5 text-xs sm:text-[13px]">
        <div className={`font-mono text-[10px] font-bold uppercase tracking-widest ${config.tagColor}`}>
          {title || config.defaultTitle}
        </div>
        <div className="text-body leading-relaxed font-normal">
          {children}
        </div>
      </div>
    </div>
  );
}
