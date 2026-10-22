"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { MNIST_SAMPLES } from "@/lib/mnistData";
import { MathText } from "@/components/Math";

const KERNEL_7x7 = [
  [ 0,  0, -1, -1, -1,  0,  0],
  [ 0, -1, -2, -3, -2, -1,  0],
  [-1, -2,  0,  5,  0, -2, -1],
  [-1, -3,  5, 24,  5, -3, -1],
  [-1, -2,  0,  5,  0, -2, -1],
  [ 0, -1, -2, -3, -2, -1,  0],
  [ 0,  0, -1, -1, -1,  0,  0],
];
const KERNEL_DIVISOR = 8;

export default function ConvolutionStaticFigure() {
  const inputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const rawImage = MNIST_SAMPLES["7"]; // 28x28
  const H_in = 28;
  const W_in = 28;
  const K = 7;
  const H_out = H_in - K + 1; // 22
  const W_out = W_in - K + 1; // 22

  // Fixed demonstration receptive window coordinates: right on the horizontal stroke of 7
  const winRow = 6;
  const winCol = 8;

  // Precompute output map
  const outputImage = useMemo(() => {
    const out: number[][] = [];
    for (let i = 0; i < H_out; i++) {
      const row: number[] = [];
      for (let j = 0; j < W_out; j++) {
        let sum = 0;
        for (let u = 0; u < K; u++) {
          for (let v = 0; v < K; v++) {
            sum += rawImage[i + u][j + v] * KERNEL_7x7[u][v];
          }
        }
        row.push(Math.max(0, Math.min(255, Math.round(Math.abs(sum / KERNEL_DIVISOR)))));
      }
      out.push(row);
    }
    return out;
  }, [rawImage, H_out, W_out]);

  // Draw Input Canvas
  useEffect(() => {
    const canvas = inputCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellW = canvas.width / W_in;
    const cellH = canvas.height / H_in;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < H_in; r++) {
      for (let c = 0; c < W_in; c++) {
        const val = rawImage[r][c];
        ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
        ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
      }
    }
  }, [rawImage, H_in, W_in]);

  // Draw Output Canvas
  useEffect(() => {
    const canvas = outputCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellW = canvas.width / W_out;
    const cellH = canvas.height / H_out;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < H_out; r++) {
      for (let c = 0; c < W_out; c++) {
        const val = outputImage[r][c];
        ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
        ctx.fillRect(c * cellW, r * cellH, cellW, cellH);

        // Highlight the single output pixel corresponding to the receptive field
        if (r === winRow && c === winCol) {
          ctx.strokeStyle = "#E07A5F";
          ctx.lineWidth = 2.5;
          ctx.strokeRect(c * cellW, r * cellH, cellW, cellH);
          ctx.fillStyle = "rgba(224, 122, 95, 0.45)";
          ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
        }
      }
    }
  }, [outputImage, H_out, W_out, winRow, winCol]);

  return (
    <figure className="my-8 rounded-lg border border-stone-border bg-card p-5 shadow-xs not-prose">
      {/* Figure Title */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-border">
        <div className="flex items-center gap-2">
          <span className="text-[10.5px] font-bold uppercase tracking-widest text-terracotta">
            Figure 3.1
          </span>
          <span className="text-xs text-label">·</span>
          <MathText
            text="Spatial 2D Convolution Architecture: $28\times 28$ Digit with $7\times 7$ Filter"
            className="text-xs font-semibold text-title font-sans"
          />
        </div>
        <MathText
          text="Valid Convolution ($S=1, P=0$)"
          className="text-[11px] font-mono text-muted"
        />
      </div>

      {/* Visual Pipeline: Input 28x28 -> Kernel 7x7 -> Output 22x22 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* 1. Input Image (28x28) */}
        <div className="lg:col-span-4 flex flex-col items-center space-y-2">
          <div className="flex items-center justify-between w-full px-1">
            <span className="text-xs font-semibold text-title">1. Input Image</span>
            <span className="text-[11px] font-mono text-muted">28×28 Grid</span>
          </div>

          <div
            className="relative border border-stone-border bg-[#101214] p-1.5 rounded shadow-inner select-none overflow-hidden"
            style={{ width: "100%", maxWidth: "200px", aspectRatio: "1 / 1" }}
          >
            <canvas
              ref={inputCanvasRef}
              width={200}
              height={200}
              className="w-full h-full rounded [image-rendering:pixelated]"
            />

            {/* Fixed Demonstration Receptive Field Box */}
            <div
              className="absolute pointer-events-none border-2 border-terracotta bg-terracotta/30 shadow-[0_0_12px_rgba(224,122,95,0.5)]"
              style={{
                top: `calc(6px + ${(winRow / H_in) * 100}% * (1 - 12px / 200px))`,
                left: `calc(6px + ${(winCol / W_in) * 100}% * (1 - 12px / 200px))`,
                width: `calc(${(K / W_in) * 100}% * (1 - 12px / 200px))`,
                height: `calc(${(K / H_in) * 100}% * (1 - 12px / 200px))`,
              }}
            >
              <div className="absolute -top-4 left-0 bg-terracotta text-white text-[8px] font-mono px-1 py-0.2 rounded-xs whitespace-nowrap shadow-xs">
                Receptive Field (7×7)
              </div>
            </div>
          </div>
          <span className="text-[11px] text-muted text-center font-sans">
            Window at row {winRow}, col {winCol}
          </span>
        </div>

        {/* 2. Kernel Operator (7x7) */}
        <div className="lg:col-span-4 flex flex-col items-center space-y-2">
          <div className="flex items-center justify-between w-full px-1">
            <span className="text-xs font-semibold text-title">2. Sliding Kernel</span>
            <span className="text-[11px] font-mono text-terracotta font-semibold">7×7 Weights</span>
          </div>

          <div className="w-full max-w-[200px] p-2 rounded bg-inset border border-stone-border shadow-xs flex flex-col items-center justify-center">
            <div className="grid grid-cols-7 gap-0.5 w-full text-center font-mono text-[7px] leading-tight select-none">
              {KERNEL_7x7.map((row, u) =>
                row.map((w, v) => (
                  <div
                    key={`k-${u}-${v}`}
                    className={`py-0.5 rounded-[1px] font-bold ${
                      w > 0
                        ? "bg-teal-500/15 text-teal-600 dark:text-teal-400"
                        : w < 0
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        : "bg-pill text-label"
                    }`}
                  >
                    {w}
                  </div>
                ))
              )}
            </div>
            <div className="mt-1 text-[9px] font-mono text-label text-center">
              Divisor: ÷{KERNEL_DIVISOR}
            </div>
          </div>
          <span className="text-[11px] text-muted text-center font-sans">
            <MathText text="Element-wise dot product: $\sum_{u, v} (X_{u, v} \cdot W_{u, v})$" />
          </span>
        </div>

        {/* 3. Output Feature Map (22x22) */}
        <div className="lg:col-span-4 flex flex-col items-center space-y-2">
          <div className="flex items-center justify-between w-full px-1">
            <span className="text-xs font-semibold text-title">3. Output Feature Map</span>
            <span className="text-[11px] font-mono text-terracotta font-semibold">22×22 Grid</span>
          </div>

          <div
            className="border border-stone-border bg-[#101214] p-1.5 rounded shadow-inner select-none overflow-hidden"
            style={{ width: "100%", maxWidth: "200px", aspectRatio: "1 / 1" }}
          >
            <canvas
              ref={outputCanvasRef}
              width={200}
              height={200}
              className="w-full h-full rounded [image-rendering:pixelated]"
            />
          </div>
          <span className="text-[11px] text-muted text-center font-sans">
            Single scalar response at ({winRow}, {winCol})
          </span>
        </div>
      </div>

      {/* Caption Footnote */}
      <figcaption className="mt-4 pt-3 border-t border-stone-border text-xs text-desc leading-relaxed font-sans">
        <strong className="text-title">Structural Mechanism:</strong>{" "}
        <MathText text="The $7 \times 7$ kernel extracts a $7 \times 7$ patch from the $28 \times 28$ input image, computes a single scalar dot product, and writes it directly to the corresponding $(i, j)$ coordinate in the $22 \times 22$ output feature map ($H_{\text{out}} = 28 - 7 + 1 = 22$)." />
      </figcaption>
    </figure>
  );
}
