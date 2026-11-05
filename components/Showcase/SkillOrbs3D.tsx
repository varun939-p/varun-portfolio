"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, useCursor } from "@react-three/drei";
import type { Line2 } from "three-stdlib";
import * as THREE from "three";
import { SKILL_GROUPS } from "../Universe/data";
import { openDetail, skillDetail } from "./detail";
import { Burst, Spring, Warmup, tapOrigin, type BurstHandle } from "./fx3d";

// Five glossy skill orbs. They drift, lean away from the cursor, squash on
// press, and burst into shards before the fullscreen popup opens.
function useLayout() {
  const { width, height } = useThree((s) => s.viewport);
  return useMemo(() => {
    const wide = width / height > 1.2;
    if (wide) {
      const gap = Math.min(2.1, width / 5.4);
      return {
        r: 0.78,
        pos: SKILL_GROUPS.map((_, i) => new THREE.Vector3((i - 2) * gap, i % 2 ? -0.45 : 0.4, 0)),
      };
    }
    // phones: 2-2-1 grid so every label has room
    const gx = Math.min(1.1, width * 0.29);
    return {
      r: 0.45,
      pos: [
        [-gx, 1.95],
        [gx, 1.95],
        [-gx, 0.15],
        [gx, 0.15],
        [0, -1.65],
      ].map(([x, y]) => new THREE.Vector3(x, y, 0)),
    };
  }, [width, height]);
}

