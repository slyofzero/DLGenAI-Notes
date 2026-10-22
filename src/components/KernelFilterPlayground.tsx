"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { CLASSICAL_FILTERS, MNIST_SAMPLES, MNISTDigitKey, DEFAULT_DIGIT, AVAILABLE_DIGITS } from "@/lib/mnistData";
import { Info, ArrowRight } from "lucide-react";
import { MathText } from "@/components/Math";

export default function KernelFilterPlayground() {
  const [digit, setDigit] = useState<MNISTDigitKey>(DEFAULT_DIGIT);
  const [activeFilterId, setActiveFilterId] = useState<string>("sobel-h");
  const [useSamePadding, setUseSamePadding] = useState<boolean>(true);
  const [hoveredCoord, setHoveredCoord] = useState<{ r: number; c: number } | null>(null);

  const inputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeFilter = useMemo(
    () => CLASSICAL_FILTERS.find((f) => f.id === activeFilterId) || CLASSICAL_FILTERS[0],
    [activeFilterId]
  );

  const rawImage = MNIST_SAMPLES[digit];
  const H_in = rawImage.length; // 28
  const W_in = rawImage[0].length; // 28
  const K = activeFilter.kernel.length; // 3
  const padding = useSamePadding ? Math.floor(K / 2) : 0;

  // Compute padded input
  const paddedImage = useMemo(() => {
    const H_pad = H_in + 2 * padding;
    const W_pad = W_in + 2 * padding;
    const pad = Array(H_pad).fill(0).map(() => Array(W_pad).fill(0));
    for (let r = 0; r < H_in; r++) {
      for (let c = 0; c < W_in; c++) {
        pad[r + padding][c + padding] = rawImage[r][c];
      }
    }
    return pad;
  }, [rawImage, H_in, W_in, padding]);

  const H_out = H_in + 2 * padding - K + 1;
  const W_out = W_in + 2 * padding - K + 1;

  // Precompute output
  const outputImage = useMemo(() => {
    const out = Array(H_out).fill(0).map(() => Array(W_out).fill(0));
    const divisor = activeFilter.divisor || 1;
    const kernel = activeFilter.kernel;

    for (let i = 0; i < H_out; i++) {
      for (let j = 0; j < W_out; j++) {
        let sum = 0;
        for (let u = 0; u < K; u++) {
          for (let v = 0; v < K; v++) {
            sum += paddedImage[i + u][j + v] * kernel[u][v];
          }
        }
        sum = sum / divisor;
        out[i][j] = Math.max(0, Math.min(255, Math.round(Math.abs(sum))));
      }
    }
    return out;
  }, [H_out, W_out, paddedImage, activeFilter, K]);

  // Draw Input Canvas
  useEffect(() => {
    const canvas = inputCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellW = width / W_in;
    const cellH = height / H_in;

    ctx.clearRect(0, 0, width, height);

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

    const width = canvas.width;
    const height = canvas.height;
    const cellW = width / W_out;
    const cellH = height / H_out;

    ctx.clearRect(0, 0, width, height);

    for (let r = 0; r < H_out; r++) {
      for (let c = 0; c < W_out; c++) {
        const val = outputImage[r][c];
        ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
        ctx.fillRect(c * cellW, r * cellH, cellW, cellH);

        // Highlight hovered pixel
        if (hoveredCoord?.r === r && hoveredCoord?.c === c) {
          ctx.strokeStyle = "#E07A5F";
          ctx.lineWidth = 2;
          ctx.strokeRect(c * cellW, r * cellH, cellW, cellH);
        }
      }
    }
  }, [outputImage, H_out, W_out, hoveredCoord]);

  const handleOutputMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = outputCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const col = Math.floor((clickX / rect.width) * W_out);
      const row = Math.floor((clickY / rect.height) * H_out);
      if (row >= 0 && row < H_out && col >= 0 && col < W_out) {
        setHoveredCoord({ r: row, c: col });
      }
    },
    [H_out, W_out]
  );

  return (
    <div className="my-8 rounded-lg border border-stone-border bg-card p-5 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-terracotta">
              Filter Gallery · MNIST 28×28
            </span>
            <span className="text-xs text-label">·</span>
            <span className="text-xs font-semibold text-title">
              Classical Feature Extraction Kernels
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Real 28×28 handwritten MNIST digit. Select a classical filter to see edge gradients, blurs, or contours extracted.
          </p>
        </div>

        {/* Digit Picker & Padding Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-label mr-1">Digit:</span>
            {AVAILABLE_DIGITS.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDigit(d);
                  setHoveredCoord(null);
                }}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  digit === d
                    ? "bg-terracotta text-white font-semibold"
                    : "bg-pill text-body hover:bg-stone-border"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="border-l border-stone-border pl-3 flex items-center gap-1.5">
            <button
              onClick={() => {
                setUseSamePadding((p) => !p);
                setHoveredCoord(null);
              }}
              className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                useSamePadding
                  ? "border-terracotta bg-terracotta/10 text-terracotta font-semibold"
                  : "border-stone-border bg-pill text-muted hover:text-title"
              }`}
            >
              Padding: {useSamePadding ? "Same (28×28)" : "Valid (26×26)"}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Selection Pills */}
      <div className="flex flex-wrap gap-2">
        {CLASSICAL_FILTERS.map((f) => {
          const isSelected = f.id === activeFilterId;
          return (
            <button
              key={f.id}
              onClick={() => {
                setActiveFilterId(f.id);
                setHoveredCoord(null);
              }}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all flex items-center gap-1.5 ${
                isSelected
                  ? "border-terracotta bg-terracotta text-white font-semibold shadow-xs"
                  : "border-stone-border bg-card text-desc hover:bg-pill hover:text-title"
              }`}
            >
              <span>{f.name}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full uppercase font-mono ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-pill text-label"
                }`}
              >
                {f.category}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Details & Intuition Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-4 rounded bg-inset border border-stone-border items-center">
        <div className="md:col-span-8 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-title">{activeFilter.name}</span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-pill text-terracotta font-semibold">
              Category: {activeFilter.category}
            </span>
            {activeFilter.divisor && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-card border border-stone-border text-label">
                Divisor: ÷{activeFilter.divisor}
              </span>
            )}
          </div>
          <p className="text-xs text-desc leading-relaxed font-sans">
            {activeFilter.description}
          </p>
        </div>

        {/* 3x3 Kernel Matrix Display */}
        <div className="md:col-span-4 flex flex-col items-center">
          <span className="text-[10px] font-mono text-label uppercase tracking-wider mb-1.5">
            Kernel Weights (3×3)
          </span>
          <div className="grid grid-cols-3 gap-1 bg-card p-2 rounded border border-stone-border font-mono text-xs text-center shadow-xs">
            {activeFilter.kernel.map((row, u) =>
              row.map((w, v) => (
                <div
                  key={`k-${u}-${v}`}
                  className={`w-9 h-8 flex items-center justify-center rounded font-bold text-[11px] ${
                    w > 0
                      ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                      : w < 0
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      : "bg-pill text-label"
                  }`}
                >
                  {w > 0 ? `+${w}` : w}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Visual Pipeline: Input MNIST -> Filter -> Output Feature Map */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Input Digit Canvas */}
        <div className="md:col-span-5 flex flex-col items-center space-y-2">
          <div className="flex items-center justify-between w-full px-1">
            <span className="text-xs font-semibold text-title">
              Input: Digit {digit}
            </span>
            <span className="text-[11px] font-mono text-muted">28×28 Original</span>
          </div>

          <div
            className="relative border border-stone-border bg-[#101214] p-1.5 rounded shadow-inner select-none overflow-hidden"
            style={{ width: "100%", maxWidth: "260px", aspectRatio: "1 / 1" }}
          >
            <canvas
              ref={inputCanvasRef}
              width={280}
              height={280}
              className="w-full h-full rounded [image-rendering:pixelated]"
            />

            {/* If hovering on output, show corresponding receptive field on input */}
            {hoveredCoord && (
              <div
                className="absolute pointer-events-none transition-all duration-75 border-2 border-terracotta bg-terracotta/30 shadow-[0_0_12px_rgba(224,122,95,0.6)]"
                style={{
                  top: `calc(6px + ${(Math.max(0, hoveredCoord.r - padding) / H_in) * 100}% * (1 - 12px / 260px))`,
                  left: `calc(6px + ${(Math.max(0, hoveredCoord.c - padding) / W_in) * 100}% * (1 - 12px / 260px))`,
                  width: `calc(${(K / W_in) * 100}% * (1 - 12px / 260px))`,
                  height: `calc(${(K / H_in) * 100}% * (1 - 12px / 260px))`,
                }}
              />
            )}
          </div>
          <span className="text-[11px] text-muted text-center">
            {hoveredCoord
              ? `Receptive field centered at (${hoveredCoord.r}, ${hoveredCoord.c})`
              : "Hover over the filtered map to track receptive field"}
          </span>
        </div>

        {/* Center: Operator Arrow */}
        <div className="md:col-span-2 flex flex-col items-center justify-center space-y-1 text-label">
          <div className="w-8 h-8 rounded-full bg-pill flex items-center justify-center border border-stone-border">
            <ArrowRight className="w-4 h-4 text-terracotta" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold">
            Convolve
          </span>
        </div>

        {/* Right: Output Feature Map Canvas */}
        <div className="md:col-span-5 flex flex-col items-center space-y-2">
          <div className="flex items-center justify-between w-full px-1">
            <span className="text-xs font-semibold text-title">
              Filtered Feature Map
            </span>
            <span className="text-[11px] font-mono text-terracotta font-semibold">
              {H_out}×{W_out}
            </span>
          </div>

          <div
            className="border border-stone-border bg-[#101214] p-1.5 rounded shadow-inner select-none cursor-crosshair overflow-hidden"
            style={{ width: "100%", maxWidth: "260px", aspectRatio: "1 / 1" }}
          >
            <canvas
              ref={outputCanvasRef}
              width={280}
              height={280}
              onMouseMove={handleOutputMouseMove}
              onMouseLeave={() => setHoveredCoord(null)}
              className="w-full h-full rounded [image-rendering:pixelated]"
            />
          </div>
          <span className="text-[11px] text-muted text-center">
            {hoveredCoord
              ? `Pixel (${hoveredCoord.r}, ${hoveredCoord.c}) Intensity: ${outputImage[hoveredCoord.r]?.[hoveredCoord.c] ?? 0}`
              : "Hover any pixel to inspect local edge response"}
          </span>
        </div>
      </div>

      {/* Pedagogical Deep-Dive: Why This Filter Works Mathematically */}
      <div className="pt-3 border-t border-stone-border flex items-start gap-2.5 text-xs text-desc">
        <Info className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-title">Pedagogical Takeaway:</span>
          {activeFilter.category === "edge" && (
            <p>
              Notice how the filter assigns <strong>positive weights</strong> on one side and <strong>negative weights</strong> on the opposite side. Over uniform flat regions (where all pixel values are equal), the positive and negative terms cancel to <strong>0</strong>. But when the kernel crosses a sharp gradient boundary, the difference explodes into a bright, highlighted ridge!
            </p>
          )}
          {activeFilter.category === "blur" && (
            <p>
              Notice how all weights in the kernel are <strong>positive and sum to 1</strong> (divided by {activeFilter.divisor}). Every pixel is replaced with a weighted local average of its surroundings, smoothing out high-frequency noise while preserving broad shapes.
            </p>
          )}
          {activeFilter.category === "detail" && (
            <MathText
              as="p"
              text="The sharpening kernel has a strong positive center weight ($+5$) surrounded by negative orthogonal neighbors ($-1$). It subtracts the local smoothed background from the original image, boosting local contrast at transition boundaries."
            />
          )}
          {activeFilter.category === "basic" && (
            <MathText
              as="p"
              text="The identity filter has a single $1$ at the center surrounded by zeros. The output matches the input exactly, demonstrating that convolution is a generalized linear spatial transformation."
            />
          )}
        </div>
      </div>
    </div>
  );
}
