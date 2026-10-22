"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, Sparkles } from "lucide-react";

interface Preset {
  name: string;
  shapeA: string;
  shapeB: string;
  description: string;
}

const PRESETS: Preset[] = [
  {
    name: "Matrix + Vector",
    shapeA: "3, 4",
    shapeB: "4",
    description: "Adding a row bias (4) to a 2D feature matrix (3, 4)",
  },
  {
    name: "Batch Feature Stretches",
    shapeA: "8, 1, 64",
    shapeB: "8, 10, 1",
    description: "Cross-broadcasting across two singleton dimensions",
  },
  {
    name: "Image RGB Normalization",
    shapeA: "16, 3, 224, 224",
    shapeB: "3, 1, 1",
    description: "Subtracting 3-channel mean/std from a batch of images",
  },
  {
    name: "Incompatible Mismatch",
    shapeA: "3, 5",
    shapeB: "2, 5",
    description: "Leading dimensions 3 and 2 disagree and neither is 1",
  },
];

function parseShape(str: string): number[] | null {
  const parts = str
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (parts.length === 0) return null;

  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => isNaN(n) || !Number.isInteger(n) || n <= 0)) {
    return null;
  }
  return nums;
}

export default function BroadcastingPlayground() {
  const [shapeStrA, setShapeStrA] = useState("3, 4");
  const [shapeStrB, setShapeStrB] = useState("4");
  const [activePreset, setActivePreset] = useState<string>("Matrix + Vector");

  const shapeA = parseShape(shapeStrA);
  const shapeB = parseShape(shapeStrB);

  const isValidInput = shapeA !== null && shapeB !== null;

  // Compute broadcasting
  let isCompatible = false;
  let alignedA: number[] = [];
  let alignedB: number[] = [];
  let resultShape: number[] = [];
  let dimStatuses: {
    dimIdx: number;
    valA: number;
    valB: number;
    res: number;
    type: "match" | "broadcastA" | "broadcastB" | "mismatch";
  }[] = [];

  if (isValidInput) {
    const maxDims = Math.max(shapeA.length, shapeB.length);
    // Pad left with 1s
    alignedA = Array(maxDims - shapeA.length).fill(1).concat(shapeA);
    alignedB = Array(maxDims - shapeB.length).fill(1).concat(shapeB);

    isCompatible = true;
    resultShape = [];
    dimStatuses = [];

    for (let i = 0; i < maxDims; i++) {
      const a = alignedA[i];
      const b = alignedB[i];

      if (a === b) {
        resultShape.push(a);
        dimStatuses.push({
          dimIdx: i,
          valA: a,
          valB: b,
          res: a,
          type: "match",
        });
      } else if (a === 1) {
        resultShape.push(b);
        dimStatuses.push({
          dimIdx: i,
          valA: a,
          valB: b,
          res: b,
          type: "broadcastA",
        });
      } else if (b === 1) {
        resultShape.push(a);
        dimStatuses.push({
          dimIdx: i,
          valA: a,
          valB: b,
          res: a,
          type: "broadcastB",
        });
      } else {
        isCompatible = false;
        dimStatuses.push({
          dimIdx: i,
          valA: a,
          valB: b,
          res: 0,
          type: "mismatch",
        });
      }
    }
  }

  const handleSelectPreset = (p: Preset) => {
    setActivePreset(p.name);
    setShapeStrA(p.shapeA);
    setShapeStrB(p.shapeB);
  };

  return (
    <div className="not-prose my-8 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-[#FCFBF9] dark:bg-[#23272B] shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-[#E7E5DF] dark:border-[#33373B] bg-[#F7F6F2] dark:bg-[#1C1F21]">
        <div>
          <span className="eyebrow-label text-[#8C533E] dark:text-[#E07A5F] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Rule Engine
          </span>
          <h4 className="font-serif text-sm font-medium text-[#191C1E] dark:text-[#F7F6F2] mt-0.5">
            PyTorch & NumPy Broadcasting Checker
          </h4>
        </div>

        {/* Status Badge */}
        {isValidInput ? (
          isCompatible ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Broadcast Compatible</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold">
              <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Incompatible Shapes</span>
            </div>
          )
        ) : null}
      </div>

      <div className="p-5 space-y-6">
        {/* Preset Selector */}
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#857F72] dark:text-[#8E8A80] font-semibold mb-2">
            Try Common DL Presets:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {PRESETS.map((p) => {
              const active = activePreset === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => handleSelectPreset(p)}
                  className={`text-left p-2.5 rounded border transition-colors ${
                    active
                      ? "border-[#8C533E] dark:border-[#E07A5F] bg-[#EDEAE2]/50 dark:bg-[#2C2F33]"
                      : "border-[#E7E5DF] dark:border-[#33373B] bg-[#FFFFFF] dark:bg-[#191C1E] hover:border-[#857F72]"
                  }`}
                >
                  <div className="text-xs font-semibold text-[#191C1E] dark:text-[#F7F6F2]">
                    {p.name}
                  </div>
                  <div className="text-[11px] font-mono text-[#8C533E] dark:text-[#E07A5F] mt-0.5">
                    ({p.shapeA}) × ({p.shapeB})
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Dimensions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#857F72] dark:text-[#8E8A80] font-semibold mb-1">
              Shape of Tensor A (comma-separated):
            </label>
            <input
              type="text"
              value={shapeStrA}
              onChange={(e) => {
                setShapeStrA(e.target.value);
                setActivePreset("");
              }}
              className="w-full font-mono text-sm px-3 py-2 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-[#FFFFFF] dark:bg-[#191C1E] text-[#191C1E] dark:text-[#F7F6F2] focus:outline-hidden focus:border-[#8C533E] dark:focus:border-[#E07A5F]"
              placeholder="e.g. 3, 4"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#857F72] dark:text-[#8E8A80] font-semibold mb-1">
              Shape of Tensor B (comma-separated):
            </label>
            <input
              type="text"
              value={shapeStrB}
              onChange={(e) => {
                setShapeStrB(e.target.value);
                setActivePreset("");
              }}
              className="w-full font-mono text-sm px-3 py-2 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-[#FFFFFF] dark:bg-[#191C1E] text-[#191C1E] dark:text-[#F7F6F2] focus:outline-hidden focus:border-[#8C533E] dark:focus:border-[#E07A5F]"
              placeholder="e.g. 4"
            />
          </div>
        </div>

        {/* Visual Alignment Grid */}
        {isValidInput ? (
          <div className="space-y-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#857F72] dark:text-[#8E8A80] font-semibold">
              Step-by-Step Right-to-Left Alignment:
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-[#E7E5DF] dark:border-[#33373B] text-center text-xs font-mono">
                <thead>
                  <tr className="bg-[#F7F6F2] dark:bg-[#1C1F21] text-[#857F72] dark:text-[#8E8A80]">
                    <th className="p-2.5 text-left font-semibold">Tensor</th>
                    {dimStatuses.map((_, i) => (
                      <th key={i} className="p-2.5 border-l border-[#E7E5DF] dark:border-[#33373B]">
                        Axis {dimStatuses.length - 1 - i}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5DF] dark:divide-[#33373B] bg-[#FFFFFF] dark:bg-[#191C1E]">
                  {/* Tensor A Row */}
                  <tr>
                    <td className="p-2.5 text-left font-semibold text-[#191C1E] dark:text-[#F7F6F2]">
                      Tensor A
                    </td>
                    {alignedA.map((val, i) => {
                      const wasPadded = i < alignedA.length - (shapeA?.length || 0);
                      return (
                        <td
                          key={i}
                          className="p-2.5 border-l border-[#E7E5DF] dark:border-[#33373B]"
                        >
                          <span
                            className={`inline-block px-2 py-0.5 rounded ${
                              wasPadded
                                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold"
                                : "text-[#191C1E] dark:text-[#F7F6F2]"
                            }`}
                          >
                            {val}
                            {wasPadded && (
                              <span className="text-[9px] block text-amber-600 dark:text-amber-400">
                                (padded 1)
                              </span>
                            )}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Tensor B Row */}
                  <tr>
                    <td className="p-2.5 text-left font-semibold text-[#191C1E] dark:text-[#F7F6F2]">
                      Tensor B
                    </td>
                    {alignedB.map((val, i) => {
                      const wasPadded = i < alignedB.length - (shapeB?.length || 0);
                      return (
                        <td
                          key={i}
                          className="p-2.5 border-l border-[#E7E5DF] dark:border-[#33373B]"
                        >
                          <span
                            className={`inline-block px-2 py-0.5 rounded ${
                              wasPadded
                                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold"
                                : "text-[#191C1E] dark:text-[#F7F6F2]"
                            }`}
                          >
                            {val}
                            {wasPadded && (
                              <span className="text-[9px] block text-amber-600 dark:text-amber-400">
                                (padded 1)
                              </span>
                            )}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Alignment Action Row */}
                  <tr className="bg-[#FCFBF9] dark:bg-[#23272B]">
                    <td className="p-2.5 text-left font-semibold text-[#555148] dark:text-[#A8A398]">
                      Compatibility
                    </td>
                    {dimStatuses.map((st, i) => {
                      if (st.type === "match") {
                        return (
                          <td
                            key={i}
                            className="p-2.5 border-l border-[#E7E5DF] dark:border-[#33373B] text-emerald-600 dark:text-emerald-400 text-[11px]"
                          >
                            Match ({st.res})
                          </td>
                        );
                      } else if (st.type === "broadcastA") {
                        return (
                          <td
                            key={i}
                            className="p-2.5 border-l border-[#E7E5DF] dark:border-[#33373B] text-sky-600 dark:text-sky-400 text-[11px]"
                          >
                            A stretches 1 → {st.res}
                          </td>
                        );
                      } else if (st.type === "broadcastB") {
                        return (
                          <td
                            key={i}
                            className="p-2.5 border-l border-[#E7E5DF] dark:border-[#33373B] text-sky-600 dark:text-sky-400 text-[11px]"
                          >
                            B stretches 1 → {st.res}
                          </td>
                        );
                      } else {
                        return (
                          <td
                            key={i}
                            className="p-2.5 border-l border-[#E7E5DF] dark:border-[#33373B] text-rose-600 dark:text-rose-400 text-[11px] font-bold bg-rose-50/50 dark:bg-rose-950/30"
                          >
                            Mismatch! ({st.valA} ≠ {st.valB})
                          </td>
                        );
                      }
                    })}
                  </tr>

                  {/* Result Dimension Row */}
                  {isCompatible && (
                    <tr className="bg-emerald-50/50 dark:bg-emerald-950/20 font-bold text-emerald-800 dark:text-emerald-300">
                      <td className="p-2.5 text-left">Result Shape</td>
                      {resultShape.map((val, i) => (
                        <td
                          key={i}
                          className="p-2.5 border-l border-[#E7E5DF] dark:border-[#33373B]"
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Summary Bar */}
            <div className="p-3.5 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-[#FFFFFF] dark:bg-[#191C1E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#555148] dark:text-[#A8A398]">Equation:</span>
                <span className="font-mono font-semibold text-[#191C1E] dark:text-[#F7F6F2]">
                  ({shapeA?.join(", ")}) × ({shapeB?.join(", ")})
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#857F72]" />
                {isCompatible ? (
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    ({resultShape.join(", ")})
                  </span>
                ) : (
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    RuntimeError: Shape Mismatch
                  </span>
                )}
              </div>

              <div className="text-[11px] text-[#857F72] dark:text-[#8E8A80]">
                {isCompatible
                  ? "Zero data copied: PyTorch expands stride-0 dimensions virtually in RAM."
                  : "Both non-singleton dimensions must match exactly to broadcast."}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs">
            Please enter valid positive integer dimensions separated by commas (e.g. <code>2, 3, 4</code>).
          </div>
        )}
      </div>
    </div>
  );
}