function Orb({ i, base, r, burst, hint, onTouch }: { i: number; base: THREE.Vector3; r: number; burst: React.RefObject<BurstHandle>; hint: boolean; onTouch: () => void }) {
  const g = SKILL_GROUPS[i];
  const group = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshStandardMaterial>(null!);
  const [hot, setHot] = useState(false);
  useCursor(hot);
  const scale = useMemo(() => new Spring(1, 180, 11), []);
  const ox = useMemo(() => new Spring(0, 60, 9), []);
  const oy = useMemo(() => new Spring(0, 60, 9), []);
  const halo = useMemo(() => new THREE.Color(g.color).multiplyScalar(1.3), [g.color]);
  const haloMat = useRef<THREE.MeshBasicMaterial>(null!);
  const wave = useRef<THREE.Mesh>(null!);
  const waveMat = useRef<THREE.MeshBasicMaterial>(null!);
  const waveT = useRef(1);
  const sats = useRef<THREE.Group>(null!);
  const satColor = useMemo(() => new THREE.Color(g.color).multiplyScalar(1.8), [g.color]);

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime;
    // lean away from the pointer (projected onto the z=0 plane)
    const px = (s.pointer.x * s.viewport.width) / 2;
    const py = (s.pointer.y * s.viewport.height) / 2;
    const dx = base.x - px;
    const dy = base.y - py;
    const d2 = dx * dx + dy * dy;
    const push = hot ? 0 : Math.exp(-d2 * 0.9) * 0.35;
    const d = Math.sqrt(d2) || 1;
    ox.target = (dx / d) * push;
    oy.target = (dy / d) * push;
    group.current.position.set(base.x + ox.step(dt), base.y + oy.step(dt) + Math.sin(t * 1.1 + i * 1.3) * 0.08, base.z);
    scale.target = hot ? 1.14 : 1;
    const k = scale.step(dt);
    body.current.scale.set(k, 2 - k, k); // squash & stretch around volume
    body.current.rotation.y += dt * 0.4;
    mat.current.emissiveIntensity = THREE.MathUtils.damp(mat.current.emissiveIntensity, hot ? 0.9 : 0.28, 6, dt);
    // until someone interacts, the first orb breathes to show it can be clicked
    haloMat.current.opacity = hint ? 0.16 + (Math.sin(t * 3) * 0.5 + 0.5) * 0.22 : 0.14;
    // satellites orbit faster while hovered
    sats.current.rotation.y += dt * (hot ? 2.6 : 0.8);
    // shockwave ring that expands as the cursor arrives
    if (waveT.current < 1) {
      waveT.current = Math.min(1, waveT.current + dt * 1.5);
      wave.current.scale.setScalar(1 + waveT.current * 1.6);
      waveMat.current.opacity = (1 - waveT.current) * 0.8;
      wave.current.visible = true;
    } else wave.current.visible = false;
  });

  return (
    <group ref={group}>
      <mesh
        ref={body}
        name={`orb-${i}`}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHot(true);
          waveT.current = 0;
          onTouch();
        }}
        onPointerOut={() => setHot(false)}
        onPointerDown={(e) => {
          e.stopPropagation();
          scale.kick(-5);
        }}
        onClick={(e) => {
          e.stopPropagation();
          scale.kick(8);
          onTouch();
          burst.current?.fire(e.point, g.color);
          openDetail(skillDetail(i, tapOrigin(e)));
        }}
      >
        <icosahedronGeometry args={[r, 6]} />
        <meshStandardMaterial
          ref={mat}
          color={new THREE.Color(g.color).multiplyScalar(0.35)}
          emissive={g.color}
          emissiveIntensity={0.28}
          metalness={0.35}
          roughness={0.12}
          envMapIntensity={1.6}
        />
      </mesh>
      <mesh scale={1.22}>
        <sphereGeometry args={[r, 32, 24]} />
        <meshBasicMaterial ref={haloMat} color={halo} transparent opacity={0.14} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* orbiting satellites on a tilted ring */}
      <group rotation={[0.5 + i * 0.25, 0, 0.35 - i * 0.12]}>
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[r * 1.6, 0.004, 6, 120]} />
          <meshBasicMaterial color={satColor} transparent opacity={0.22} toneMapped={false} depthWrite={false} />
        </mesh>
        <group ref={sats}>
          {Array.from({ length: 5 }, (_, k) => {
            const a = (k / 5) * Math.PI * 2;
            return (
              <mesh key={k} position={[Math.cos(a) * r * 1.6, 0, Math.sin(a) * r * 1.6]}>
                <sphereGeometry args={[k === 0 ? 0.045 : 0.026, 10, 8]} />
                <meshBasicMaterial color={satColor} toneMapped={false} />
              </mesh>
            );
          })}
        </group>
      </group>
      <mesh ref={wave} visible={false}>
        <ringGeometry args={[r * 1.05, r * 1.12, 64]} />
        <meshBasicMaterial ref={waveMat} color={satColor} transparent opacity={0} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {hint && (
        <Html center position={[0, r + 0.42, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div className="orb-hint whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0a1020] shadow-lg">Click to explore</div>
        </Html>
      )}
      <Html center position={[0, -r - 0.32, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div className="flex flex-col items-center whitespace-nowrap text-center">
          <span className={`text-sm font-bold text-white transition-transform duration-300 sm:text-base ${hot ? "scale-110" : ""}`}>{g.name}</span>
          <span className="text-xs font-medium" style={{ color: g.color }}>
            {hot ? "Click to open" : `${g.items.length} tools`}
          </span>
        </div>
      </Html>
    </group>
  );
}

function Orbs() {
  const { r, pos } = useLayout();
  const burst = useRef<BurstHandle>(null);
  const [touched, setTouched] = useState(false);
  const touch = useCallback(() => setTouched(true), []);
  return (
    <>
      {pos.map((p, i) => (
        <Orb key={i} i={i} base={p} r={r} burst={burst} hint={!touched && i === 0} onTouch={touch} />
      ))}
      <EnergyLinks pos={pos} />
      <Burst ref={burst} count={70} />
    </>
  );
}

function EnergyLinks({ pos }: { pos: THREE.Vector3[] }) {
  const lines = useRef<(Line2 | null)[]>([]);
  const pairs = useMemo(() => {
    const out: [THREE.Vector3, THREE.Vector3, string][] = [];
    for (let k = 0; k < pos.length - 1; k++) {
      const a = pos[k].clone().setZ(-0.4);
      const b = pos[k + 1].clone().setZ(-0.4);
      out.push([a, b, SKILL_GROUPS[k].color]);
    }
    return out;
  }, [pos]);
  useFrame((_, dt) => {
    lines.current.forEach((l) => {
      if (l) l.material.dashOffset -= dt * 0.6;
    });
  });
  return (
    <>
      {pairs.map(([a, b, c], k) => (
        <Line
          key={k}
          ref={(l) => {
            lines.current[k] = l as unknown as Line2 | null;
          }}
          points={[a, b]}
          color={c}
          lineWidth={1.4}
          dashed
          dashSize={0.14}
          gapSize={0.2}
          transparent
          opacity={0.55}
        />
      ))}
    </>
  );
}

export default function SkillOrbs3D({ visible }: { visible: boolean }) {
  const [ready, setReady] = useState(false);
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={ready && visible ? "always" : "never"}
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y", opacity: ready ? 1 : 0, transition: "opacity 0.9s ease" }}
    >
      <ambientLight intensity={0.2} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <Orbs />
      <Warmup studio onReady={() => setReady(true)} />
    </Canvas>
  );
}
