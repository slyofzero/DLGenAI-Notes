"use client";

import React from "react";
import { MathText } from "@/components/Math";

export default function StrideVisualFigure() {
  const stepsUnit = [
    { name: "Step 0", active: [0, 1, 2] },
    { name: "Step 1", active: [1, 2, 3] },
    { name: "Step 2", active: [2, 3, 4] },
  ];

  const stepsStride2 = [
    { name: "Step 0", active: [0, 1, 2] },
    { name: "Step 1", active: [2, 3, 4] },
    { name: "Step 2", active: [4, 5, 6] },
  ];

  const totalCells = 7;

  return (
    <figure className="my-6 rounded-lg border border-stone-border bg-card p-4 shadow-xs not-prose">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-stone-border">
        <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta">
          Stride Mechanics: Unit Stride vs. Strided Subsampling
        </span>
        <MathText text="1D Kernel ($K=3$) Example" className="text-[11px] font-mono text-muted" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Unit Stride (S = 1) */}
        <div className="space-y-2.5 p-3 rounded bg-inset border border-stone-border">
          <div className="flex items-center justify-between">
            <MathText text="Unit Stride ($S = 1$)" className="text-xs font-bold text-title" />
            <span className="text-[10px] font-mono text-label bg-pill px-1.5 py-0.5 rounded">
              Shifts by 1 pixel
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {stepsUnit.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-12 text-[10px] text-muted">{step.name}:</span>
                <div className="flex gap-1">
                  {Array.from({ length: totalCells }).map((_, c) => {
                    const isCovered = step.active.includes(c);
                    return (
                      <div
                        key={c}
                        className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] transition-colors ${
                          isCovered
                            ? "bg-terracotta text-white border border-terracotta/40 shadow-xs"
                            : "bg-card border border-stone-border text-label/60"
                        }`}
                      >
                        {isCovered ? "K" : "·"}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-desc font-sans pt-1">
            <MathText text="Visits every coordinate sequentially. Output length: $7 - 3 + 1 = 5$ values." />
          </p>
        </div>

        {/* Strided Convolution (S = 2) */}
        <div className="space-y-2.5 p-3 rounded bg-inset border border-stone-border">
          <div className="flex items-center justify-between">
            <MathText text="Strided Convolution ($S = 2$)" className="text-xs font-bold text-title" />
            <span className="text-[10px] font-mono text-terracotta bg-terracotta/10 px-1.5 py-0.5 rounded font-semibold">
              Hops by 2 pixels!
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {stepsStride2.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-12 text-[10px] text-muted">{step.name}:</span>
                <div className="flex gap-1">
                  {Array.from({ length: totalCells }).map((_, c) => {
                    const isCovered = step.active.includes(c);
                    return (
                      <div
                        key={c}
                        className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] transition-colors ${
                          isCovered
                            ? "bg-teal-600 text-white border border-teal-600/40 shadow-xs"
                            : "bg-card border border-stone-border text-label/60"
                        }`}
                      >
                        {isCovered ? "K" : "·"}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-desc font-sans pt-1">
            <MathText text="Skips intermediate positions. Output length: $\lfloor \frac{7 - 3}{2} \rfloor + 1 = 3$ values ($40\%$ fewer steps)." />
          </p>
        </div>
      </div>
    </figure>
  );
}
