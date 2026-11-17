"use client";

import { useEffect, useReducer } from "react";
import {
  STEP_INTERVAL_MS,
  gradientStep,
  optimum,
  steelArea,
  tankStatus,
} from "./tank";

const HISTORY_LIMIT = 400;

interface State {
  V: number;
  x: number;
  y: number;
  running: boolean;
  steps: number;
  history: number[]; // A per optimizer step
  init: { V: number; x: number; y: number };
}

type Action =
  | { type: "setV"; V: number }
  | { type: "setX"; x: number }
  | { type: "setY"; y: number }
  | { type: "run" }
  | { type: "pause" }
  | { type: "step" }
  | { type: "jump" }
  | { type: "reset" };

/** Manual edits restart the step counter and the A-per-step history. */
function restart(s: State, patch: Partial<State>): State {
  const n = { ...s, ...patch, running: false, steps: 0 };
  return { ...n, history: [steelArea(n.V, n.x, n.y)] };
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "setV":
      return restart(s, { V: a.V });
    case "setX":
      return restart(s, { x: a.x });
    case "setY":
      return restart(s, { y: a.y });
    case "run":
      return { ...s, running: true };
    case "pause":
      return { ...s, running: false };
    case "step": {
      const r = gradientStep(s.V, s.x, s.y);
      const history = [...s.history, steelArea(s.V, r.x, r.y)].slice(-HISTORY_LIMIT);
      return {
        ...s,
        x: r.x,
        y: r.y,
        steps: s.steps + 1,
        history,
        running: s.running && !r.converged,
      };
    }
    case "jump": {
      const o = optimum(s.V);
      return {
        ...s,
        x: o.x,
        y: o.y,
        running: false,
        history: [...s.history, o.A].slice(-HISTORY_LIMIT),
      };
    }
    case "reset":
      return restart(s, { ...s.init });
  }
}

export function useTankOptimizer(init: { V: number; x: number; y: number }) {
  const [state, dispatch] = useReducer(reducer, init, (i) => ({
    ...i,
    running: false,
    steps: 0,
    history: [steelArea(i.V, i.x, i.y)],
    init: i,
  }));

  useEffect(() => {
    if (!state.running) return;
    const id = window.setInterval(() => dispatch({ type: "step" }), STEP_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [state.running]);

  const status = tankStatus(state.running, state.V, state.x, state.y);

  return {
    ...state,
    status,
    setV: (V: number) => dispatch({ type: "setV", V }),
    setX: (x: number) => dispatch({ type: "setX", x }),
    setY: (y: number) => dispatch({ type: "setY", y }),
    run: () => dispatch({ type: "run" }),
    pause: () => dispatch({ type: "pause" }),
    step: () => dispatch({ type: "step" }),
    jump: () => dispatch({ type: "jump" }),
    reset: () => dispatch({ type: "reset" }),
  };
}
