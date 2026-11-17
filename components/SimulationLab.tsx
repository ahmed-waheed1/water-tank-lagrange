"use client";

import Link from "next/link";
import { useId, useState } from "react";
import TankSceneLazy from "./TankSceneLazy";
import { Button, Readout, Slider, StatusPill } from "./ui";
import type { ViewPreset } from "./TankScene";
import {
  DEFAULT_VOLUME,
  SIDE_MAX,
  SIDE_MIN,
  excessPercent,
  fmt,
  heightFor,
  lambdas,
  lambdasAgree,
  optimum,
  steelArea,
} from "@/lib/tank";
import { useTankOptimizer } from "@/lib/useTankOptimizer";

const VIEWS: { id: ViewPreset; label: string }[] = [
  { id: "iso", label: "Iso" },
  { id: "front", label: "Front" },
  { id: "side", label: "Side" },
  { id: "high", label: "High" },
];

function PanelSection({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="border-t border-white/10 px-5 py-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-white/90">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function LambdaBars({ x, y, z }: { x: number; y: number; z: number }) {
  const ls = lambdas(x, y, z);
  const max = Math.max(...ls);
  const agree = lambdasAgree(ls);
  return (
    <div>
      <ul className="space-y-2">
        {ls.map((l, i) => (
          <li key={i} className="grid grid-cols-[28px_1fr_56px] items-center gap-2">
            <span className="font-mono text-xs text-white/70">
              λ<sub>{i + 1}</sub>
            </span>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-[width] duration-150 ${agree ? "bg-[#8FE3B8]" : "bg-[#6FB1FF]"}`}
                style={{ width: `${(l / max) * 100}%` }}
              />
            </div>
            <span className="text-right font-mono text-xs text-white">{fmt(l, 3)}</span>
          </li>
        ))}
      </ul>
      <p className={`mt-3 font-mono text-xs ${agree ? "text-[#8FE3B8]" : "text-white/55"}`} aria-live="polite">
        {agree ? "all equal: ∇f ∥ ∇g" : "not equal yet: ∇f is not parallel to ∇g"}
      </p>
    </div>
  );
}

function Sparkline({ data, best }: { data: number[]; best: number }) {
  const W = 320;
  const H = 72;
  const P = 4;
  const lo = Math.min(best, ...data);
  const hi = Math.max(best + 1e-6, ...data);
  const span = hi - lo || 1;
  const sx = (i: number) => P + (data.length < 2 ? 0 : (i / (data.length - 1)) * (W - 2 * P));
  const sy = (v: number) => H - P - ((v - lo) / span) * (H - 2 * P);
  const pts = data.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(" ");
  const last = data[data.length - 1];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-[72px] w-full rounded-lg bg-white/[0.04] ring-1 ring-white/10"
      role="img"
      aria-label={`Steel area per step: started at ${fmt(data[0])} m², now ${fmt(last)} m², best ${fmt(best)} m².`}
      preserveAspectRatio="none"
    >
      <line x1={0} x2={W} y1={sy(best)} y2={sy(best)} stroke="#8FE3B8" strokeDasharray="5 4" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
      {data.length > 1 ? (
        <polyline points={pts} fill="none" stroke="#F59A4A" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      ) : (
        <circle cx={sx(0)} cy={sy(last)} r={3} fill="#F59A4A" />
      )}
    </svg>
  );
}

export default function SimulationLab() {
  const t = useTankOptimizer({ V: DEFAULT_VOLUME, x: 6, y: 3 });
  const [showBest, setShowBest] = useState(true);
  const [view, setView] = useState<{ preset: ViewPreset; nonce: number }>({ preset: "iso", nonce: 0 });
  const toggleId = useId();

  const z = heightFor(t.V, t.x, t.y);
  const A = steelArea(t.V, t.x, t.y);
  const best = optimum(t.V);
  const extra = excessPercent(t.V, t.x, t.y);

  return (
    <div className="flex min-h-dvh flex-col bg-[#0A1A3C] text-white lg:h-dvh lg:overflow-hidden">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 bg-[#0F2350] px-4 py-3">
        <Link href="/" className="rounded-md px-2 py-1 text-sm text-white/80 hover:bg-white/10 hover:text-white">
          ← Back to project
        </Link>
        <h1 className="font-display text-lg font-bold">3D tank lab</h1>
        <div className="ml-auto">
          <StatusPill status={t.status} />
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        <div className="relative h-[55vh] min-h-[320px] lg:h-auto lg:flex-1">
          <div
            className="absolute inset-0"
            role="img"
            aria-label={`3D view of an open-top tank ${fmt(t.x)} m by ${fmt(t.y)} m by ${fmt(z)} m holding ${t.V} cubic metres. Drag to orbit, scroll to zoom.`}
          >
            <TankSceneLazy x={t.x} y={t.y} z={z} best={best} showBest={showBest} view={view} />
          </div>
          <div className="absolute left-3 top-3 flex flex-wrap gap-1 rounded-lg bg-[#0F2350]/85 p-1 ring-1 ring-white/10" role="group" aria-label="Camera view">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={view.preset === v.id}
                onClick={() => setView((p) => ({ preset: v.id, nonce: p.nonce + 1 }))}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  view.preset === v.id ? "bg-[#F59A4A] text-[#0F2350]" : "text-white/80 hover:bg-white/10"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-3 rounded-md bg-[#0F2350]/80 px-3 py-1.5 font-mono text-[11px] text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-0 w-4 border-t-2 border-dashed border-[#8FE3B8]" /> best tank
            </span>
            <span>grid = 1 m</span>
          </div>
        </div>

        <aside
          aria-label="Controls"
          className="w-full shrink-0 border-white/10 bg-[#0F2350]/60 lg:w-[380px] lg:overflow-y-auto lg:border-l"
        >
          <section className="space-y-4 px-5 py-4">
            <Slider label="Volume V" unit="m³" value={t.V} min={8} max={128} step={1} digits={0} onChange={t.setV} />
            <Slider label="Length x" unit="m" value={t.x} min={SIDE_MIN} max={SIDE_MAX} onChange={t.setX} />
            <Slider label="Width y" unit="m" value={t.y} min={SIDE_MIN} max={SIDE_MAX} onChange={t.setY} />
            <label htmlFor={toggleId} className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
              <input
                id={toggleId}
                type="checkbox"
                checked={showBest}
                onChange={(e) => setShowBest(e.target.checked)}
                className="size-4 accent-[#F59A4A]"
              />
              Show best tank outline
            </label>
          </section>

          <PanelSection title="Readouts">
            <div className="grid grid-cols-2 gap-2">
              <Readout label="Height z" value={`${fmt(z)} m`} />
              <Readout label="Steel A" value={`${fmt(A)} m²`} />
              <Readout label="Best A*" value={`${fmt(best.A)} m²`} tone="best" />
              <Readout label="Extra steel" value={`+${fmt(Math.max(0, extra), 2)}%`} tone={extra < 0.05 ? "best" : "warn"} />
            </div>
            <p className="mt-2 font-mono text-[11px] text-white/50">
              best: {fmt(best.x)} × {fmt(best.y)} × {fmt(best.z)} m, λ = {fmt(best.lambda, 3)}
            </p>
          </PanelSection>

          <PanelSection title="Lagrange check">
            <LambdaBars x={t.x} y={t.y} z={z} />
          </PanelSection>

          <PanelSection title="Optimizer" aside={<span className="font-mono text-xs text-white/60">step {t.steps}</span>}>
            <Sparkline data={t.history} best={best.A} />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="primary" onClick={t.running ? t.pause : t.run}>
                {t.running ? "Pause" : "Run optimizer"}
              </Button>
              <Button onClick={t.step} disabled={t.running}>
                One step
              </Button>
              <Button onClick={t.jump}>Jump to best</Button>
              <Button onClick={t.reset}>Reset</Button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-white/50">
              Gradient descent on A(x, y) = xy + 2V/x + 2V/y, one step every 70 ms, stopping when a step moves less than
              0.0005 m.
            </p>
          </PanelSection>
        </aside>
      </div>
    </div>
  );
}
