"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";

type SurfaceKey = "ravine" | "rosenbrock" | "saddle" | "multiwell";
type OptimizerKey = "gd" | "momentum" | "rmsprop" | "adam";

interface SurfaceConfig {
  name: string;
  f: (x: number, y: number) => number;
  grad: (x: number, y: number) => [number, number];
  xRange: [number, number];
  yRange: [number, number];
  defaultStart: [number, number];
  defaultEta: number;
}

const SURFACES: Record<SurfaceKey, SurfaceConfig> = {
  ravine: {
    name: "Ill-Conditioned Ravine (κ = 20)",
    f: (x, y) => 0.5 * x * x + 10 * y * y,
    grad: (x, y) => [x, 20 * y],
    xRange: [-6, 6],
    yRange: [-3, 3],
    defaultStart: [-5, 2.5],
    defaultEta: 0.08,
  },
  rosenbrock: {
    name: "Rosenbrock Banana Valley",
    f: (x, y) => Math.pow(1 - x, 2) + 20 * Math.pow(y - x * x, 2),
    grad: (x, y) => [
      -2 * (1 - x) - 40 * x * (y - x * x),
      20 * 2 * (y - x * x),
    ],
    xRange: [-2.5, 2.5],
    yRange: [-1.5, 3.5],
    defaultStart: [-1.8, 2.0],
    defaultEta: 0.003,
  },
  saddle: {
    name: "Saddle Point Geometry",
    f: (x, y) => x * x - y * y + 0.1 * Math.pow(x, 4) + 0.1 * Math.pow(y, 4),
    grad: (x, y) => [2 * x + 0.4 * Math.pow(x, 3), -2 * y + 0.4 * Math.pow(y, 3)],
    xRange: [-3, 3],
    yRange: [-3, 3],
    defaultStart: [0.05, 2.2],
    defaultEta: 0.08,
  },
  multiwell: {
    name: "Non-Convex Multi-Well",
    f: (x, y) => 0.2 * (x * x + y * y) - Math.cos(1.5 * x) - Math.cos(1.5 * y) + 2,
    grad: (x, y) => [
      0.4 * x + 1.5 * Math.sin(1.5 * x),
      0.4 * y + 1.5 * Math.sin(1.5 * y),
    ],
    xRange: [-4, 4],
    yRange: [-4, 4],
    defaultStart: [-3.2, 3.1],
    defaultEta: 0.15,
  },
};

