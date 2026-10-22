"use client";

import React, { useEffect, useState } from "react";
import { HeadingItem } from "@/lib/mdx";

interface TableOfContentsProps {
  headings?: HeadingItem[];
}

export default function TableOfContents({ headings = [] }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  const currentActiveId = activeId || headings[0]?.id || "";

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0% 0% -70% 0%" }
    );

    headings.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  return (
    <aside className="hidden xl:block w-56 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto text-[12px] pl-5 border-l border-stone-border">
      <div className="text-[10px] font-bold uppercase tracking-widest text-label mb-3">
        On This Page
      </div>

      {headings.length === 0 ? (
        <div className="text-[11px] text-label italic">No headings in section</div>
      ) : (
        <ul className="space-y-1.5">
          {headings.map((item) => {
            const isActive = currentActiveId === item.id;
            return (
              <li key={item.id} className={item.level === 3 ? "pl-3" : "pl-0"}>
                <a
                  href={`#${item.id}`}
                  className={`block transition-colors py-0.5 leading-snug ${
                    isActive
                      ? "text-terracotta font-semibold"
                      : "text-desc hover:text-title"
                  }`}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
