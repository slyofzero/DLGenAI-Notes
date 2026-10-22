"use client";

import React, { useState } from "react";
import { Layers, Database, Sparkles } from "lucide-react";

// 3D Tensor of shape (2, 3, 4)
// Total elements: 24
const TENSOR_DATA = [
  // Batch 0 (Shape 3x4)
  [
    [10, 11, 12, 13],
    [20, 21, 22, 23],
    [30, 31, 32, 33],
  ],
  // Batch 1 (Shape 3x4)
  [
    [50, 51, 52, 53],
    [60, 61, 62, 63],
    [70, 71, 72, 73],
  ],
];

// Stride constants for (2, 3, 4)
const STRIDE_B = 12; // 3 * 4
const STRIDE_I = 4;  // 4
const STRIDE_J = 1;  // 1

type SelectionMode = "element" | "batch" | "row" | "col";

export default function Tensor3DMemoryPlayground() {
  const [mode, setMode] = useState<SelectionMode>("element");
  const [selectedB, setSelectedB] = useState<number>(0);
  const [selectedI, setSelectedI] = useState<number>(1);
  const [selectedJ, setSelectedJ] = useState<number>(2);

  // Check if a cell (b, i, j) is selected based on mode
  const isCellSelected = (b: number, i: number, j: number) => {
    if (mode === "element") {
      return b === selectedB && i === selectedI && j === selectedJ;
    }
    if (mode === "batch") {
      return b === selectedB;
    }
    if (mode === "row") {
      return b === selectedB && i === selectedI;
    }
    if (mode === "col") {
      return b === selectedB && j === selectedJ;
    }
    return false;
  };

  const getMemoryIndex = (b: number, i: number, j: number) => {
    return b * STRIDE_B + i * STRIDE_I + j * STRIDE_J;
  };

  const currentMemoryIndex = getMemoryIndex(selectedB, selectedI, selectedJ);

  // Flatten the 3D tensor to 1D RAM array
  const flatRam = TENSOR_DATA.flatMap((batch, b) =>
    batch.flatMap((row, i) =>
      row.map((val, j) => ({
        val,
        b,
        i,
        j,
        addr: getMemoryIndex(b, i, j),
      }))
    )
  );

  return (
    <div className="not-prose my-8 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-[#FCFBF9] dark:bg-[#23272B] shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-[#E7E5DF] dark:border-[#33373B] bg-[#F7F6F2] dark:bg-[#1C1F21]">
        <div>
          <span className="eyebrow-label text-[#8C533E] dark:text-[#E07A5F] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Memory Explorer
          </span>
          <h4 className="font-serif text-sm font-medium text-[#191C1E] dark:text-[#F7F6F2] mt-0.5">
            3D Tensor Stride & Contiguous RAM Buffer (Shape: 2 × 3 × 4)
          </h4>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-[#EDEAE2] dark:bg-[#191C1E] p-1 rounded border border-[#E7E5DF] dark:border-[#33373B] text-xs">
          <button
            onClick={() => setMode("element")}
            className={`px-2.5 py-1 rounded transition-colors font-mono cursor-pointer ${
              mode === "element"
                ? "bg-[#FFFFFF] dark:bg-[#23272B] text-[#8C533E] dark:text-[#E07A5F] font-semibold shadow-2xs"
                : "text-[#555148] dark:text-[#A8A398] hover:text-[#191C1E] dark:hover:text-[#F7F6F2]"
            }`}
          >
            Element [b, i, j]
          </button>
          <button
            onClick={() => setMode("batch")}
            className={`px-2.5 py-1 rounded transition-colors font-mono cursor-pointer ${
              mode === "batch"
                ? "bg-[#FFFFFF] dark:bg-[#23272B] text-[#8C533E] dark:text-[#E07A5F] font-semibold shadow-2xs"
                : "text-[#555148] dark:text-[#A8A398] hover:text-[#191C1E] dark:hover:text-[#F7F6F2]"
            }`}
          >
            Batch Slice [b]
          </button>
          <button
            onClick={() => setMode("row")}
            className={`px-2.5 py-1 rounded transition-colors font-mono cursor-pointer ${
              mode === "row"
                ? "bg-[#FFFFFF] dark:bg-[#23272B] text-[#8C533E] dark:text-[#E07A5F] font-semibold shadow-2xs"
                : "text-[#555148] dark:text-[#A8A398] hover:text-[#191C1E] dark:hover:text-[#F7F6F2]"
            }`}
          >
            Row Slice [b, i]
          </button>
          <button
            onClick={() => setMode("col")}
            className={`px-2.5 py-1 rounded transition-colors font-mono cursor-pointer ${
              mode === "col"
                ? "bg-[#FFFFFF] dark:bg-[#23272B] text-[#8C533E] dark:text-[#E07A5F] font-semibold shadow-2xs"
                : "text-[#555148] dark:text-[#A8A398] hover:text-[#191C1E] dark:hover:text-[#F7F6F2]"
            }`}
          >
            Col Slice [b, j]
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Dynamic Formula Display */}
        <div className="p-3.5 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-[#FFFFFF] dark:bg-[#191C1E] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#857F72] dark:text-[#8E8A80]">Address Formula:</span>
            <span className="text-[#191C1E] dark:text-[#F7F6F2] font-semibold">
              (b × <span className="text-[#8C533E] dark:text-[#E07A5F]">12</span>) + (i × <span className="text-[#8C533E] dark:text-[#E07A5F]">4</span>) + (j × <span className="text-[#8C533E] dark:text-[#E07A5F]">1</span>)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#857F72] dark:text-[#8E8A80]">Current Coordinates:</span>
            {mode === "element" && (
              <span className="px-2 py-0.5 rounded bg-[#EDEAE2] dark:bg-[#2C2F33] text-[#8C533E] dark:text-[#E07A5F] font-bold">
                [{selectedB}, {selectedI}, {selectedJ}] → Offset = ({selectedB}×12) + ({selectedI}×4) + ({selectedJ}×1) = {currentMemoryIndex}
              </span>
            )}
            {mode === "batch" && (
              <span className="px-2 py-0.5 rounded bg-[#EDEAE2] dark:bg-[#2C2F33] text-[#8C533E] dark:text-[#E07A5F] font-bold">
                Batch {selectedB} → RAM Span [{selectedB * 12} … {selectedB * 12 + 11}] (12 contiguous numbers)
              </span>
            )}
            {mode === "row" && (
              <span className="px-2 py-0.5 rounded bg-[#EDEAE2] dark:bg-[#2C2F33] text-[#8C533E] dark:text-[#E07A5F] font-bold">
                Batch {selectedB}, Row {selectedI} → RAM Span [{getMemoryIndex(selectedB, selectedI, 0)} … {getMemoryIndex(selectedB, selectedI, 3)}] (4 contiguous numbers)
              </span>
            )}
            {mode === "col" && (
              <span className="px-2 py-0.5 rounded bg-[#EDEAE2] dark:bg-[#2C2F33] text-[#8C533E] dark:text-[#E07A5F] font-bold">
                Batch {selectedB}, Col {selectedJ} → RAM Offsets [{getMemoryIndex(selectedB, 0, selectedJ)}, {getMemoryIndex(selectedB, 1, selectedJ)}, {getMemoryIndex(selectedB, 2, selectedJ)}] (Stride = +4)
              </span>
            )}
          </div>
        </div>

        {/* 3D Tensor Slices */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#857F72] dark:text-[#8E8A80] font-semibold mb-3">
            <Layers className="w-3.5 h-3.5" />
            2D Slices of 3D Tensor (Click any cell or slice):
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TENSOR_DATA.map((batchData, b) => (
              <div
                key={b}
                className={`p-3.5 rounded border transition-colors ${
                  selectedB === b
                    ? "border-[#8C533E] dark:border-[#E07A5F] bg-[#FFFFFF] dark:bg-[#191C1E]"
                    : "border-[#E7E5DF] dark:border-[#33373B] bg-[#FCFBF9] dark:bg-[#1C1F21]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-[#191C1E] dark:text-[#F7F6F2]">
                    Slice Batch b = {b} (Shape: 3 × 4)
                  </span>
                  <span className="text-[10px] font-mono text-[#857F72] dark:text-[#8E8A80]">
                    RAM Offsets: {b * 12} – {b * 12 + 11}
                  </span>
                </div>

                {/* 3x4 Grid */}
                <div className="grid grid-cols-4 gap-1.5">
                  {batchData.flatMap((row, i) =>
                    row.map((val, j) => {
                      const active = isCellSelected(b, i, j);
                      return (
                        <button
                          key={`${b}-${i}-${j}`}
                          onClick={() => {
                            setSelectedB(b);
                            setSelectedI(i);
                            setSelectedJ(j);
                          }}
                          className={`p-2 rounded text-center transition-all cursor-pointer font-mono ${
                            active
                              ? "bg-[#8C533E] dark:bg-[#E07A5F] text-white font-bold shadow-xs scale-102"
                              : "bg-[#EDEAE2]/50 dark:bg-[#2C2F33] text-[#191C1E] dark:text-[#E6E4DF] hover:bg-[#EDEAE2] dark:hover:bg-[#33373B]"
                          }`}
                        >
                          <div className="text-xs">{val}</div>
                          <div
                            className={`text-[9px] mt-0.5 ${
                              active ? "text-white/80" : "text-[#857F72] dark:text-[#8E8A80]"
                            }`}
                          >
                            [{b},{i},{j}]
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 1D Flat Physical Memory Buffer */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#857F72] dark:text-[#8E8A80] font-semibold">
              <Database className="w-3.5 h-3.5" />
              1D Physical RAM Buffer (Contiguous Row-Major Memory):
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-[#857F72] dark:text-[#8E8A80]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#EDEAE2] dark:bg-[#2C2F33] inline-block border border-[#857F72]/30"></span>
                Batch 0 (0-11)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-50 dark:bg-amber-950/40 inline-block border border-amber-300 dark:border-amber-800"></span>
                Batch 1 (12-23)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex gap-1 min-w-[700px]">
              {flatRam.map((cell) => {
                const active = isCellSelected(cell.b, cell.i, cell.j);
                const isBatch1 = cell.b === 1;

                return (
                  <div
                    key={cell.addr}
                    onClick={() => {
                      setSelectedB(cell.b);
                      setSelectedI(cell.i);
                      setSelectedJ(cell.j);
                    }}
                    className={`flex-1 min-w-[32px] p-1.5 rounded text-center transition-all cursor-pointer font-mono ${
                      active
                        ? "bg-[#8C533E] dark:bg-[#E07A5F] text-white font-bold ring-2 ring-[#8C533E]/50 z-10 scale-105"
                        : isBatch1
                        ? "bg-amber-50/70 dark:bg-amber-950/30 text-[#191C1E] dark:text-[#E6E4DF] border border-amber-200 dark:border-amber-900/60 hover:bg-amber-100"
                        : "bg-[#EDEAE2]/50 dark:bg-[#2C2F33] text-[#191C1E] dark:text-[#E6E4DF] border border-[#E7E5DF] dark:border-[#33373B] hover:bg-[#EDEAE2]"
                    }`}
                  >
                    <div className="text-[11px]">{cell.val}</div>
                    <div
                      className={`text-[9px] mt-0.5 ${
                        active ? "text-white/80" : "text-[#857F72] dark:text-[#8E8A80]"
                      }`}
                    >
                      @{cell.addr}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Intuition Box */}
        <div className="p-3.5 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-[#FFFFFF] dark:bg-[#191C1E] text-xs text-[#555148] dark:text-[#A8A398] leading-relaxed">
          <strong className="text-[#191C1E] dark:text-[#F7F6F2] font-semibold">
            Key Insight:
          </strong>{" "}
          Notice how entire batches and entire rows are <em>physically adjacent</em> (contiguous) in memory.
          However, reading along a column skips by <code className="text-[#8C533E] dark:text-[#E07A5F]">stride[1] = 4</code> slots in memory.
          This stride structure allows PyTorch to slice, reshape, and transpose multidimensional arrays with <strong>zero data copying</strong>!
        </div>
      </div>
    </div>
  );
}
