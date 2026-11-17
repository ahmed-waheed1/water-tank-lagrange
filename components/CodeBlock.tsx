"use client";

import { useState } from "react";

const TOKEN =
  /(#.*$)|('[^']*'|"[^"]*")|\b(import|from|for|in|lambda|True|False|None)\b|\b(print|round|minimize)\b|\b(\d+(?:\.\d+)?)\b/gm;

function highlight(code: string) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of code.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out.push(code.slice(last, i));
    const cls = m[1]
      ? "text-[#7d8bab] italic"
      : m[2]
        ? "text-[#8FE3B8]"
        : m[3]
          ? "text-[#F59A4A]"
          : m[4]
            ? "text-[#6FB1FF]"
            : "text-[#FFC48F]";
    out.push(
      <span key={k++} className={cls}>
        {m[0]}
      </span>,
    );
    last = i + m[0].length;
  }
  out.push(code.slice(last));
  return out;
}

export default function CodeBlock({ code, filename }: { code: string; filename: string }) {
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
    window.setTimeout(() => setCopied("idle"), 2000);
  }

  return (
    <figure className="overflow-hidden rounded-xl bg-[#0A1A3C] ring-1 ring-[#0A1A3C]">
      <figcaption className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
        <span className="font-mono text-xs text-white/70">{filename}</span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/10"
        >
          {copied === "ok" ? "Copied!" : copied === "fail" ? "Copy failed" : "Copy code"}
        </button>
        <span className="sr-only" aria-live="polite">
          {copied === "ok" ? "Code copied to clipboard" : copied === "fail" ? "Could not copy code" : ""}
        </span>
      </figcaption>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-[#E8EEF8]" tabIndex={0}>
        <code>{highlight(code)}</code>
      </pre>
    </figure>
  );
}
