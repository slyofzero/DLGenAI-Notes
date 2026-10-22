"use client";

import React, { useState, useMemo } from "react";

type ActivationKey = "relu" | "leaky_relu" | "gelu" | "sigmoid" | "tanh" | "silu";

interface ActivationDef {
  name: string;
  formula: string;
  derivativeFormula: string;
  f: (x: number) => number;
  df: (x: number) => number;
}

const ACTIVATIONS: Record<ActivationKey, ActivationDef> = {
  relu: {
    name: "ReLU (Rectified Linear Unit)",
    formula: "f(x) = max(0, x)",
    derivativeFormula: "f'(x) = 1 if x > 0 else 0",
    f: (x) => Math.max(0, x),
    df: (x) => (x > 0 ? 1 : 0),
  },
  leaky_relu: {
    name: "Leaky ReLU (α = 0.1)",
    formula: "f(x) = max(αx, x)",
    derivativeFormula: "f'(x) = 1 if x > 0 else 0.1",
    f: (x) => (x > 0 ? x : 0.1 * x),
    df: (x) => (x > 0 ? 1 : 0.1),
  },
  gelu: {
    name: "GELU (Gaussian Error Linear Unit)",
    formula: "f(x) ≈ 0.5x(1 + tanh(√(2/π)(x + 0.044715x³)))",
    derivativeFormula: "f'(x) = Φ(x) + x ϕ(x)",
    f: (x) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3)))),
    df: (x) => {
      const h = 0.001;
      const f1 = 0.5 * (x + h) * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * ((x + h) + 0.044715 * Math.pow(x + h, 3))));
      const f0 = 0.5 * (x - h) * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * ((x - h) + 0.044715 * Math.pow(x - h, 3))));
      return (f1 - f0) / (2 * h);
    },
  },
  sigmoid: {
    name: "Sigmoid",
    formula: "σ(x) = 1 / (1 + e⁻ˣ)",
    derivativeFormula: "σ'(x) = σ(x)(1 - σ(x))",
    f: (x) => 1 / (1 + Math.exp(-x)),
    df: (x) => {
      const s = 1 / (1 + Math.exp(-x));
      return s * (1 - s);
    },
  },
  tanh: {
    name: "Tanh (Hyperbolic Tangent)",
    formula: "tanh(x) = (eˣ - e⁻ˣ) / (eˣ + e⁻ˣ)",
    derivativeFormula: "tanh'(x) = 1 - tanh²(x)",
    f: (x) => Math.tanh(x),
    df: (x) => 1 - Math.pow(Math.tanh(x), 2),
  },
  silu: {
    name: "SiLU / Swish",
    formula: "f(x) = x · σ(x)",
    derivativeFormula: "f'(x) = σ(x) + x σ(x)(1 - σ(x))",
    f: (x) => x / (1 + Math.exp(-x)),
    df: (x) => {
      const s = 1 / (1 + Math.exp(-x));
      return s + x * s * (1 - s);
    },
  },
};

