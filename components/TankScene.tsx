"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, Grid, Line, OrbitControls } from "@react-three/drei";
import { type RefObject, useMemo, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export type ViewPreset = "iso" | "front" | "side" | "high";

export interface TankSceneProps {
  x: number;
  y: number;
  z: number;
  best: { x: number; y: number; z: number };
  showBest?: boolean;
  view?: { preset: ViewPreset; nonce: number };
  compact?: boolean;
}

const STEEL = "#cfd8e4";
const WATER = "#2F7BEA";
const BEST = "#8FE3B8";

const VIEW_DIRS: Record<ViewPreset, [number, number, number]> = {
  iso: [1, 0.75, 1.1],
  front: [0, 0.22, 1],
  side: [1, 0.22, 0],
  high: [0.12, 1, 0.18],
};

/** Exponential smoothing factor that is frame-rate independent. */
const ease = (dt: number, speed = 7) => 1 - Math.exp(-dt * speed);

/** Walls (bottom + 4 sides, no lid) in a unit box; the parent group scales it to x × z × y. */
const WALLS: {
  pos: [number, number, number];
  rot: [number, number, number];
}[] = [
  { pos: [0, 0, 0], rot: [-Math.PI / 2, 0, 0] },
  { pos: [0, 0.5, 0.5], rot: [0, 0, 0] },
  { pos: [0, 0.5, -0.5], rot: [0, 0, 0] },
  { pos: [-0.5, 0.5, 0], rot: [0, Math.PI / 2, 0] },
  { pos: [0.5, 0.5, 0], rot: [0, Math.PI / 2, 0] },
];

type SizeRef = RefObject<THREE.Vector3>;
type LabelRefs = RefObject<(HTMLSpanElement | null)[]>;

function Tank({ target, size }: { target: THREE.Vector3; size: SizeRef }) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    size.current.lerp(target, ease(dt));
    group.current?.scale.copy(size.current);
  });

  return (
    <>
      <group ref={group}>
        {WALLS.map((w, i) => (
          <mesh key={i} position={w.pos} rotation={w.rot} renderOrder={2}>
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial
              color={STEEL}
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
              depthWrite={false}
              metalness={0.6}
              roughness={0.35}
            />
            <Edges color="white" />
          </mesh>
        ))}
        {/* Water filled to 85 % of the height */}
        <mesh position={[0, 0.425, 0]} renderOrder={1}>
          <boxGeometry args={[0.985, 0.85, 0.985]} />
          <meshStandardMaterial
            color={WATER}
            transparent
            opacity={0.5}
            depthWrite={false}
            roughness={0.15}
            emissive="#6FB1FF"
            emissiveIntensity={0.15}
          />
        </mesh>
      </group>
    </>
  );
}

function BestOutline({ x, y, z }: { x: number; y: number; z: number }) {
  const points = useMemo(() => {
    const hx = x / 2;
    const hy = y / 2;
    const c: [number, number, number][] = [
      [-hx, 0, -hy],
      [hx, 0, -hy],
      [hx, 0, hy],
      [-hx, 0, hy],
    ];
    const up = c.map(([a, , b]) => [a, z, b] as [number, number, number]);
    const segs: [number, number, number][] = [];
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      segs.push(c[i], c[j], up[i], up[j], c[i], up[i]);
    }
    return segs;
  }, [x, y, z]);

  return (
    <Line
      points={points}
      segments
      color={BEST}
      lineWidth={1.6}
      dashed
      dashSize={0.25}
      gapSize={0.15}
    />
  );
}

