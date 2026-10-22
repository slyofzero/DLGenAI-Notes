"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, CheckCircle2 } from "lucide-react";
import { MNIST_SAMPLES, MNISTDigitKey, DEFAULT_DIGIT, AVAILABLE_DIGITS } from "@/lib/mnistData";

interface ConvolutionPlaygroundProps {
  mode?: "basic" | "stride" | "padding";
  initialKernelSize?: 3 | 5 | 7;
  initialStride?: number;
  initialPadding?: number;
  initialDigit?: MNISTDigitKey;
}

const KERNELS: Record<number, { name: string; weights: number[][]; divisor?: number }> = {
  3: {
    name: "3×3 Sobel Horizontal",
    weights: [
      [-1, -2, -1],
      [ 0,  0,  0],
      [ 1,  2,  1],
    ],
  },
  5: {
    name: "5×5 Center-Surround (LeNet)",
    weights: [
      [ 0,  0, -1,  0,  0],
      [ 0, -1, -2, -1,  0],
      [-1, -2, 16, -2, -1],
      [ 0, -1, -2, -1,  0],
      [ 0,  0, -1,  0,  0],
    ],
    divisor: 4,
  },
  7: {
    name: "7×7 Feature Extractor (ResNet)",
    weights: [
      [ 0,  0, -1, -1, -1,  0,  0],
      [ 0, -1, -2, -3, -2, -1,  0],
      [-1, -2,  0,  5,  0, -2, -1],
      [-1, -3,  5, 24,  5, -3, -1],
      [-1, -2,  0,  5,  0, -2, -1],
      [ 0, -1, -2, -3, -2, -1,  0],
      [ 0,  0, -1, -1, -1,  0,  0],
    ],
    divisor: 8,
  },
};

