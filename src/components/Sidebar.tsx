"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChapterMeta } from "@/lib/mdx";
import { FileText, ChevronDown, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

interface SidebarProps {
  chapters: ChapterMeta[];
  desktopOpen: boolean;
  onToggleDesktop: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({
  chapters,
  desktopOpen,
  onToggleDesktop,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  // Group chapters by chapterNumber
  const grouped = chapters.reduce<Record<number, ChapterMeta[]>>((acc, chap) => {
    if (!acc[chap.chapterNumber]) {
      acc[chap.chapterNumber] = [];
    }
    acc[chap.chapterNumber].push(chap);
    return acc;
  }, {});

  const moduleTitles: Record<number, string> = {
    1: "Foundations & Linear Algebra",
    2: "Deep Architectures & Dynamics",
    3: "Generative Models & Latent Spaces",
  };

  return (
    <>
      {/* Mobile Backdrop (Covers entire screen behind drawer) */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Desktop In-Place Expand Button (When desktop left sidebar is collapsed) */}
      {!desktopOpen && (
        <button
          onClick={onToggleDesktop}
          title="Expand Course Explorer"
          aria-label="Expand Course Explorer"
          className="hidden lg:flex fixed left-0 top-20 z-30 items-center gap-1.5 px-2.5 py-2 rounded-r-md border-y border-r border-stone-border bg-card text-label hover:text-title hover:bg-pill shadow-xs transition-colors"
        >
          <PanelLeftOpen className="w-4 h-4 text-terracotta" />
          <span className="text-[11px] font-medium tracking-wide">
            Explorer
          </span>
        </button>
      )}

      {/* Explorer Sidebar
          - On mobile: slides from the RIGHT (right-0), covers header completely (top-0 h-full z-50)
          - On desktop: docks on the LEFT (lg:left-0 lg:top-14 lg:h-auto lg:bottom-0 lg:z-40)
      */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 h-full w-72 max-w-[85vw] border-l border-stone-border shadow-2xl bg-canvas transition-transform duration-200 ease-in-out overflow-y-auto lg:top-14 lg:bottom-0 lg:left-0 lg:right-auto lg:h-auto lg:w-64 lg:z-40 lg:border-l-0 lg:border-r lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        } ${desktopOpen ? "lg:translate-x-0" : "lg:-translate-x-full"}`}
      >
        <div className="p-4 space-y-6">
          {/* Header Row */}
          <div className="flex items-center justify-between px-2 pt-1 lg:pt-0 text-[10px] font-bold uppercase tracking-widest text-label">
            <span>Course Explorer</span>

            {/* Desktop in-place collapse button */}
            <button
              onClick={onToggleDesktop}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              className="hidden lg:block p-1 rounded text-label hover:text-title hover:bg-pill transition-colors"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>

            {/* Mobile close button (covers header, dismisses drawer) */}
            <button
              onClick={onCloseMobile}
              title="Close menu"
              aria-label="Close menu"
              className="lg:hidden p-1.5 rounded text-label hover:text-title hover:bg-pill transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="space-y-5 text-xs">
            {Object.entries(grouped).map(([numStr, items]) => {
              const num = parseInt(numStr, 10);
              return (
                <div key={num} className="space-y-1">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-title uppercase tracking-wider">
                    <ChevronDown className="w-3 h-3 text-label" />
                    <span>Module 0{num}</span>
                  </div>
                  <div className="px-2 pb-1 text-[10.5px] text-desc font-serif italic">
                    {moduleTitles[num] || `Module ${num}`}
                  </div>

                  <div className="pl-2 border-l border-stone-border ml-3.5 space-y-0.5">
                    {items.map((ch) => {
                      const href = `/notes/${ch.slug}`;
                      const isActive = pathname === href;

                      return (
                        <Link
                          key={ch.slug}
                          href={href}
                          onClick={onCloseMobile}
                          className={`group flex items-start gap-2 px-2 py-1.5 rounded-sm transition-colors leading-snug ${
                            isActive
                              ? "bg-card text-terracotta font-semibold border-l-2 -ml-[9px] border-terracotta"
                              : "text-desc hover:text-title hover:bg-pill/50"
                          }`}
                        >
                          <FileText
                            className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                              isActive ? "text-terracotta" : "text-label"
                            }`}
                          />
                          <span className="line-clamp-2">{ch.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