export default function FunctionPlotter() {
  const [actKey, setActKey] = useState<ActivationKey>("gelu");
  const [showDerivative, setShowDerivative] = useState<boolean>(true);
  const [hoverX, setHoverX] = useState<number | null>(null);

  const act = ACTIVATIONS[actKey];

  const width = 500;
  const height = 240;
  const padding = 30;
  const xMin = -4;
  const xMax = 4;
  const yMin = -2;
  const yMax = 3;

  const toSvgX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * (width - 2 * padding);
  const toSvgY = (y: number) => height - padding - ((y - yMin) / (yMax - yMin)) * (height - 2 * padding);

  const points = useMemo(() => {
    const pts: { x: number; y: number; dy: number }[] = [];
    const steps = 160;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      pts.push({ x, y: act.f(x), dy: act.df(x) });
    }
    return pts;
  }, [act, xMin, xMax]);

  const fPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toSvgX(p.x).toFixed(1)} ${toSvgY(p.y).toFixed(1)}`)
    .join(" ");

  const dfPath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toSvgX(p.x).toFixed(1)} ${toSvgY(p.dy).toFixed(1)}`)
    .join(" ");

  return (
    <div className="not-prose my-8 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-[#FFFFFF] dark:bg-[#23272B] shadow-2xs overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[#E7E5DF] dark:border-[#33373B] bg-[#FCFBF9] dark:bg-[#1C1F21]">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#857F72] dark:text-[#8E8A80]">
            Activation Inspection
          </div>
          <h4 className="font-serif text-sm font-medium text-[#191C1E] dark:text-[#F7F6F2]">
            Function Curve &amp; Instantaneous Gradient
          </h4>
        </div>

        <label className="flex items-center gap-1.5 text-xs text-[#555148] dark:text-[#A8A398] cursor-pointer">
          <input
            type="checkbox"
            checked={showDerivative}
            onChange={(e) => setShowDerivative(e.target.checked)}
            className="accent-[#8C533E] rounded"
          />
          Show Gradient $f&apos;(x)$
        </label>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* SVG Plot */}
        <div className="md:col-span-2 relative bg-[#F7F6F2] dark:bg-[#191C1E] p-3 rounded border border-[#E7E5DF] dark:border-[#33373B]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const svgX = ((e.clientX - rect.left) / rect.width) * width;
              const realX = xMin + ((svgX - padding) / (width - 2 * padding)) * (xMax - xMin);
              setHoverX(Math.max(xMin, Math.min(xMax, realX)));
            }}
            onMouseLeave={() => setHoverX(null)}
          >
            {/* Grid & Axes */}
            <line
              x1={padding}
              y1={toSvgY(0)}
              x2={width - padding}
              y2={toSvgY(0)}
              stroke="#857F72"
              strokeOpacity="0.3"
              strokeWidth="1"
            />
            <line
              x1={toSvgX(0)}
              y1={padding}
              x2={toSvgX(0)}
              y2={height - padding}
              stroke="#857F72"
              strokeOpacity="0.3"
              strokeWidth="1"
            />

            {/* Labels */}
            <text x={toSvgX(0) + 5} y={padding + 10} className="text-[10px] fill-[#857F72] font-mono">
              y
            </text>
            <text x={width - padding - 8} y={toSvgY(0) - 5} className="text-[10px] fill-[#857F72] font-mono">
              x
            </text>

            {/* Curve: f(x) (Dark slate / primary) */}
            <path d={fPath} fill="none" stroke="#2B4141" strokeWidth="2.2" strokeLinecap="round" />

            {/* Curve: f'(x) (Terracotta dashed) */}
            {showDerivative && (
              <path
                d={dfPath}
                fill="none"
                stroke="#8C533E"
                strokeWidth="2"
                strokeDasharray="4 3"
                strokeLinecap="round"
              />
            )}

            {/* Hover cursor inspection */}
            {hoverX !== null && (
              <g>
                <line
                  x1={toSvgX(hoverX)}
                  y1={padding}
                  x2={toSvgX(hoverX)}
                  y2={height - padding}
                  stroke="#857F72"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <circle cx={toSvgX(hoverX)} cy={toSvgY(act.f(hoverX))} r="4" fill="#2B4141" />
                {showDerivative && (
                  <circle cx={toSvgX(hoverX)} cy={toSvgY(act.df(hoverX))} r="4" fill="#8C533E" />
                )}
              </g>
            )}
          </svg>

          {/* Legend */}
          <div className="flex items-center gap-4 justify-center mt-2 text-[11px] font-medium">
            <div className="flex items-center gap-1.5 text-[#2B4141] dark:text-[#E6E4DF]">
              <span className="w-3 h-0.5 bg-[#2B4141] dark:bg-[#E6E4DF] rounded"></span>
              $f(x)$ Value
            </div>
            {showDerivative && (
              <div className="flex items-center gap-1.5 text-[#8C533E] dark:text-[#E07A5F]">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-[#8C533E] dark:border-[#E07A5F]"></span>
                $f&apos;(x)$ Derivative
              </div>
            )}
          </div>
        </div>

        {/* Function Chooser */}
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#857F72] dark:text-[#8E8A80] block mb-2">
              Select Function
            </label>
            <div className="grid grid-cols-2 gap-1">
              {(["relu", "leaky_relu", "gelu", "silu", "sigmoid", "tanh"] as ActivationKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setActKey(k)}
                  className={`text-[11px] py-1.5 px-2 rounded font-medium transition-colors text-left truncate ${
                    actKey === k
                      ? "bg-[#8C533E] text-white"
                      : "bg-[#EDEAE2] dark:bg-[#2C2F33] text-[#555148] dark:text-[#A8A398] hover:text-[#191C1E] dark:hover:text-[#F7F6F2]"
                  }`}
                >
                  {k.toUpperCase().replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#FCFBF9] dark:bg-[#1C1F21] rounded border border-[#E7E5DF] dark:border-[#33373B] text-xs space-y-1">
            <div className="font-serif font-bold text-[#191C1E] dark:text-[#F7F6F2]">{act.name}</div>
            <div className="text-[#555148] dark:text-[#A8A398] font-mono text-[11px] truncate">
              {act.formula}
            </div>
            {hoverX !== null && (
              <div className="pt-2 border-t border-[#E7E5DF] dark:border-[#33373B] font-mono text-[10.5px] space-y-0.5">
                <div>x = {hoverX.toFixed(2)}</div>
                <div className="text-[#2B4141] dark:text-[#E6E4DF] font-semibold">f(x) = {act.f(hoverX).toFixed(3)}</div>
                <div className="text-[#8C533E] dark:text-[#E07A5F] font-semibold">f&apos;(x) = {act.df(hoverX).toFixed(3)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
