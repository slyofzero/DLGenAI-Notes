"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, FastForward } from "lucide-react";

// Matrix A: 2 x 3
const MATRIX_A = [
  [1, 2, 3],
  [4, 5, 6],
];

// Matrix B: 3 x 2
const MATRIX_B = [
  [7, 8],
  [9, 1],
  [2, 3],
];

const MEM_A = MATRIX_A.flat(); // size 6: [1, 2, 3, 4, 5, 6]
const MEM_B = MATRIX_B.flat(); // size 6: [7, 8, 9, 1, 2, 3]

const M = 2; // A.shape[0]
const K = 3; // A.shape[1] == B.shape[0]
const N = 2; // B.shape[1]

export default function MatrixMulPlayground() {
  const [i, setI] = useState<number>(0);
  const [j, setJ] = useState<number>(0);
  const [k, setK] = useState<number>(0);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1000);

  // Stride arithmetic
  const idxA = i * K + k; // i * A.shape[1] + k
  const idxB = k * N + j; // k * B.shape[1] + j

  const valA = MATRIX_A[i][k];
  const valB = MATRIX_B[k][j];
  const currentProduct = valA * valB;

  const partialSum = React.useMemo(() => {
    let sum = 0;
    for (let step = 0; step <= k; step++) {
      sum += MATRIX_A[i][step] * MATRIX_B[step][j];
    }
    return sum;
  }, [i, j, k]);

  const matrixC = React.useMemo(() => {
    const res: number[][] = [];
    for (let r = 0; r < M; r++) {
      res[r] = [];
      for (let c = 0; c < N; c++) {
        let sum = 0;
        for (let step = 0; step < K; step++) {
          sum += MATRIX_A[r][step] * MATRIX_B[step][c];
        }
        res[r][c] = sum;
      }
    }
    return res;
  }, []);

  const stepForward = () => {
    if (k < K - 1) {
      setK((prev) => prev + 1);
    } else {
      setK(0);
      if (j < N - 1) {
        setJ((prev) => prev + 1);
      } else {
        setJ(0);
        setI((prev) => (prev + 1) % M);
      }
    }
  };

  const stepBackward = () => {
    if (k > 0) {
      setK((prev) => prev - 1);
    } else {
      setK(K - 1);
      if (j > 0) {
        setJ((prev) => prev - 1);
      } else {
        setJ(N - 1);
        setI((prev) => (prev - 1 + M) % M);
      }
    }
  };

  const resetAll = () => {
    setI(0);
    setJ(0);
    setK(0);
    setIsPlaying(false);
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setK((prevK) => {
        if (prevK < K - 1) {
          return prevK + 1;
        } else {
          setJ((prevJ) => {
            if (prevJ < N - 1) {
              return prevJ + 1;
            } else {
              setI((prevI) => (prevI + 1) % M);
              return 0;
            }
          });
          return 0;
        }
      });
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed]);

  return (
    <div className="not-prose my-8 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-white dark:bg-[#23272B] shadow-2xs overflow-hidden">
      {/* Top Playback Control Bar */}
      <div className="px-4 py-2.5 border-b border-[#E7E5DF] dark:border-[#33373B] bg-[#FCFBF9] dark:bg-[#1C1F21] flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-mono text-xs text-[#857F72]">
          <span>i={i}</span>
          <span>·</span>
          <span>j={j}</span>
          <span>·</span>
          <span>k={k}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={stepBackward}
            title="Step Back"
            aria-label="Step Back"
            className="p-1.5 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-white dark:bg-[#23272B] hover:bg-[#EDEAE2] text-[#555148] dark:text-[#A8A398] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause" : "Play"}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="p-1.5 px-3 rounded bg-[#8C533E] hover:bg-[#734230] text-white text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={stepForward}
            title="Step Forward"
            aria-label="Step Forward"
            className="p-1.5 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-white dark:bg-[#23272B] hover:bg-[#EDEAE2] text-[#555148] dark:text-[#A8A398] transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetAll}
            title="Reset"
            aria-label="Reset"
            className="p-1.5 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-white dark:bg-[#23272B] hover:bg-[#EDEAE2] text-[#555148] dark:text-[#A8A398] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setSpeed(speed === 1000 ? 450 : 1000)}
            title="Toggle Speed"
            aria-label="Toggle Speed"
            className={`p-1.5 rounded border text-xs font-mono transition-colors ${
              speed === 450
                ? "border-[#8C533E] text-[#8C533E] bg-[#EDEAE2]"
                : "border-[#E7E5DF] dark:border-[#33373B] text-[#857F72]"
            }`}
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* 1. Pseudocode Section */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#857F72] dark:text-[#8E8A80]">
            Pseudocode
          </div>

          <div className="rounded border border-[#E7E5DF] dark:border-[#33373B] bg-[#FCFBF9] dark:bg-[#1C1F21] p-3.5 text-xs font-mono space-y-1">
            <div>
              <span className="text-[#8C533E] dark:text-[#E07A5F] font-bold">
                for i in range(A.shape[0]):
              </span>
            </div>
            <div className="pl-4">
              <span className="text-[#2B4141] dark:text-[#60A5FA] font-bold">
                for j in range(B.shape[1]):
              </span>
            </div>
            <div className="pl-8">
              <span className="text-[#D97706] font-bold">
                for k in range(A.shape[1]):
              </span>
            </div>
            {/* Active Execution Line with A[i][k] * B[k][j] */}
            <div className="pl-12 py-1.5 space-y-1 border-l-2 border-[#D97706] bg-amber-500/10 dark:bg-amber-500/15 px-2.5 rounded-r my-1 text-[11px] sm:text-xs">
              <div className="font-semibold text-[#191C1E] dark:text-[#F7F6F2]">
                acc += A[i][k] * B[k][j] = A[{i}][{k}] * B[{k}][{j}] = {valA} *{" "}
                {valB} = +{currentProduct}
              </div>
              {/* Memory mapping explanation */}
              <div className="text-[10.5px] text-[#857F72] pt-0.5 space-y-0.5">
                <div>
                  A[{i}][{k}] means memory index i * A.shape[1] + k = {i} * 3 +{" "}
                  {k} ={" "}
                  <strong className="text-[#8C533E] dark:text-[#E07A5F] font-bold">
                    {idxA}
                  </strong>
                </div>
                <div>
                  B[{k}][{j}] means memory index k * B.shape[1] + j = {k} * 2 +{" "}
                  {j} ={" "}
                  <strong className="text-[#2B4141] dark:text-[#60A5FA] font-bold">
                    {idxB}
                  </strong>
                </div>
              </div>
            </div>
            <div className="font-semibold pl-8 text-[#191C1E] dark:text-[#F7F6F2]">
              A[i][j] = acc
            </div>
            <div className="pl-8 pt-1 text-[11.5px] font-semibold text-[#D97706]">
              acc = {partialSum}
            </div>
          </div>
        </div>

        {/* 2. Memory Representation Section (Two Clean Rows) */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#857F72] dark:text-[#8E8A80]">
            Memory Representation
          </div>

          <div className="rounded border border-[#E7E5DF] dark:border-[#33373B] bg-[#FCFBF9] dark:bg-[#1C1F21] p-3 space-y-2">
            {/* Row 1: Memory A */}
            <div className="grid grid-cols-6 gap-1 font-mono text-center">
              {MEM_A.map((val, index) => {
                const isActive = index === idxA;
                const isInRow = Math.floor(index / K) === i;
                return (
                  <div
                    key={`memA-${index}`}
                    className={`py-1.5 rounded border text-xs transition-all ${
                      isActive
                        ? "border-[#8C533E] bg-[#8C533E] text-white font-bold scale-102 shadow-xs"
                        : isInRow
                          ? "border-[#8C533E]/40 bg-[#8C533E]/10 text-[#8C533E] dark:text-[#E07A5F]"
                          : "border-[#E7E5DF] dark:border-[#33373B] bg-white dark:bg-[#23272B] text-[#857F72]"
                    }`}
                  >
                    <div className="text-[9px] opacity-75">{index}</div>
                    <div className="font-semibold text-xs sm:text-sm">
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Row 2: Memory B */}
            <div className="grid grid-cols-6 gap-1 font-mono text-center">
              {MEM_B.map((val, index) => {
                const isActive = index === idxB;
                const isInCol = index % N === j;
                return (
                  <div
                    key={`memB-${index}`}
                    className={`py-1.5 rounded border text-xs transition-all ${
                      isActive
                        ? "border-[#2B4141] dark:border-[#60A5FA] bg-[#2B4141] dark:bg-[#1E3A8A] text-white font-bold scale-102 shadow-xs"
                        : isInCol
                          ? "border-[#2B4141]/40 dark:border-[#60A5FA]/40 bg-[#2B4141]/10 dark:bg-[#60A5FA]/10 text-[#2B4141] dark:text-[#60A5FA]"
                          : "border-[#E7E5DF] dark:border-[#33373B] bg-white dark:bg-[#23272B] text-[#857F72]"
                    }`}
                  >
                    <div className="text-[9px] opacity-75">{index}</div>
                    <div className="font-semibold text-xs sm:text-sm">
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Matrices Section (Blocks Only) */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#857F72] dark:text-[#8E8A80]">
            Matrices
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-5 py-2">
            {/* Matrix A Blocks (2 x 3) */}
            <div className="grid grid-cols-3 gap-1.5">
              {MATRIX_A.map((row, r) =>
                row.map((val, c) => {
                  const isCurrent = r === i && c === k;
                  const isInRow = r === i;
                  return (
                    <div
                      key={`a2d-${r}-${c}`}
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded flex flex-col items-center justify-center font-mono text-xs border transition-all ${
                        isCurrent
                          ? "border-[#8C533E] bg-[#8C533E] text-white font-bold scale-105 shadow-xs"
                          : isInRow
                            ? "border-[#8C533E]/50 bg-[#8C533E]/15 text-[#8C533E] dark:text-[#E07A5F] font-semibold"
                            : "border-[#E7E5DF] dark:border-[#33373B] bg-white dark:bg-[#23272B] text-[#555148] dark:text-[#A8A398]"
                      }`}
                    >
                      <span className="text-sm font-semibold">{val}</span>
                    </div>
                  );
                }),
              )}
            </div>

            <div className="text-lg font-bold text-[#857F72]">×</div>

            {/* Matrix B Blocks (3 x 2) */}
            <div className="grid grid-cols-2 gap-1.5">
              {MATRIX_B.map((row, r) =>
                row.map((val, c) => {
                  const isCurrent = r === k && c === j;
                  const isInCol = c === j;
                  return (
                    <div
                      key={`b2d-${r}-${c}`}
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded flex flex-col items-center justify-center font-mono text-xs border transition-all ${
                        isCurrent
                          ? "border-[#2B4141] dark:border-[#60A5FA] bg-[#2B4141] dark:bg-[#1E3A8A] text-white font-bold scale-105 shadow-xs"
                          : isInCol
                            ? "border-[#2B4141]/50 dark:border-[#60A5FA]/50 bg-[#2B4141]/15 dark:bg-[#60A5FA]/15 text-[#2B4141] dark:text-[#60A5FA] font-semibold"
                            : "border-[#E7E5DF] dark:border-[#33373B] bg-white dark:bg-[#23272B] text-[#555148] dark:text-[#A8A398]"
                      }`}
                    >
                      <span className="text-sm font-semibold">{val}</span>
                    </div>
                  );
                }),
              )}
            </div>

            <div className="text-lg font-bold text-[#857F72]">=</div>

            {/* Result Matrix C Blocks (2 x 2) */}
            <div className="grid grid-cols-2 gap-1.5">
              {matrixC.map((row, r) =>
                row.map((val, c) => {
                  const isCurrentTarget = r === i && c === j;
                  return (
                    <button
                      key={`c2d-${r}-${c}`}
                      onClick={() => {
                        setI(r);
                        setJ(c);
                        setK(0);
                        setIsPlaying(false);
                      }}
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded flex flex-col items-center justify-center font-mono text-xs border transition-all ${
                        isCurrentTarget
                          ? "border-[#D97706] bg-[#D97706] text-white font-bold scale-105 shadow-xs"
                          : "border-[#E7E5DF] dark:border-[#33373B] bg-white dark:bg-[#23272B] text-[#191C1E] dark:text-[#F7F6F2] hover:border-[#8C533E]"
                      }`}
                    >
                      <span className="text-sm font-semibold">{val}</span>
                    </button>
                  );
                }),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
