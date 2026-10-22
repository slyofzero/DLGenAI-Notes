"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { MathText } from "@/components/Math";

export default function PaddingVisualFigure() {
  const original4x4 = [
    [56, 112, 121, 144],
    [56, 117, 129, 148],
    [56, 111, 112, 104],
    [28,  56,  56,  64],
  ];

  return (
    <figure className="my-6 rounded-lg border border-stone-border bg-card p-4 shadow-xs not-prose">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-stone-border">
        <MathText
          text="Padding Mechanics: Original Grid vs. Zero-Padded Grid ($P=1$)"
          className="text-[10px] font-bold uppercase tracking-wider text-terracotta"
        />
        <span className="text-[11px] font-mono text-muted">Boundary Preservation</span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-2">
        {/* 1. Original 4x4 Grid */}
        <div className="flex flex-col items-center space-y-1.5">
          <span className="text-xs font-semibold text-title">Original 4×4 Matrix</span>
          <div className="grid grid-cols-4 gap-1 p-2 rounded bg-inset border border-stone-border text-center font-mono text-xs">
            {original4x4.map((row, r) =>
              row.map((val, c) => (
                <div
                  key={`orig-${r}-${c}`}
                  className="w-8 h-8 rounded flex items-center justify-center font-medium bg-card border border-stone-border text-[11px] text-body shadow-xs"
                >
                  {val}
                </div>
              ))
            )}
          </div>
          <span className="text-[10px] text-label font-mono">16 Pixels</span>
        </div>

        {/* Transition Arrow */}
        <div className="flex flex-col items-center text-label space-y-1">
          <div className="w-8 h-8 rounded-full bg-pill flex items-center justify-center border border-stone-border">
            <ArrowRight className="w-4 h-4 text-terracotta" />
          </div>
          <span className="text-[9px] font-mono uppercase font-bold text-terracotta">
            Pad with P=1
          </span>
        </div>

        {/* 2. Zero-Padded 6x6 Grid */}
        <div className="flex flex-col items-center space-y-1.5">
          <span className="text-xs font-semibold text-title">Zero-Padded 6×6 Grid</span>
          <div className="grid grid-cols-6 gap-1 p-2 rounded bg-inset border border-stone-border text-center font-mono text-xs">
            {Array.from({ length: 6 }).map((_, r) =>
              Array.from({ length: 6 }).map((_, c) => {
                const isPad = r === 0 || r === 5 || c === 0 || c === 5;
                const val = isPad ? 0 : original4x4[r - 1][c - 1];

                return (
                  <div
                    key={`pad-${r}-${c}`}
                    className={`w-8 h-8 rounded flex items-center justify-center font-medium text-[11px] ${
                      isPad
                        ? "bg-stone-border/40 border border-dashed border-stone-border text-label/60 font-bold"
                        : "bg-card border border-stone-border text-body shadow-xs font-semibold"
                    }`}
                  >
                    {val}
                  </div>
                );
              })
            )}
          </div>
          <span className="text-[10px] text-label font-mono">36 Cells (20 Padded Zeros)</span>
        </div>
      </div>

      <figcaption className="mt-3 pt-2.5 border-t border-stone-border text-[11px] text-desc font-sans">
        <MathText text="Zero-padding adds a $P=1$ perimeter of zeros (dashed cells) around all four borders. When a $3 \times 3$ kernel slides across the padded $6 \times 6$ grid, the output retains the original $4 \times 4$ dimensions ($6 - 3 + 1 = 4$)." />
      </figcaption>
    </figure>
  );
}
