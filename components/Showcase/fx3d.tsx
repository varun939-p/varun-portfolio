"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

// Under-damped spring: presses overshoot and settle like a physical object.
export class Spring {
  x: number;
  v = 0;
  target: number;
  constructor(x: number, public k = 170, public c = 13) {
    this.x = x;
    this.target = x;
  }
  step(dt: number) {
    const h = Math.min(dt, 1 / 30);
    this.v += (-this.k * (this.x - this.target) - this.c * this.v) * h;
    this.x += this.v * h;
    return this.x;
  }
  kick(v: number) {
    this.v += v;
  }
}

export interface BurstHandle {
  fire: (p: THREE.Vector3, color: string) => void;
}

// One instanced draw call of shards that explode outward from a tap point.
export const Burst = forwardRef<BurstHandle, { count?: number; speed?: number }>(function Burst(
  { count = 56, speed = 1 },
  ref
) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const mat = useRef<THREE.MeshBasicMaterial>(null!);
  const alive = useRef(false);
  const parts = useMemo(
    () => Array.from({ length: count }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), life: 0, s: 1 })),
    [count]
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useImperativeHandle(
    ref,
    () => ({
      fire(p, color) {
        mat.current.color.set(color).multiplyScalar(1.6);
        for (const d of parts) {
          d.p.copy(p);
          d.v.set(Math.random() - 0.5, Math.random() - 0.3, Math.random() - 0.5).normalize().multiplyScalar((2 + Math.random() * 4) * speed);
          d.life = 0.7 + Math.random() * 0.5;
          d.s = 0.04 + Math.random() * 0.06;
        }
        alive.current = true;
        mesh.current.visible = true;
      },
    }),
    [parts, speed]
  );

  useFrame((_, dt) => {
    if (!alive.current) return;
    const h = Math.min(dt, 1 / 30);
    let any = false;
    parts.forEach((d, i) => {
      if (d.life > 0) {
        d.life -= h * 1.3;
        d.v.multiplyScalar(1 - h * 2.4);
        d.v.y -= h * 3 * speed;
        d.p.addScaledVector(d.v, h);
        any = true;
      }
      dummy.position.copy(d.p);
      dummy.rotation.set(d.life * 9, d.life * 7, 0);
      dummy.scale.setScalar(Math.max(d.life, 0) * d.s * 1.6);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (!any) {
      alive.current = false;
      mesh.current.visible = false;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false} visible={false}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial ref={mat} toneMapped={false} transparent opacity={0.95} />
    </instancedMesh>
  );
});

// Studio reflections baked once from light cards — no HDR download.
export function StudioEnv() {
  return (
    <Environment resolution={128} frames={1}>
      <Lightformer form="rect" intensity={3.5} position={[0, 5, -2]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} />
      <Lightformer form="rect" intensity={2.2} color="#7cc7e8" position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
      <Lightformer form="rect" intensity={2.2} color="#b46cff" position={[6, -1, 2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
      <Lightformer form="ring" intensity={2.5} position={[0, 0, 8]} scale={3} />
    </Environment>
  );
}

// Inertial drag-to-rotate that leaves vertical page scrolling to the browser on touch.
export function DragOrbit({ minPolar = 0.32, maxPolar = 0.62, autoRotate = false }) {
  const ref = useRef<OrbitControlsImpl>(null);
  useEffect(() => {
    const el = ref.current?.domElement as HTMLElement | undefined;
    if (el) el.style.touchAction = "pan-y";
  });
  useFrame(() => {
    const el = ref.current?.domElement as HTMLElement | undefined;
    if (el && el.style.touchAction !== "pan-y") el.style.touchAction = "pan-y";
  });
  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.5}
      enableZoom={false}
      enablePan={false}
      autoRotate={autoRotate}
      autoRotateSpeed={0.5}
      minPolarAngle={Math.PI * minPolar}
      maxPolarAngle={Math.PI * maxPolar}
    />
  );
}

export const tapOrigin = (e: { nativeEvent: MouseEvent | PointerEvent }) => ({
  x: e.nativeEvent.clientX,
  y: e.nativeEvent.clientY,
});

// Compiles every shader in the scene before the first visible frame
// (KHR_parallel_shader_compile keeps the main thread free), so a 3D section
// never stutters as it scrolls into view. Optionally bakes studio reflections
// first, because materials compile differently once an env map exists.
export function Warmup({ onReady, studio = false }: { onReady: () => void; studio?: boolean }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    let rt: THREE.WebGLRenderTarget | null = null;
    if (studio) {
      const env = new THREE.Scene();
      const card = (geo: THREE.BufferGeometry, color: string, k: number, pos: number[], rot: number[]) => {
        const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
        m.position.fromArray(pos);
        m.rotation.set(rot[0], rot[1], rot[2]);
        env.add(m);
      };
      card(new THREE.PlaneGeometry(10, 3), "#ffffff", 3.5, [0, 5, -2], [Math.PI / 2, 0, 0]);
      card(new THREE.PlaneGeometry(6, 2), "#7cc7e8", 2.2, [-6, 1, 2], [0, Math.PI / 2, 0]);
      card(new THREE.PlaneGeometry(6, 2), "#f5b544", 2, [6, -1, 2], [0, -Math.PI / 2, 0]);
      card(new THREE.RingGeometry(1.5, 3, 48), "#ffffff", 2.5, [0, 0, 8], [0, 0, 0]);
      const pmrem = new THREE.PMREMGenerator(gl);
      rt = pmrem.fromScene(env, 0.02);
      pmrem.dispose();
      env.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry.dispose();
          (m.material as THREE.Material).dispose();
        }
      });
      scene.environment = rt.texture;
    }
    let live = true;
    const t = setTimeout(() => {
      gl.compileAsync(scene, camera)
        .catch(() => undefined)
        .then(() => live && onReady());
    }, 0);
    return () => {
      live = false;
      clearTimeout(t);
      if (rt) {
        scene.environment = null;
        rt.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera, studio]);
  return null;
}
