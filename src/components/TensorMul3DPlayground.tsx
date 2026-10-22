"use client";

import React, { useState } from "react";
import { Sparkles, Play, Pause, RotateCcw } from "lucide-react";

// Tensors A (3, 2, 4), B (3, 4, 2) and C (3, 2, 2)
const TENSOR_A = [
  // Slice 0 (2x4)
  [
    [1, 2, 1, 3],
    [0, 1, 2, 1],
  ],
  // Slice 1 (2x4)
  [
    [2, 0, 3, 1],
    [1, 2, 0, 2],
  ],
  // Slice 2 (2x4)
  [
    [3, 1, 2, 0],
    [2, 3, 1, 1],
  ],
];

const TENSOR_B = [
  // Slice 0 (4x2)
  [
    [2, 1],
    [1, 3],
    [0, 2],
    [3, 1],
  ],
  // Slice 1 (4x2)
  [
    [1, 2],
    [3, 0],
    [2, 1],
    [1, 4],
  ],
  // Slice 2 (4x2)
  [
    [0, 3],
    [2, 1],
    [1, 2],
    [4, 0],
  ],
];

// Precomputed C = A @ B
const TENSOR_C = [
  // Slice 0 (2x2)
  [
    [13, 12],
    [4, 8],
  ],
  // Slice 1 (2x2)
  [
    [9, 11],
    [9, 10],
  ],
  // Slice 2 (2x2)
  [
    [4, 14],
    [11, 11],
  ],
];