/** Projects the x / y / z label anchors (in metres, from the animated size) to screen pixels. */
function LabelProjector({
  size,
  labels,
}: {
  size: SizeRef;
  labels: LabelRefs;
}) {
  const camera = useThree((s) => s.camera);
  const viewport = useThree((s) => s.size);
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const s = size.current; // (x, height, y)
    const anchors: [number, number, number][] = [
      [0, 0, s.z / 2 + 0.35], // x: front bottom edge
      [s.x / 2 + 0.35, 0, 0], // y: right bottom edge
      [-s.x / 2, s.y / 2, s.z / 2], // z: front-left vertical edge
    ];
    anchors.forEach((a, i) => {
      const el = labels.current[i];
      if (!el) return;
      v.set(...a).project(camera);
      const visible = v.z < 1;
      el.style.opacity = visible ? "1" : "0";
      el.style.transform = `translate(-50%, -50%) translate(${((v.x + 1) / 2) * viewport.width}px, ${((1 - v.y) / 2) * viewport.height}px)`;
    });
  });

  return null;
}

/** Animates the camera to view presets and keeps the orbit target centred on the tank. */
function CameraRig({
  view,
  x,
  y,
  z,
}: {
  view?: TankSceneProps["view"];
  x: number;
  y: number;
  z: number;
}) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const goal = useRef<THREE.Vector3 | null>(null);
  const lastNonce = useRef<number | undefined>(undefined);
  const focus = useMemo(
    () => new THREE.Vector3(0, Math.min(z, 12) / 2, 0),
    [z],
  );

  useFrame((_, dt) => {
    if (view && view.nonce !== lastNonce.current) {
      lastNonce.current = view.nonce;
      const reach = Math.max(9, 1.7 * Math.hypot(x, y, Math.min(z, 12)) + 3);
      goal.current = new THREE.Vector3(...VIEW_DIRS[view.preset])
        .normalize()
        .multiplyScalar(reach)
        .add(focus);
    }
    if (controls) {
      controls.target.lerp(focus, ease(dt, 4));
    }
    if (goal.current) {
      camera.position.lerp(goal.current, ease(dt, 5));
      if (camera.position.distanceTo(goal.current) < 0.01) goal.current = null;
    }
    controls?.update();
  });

  return null;
}

export default function TankScene({
  x,
  y,
  z,
  best,
  showBest = true,
  view,
  compact = false,
}: TankSceneProps) {
  const target = useMemo(() => new THREE.Vector3(x, z, y), [x, y, z]);
  const size = useRef(new THREE.Vector3(x, z, y));
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const text = [
    `x = ${x.toFixed(2)} m`,
    `y = ${y.toFixed(2)} m`,
    `z = ${z.toFixed(2)} m`,
  ];

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Canvas
        camera={{
          position: compact ? [8.5, 6.5, 9.5] : [10, 7.5, 11],
          fov: 40,
          near: 0.1,
          far: 500,
        }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[8, 14, 6]} intensity={1.4} />
        <directionalLight
          position={[-6, 4, -8]}
          intensity={0.4}
          color="#6FB1FF"
        />
        <Grid
          args={[40, 40]}
          cellSize={1}
          cellThickness={0.6}
          cellColor="#2b4170"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#3f63a8"
          fadeDistance={compact ? 30 : 60}
          fadeStrength={1.2}
          infiniteGrid
          position={[0, -0.002, 0]}
        />
        <Tank target={target} size={size} />
        <LabelProjector size={size} labels={labels} />
        {showBest && <BestOutline x={best.x} y={best.y} z={best.z} />}
        <OrbitControls
          makeDefault
          enableDamping
          minDistance={3}
          maxDistance={160}
          maxPolarAngle={Math.PI / 2 - 0.02}
          enableZoom={!compact}
        />
        <CameraRig view={view} x={x} y={y} z={z} />
      </Canvas>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {[2, 1, 0].map((i) => (
          <span
            key={i}
            ref={(el) => {
              labels.current[i] = el;
            }}
            className="absolute left-0 top-0 whitespace-nowrap rounded-md bg-[#0A1A3C]/85 px-1.5 py-0.5 font-mono text-[11px] text-white opacity-0 ring-1 ring-white/20"
          >
            {text[i]}
          </span>
        ))}
      </div>
    </div>
  );
}