export default function LossLandscape2D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [surfaceKey, setSurfaceKey] = useState<SurfaceKey>("ravine");
  const [optimizerKey, setOptimizerKey] = useState<OptimizerKey>("gd");
  const [eta, setEta] = useState<number>(0.08);
  const [beta, setBeta] = useState<number>(0.85);
  const maxSteps = 100;

  const [trajectory, setTrajectory] = useState<[number, number][]>([SURFACES.ravine.defaultStart]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Optimizer internal states
  const optState = useRef({
    x: -5,
    y: 2.5,
    vx: 0,
    vy: 0,
    sx: 0,
    sy: 0,
    m1x: 0,
    m1y: 0,
    m2x: 0,
    m2y: 0,
    t: 0,
  });

  const surface = SURFACES[surfaceKey];

  // Initialize position
  const resetTo = useCallback((startPos: [number, number]) => {
    optState.current = {
      x: startPos[0],
      y: startPos[1],
      vx: 0,
      vy: 0,
      sx: 0,
      sy: 0,
      m1x: 0,
      m1y: 0,
      m2x: 0,
      m2y: 0,
      t: 0,
    };
    setTrajectory([[startPos[0], startPos[1]]]);
    setCurrentStep(0);
    setIsRunning(false);
  }, []);

  const handleSurfaceChange = (key: SurfaceKey) => {
    setSurfaceKey(key);
    const nextSurf = SURFACES[key];
    setEta(nextSurf.defaultEta);
    resetTo(nextSurf.defaultStart);
  };

  // Step function
  const stepOptimizer = useCallback(() => {
    const s = optState.current;
    if (s.t >= maxSteps) {
      setIsRunning(false);
      return;
    }

    const [gx, gy] = surface.grad(s.x, s.y);
    s.t += 1;

    let nx = s.x;
    let ny = s.y;

    if (optimizerKey === "gd") {
      nx = s.x - eta * gx;
      ny = s.y - eta * gy;
    } else if (optimizerKey === "momentum") {
      s.vx = beta * s.vx + eta * gx;
      s.vy = beta * s.vy + eta * gy;
      nx = s.x - s.vx;
      ny = s.y - s.vy;
    } else if (optimizerKey === "rmsprop") {
      const rho = 0.9;
      const eps = 1e-8;
      s.sx = rho * s.sx + (1 - rho) * (gx * gx);
      s.sy = rho * s.sy + (1 - rho) * (gy * gy);
      nx = s.x - (eta / Math.sqrt(s.sx + eps)) * gx;
      ny = s.y - (eta / Math.sqrt(s.sy + eps)) * gy;
    } else if (optimizerKey === "adam") {
      const beta1 = 0.9;
      const beta2 = 0.999;
      const eps = 1e-8;
      s.m1x = beta1 * s.m1x + (1 - beta1) * gx;
      s.m1y = beta1 * s.m1y + (1 - beta1) * gy;
      s.m2x = beta2 * s.m2x + (1 - beta2) * (gx * gx);
      s.m2y = beta2 * s.m2y + (1 - beta2) * (gy * gy);

      const mHatX = s.m1x / (1 - Math.pow(beta1, s.t));
      const mHatY = s.m1y / (1 - Math.pow(beta1, s.t));
      const vHatX = s.m2x / (1 - Math.pow(beta2, s.t));
      const vHatY = s.m2y / (1 - Math.pow(beta2, s.t));

      nx = s.x - (eta / (Math.sqrt(vHatX) + eps)) * mHatX;
      ny = s.y - (eta / (Math.sqrt(vHatY) + eps)) * mHatY;
    }

    if (isNaN(nx) || isNaN(ny) || Math.abs(nx) > 50 || Math.abs(ny) > 50) {
      setIsRunning(false);
      return;
    }

    s.x = nx;
    s.y = ny;
    setTrajectory((prev) => [...prev, [nx, ny]]);
    setCurrentStep(s.t);
  }, [surface, optimizerKey, eta, beta]);

  // Run loop
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      stepOptimizer();
    }, 45);
    return () => clearInterval(interval);
  }, [isRunning, stepOptimizer]);

  // Render contour canvas with Warm Stone palette
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const [minX, maxX] = surface.xRange;
    const [minY, maxY] = surface.yRange;

    const toCanvasX = (x: number) => ((x - minX) / (maxX - minX)) * width;
    const toCanvasY = (y: number) => height - ((y - minY) / (maxY - minY)) * height;

    ctx.clearRect(0, 0, width, height);

    const res = 4;
    const cols = Math.floor(width / res);
    const rows = Math.floor(height / res);

    let maxVal = -Infinity;
    let minVal = Infinity;
    const vals: number[][] = [];

    for (let r = 0; r < rows; r++) {
      vals[r] = [];
      const yVal = minY + ((rows - 1 - r) / (rows - 1)) * (maxY - minY);
      for (let c = 0; c < cols; c++) {
        const xVal = minX + (c / (cols - 1)) * (maxX - minX);
        const v = surface.f(xVal, yVal);
        vals[r][c] = v;
        if (v > maxVal) maxVal = v;
        if (v < minVal) minVal = v;
      }
    }

    // Warm stone / linen contour shading
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = vals[r][c];
        const norm = Math.min(1, Math.max(0, Math.log10(1 + (v - minVal)) / Math.log10(1 + (maxVal - minVal) * 0.4)));
        // Interpolate from warm linen (#F6F4D2) to dusty rose (#B57E75) to dark slate (#2B4141)
        const l = 94 - norm * 68;
        const s = 14 + norm * 20;
        const h = 42 - norm * 20; // Warm amber-stone to earthy clay
        ctx.fillStyle = `hsl(${h}, ${s}%, ${l}%)`;
        ctx.fillRect(c * res, r * res, res, res);
      }
    }

    // Coordinate axes
    ctx.strokeStyle = "rgba(133, 127, 114, 0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    const zeroX = toCanvasX(0);
    const zeroY = toCanvasY(0);

    if (zeroX >= 0 && zeroX <= width) {
      ctx.beginPath();
      ctx.moveTo(zeroX, 0);
      ctx.lineTo(zeroX, height);
      ctx.stroke();
    }
    if (zeroY >= 0 && zeroY <= height) {
      ctx.beginPath();
      ctx.moveTo(0, zeroY);
      ctx.lineTo(width, zeroY);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw trajectory
    if (trajectory.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = "#8C533E"; // Terracotta
      ctx.lineWidth = 2.2;
      ctx.lineJoin = "round";

      trajectory.forEach(([px, py], i) => {
        const cx = toCanvasX(px);
        const cy = toCanvasY(py);
        if (i === 0) {
          ctx.moveTo(cx, cy);
        } else {
          ctx.lineTo(cx, cy);
        }
      });
      ctx.stroke();

      trajectory.forEach(([px, py], i) => {
        const cx = toCanvasX(px);
        const cy = toCanvasY(py);

        ctx.beginPath();
        if (i === 0) {
          // Starting point (dark slate)
          ctx.arc(cx, cy, 5.5, 0, 2 * Math.PI);
          ctx.fillStyle = "#2B4141";
          ctx.fill();
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (i === trajectory.length - 1) {
          // Head (Terracotta)
          ctx.arc(cx, cy, 5.5, 0, 2 * Math.PI);
          ctx.fillStyle = "#8C533E";
          ctx.fill();
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (i % 2 === 0) {
          ctx.arc(cx, cy, 2, 0, 2 * Math.PI);
          ctx.fillStyle = "rgba(140, 83, 62, 0.65)";
          ctx.fill();
        }
      });
    }
  }, [surface, trajectory]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const [minX, maxX] = surface.xRange;
    const [minY, maxY] = surface.yRange;

    const realX = minX + (clickX / canvas.width) * (maxX - minX);
    const realY = maxY - (clickY / canvas.height) * (maxY - minY);

    resetTo([parseFloat(realX.toFixed(2)), parseFloat(realY.toFixed(2))]);
  };

  const currentLoss =
    trajectory.length > 0
      ? surface.f(trajectory[trajectory.length - 1][0], trajectory[trajectory.length - 1][1]).toFixed(4)
      : "0.0000";

  const currPos =
    trajectory.length > 0
      ? `(${trajectory[trajectory.length - 1][0].toFixed(2)}, ${trajectory[trajectory.length - 1][1].toFixed(2)})`
      : "(0, 0)";

  return (
    <div className="not-prose my-8 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-[#FFFFFF] dark:bg-[#23272B] shadow-2xs overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[#E7E5DF] dark:border-[#33373B] bg-[#FCFBF9] dark:bg-[#1C1F21]">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#857F72] dark:text-[#8E8A80]">
            Optimization Simulation
          </div>
          <h4 className="font-serif text-sm font-medium text-[#191C1E] dark:text-[#F7F6F2]">
            2D Loss Landscape Trajectory
          </h4>
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-3 text-xs font-mono bg-[#EDEAE2] dark:bg-[#2C2F33] px-3 py-1 rounded">
          <div>
            <span className="text-[#857F72]">Step:</span>{" "}
            <span className="font-bold text-[#191C1E] dark:text-[#F7F6F2]">{currentStep}</span>
          </div>
          <span className="text-[#857F72]">·</span>
          <div>
            <span className="text-[#857F72]">Pos:</span>{" "}
            <span className="font-bold text-[#191C1E] dark:text-[#F7F6F2]">{currPos}</span>
          </div>
          <span className="text-[#857F72]">·</span>
          <div>
            <span className="text-[#857F72]">Loss:</span>{" "}
            <span className="font-bold text-[#8C533E] dark:text-[#E07A5F]">{currentLoss}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Canvas Visualizer */}
        <div className="lg:col-span-2 relative p-4 bg-[#F7F6F2] dark:bg-[#191C1E] flex items-center justify-center border-b lg:border-b-0 lg:border-r border-[#E7E5DF] dark:border-[#33373B]">
          <canvas
            ref={canvasRef}
            width={580}
            height={360}
            onClick={handleCanvasClick}
            className="w-full max-w-[580px] h-[320px] sm:h-[360px] rounded cursor-crosshair border border-[#E7E5DF] dark:border-[#33373B] bg-white dark:bg-[#23272B]"
          />
          <div className="absolute bottom-6 right-6 pointer-events-none text-[10px] font-mono bg-[#191C1E]/80 text-[#F7F6F2] px-2 py-0.5 rounded">
            Click to re-target $(\theta_x, \theta_y)$
          </div>
        </div>

        {/* Control Panel */}
        <div className="p-5 flex flex-col justify-between space-y-4 bg-[#FCFBF9] dark:bg-[#1C1F21]">
          <div className="space-y-4">
            {/* Surface Picker */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#857F72] dark:text-[#8E8A80] block mb-1">
                Objective Landscape
              </label>
              <select
                value={surfaceKey}
                onChange={(e) => handleSurfaceChange(e.target.value as SurfaceKey)}
                className="w-full text-xs rounded border border-[#E7E5DF] dark:border-[#33373B] bg-white dark:bg-[#23272B] px-2.5 py-1.5 text-[#191C1E] dark:text-[#F7F6F2] focus:outline-none focus:border-[#8C533E]"
              >
                <option value="ravine">Ill-Conditioned Ravine (κ = 20)</option>
                <option value="rosenbrock">Rosenbrock Valley</option>
                <option value="saddle">Saddle Point Geometry</option>
                <option value="multiwell">Non-Convex Multi-Well</option>
              </select>
            </div>

            {/* Optimizer Picker */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#857F72] dark:text-[#8E8A80] block mb-1">
                Optimizer Algorithm
              </label>
              <div className="grid grid-cols-2 gap-1">
                {(["gd", "momentum", "rmsprop", "adam"] as OptimizerKey[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setOptimizerKey(opt);
                      resetTo(surface.defaultStart);
                    }}
                    className={`text-[11px] py-1.5 px-2 rounded font-medium transition-colors ${
                      optimizerKey === opt
                        ? "bg-[#8C533E] text-white"
                        : "bg-[#EDEAE2] dark:bg-[#2C2F33] text-[#555148] dark:text-[#A8A398] hover:text-[#191C1E] dark:hover:text-[#F7F6F2]"
                    }`}
                  >
                    {opt === "gd"
                      ? "Vanilla GD"
                      : opt === "momentum"
                      ? "Polyak Momentum"
                      : opt === "rmsprop"
                      ? "RMSprop"
                      : "Adam"}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#555148] dark:text-[#A8A398]">Learning Rate ($\eta$)</span>
                  <span className="font-mono text-[#191C1E] dark:text-[#F7F6F2] font-semibold">{eta}</span>
                </div>
                <input
                  type="range"
                  min={surfaceKey === "rosenbrock" ? "0.0005" : "0.005"}
                  max={surfaceKey === "rosenbrock" ? "0.015" : "0.35"}
                  step={surfaceKey === "rosenbrock" ? "0.0005" : "0.005"}
                  value={eta}
                  onChange={(e) => setEta(parseFloat(e.target.value))}
                  className="w-full accent-[#8C533E] cursor-pointer"
                />
              </div>

              {(optimizerKey === "momentum" || optimizerKey === "adam") && (
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#555148] dark:text-[#A8A398]">Momentum ($\beta$)</span>
                    <span className="font-mono text-[#191C1E] dark:text-[#F7F6F2] font-semibold">{beta}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.99"
                    step="0.02"
                    value={beta}
                    onChange={(e) => setBeta(parseFloat(e.target.value))}
                    className="w-full accent-[#8C533E] cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#E7E5DF] dark:border-[#33373B] flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#8C533E] hover:bg-[#734230] text-white text-xs font-semibold py-1.5 px-3 rounded transition-colors"
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isRunning ? "Pause" : "Simulate"}
            </button>
            <button
              onClick={stepOptimizer}
              disabled={isRunning}
              title="Step once"
              className="p-1.5 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-white dark:bg-[#23272B] hover:bg-[#EDEAE2] dark:hover:bg-[#2C2F33] text-[#555148] dark:text-[#A8A398] disabled:opacity-40 transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => resetTo(surface.defaultStart)}
              title="Reset"
              className="p-1.5 rounded border border-[#E7E5DF] dark:border-[#33373B] bg-white dark:bg-[#23272B] hover:bg-[#EDEAE2] dark:hover:bg-[#2C2F33] text-[#555148] dark:text-[#A8A398] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