export default function TensorMul3DPlayground() {
  const [activeBatch, setActiveBatch] = useState<number>(0);
  const [selectedI, setSelectedI] = useState<number>(0);
  const [selectedJ, setSelectedJ] = useState<number>(0);
  const [activeK, setActiveK] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Auto-play animation through k = 0, 1, 2, 3
  React.useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveK((prev) => {
        if (prev === null || prev >= 3) {
          return 0;
        }
        return prev + 1;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentA = TENSOR_A[activeBatch];
  const currentB = TENSOR_B[activeBatch];
  const currentC = TENSOR_C[activeBatch];

  // Dot product terms for C[activeBatch][selectedI, selectedJ]
  const terms = [0, 1, 2, 3].map((k) => ({
    k,
    a: currentA[selectedI][k],
    b: currentB[k][selectedJ],
    prod: currentA[selectedI][k] * currentB[k][selectedJ],
  }));

  const totalSum = terms.reduce((acc, t) => acc + t.prod, 0);

  return (
    <div className="not-prose my-8 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-[#FCFBF9] dark:bg-[#23272B] shadow-2xs overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-[#E7E5DF] dark:border-[#33373B] bg-[#F7F6F2] dark:bg-[#1C1F21]">
        <div>
          <span className="eyebrow-label text-[#8C533E] dark:text-[#E07A5F] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive 3D Tensor Multiplication
          </span>
          <h4 className="font-serif text-sm font-medium text-[#191C1E] dark:text-[#F7F6F2] mt-0.5">
            Batched Matmul: (3, 2, 4) @ (3, 4, 2) → (3, 2, 2)
          </h4>
        </div>

        {/* Batch Slice Controls */}
        <div className="flex items-center gap-1.5 bg-[#EDEAE2] dark:bg-[#191C1E] p-1 rounded border border-[#E7E5DF] dark:border-[#33373B] text-xs font-mono">
          <span className="px-2 text-[11px] text-[#857F72] dark:text-[#8E8A80] font-semibold uppercase tracking-wider">
            Batch:
          </span>
          {[0, 1, 2].map((b) => (
            <button
              key={b}
              onClick={() => {
                setActiveBatch(b);
                setActiveK(null);
                setIsPlaying(false);
              }}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeBatch === b
                  ? "bg-[#8C533E] dark:bg-[#E07A5F] text-white font-bold shadow-2xs"
                  : "bg-transparent text-[#555148] dark:text-[#A8A398] hover:text-[#191C1E] dark:hover:text-[#F7F6F2]"
              }`}
            >
              b = {b}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* Unified 3D Isometric SVG (Scales responsively with zero overflow) */}
        <div className="p-3 sm:p-4 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-[#FFFFFF] dark:bg-[#191C1E] flex justify-center">
          <svg
            viewBox="0 0 540 150"
            className="w-full max-w-[540px] h-auto select-none overflow-visible"
            aria-label="3D Tensor Multiplication Visualization"
          >
            {/* ================= TENSOR A ================= */}
            <text x="85" y="16" textAnchor="middle" className="font-mono text-[11px] font-bold fill-[#191C1E] dark:fill-[#F7F6F2]">
              Tensor A
            </text>
            <text x="85" y="30" textAnchor="middle" className="font-mono text-[10px] font-semibold fill-[#8C533E] dark:fill-[#E07A5F]">
              Shape: (3, 2, 4)
            </text>

            {[2, 1, 0].map((b) => {
              const isActive = activeBatch === b;
              const x = 20 + b * 16;
              const y = 72 - b * 12;
              const w = 74;
              const h = 42;

              return (
                <g key={`cuboid-a-${b}`} onClick={() => setActiveBatch(b)} className="cursor-pointer">
                  {/* Top extruded facet */}
                  <polygon
                    points={`${x},${y} ${x + 8},${y - 6} ${x + w + 8},${y - 6} ${x + w},${y}`}
                    className={`transition-colors ${
                      isActive ? "fill-[#A6634B] dark:fill-[#B85C42]" : "fill-[#E7E5DF] dark:fill-[#33373B]"
                    }`}
                    opacity={isActive ? 0.95 : 0.45}
                  />
                  {/* Right extruded facet */}
                  <polygon
                    points={`${x + w},${y} ${x + w + 8},${y - 6} ${x + w + 8},${y + h - 6} ${x + w},${y + h}`}
                    className={`transition-colors ${
                      isActive ? "fill-[#734230] dark:fill-[#8C3A24]" : "fill-[#D8D4CA] dark:fill-[#2A2E32]"
                    }`}
                    opacity={isActive ? 0.95 : 0.45}
                  />
                  {/* Front slice face */}
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx="2"
                    className={`transition-colors ${
                      isActive
                        ? "fill-[#8C533E] dark:fill-[#E07A5F] stroke-[#E07A5F] dark:stroke-[#F08E75]"
                        : "fill-[#EDEAE2] dark:fill-[#23272B] stroke-[#C8C4BA] dark:stroke-[#33373B]"
                    }`}
                    strokeWidth={isActive ? "2" : "1"}
                    opacity={isActive ? 1 : 0.55}
                  />
                  <text
                    x={x + w / 2}
                    y={y + h / 2 + 3.5}
                    textAnchor="middle"
                    className={`font-mono text-[9.5px] font-bold pointer-events-none ${
                      isActive ? "fill-white" : "fill-[#857F72] dark:fill-[#8E8A80]"
                    }`}
                  >
                    Slice {b} [2×4]
                  </text>
                </g>
              );
            })}

            {/* ================= OPERATOR @ ================= */}
            <rect x="162" y="66" width="28" height="32" rx="5" className="fill-[#EDEAE2]/70 dark:fill-[#2A2E32]" />
            <text x="176" y="87" textAnchor="middle" className="font-mono text-[14px] font-bold fill-[#8C533E] dark:fill-[#E07A5F]">
              @
            </text>
            <text x="176" y="112" textAnchor="middle" className="font-mono text-[9px] fill-[#857F72] dark:fill-[#8E8A80]">
              bmm
            </text>

            {/* ================= TENSOR B ================= */}
            <text x="265" y="16" textAnchor="middle" className="font-mono text-[11px] font-bold fill-[#191C1E] dark:fill-[#F7F6F2]">
              Tensor B
            </text>
            <text x="265" y="30" textAnchor="middle" className="font-mono text-[10px] font-semibold fill-[#8C533E] dark:fill-[#E07A5F]">
              Shape: (3, 4, 2)
            </text>

            {[2, 1, 0].map((b) => {
              const isActive = activeBatch === b;
              const x = 224 + b * 16;
              const y = 62 - b * 12;
              const w = 46;
              const h = 64;

              return (
                <g key={`cuboid-b-${b}`} onClick={() => setActiveBatch(b)} className="cursor-pointer">
                  <polygon
                    points={`${x},${y} ${x + 8},${y - 6} ${x + w + 8},${y - 6} ${x + w},${y}`}
                    className={`transition-colors ${
                      isActive ? "fill-[#A6634B] dark:fill-[#B85C42]" : "fill-[#E7E5DF] dark:fill-[#33373B]"
                    }`}
                    opacity={isActive ? 0.95 : 0.45}
                  />
                  <polygon
                    points={`${x + w},${y} ${x + w + 8},${y - 6} ${x + w + 8},${y + h - 6} ${x + w},${y + h}`}
                    className={`transition-colors ${
                      isActive ? "fill-[#734230] dark:fill-[#8C3A24]" : "fill-[#D8D4CA] dark:fill-[#2A2E32]"
                    }`}
                    opacity={isActive ? 0.95 : 0.45}
                  />
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx="2"
                    className={`transition-colors ${
                      isActive
                        ? "fill-[#8C533E] dark:fill-[#E07A5F] stroke-[#E07A5F] dark:stroke-[#F08E75]"
                        : "fill-[#EDEAE2] dark:fill-[#23272B] stroke-[#C8C4BA] dark:stroke-[#33373B]"
                    }`}
                    strokeWidth={isActive ? "2" : "1"}
                    opacity={isActive ? 1 : 0.55}
                  />
                  <text
                    x={x + w / 2}
                    y={y + h / 2 + 3.5}
                    textAnchor="middle"
                    className={`font-mono text-[9px] font-bold pointer-events-none ${
                      isActive ? "fill-white" : "fill-[#857F72] dark:fill-[#8E8A80]"
                    }`}
                  >
                    Slice {b} [4×2]
                  </text>
                </g>
              );
            })}

            {/* ================= OPERATOR = ================= */}
            <text x="340" y="88" textAnchor="middle" className="font-mono text-[18px] font-bold fill-[#191C1E] dark:fill-[#F7F6F2]">
              =
            </text>

            {/* ================= RESULT C ================= */}
            <text x="445" y="16" textAnchor="middle" className="font-mono text-[11px] font-bold fill-[#191C1E] dark:fill-[#F7F6F2]">
              Result Tensor C
            </text>
            <text x="445" y="30" textAnchor="middle" className="font-mono text-[10px] font-semibold fill-emerald-600 dark:fill-emerald-400">
              Shape: (3, 2, 2)
            </text>

            {[2, 1, 0].map((b) => {
              const isActive = activeBatch === b;
              const x = 405 + b * 16;
              const y = 68 - b * 12;
              const w = 48;
              const h = 48;

              return (
                <g key={`cuboid-c-${b}`} onClick={() => setActiveBatch(b)} className="cursor-pointer">
                  <polygon
                    points={`${x},${y} ${x + 8},${y - 6} ${x + w + 8},${y - 6} ${x + w},${y}`}
                    className={`transition-colors ${
                      isActive ? "fill-[#059669] dark:fill-[#059669]" : "fill-[#E7E5DF] dark:fill-[#33373B]"
                    }`}
                    opacity={isActive ? 0.95 : 0.45}
                  />
                  <polygon
                    points={`${x + w},${y} ${x + w + 8},${y - 6} ${x + w + 8},${y + h - 6} ${x + w},${y + h}`}
                    className={`transition-colors ${
                      isActive ? "fill-[#065F46] dark:fill-[#064E3B]" : "fill-[#D8D4CA] dark:fill-[#2A2E32]"
                    }`}
                    opacity={isActive ? 0.95 : 0.45}
                  />
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx="2"
                    className={`transition-colors ${
                      isActive
                        ? "fill-[#10B981] dark:fill-[#10B981] stroke-[#059669] dark:stroke-[#34D399]"
                        : "fill-[#EDEAE2] dark:fill-[#23272B] stroke-[#C8C4BA] dark:stroke-[#33373B]"
                    }`}
                    strokeWidth={isActive ? "2" : "1"}
                    opacity={isActive ? 1 : 0.55}
                  />
                  <text
                    x={x + w / 2}
                    y={y + h / 2 + 3.5}
                    textAnchor="middle"
                    className={`font-mono text-[9px] font-bold pointer-events-none ${
                      isActive ? "fill-white" : "fill-[#857F72] dark:fill-[#8E8A80]"
                    }`}
                  >
                    Slice {b} [2×2]
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 2D Slice Matrix Multiplication View (Like Module 1.1) */}
        <div className="p-4 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-[#FFFFFF] dark:bg-[#191C1E] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7E5DF] dark:border-[#33373B] pb-3">
            <div>
              <div className="text-xs font-mono font-bold text-[#191C1E] dark:text-[#F7F6F2]">
                Active Slice: Batch b = {activeBatch}
              </div>
              <div className="text-[11px] text-[#555148] dark:text-[#A8A398]">
                Click any cell in Result C to trace its row-column dot product:
              </div>
            </div>

            {/* Animation Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold bg-[#8C533E] hover:bg-[#734230] text-white transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? "Pause" : "Animate k"}</span>
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setActiveK(null);
                }}
                className="p-1.5 rounded text-[#857F72] hover:text-[#191C1E] dark:hover:text-[#F7F6F2] hover:bg-[#EDEAE2] dark:hover:bg-[#2C2F33] transition-colors"
                title="Reset animation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Side-by-side 2D Matrix Grids */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 py-2">
            {/* Matrix A[b] (2x4) */}
            <div className="flex flex-col items-center">
              <div className="text-[11px] font-mono text-[#857F72] dark:text-[#8E8A80] mb-1.5">
                Matrix A[{activeBatch}] (2 × 4)
              </div>
              <div className="grid grid-cols-4 gap-1 p-2 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-[#FCFBF9] dark:bg-[#23272B]">
                {currentA.map((row, i) =>
                  row.map((val, k) => {
                    const isRow = i === selectedI;
                    const isTerm = isRow && (activeK === null || activeK === k);
                    const isStrictK = isRow && activeK === k;

                    return (
                      <div
                        key={`a-cell-${i}-${k}`}
                        className={`w-9 h-9 sm:w-10 sm:h-10 flex flex-col items-center justify-center rounded font-mono text-xs transition-colors ${
                          isStrictK
                            ? "bg-[#8C533E] dark:bg-[#E07A5F] text-white font-bold ring-2 ring-[#8C533E]"
                            : isTerm && isRow
                            ? "bg-[#EDEAE2] dark:bg-[#33373B] text-[#8C533E] dark:text-[#E07A5F] font-bold"
                            : "bg-[#FFFFFF] dark:bg-[#191C1E] text-[#555148] dark:text-[#A8A398] opacity-60"
                        }`}
                      >
                        <span>{val}</span>
                        <span className="text-[8.5px] opacity-70">[{i},{k}]</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <span className="text-base sm:text-lg font-mono font-bold text-[#8C533E] dark:text-[#E07A5F]">
              ×
            </span>

            {/* Matrix B[b] (4x2) */}
            <div className="flex flex-col items-center">
              <div className="text-[11px] font-mono text-[#857F72] dark:text-[#8E8A80] mb-1.5">
                Matrix B[{activeBatch}] (4 × 2)
              </div>
              <div className="grid grid-cols-2 gap-1 p-2 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-[#FCFBF9] dark:bg-[#23272B]">
                {currentB.map((row, k) =>
                  row.map((val, j) => {
                    const isCol = j === selectedJ;
                    const isTerm = isCol && (activeK === null || activeK === k);
                    const isStrictK = isCol && activeK === k;

                    return (
                      <div
                        key={`b-cell-${k}-${j}`}
                        className={`w-9 h-9 sm:w-10 sm:h-10 flex flex-col items-center justify-center rounded font-mono text-xs transition-colors ${
                          isStrictK
                            ? "bg-[#8C533E] dark:bg-[#E07A5F] text-white font-bold ring-2 ring-[#8C533E]"
                            : isTerm && isCol
                            ? "bg-[#EDEAE2] dark:bg-[#33373B] text-[#8C533E] dark:text-[#E07A5F] font-bold"
                            : "bg-[#FFFFFF] dark:bg-[#191C1E] text-[#555148] dark:text-[#A8A398] opacity-60"
                        }`}
                      >
                        <span>{val}</span>
                        <span className="text-[8.5px] opacity-70">[{k},{j}]</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <span className="text-base sm:text-lg font-mono font-bold text-[#191C1E] dark:text-[#F7F6F2]">
              =
            </span>

            {/* Result Matrix C[b] (2x2) */}
            <div className="flex flex-col items-center">
              <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold mb-1.5">
                Result C[{activeBatch}] (2 × 2)
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-2 rounded border-2 border-emerald-500/40 bg-[#FCFBF9] dark:bg-[#23272B]">
                {currentC.map((row, i) =>
                  row.map((val, j) => {
                    const isSelected = i === selectedI && j === selectedJ;

                    return (
                      <button
                        key={`c-cell-${i}-${j}`}
                        onClick={() => {
                          setSelectedI(i);
                          setSelectedJ(j);
                          setActiveK(null);
                          setIsPlaying(false);
                        }}
                        className={`w-10 h-10 sm:w-11 sm:h-11 flex flex-col items-center justify-center rounded font-mono text-xs cursor-pointer transition-all ${
                          isSelected
                            ? "bg-emerald-600 text-white font-bold ring-2 ring-emerald-400 scale-105 shadow-xs"
                            : "bg-[#FFFFFF] dark:bg-[#191C1E] text-[#191C1E] dark:text-[#E6E4DF] hover:bg-emerald-50 dark:hover:bg-[#1F2E28]"
                        }`}
                      >
                        <span className="text-xs sm:text-sm">{val}</span>
                        <span className="text-[8.5px] opacity-75">C[{i},{j}]</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Dot Product Calculation Bar */}
          <div className="p-3 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-[#FCFBF9] dark:bg-[#23272B] font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2 pb-2 border-b border-[#E7E5DF] dark:border-[#33373B]">
              <span className="font-bold text-[#191C1E] dark:text-[#F7F6F2]">
                Row A[{activeBatch}][{selectedI}] · Col B[{activeBatch}][{selectedJ}]:
              </span>
              <span className="text-[11px] text-[#8C533E] dark:text-[#E07A5F]">
                C[{activeBatch}][{selectedI}, {selectedJ}] = {totalSum}
              </span>
            </div>

            {/* Terms expansion */}
            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
              {terms.map((t, idx) => {
                const isCurrentK = activeK === t.k;
                return (
                  <React.Fragment key={t.k}>
                    <span
                      onClick={() => {
                        setActiveK(t.k);
                        setIsPlaying(false);
                      }}
                      className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                        isCurrentK
                          ? "bg-[#8C533E] dark:bg-[#E07A5F] text-white font-bold ring-1 ring-[#8C533E]"
                          : "bg-[#FFFFFF] dark:bg-[#191C1E] border border-[#E7E5DF] dark:border-[#33373B] text-[#555148] dark:text-[#E6E4DF] hover:border-[#8C533E]"
                      }`}
                    >
                      ({t.a}×{t.b}={t.prod})
                    </span>
                    {idx < terms.length - 1 && <span className="text-[#857F72]">+</span>}
                  </React.Fragment>
                );
              })}
              <span className="text-[#857F72]">=</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                {totalSum}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
