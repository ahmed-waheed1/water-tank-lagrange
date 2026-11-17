"use client";

import { useId } from "react";
import { STATUS_LABEL, type TankStatus } from "@/lib/tank";

const PILL: Record<TankStatus, string> = {
  idle: "bg-white/10 text-white/80 ring-white/25",
  running: "bg-[#F59A4A]/15 text-[#FFC48F] ring-[#F59A4A]/50",
  optimal: "bg-[#8FE3B8]/15 text-[#8FE3B8] ring-[#8FE3B8]/50",
};

export function StatusPill({ status }: { status: TankStatus }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-xs ring-1 ${PILL[status]}`}
    >
      <span
        aria-hidden
        className={`size-2 rounded-full bg-current ${status === "running" ? "animate-pulse" : ""}`}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Slider({
  label,
  unit,
  value,
  min,
  max,
  step = 0.01,
  digits = 2,
  onChange,
}: {
  label: React.ReactNode;
  unit: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  digits?: number;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm text-white/80">
          {label}
        </label>
        <output htmlFor={id} className="font-mono text-sm text-white">
          {value.toFixed(digits)} {unit}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="range w-full"
        min={min}
        max={max}
        step={step}
        value={Math.min(max, Math.max(min, value))}
        aria-valuetext={`${value.toFixed(digits)} ${unit}`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function Readout({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "best" | "warn";
}) {
  const color = tone === "best" ? "text-[#8FE3B8]" : tone === "warn" ? "text-[#FFC48F]" : "text-white";
  return (
    <div className="rounded-lg bg-white/[0.06] px-3 py-2 ring-1 ring-white/10">
      <div className="text-[11px] uppercase tracking-wider text-white/55">{label}</div>
      <div className={`font-mono text-base ${color}`}>{value}</div>
    </div>
  );
}

const BTN = {
  primary: "bg-[#F59A4A] text-[#0F2350] hover:bg-[#f8ad6b]",
  ghost: "bg-transparent text-white ring-1 ring-white/30 hover:bg-white/10",
} as const;

export function Button({
  variant = "ghost",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof BTN }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${BTN[variant]} ${className}`}
      {...props}
    />
  );
}