export default function ConvolutionPlayground({
  mode = "basic",
  initialKernelSize = 5,
  initialStride = 1,
  initialPadding = 0,
  initialDigit = DEFAULT_DIGIT,
}: ConvolutionPlaygroundProps) {
  const showStride = mode === "stride" || mode === "padding";
  const showPadding = mode === "padding";

  const [digit, setDigit] = useState<MNISTDigitKey>(initialDigit);
  const [kernelSize, setKernelSize] = useState<3 | 5 | 7>(initialKernelSize);
  const [stride, setStride] = useState<number>(showStride ? initialStride : 1);
  const [padding, setPadding] = useState<number>(showPadding ? initialPadding : 0);

  // Playback state
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(4); // Default to 4x for smooth 28x28 scanning

  // Canvas refs
  const inputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeKernelObj = KERNELS[kernelSize];
  const activeKernel = activeKernelObj.weights;
  const rawImage = MNIST_SAMPLES[digit];
  const H_in = rawImage.length; // 28
  const W_in = rawImage[0].length; // 28

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

  const H_pad = H_in + 2 * padding;
  const W_pad = W_in + 2 * padding;

  // Output dimensions
  const H_out = Math.max(1, Math.floor((H_pad - kernelSize) / stride) + 1);
  const W_out = Math.max(1, Math.floor((W_pad - kernelSize) / stride) + 1);
  const totalSteps = H_out * W_out;

  // Precompute full convolution output
  const fullOutput = useMemo(() => {
    const out = Array(H_out).fill(0).map(() => Array(W_out).fill(0));
    const divisor = activeKernelObj.divisor || 1;
    for (let i = 0; i < H_out; i++) {
      for (let j = 0; j < W_out; j++) {
        let sum = 0;
        for (let u = 0; u < kernelSize; u++) {
          for (let v = 0; v < kernelSize; v++) {
            const val = paddedImage[i * stride + u][j * stride + v];
            sum += val * activeKernel[u][v];
          }
        }
        sum = sum / divisor;
        out[i][j] = Math.max(0, Math.min(255, Math.abs(sum)));
      }
    }
    return out;
  }, [H_out, W_out, kernelSize, stride, paddedImage, activeKernel, activeKernelObj.divisor]);

  const handleSetDigit = (d: MNISTDigitKey) => {
    setDigit(d);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleSetKernelSize = (k: 3 | 5 | 7) => {
    setKernelSize(k);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleSetStride = (s: number) => {
    setStride(s);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleSetPadding = (p: number) => {
    setPadding(p);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Current output indices (outRow, outCol)
  const safeStep = Math.min(currentStep, totalSteps - 1);
  const outRow = Math.floor(safeStep / W_out);
  const outCol = safeStep % W_out;

  // Sliding window top-left in padded coordinate space
  const windowRow = outRow * stride;
  const windowCol = outCol * stride;

  // Extract active patch
  const activePatch = useMemo(() => {
    const patch: number[][] = [];
    for (let u = 0; u < kernelSize; u++) {
      const row: number[] = [];
      for (let v = 0; v < kernelSize; v++) {
        row.push(paddedImage[windowRow + u][windowCol + v]);
      }
      patch.push(row);
    }
    return patch;
  }, [paddedImage, windowRow, windowCol, kernelSize]);

  // Current step arithmetic
  const currentCalc = useMemo(() => {
    const dotProducts: { x: number; w: number; prod: number }[] = [];
    let sum = 0;
    const divisor = activeKernelObj.divisor || 1;
    for (let u = 0; u < kernelSize; u++) {
      for (let v = 0; v < kernelSize; v++) {
        const x = activePatch[u][v];
        const w = activeKernel[u][v];
        const prod = x * w;
        dotProducts.push({ x, w, prod });
        sum += prod;
      }
    }
    const finalVal = Math.round(Math.max(0, Math.min(255, Math.abs(sum / divisor))));
    return { dotProducts, rawSum: sum, divisor, finalVal };
  }, [activePatch, activeKernel, kernelSize, activeKernelObj.divisor]);

  // Draw Input Canvas (Smooth, high-contrast, real 28x28 MNIST)
  useEffect(() => {
    const canvas = inputCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellW = width / W_pad;
    const cellH = height / H_pad;

    ctx.clearRect(0, 0, width, height);

    for (let r = 0; r < H_pad; r++) {
      for (let c = 0; c < W_pad; c++) {
        const isPadCell =
          r < padding || r >= H_in + padding || c < padding || c >= W_in + padding;
        const val = paddedImage[r][c];

        if (isPadCell) {
          ctx.fillStyle = "#16181B";
          ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
          ctx.strokeStyle = "#2A2E33";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(c * cellW, r * cellH, cellW, cellH);
        } else {
          ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
          ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
        }
      }
    }
  }, [paddedImage, H_pad, W_pad, H_in, W_in, padding]);

  // Draw Output Canvas (Real-time progressive revelation)
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

    // Background
    ctx.fillStyle = "#121416";
    ctx.fillRect(0, 0, width, height);

    for (let r = 0; r < H_out; r++) {
      for (let c = 0; c < W_out; c++) {
        const stepIdx = r * W_out + c;
        const isComputed = stepIdx <= safeStep;
        const val = fullOutput[r][c];

        if (isComputed) {
          ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
          ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
        } else {
          // Uncomputed dot pattern
          ctx.fillStyle = "#1C1F22";
          ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
          ctx.fillStyle = "#2D3238";
          ctx.fillRect(c * cellW + cellW / 2 - 0.75, r * cellH + cellH / 2 - 0.75, 1.5, 1.5);
        }

        // Active highlighted cell
        if (r === outRow && c === outCol) {
          ctx.strokeStyle = "#E07A5F";
          ctx.lineWidth = 2;
          ctx.strokeRect(c * cellW, r * cellH, cellW, cellH);
          ctx.fillStyle = "rgba(224, 122, 95, 0.4)";
          ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
        }
      }
    }
  }, [fullOutput, H_out, W_out, safeStep, outRow, outCol]);

  // Play animation loop
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(16, 200 / speed);
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, speed, totalSteps]);

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1));
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleComplete = () => {
    setIsPlaying(false);
    setCurrentStep(totalSteps - 1);
  };

  const handleInputCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      setIsPlaying(false);
      const canvas = inputCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const col = Math.floor((clickX / rect.width) * W_pad);
      const row = Math.floor((clickY / rect.height) * H_pad);

      // Map clicked coordinate to nearest valid output coordinate
      const mappedOutRow = Math.min(H_out - 1, Math.max(0, Math.floor(row / stride)));
      const mappedOutCol = Math.min(W_out - 1, Math.max(0, Math.floor(col / stride)));
      setCurrentStep(mappedOutRow * W_out + mappedOutCol);
    },
    [W_pad, H_pad, H_out, W_out, stride]
  );

  const handleOutputCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      setIsPlaying(false);
      const canvas = outputCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const col = Math.floor((clickX / rect.width) * W_out);
      const row = Math.floor((clickY / rect.height) * H_out);
      const safeR = Math.min(H_out - 1, Math.max(0, row));
      const safeC = Math.min(W_out - 1, Math.max(0, col));
      setCurrentStep(safeR * W_out + safeC);
    },
    [H_out, W_out]
  );

  return (
    <div className="my-8 rounded-lg border border-stone-border bg-card p-5 shadow-xs space-y-6">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-terracotta">
              Interactive Lab · MNIST 28×28
            </span>
            <span className="text-xs text-label">·</span>
            <span className="text-xs font-semibold text-title">
              {mode === "basic" && "Basic 2D Convolution (Unit Stride, No Padding)"}
              {mode === "stride" && "Convolving with Stride (Downsampling)"}
              {mode === "padding" && "Convolving with Padding & Stride"}
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Real 28×28 handwritten MNIST digit. A large {kernelSize}×{kernelSize} filter sweeps over the image to extract visual features.
          </p>
        </div>

        {/* Digit Picker */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-label mr-1">Digit:</span>
          {AVAILABLE_DIGITS.map((d) => (
            <button
              key={d}
              onClick={() => handleSetDigit(d)}
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
      </div>

      {/* Parameter Controls: Kernel Size, Stride, Padding */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3.5 rounded bg-inset border border-stone-border">
        {/* Kernel Size Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-title uppercase tracking-wider block">
            Kernel Size (K×K)
          </label>
          <div className="flex gap-1.5">
            {([3, 5, 7] as const).map((k) => (
              <button
                key={k}
                onClick={() => handleSetKernelSize(k)}
                className={`flex-1 py-1 px-2 text-xs rounded border transition-colors ${
                  kernelSize === k
                    ? "border-terracotta bg-terracotta/10 text-terracotta font-bold"
                    : "border-stone-border bg-card text-muted hover:text-title hover:bg-pill"
                }`}
              >
                {k}×{k} {k >= 5 && "(Large)"}
              </button>
            ))}
          </div>
        </div>

        {/* Stride Selector (if enabled) */}
        {showStride ? (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-title uppercase tracking-wider block">
              Stride (S)
            </label>
            <div className="flex gap-1.5">
              {[1, 2, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSetStride(s)}
                  className={`flex-1 py-1 px-2 text-xs rounded border transition-colors ${
                    stride === s
                      ? "border-terracotta bg-terracotta/10 text-terracotta font-bold"
                      : "border-stone-border bg-card text-muted hover:text-title hover:bg-pill"
                  }`}
                >
                  S = {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 opacity-60">
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
              Stride (Fixed)
            </label>
            <div className="py-1 px-2 text-xs text-center rounded border border-stone-border bg-card text-label">
              S = 1 (1 pixel hop)
            </div>
          </div>
        )}

        {/* Padding Selector (if enabled) */}
        {showPadding ? (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-title uppercase tracking-wider block">
              Zero Padding (P)
            </label>
            <div className="flex gap-1.5">
              {[0, 2, 3].map((p) => (
                <button
                  key={p}
                  onClick={() => handleSetPadding(p)}
                  className={`flex-1 py-1 px-2 text-xs rounded border transition-colors ${
                    padding === p
                      ? "border-terracotta bg-terracotta/10 text-terracotta font-bold"
                      : "border-stone-border bg-card text-muted hover:text-title hover:bg-pill"
                  }`}
                >
                  P = {p} {p === Math.floor(kernelSize / 2) && "(Same)"}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 opacity-60">
            <label className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
              Padding (Fixed)
            </label>
            <div className="py-1 px-2 text-xs text-center rounded border border-stone-border bg-card text-label">
              P = 0 (Valid / No Pad)
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Dimension Formula Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 rounded bg-pill text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="font-sans font-semibold text-label">Dimension Formula:</span>
          <span className="text-title">
            H_out = ⌊({H_in} - {kernelSize} + 2×{padding}) / {stride}⌋ + 1 ={" "}
            <strong className="text-terracotta font-bold">{H_out}</strong>
          </span>
        </div>
        <div className="text-label">
          Feature Map: <strong className="text-title">{H_out}×{W_out}</strong> ({totalSteps} values) · Step <strong className="text-terracotta">{safeStep + 1}</strong> of {totalSteps}
        </div>
      </div>

      {/* Main Interactive Workspace: Input Image | Microscope | Output Feature Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Image Grid with High-Visibility Terracotta Receptive Window */}
        <div className="lg:col-span-5 flex flex-col items-center space-y-2">
          <div className="flex items-center justify-between w-full px-1">
            <span className="text-xs font-semibold text-title">
              Input: Digit {digit} {padding > 0 && <span className="text-label font-normal">(+{padding} Pad)</span>}
            </span>
            <span className="text-[11px] font-mono text-muted">
              {H_pad}×{W_pad} Canvas
            </span>
          </div>

          <div
            className="relative border border-stone-border bg-[#101214] p-1.5 rounded shadow-inner select-none overflow-hidden"
            style={{ width: "100%", maxWidth: "280px", aspectRatio: "1 / 1" }}
          >
            <canvas
              ref={inputCanvasRef}
              width={280}
              height={280}
              onClick={handleInputCanvasClick}
              className="w-full h-full rounded cursor-crosshair [image-rendering:pixelated]"
            />

            {/* Glowing Receptive Window Overlay */}
            <div
              className="absolute pointer-events-none transition-all duration-100 ease-out border-2 border-terracotta bg-terracotta/25 shadow-[0_0_15px_rgba(224,122,95,0.45)]"
              style={{
                top: `calc(6px + ${(windowRow / H_pad) * 100}% * (1 - 12px / 280px))`,
                left: `calc(6px + ${(windowCol / W_pad) * 100}% * (1 - 12px / 280px))`,
                width: `calc(${(kernelSize / W_pad) * 100}% * (1 - 12px / 280px))`,
                height: `calc(${(kernelSize / H_pad) * 100}% * (1 - 12px / 280px))`,
              }}
            >
              <div className="absolute -top-4 left-0 bg-terracotta text-white text-[9px] font-mono px-1 py-0.2 rounded-xs whitespace-nowrap shadow-xs">
                K: {kernelSize}×{kernelSize}
              </div>
            </div>
          </div>
          <span className="text-[11px] text-muted text-center">
            Sliding window at row {windowRow}, col {windowCol}
          </span>
        </div>

        {/* Center: The Convolution Arithmetic Microscope */}
        <div className="lg:col-span-3 flex flex-col space-y-3 p-3.5 rounded bg-inset border border-stone-border">
          <div className="border-b border-stone-border pb-1.5 flex items-center justify-between">
            <span className="text-xs font-bold text-title">Kernel × Patch</span>
            <span className="text-[10px] font-mono text-terracotta font-semibold">
              Output[{outRow}, {outCol}]
            </span>
          </div>

          {/* Mini Kernel Weights Preview */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-label">
              Filter ({activeKernelObj.name})
            </span>
            <div
              className="grid gap-1 bg-card p-1.5 rounded border border-stone-border text-center font-mono text-[9px]"
              style={{ gridTemplateColumns: `repeat(${kernelSize}, 1fr)` }}
            >
              {activeKernel.map((row, u) =>
                row.map((w, v) => (
                  <div
                    key={`k-${u}-${v}`}
                    className={`py-0.5 rounded font-bold ${
                      w > 0
                        ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                        : w < 0
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : "bg-pill text-label"
                    }`}
                  >
                    {w > 0 ? `+${w}` : w}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Step-by-Step Dot Product Arithmetic */}
          <div className="space-y-1.5 text-xs">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-label">
              Local Dot Product
            </span>
            <div className="p-2 rounded bg-card border border-stone-border font-mono text-[10px] space-y-1 text-desc max-h-36 overflow-y-auto">
              <div className="text-label text-[10px] pb-1 border-b border-stone-border">
                ∑ (Patch Pixel × Weight):
              </div>
              {currentCalc.dotProducts.slice(0, 4).map((dp, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span>
                    {dp.x} × ({dp.w})
                  </span>
                  <span className={dp.prod >= 0 ? "text-teal-600" : "text-rose-600"}>
                    = {dp.prod}
                  </span>
                </div>
              ))}
              {currentCalc.dotProducts.length > 4 && (
                <div className="text-[9px] text-label text-center pt-0.5">
                  ... + {currentCalc.dotProducts.length - 4} more terms
                </div>
              )}
            </div>

            {/* Sum Result */}
            <div className="pt-1 border-t border-stone-border flex items-center justify-between text-xs font-mono">
              <span className="text-label">Raw Sum:</span>
              <span className="font-bold text-title">{currentCalc.rawSum}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-label">Clamped:</span>
              <span className="font-bold text-terracotta bg-terracotta/10 px-1.5 py-0.5 rounded">
                {currentCalc.finalVal}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Output Feature Map Canvas */}
        <div className="lg:col-span-4 flex flex-col items-center space-y-2">
          <div className="flex items-center justify-between w-full px-1">
            <span className="text-xs font-semibold text-title">Output Feature Map</span>
            <span className="text-[11px] font-mono text-terracotta font-semibold">
              {H_out}×{W_out}
            </span>
          </div>

          <div
            className="border border-stone-border bg-[#101214] p-1.5 rounded shadow-inner select-none cursor-crosshair overflow-hidden"
            style={{ width: "100%", maxWidth: "280px", aspectRatio: "1 / 1" }}
          >
            <canvas
              ref={outputCanvasRef}
              width={280}
              height={280}
              onClick={handleOutputCanvasClick}
              className="w-full h-full rounded [image-rendering:pixelated]"
            />
          </div>
          <span className="text-[11px] text-muted text-center">
            Click anywhere on the feature map to jump
          </span>
        </div>
      </div>

      {/* Animation Playback Toolbar */}
      <div className="pt-3 border-t border-stone-border flex flex-wrap items-center justify-between gap-3">
        {/* Playback Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReset}
            title="Reset to Start"
            className="p-1.5 rounded border border-stone-border bg-card text-muted hover:text-title hover:bg-pill transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleStepBackward}
            disabled={safeStep <= 0}
            title="Previous Step"
            className="p-1.5 rounded border border-stone-border bg-card text-muted hover:text-title hover:bg-pill disabled:opacity-30 transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-terracotta hover:bg-[#734230] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Animation</span>
              </>
            )}
          </button>
          <button
            onClick={handleStepForward}
            disabled={safeStep >= totalSteps - 1}
            title="Next Step"
            className="p-1.5 rounded border border-stone-border bg-card text-muted hover:text-title hover:bg-pill disabled:opacity-30 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <button
            onClick={handleComplete}
            title="Compute Full Map"
            className="p-1.5 rounded border border-stone-border bg-card text-muted hover:text-title hover:bg-pill transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-label text-[11px] mr-1">Speed:</span>
          {[1, 4, 16].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                speed === s
                  ? "bg-terracotta text-white font-bold"
                  : "bg-pill text-muted hover:text-title"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Progress Slider */}
        <div className="w-full sm:w-64 flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={totalSteps - 1}
            value={safeStep}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentStep(parseInt(e.target.value, 10));
            }}
            className="flex-1 accent-terracotta cursor-pointer"
          />
          <span className="text-[11px] font-mono text-label w-12 text-right">
            {Math.round(((safeStep + 1) / totalSteps) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
