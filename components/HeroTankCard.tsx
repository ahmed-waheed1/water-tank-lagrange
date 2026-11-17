"use client";

import TankSceneLazy from "./TankSceneLazy";
import { Button, Readout, Slider, StatusPill } from "./ui";
import { excessPercent, fmt, heightFor, optimum, steelArea } from "@/lib/tank";
import { useTankOptimizer } from "@/lib/useTankOptimizer";

const V = 32;
const best = optimum(V);

export default function HeroTankCard() {
  const t = useTankOptimizer({ V, x: 6, y: 3 });
  const z = heightFor(V, t.x, t.y);
  const A = steelArea(V, t.x, t.y);
  const extra = excessPercent(V, t.x, t.y);

  return (
    <div className="overflow-hidden rounded-2xl bg-[#0A1A3C] ring-1 ring-white/10 shadow-2xl shadow-black/30">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="font-mono text-xs text-white/70">
          Live tank · V = {V} m³
        </div>
        <StatusPill status={t.status} />
      </div>

      <div
        className="relative h-64 sm:h-72"
        role="img"
        aria-label={`3D view of a ${fmt(t.x)} by ${fmt(t.y)} by ${fmt(z)} metre open-top tank, with the optimal 4 by 4 by 2 metre tank outlined in green.`}
      >
        <TankSceneLazy x={t.x} y={t.y} z={z} best={best} compact />
      </div>

      <div className="space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Slider label="Length x" unit="m" value={t.x} min={2} max={8} onChange={t.setX} />
          <Slider label="Width y" unit="m" value={t.y} min={2} max={8} onChange={t.setY} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Readout label="Height z" value={`${fmt(z)} m`} />
          <Readout label="Steel A" value={`${fmt(A)} m²`} />
          <Readout
            label="Above best"
            value={`+${fmt(Math.max(0, extra), 1)}%`}
            tone={extra < 0.05 ? "best" : "warn"}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={t.reset}>Reset</Button>
          <Button variant="primary" onClick={t.running ? t.pause : t.run} disabled={t.status === "optimal"}>
            {t.running ? "Pause" : "Run optimizer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
