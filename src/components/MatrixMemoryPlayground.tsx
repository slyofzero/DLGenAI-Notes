"use client";

import React, { useState } from "react";
import { Grid, Layers, Database } from "lucide-react";

const MATRIX_DATA = [
  [12, 25, 38],
  [41, 56, 63],
  [74, 87, 99],
];

type SelectionType = "cell" | "row" | "col";

export default function MatrixMemoryPlayground() {
  const [mode, setMode] = useState<SelectionType>("cell");
  const [selectedRow, setSelectedRow] = useState<number>(1);
  const [selectedCol, setSelectedCol] = useState<number>(1);

  // Check if a cell (r, c) is currently highlighted
  const isCellSelected = (r: number, c: number) => {
    if (mode === "cell") {
      return r === selectedRow && c === selectedCol;
    }
    if (mode === "row") {
      return r === selectedRow;
    }
    if (mode === "col") {
      return c === selectedCol;
    }
    return false;
  };

  // Check if a 1D index (0..8) is currently highlighted
  const isIndexSelected = (idx: number) => {
    const r = Math.floor(idx / 3);
    const c = idx % 3;
    return isCellSelected(r, c);
  };

  // Memory offset for the currently selected cell
  const currentOffset = selectedRow * 3 + selectedCol;
  const currentValue = MATRIX_DATA[selectedRow][selectedCol];

  return (
    <div className="not-prose my-8 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-white dark:bg-[#23272B] shadow-2xs overflow-hidden">
      {/* Top Header */}
      <div className="px-5 py-3.5 border-b border-[#E7E5DF] dark:border-[#33373B] bg-[#FCFBF9] dark:bg-[#1C1F21] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#857F72] dark:text-[#8E8A80]">
            Interactive Memory Explorer
          </div>
          <h4 className="font-serif text-sm font-medium text-[#191C1E] dark:text-[#F7F6F2]">
            2D Matrix to 1D Contiguous Memory Layout
          </h4>
        </div>

        {/* Selection Mode Pills */}
        <div className="flex items-center gap-1 bg-[#EDEAE2] dark:bg-[#2C2F33] p-1 rounded text-xs font-medium">
          <button
            onClick={() => setMode("cell")}
            className={`px-2.5 py-1 rounded transition-colors ${
              mode === "cell"
                ? "bg-[#8C533E] text-white shadow-xs font-semibold"
                : "text-[#555148] dark:text-[#A8A398] hover:text-[#191C1E] dark:hover:text-[#F7F6F2]"
            }`}
          >
            Pick Element
          </button>
          <button
            onClick={() => setMode("row")}
            className={`px-2.5 py-1 rounded transition-colors ${
              mode === "row"
                ? "bg-[#8C533E] text-white shadow-xs font-semibold"
                : "text-[#555148] dark:text-[#A8A398] hover:text-[#191C1E] dark:hover:text-[#F7F6F2]"
            }`}
          >
            Select Row
          </button>
          <button
            onClick={() => setMode("col")}
            className={`px-2.5 py-1 rounded transition-colors ${
              mode === "col"
                ? "bg-[#8C533E] text-white shadow-xs font-semibold"
                : "text-[#555148] dark:text-[#A8A398] hover:text-[#191C1E] dark:hover:text-[#F7F6F2]"
            }`}
          >
            Select Column
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Quick Row / Column Selector Buttons */}
        {mode === "row" && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#857F72] font-medium">Choose Row:</span>
            {[0, 1, 2].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRow(r)}
                className={`px-3 py-1 rounded border transition-colors ${
                  selectedRow === r
                    ? "border-[#8C533E] bg-[#8C533E] text-white font-semibold"
                    : "border-[#E7E5DF] dark:border-[#33373B] bg-[#FCFBF9] dark:bg-[#1C1F21] text-[#555148] dark:text-[#A8A398] hover:bg-[#EDEAE2]"
                }`}
              >
                Row {r}
              </button>
            ))}
          </div>
        )}

        {mode === "col" && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#857F72] font-medium">Choose Column:</span>
            {[0, 1, 2].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCol(c)}
                className={`px-3 py-1 rounded border transition-colors ${
                  selectedCol === c
                    ? "border-[#8C533E] bg-[#8C533E] text-white font-semibold"
                    : "border-[#E7E5DF] dark:border-[#33373B] bg-[#FCFBF9] dark:bg-[#1C1F21] text-[#555148] dark:text-[#A8A398] hover:bg-[#EDEAE2]"
                }`}
              >
                Column {c}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* 1. 2D Matrix View */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#191C1E] dark:text-[#F7F6F2]">
              <Grid className="w-4 h-4 text-[#8C533E] dark:text-[#E07A5F]" />
              <span>How We Think: 2D Matrix View (Shape: 3 × 3)</span>
            </div>

            <div className="inline-block p-3 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-[#FCFBF9] dark:bg-[#1C1F21]">
              <div className="grid grid-cols-3 gap-2">
                {MATRIX_DATA.map((row, r) =>
                  row.map((val, c) => {
                    const active = isCellSelected(r, c);
                    return (
                      <button
                        key={`${r}-${c}`}
                        onClick={() => {
                          setSelectedRow(r);
                          setSelectedCol(c);
                        }}
                        className={`w-16 h-16 sm:w-18 sm:h-18 rounded flex flex-col items-center justify-center border transition-all ${
                          active
                            ? "border-[#8C533E] bg-[#8C533E] text-white shadow-xs scale-102 font-bold"
                            : "border-[#E7E5DF] dark:border-[#33373B] bg-white dark:bg-[#23272B] text-[#191C1E] dark:text-[#F7F6F2] hover:border-[#8C533E]/50"
                        }`}
                      >
                        <span className="text-sm sm:text-base font-mono">{val}</span>
                        <span
                          className={`text-[9px] font-mono mt-0.5 ${
                            active ? "text-white/80" : "text-[#857F72]"
                          }`}
                        >
                          [{r}, {c}]
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
            <p className="text-[11px] text-[#555148] dark:text-[#A8A398]">
              Click any cell to see where it lives in physical memory.
            </p>
          </div>

          {/* 2. Mathematical Stride Explanation Card */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#191C1E] dark:text-[#F7F6F2]">
              <Database className="w-4 h-4 text-[#8C533E] dark:text-[#E07A5F]" />
              <span>Hardware Formula &amp; Strides</span>
            </div>

            <div className="p-4 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-[#FCFBF9] dark:bg-[#1C1F21] space-y-3 text-xs">
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#857F72]">
                  Index Formula (Row-Major)
                </div>
                <div className="font-mono text-sm text-[#8C533E] dark:text-[#E07A5F] font-bold">
                  Memory Index = (row × 3) + col
                </div>
              </div>

              {mode === "cell" && (
                <div className="pt-2 border-t border-[#E7E5DF] dark:border-[#33373B] space-y-1 font-mono text-xs">
                  <div>
                    Selected: <strong className="text-[#191C1E] dark:text-[#F7F6F2]">Matrix[{selectedRow}, {selectedCol}]</strong>
                  </div>
                  <div>
                    Calculation: ({selectedRow} × 3) + {selectedCol} ={" "}
                    <strong className="text-[#8C533E] dark:text-[#E07A5F]">Index {currentOffset}</strong>
                  </div>
                  <div>Value Stored: <strong className="text-[#191C1E] dark:text-[#F7F6F2]">{currentValue}</strong></div>
                </div>
              )}

              {mode === "row" && (
                <div className="pt-2 border-t border-[#E7E5DF] dark:border-[#33373B] space-y-1.5 text-xs text-[#555148] dark:text-[#A8A398]">
                  <div className="font-semibold text-[#191C1E] dark:text-[#F7F6F2]">
                    Row {selectedRow} Memory Slice: [{selectedRow * 3}, {selectedRow * 3 + 1}, {selectedRow * 3 + 2}]
                  </div>
                  <p>
                    All 3 numbers in this row sit <strong>directly next to each other</strong> in RAM. Moving to the next column takes just 1 step (stride = 1).
                  </p>
                </div>
              )}

              {mode === "col" && (
                <div className="pt-2 border-t border-[#E7E5DF] dark:border-[#33373B] space-y-1.5 text-xs text-[#555148] dark:text-[#A8A398]">
                  <div className="font-semibold text-[#191C1E] dark:text-[#F7F6F2]">
                    Column {selectedCol} Memory Positions: [{selectedCol}, {selectedCol + 3}, {selectedCol + 6}]
                  </div>
                  <p>
                    These numbers are <strong>separated by 3 slots</strong> in RAM! To reach the next row in the same column, the computer must jump by 3 (stride = 3).
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. 1D Contiguous Memory Array View (1x9) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#191C1E] dark:text-[#F7F6F2]">
            <Layers className="w-4 h-4 text-[#8C533E] dark:text-[#E07A5F]" />
            <span>How the Computer Stores It: 1D Physical Memory Buffer (Size: 9)</span>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="inline-flex gap-1.5 p-3 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-[#FCFBF9] dark:bg-[#1C1F21]">
              {Array.from({ length: 9 }).map((_, idx) => {
                const r = Math.floor(idx / 3);
                const c = idx % 3;
                const val = MATRIX_DATA[r][c];
                const active = isIndexSelected(idx);

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedRow(r);
                      setSelectedCol(c);
                    }}
                    className={`w-14 sm:w-16 h-18 rounded flex flex-col items-center justify-between py-2 border transition-all shrink-0 ${
                      active
                        ? "border-[#8C533E] bg-[#8C533E] text-white shadow-xs font-bold scale-102"
                        : "border-[#E7E5DF] dark:border-[#33373B] bg-white dark:bg-[#23272B] text-[#191C1E] dark:text-[#F7F6F2] hover:border-[#8C533E]/50"
                    }`}
                  >
                    <span
                      className={`text-[9px] font-mono ${
                        active ? "text-white/80" : "text-[#857F72]"
                      }`}
                    >
                      addr[{idx}]
                    </span>
                    <span className="text-sm sm:text-base font-mono font-semibold">{val}</span>
                    <span
                      className={`text-[9px] font-mono ${
                        active ? "text-white/80" : "text-[#857F72]"
                      }`}
                    >
                      ({r},{c})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
