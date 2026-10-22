"use client";

import React from "react";
import Link from "next/link";
import { Code2, Compass, Menu } from "lucide-react";

interface HeaderProps {
  onOpenMobileDrawer?: () => void;
}

export default function Header({ onOpenMobileDrawer }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-border bg-canvas/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2 group">
          <span className="font-serif text-lg tracking-tight text-title font-medium">
            DLGenAI <em className="italic text-terracotta not-italic">Notes</em>
          </span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-pill text-label">
            Lab
          </span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6 text-xs font-medium text-desc">
          <Link href="/" className="hover:text-title transition-colors">
            Overview
          </Link>
          <Link
            href="/notes/01-matrix-multiplication"
            className="hidden sm:flex items-center gap-1.5 hover:text-terracotta transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Read Notes</span>
          </Link>
          <a
            href="https://github.com/slyofzero/DLGenAI-Notes"
            target="_blank"
            rel="noreferrer"
            className="p-1 rounded text-label hover:text-title transition-colors"
            title="Source Code"
          >
            <Code2 className="w-4 h-4" />
          </a>

          {/* Mobile Explorer Drawer Trigger Button */}
          {onOpenMobileDrawer && (
            <button
              onClick={onOpenMobileDrawer}
              className="lg:hidden p-1.5 rounded text-desc hover:text-title hover:bg-pill transition-colors flex items-center gap-1"
              title="Open Course Explorer"
              aria-label="Open Course Explorer"
            >
              <Menu className="w-4 h-4" />
              <span className="text-[11px] font-medium">Menu</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
