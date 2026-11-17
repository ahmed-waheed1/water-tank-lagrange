"use client";

import dynamic from "next/dynamic";

/** The WebGL scene only runs in the browser, so it is never prerendered. */
const TankSceneLazy = dynamic(() => import("./TankScene"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center font-mono text-xs text-white/60">
      Loading 3D scene…
    </div>
  ),
});

export default TankSceneLazy;
