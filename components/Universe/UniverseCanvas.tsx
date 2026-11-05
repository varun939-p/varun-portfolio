"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type ReactNode,
  type SetStateAction,
} from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import {
  Html,
  OrbitControls,
  PerformanceMonitor,
  useCursor,
} from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { GradeEffect } from "./GradeEffect";
import { openDetail, projectDetail } from "../Showcase/detail";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { PROJECTS, SKILL_GROUPS, type ProjectId } from "./data";

export interface UniverseProps {
  active: ProjectId | null;
  hovered: ProjectId | null;
  focusGroup: number | null;
  setActive: Dispatch<SetStateAction<ProjectId | null>>;
  setHovered: Dispatch<SetStateAction<ProjectId | null>>;
  fpsRef: MutableRefObject<HTMLSpanElement | null>;
}

const ORBIT_R = 2.5;
const BG = "#0a1020";
const CAM_POS: [number, number, number] = [0, 1.4, 9.4];
const FOCUS_DIST = Math.hypot(...CAM_POS);

// Damped harmonic oscillator (semi-implicit Euler). Under-damped on purpose so
// hover/press feedback overshoots and settles like a physical spring.
class Spring {
  x: number;
  v = 0;
  target: number;
  constructor(x: number, public k = 180, public c = 15) {
    this.x = x;
    this.target = x;
  }
  step(dt: number) {
    const h = Math.min(dt, 1 / 30);
    const a = -this.k * (this.x - this.target) - this.c * this.v;
    this.v += a * h;
    this.x += this.v * h;
    return this.x;
  }
  kick(v: number) {
    this.v += v;
  }
}

const hdr = (hex: string, k: number) => new THREE.Color(hex).multiplyScalar(k);

// ─── Camera framing: shift the projection centre so the cluster sits right of the hero copy
function ViewRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const { width, height } = useThree((s) => s.size);
  useLayoutEffect(() => {
    camera.fov = width < 768 ? 52 : 40;
    // lg+: push the cluster right of the copy
    const x = width >= 1024 ? -width * 0.21 : 0;
    const y = width >= 1024 ? height * 0.04 : width < 768 ? height * 0.08 : 0;
    camera.setViewOffset(width, height, x, y, width, height);
    camera.updateProjectionMatrix();
    return () => camera.clearViewOffset();
  }, [camera, width, height]);
  return null;
}

// ─── Responsive scale + damped pointer-parallax tilt
function ClusterRig({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null!);
  const width = useThree((s) => s.size.width);
  const scale = width < 768 ? 0.62 : width < 1280 ? 0.85 : 1;
  useFrame((state, dt) => {
    const g = ref.current;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.12, 3, dt);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, state.pointer.x * 0.08, 3, dt);
  });
  return (
    <group ref={ref} scale={scale}>
      {children}
    </group>
  );
}

// ─── Key light that trails the pointer for live specular sweeps
function PointerLight() {
  const ref = useRef<THREE.PointLight>(null!);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ pointer, camera }, dt) => {
    tmp.set(pointer.x, pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
    tmp.multiplyScalar(6.5).add(camera.position);
    ref.current.position.lerp(tmp, 1 - Math.exp(-dt * 6));
  });
  return <pointLight ref={ref} intensity={14} distance={9} decay={2} color="#ffe2b0" />;
}

// ─── Central AI core
function Core({
  onSelect,
  onRipple,
}: {
  onSelect: () => void;
  onRipple: (p: THREE.Vector3, c: string) => void;
}) {
  const shell = useRef<THREE.Mesh>(null!);
  const inner = useRef<THREE.Mesh>(null!);
  const wire = useRef<THREE.Mesh>(null!);
  const [hot, setHot] = useState(false);
  useCursor(hot);
  const spring = useMemo(() => new Spring(1, 140, 11), []);
  const glow = useMemo(() => hdr("#7cc7e8", 2.6), []);
  useFrame((s, dt) => {
    const t = s.clock.elapsedTime;
    spring.target = hot ? 1.08 : 1;
    const k = spring.step(dt);
    shell.current.scale.setScalar(k);
    shell.current.rotation.y += dt * 0.15;
    shell.current.rotation.x = Math.sin(t * 0.3) * 0.2;
    wire.current.rotation.y -= dt * 0.08;
    wire.current.rotation.z += dt * 0.05;
    inner.current.scale.setScalar(0.5 + Math.sin(t * 2.2) * 0.03 + (k - 1) * 1.5);
  });
  return (
    <group>
      <mesh ref={inner}>
        <icosahedronGeometry args={[1, 3]} />
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>
      <mesh
        ref={shell}
        name="core"
        onPointerOver={(e) => {
          e.stopPropagation();
          setHot(true);
        }}
        onPointerOut={() => setHot(false)}
        onPointerDown={(e) => {
          e.stopPropagation();
          spring.kick(-3);
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (e.delta > 6) return;
          spring.kick(5);
          onSelect();
          onRipple(e.point, "#7cc7e8");
        }}
      >
        <icosahedronGeometry args={[1.05, 1]} />
        {/* Standard PBR, not physical: this shell covers the most screen area of
            anything in the scene, and profiling showed it was the main per-pixel cost. */}
        <meshStandardMaterial
          color="#10264d"
          metalness={0.75}
          roughness={0.08}
          envMapIntensity={2}
          flatShading
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={wire} scale={1.5}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#7cc7e8" wireframe transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

function OrbitRings() {
  const a = useMemo(() => hdr("#7cc7e8", 1.3), []);
  const b = useMemo(() => hdr("#f5b544", 1.0), []);
  return (
    <>
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[ORBIT_R, 0.007, 8, 220]} />
        <meshBasicMaterial color={a} toneMapped={false} transparent opacity={0.55} />
      </mesh>
      <mesh rotation={[Math.PI / 2 + 0.35, 0.25, 0]}>
        <torusGeometry args={[ORBIT_R * 1.32, 0.005, 8, 220]} />
        <meshBasicMaterial color={b} toneMapped={false} transparent opacity={0.3} />
      </mesh>
    </>
  );
}

// ─── Interactive project node: raycast hover/click, spring scale, emissive glow
const NODE_GEOMS = [
  <octahedronGeometry key="o" args={[0.46, 0]} />,
  <dodecahedronGeometry key="d" args={[0.42, 0]} />,
  <icosahedronGeometry key="i" args={[0.44, 0]} />,
];

function ProjectNode({
  index,
  active,
  hovered,
  setActive,
  setHovered,
  onRipple,
}: {
  index: number;
  active: ProjectId | null;
  hovered: ProjectId | null;
  setActive: UniverseProps["setActive"];
  setHovered: UniverseProps["setHovered"];
  onRipple: (p: THREE.Vector3, c: string) => void;
}) {
  const p = PROJECTS[index];
  const group = useRef<THREE.Group>(null!);
  const mesh = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null!);
  const halo = useRef<THREE.Mesh>(null!);
  const scale = useMemo(() => new Spring(1), []);
  const glow = useMemo(() => new Spring(0.35, 120, 18), []);
  const haloColor = useMemo(() => hdr(p.color, 2.2), [p.color]);
  const isActive = active === p.id;
  const isHot = isActive || hovered === p.id;
  useCursor(hovered === p.id);
  const base = (index / PROJECTS.length) * Math.PI * 2;

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const a = base + t * 0.1;
    group.current.position.set(Math.cos(a) * ORBIT_R, Math.sin(t * 0.9 + index * 2) * 0.22, Math.sin(a) * ORBIT_R);
    scale.target = isActive ? 1.38 : isHot ? 1.22 : 1;
    mesh.current.scale.setScalar(scale.step(dt));
    mesh.current.rotation.x += dt * 0.35;
    mesh.current.rotation.y += dt * 0.55;
    glow.target = isHot ? 3.2 : 0.35;
    mat.current.emissiveIntensity = Math.max(0, glow.step(dt));
    halo.current.visible = isActive;
    if (isActive) {
      halo.current.lookAt(state.camera.position);
      halo.current.scale.setScalar(0.95 + Math.sin(t * 3) * 0.05);
    }
  });

  return (
    <group ref={group}>
      <mesh
        ref={mesh}
        name={`project-${p.id}`}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(p.id);
        }}
        onPointerOut={() => setHovered((h) => (h === p.id ? null : h))}
        onPointerDown={(e) => {
          e.stopPropagation();
          scale.kick(-6);
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (e.delta > 6) return; // was an orbit drag, not a tap
          scale.kick(9);
          setActive(p.id);
          onRipple(e.point, p.color);
          openDetail(projectDetail(p.id, { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }));
        }}
      >
        {NODE_GEOMS[index % NODE_GEOMS.length]}
        <meshPhysicalMaterial
          ref={mat}
          color="#0a1224"
          emissive={p.color}
          emissiveIntensity={0.35}
          metalness={0.9}
          roughness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.4}
          flatShading
          toneMapped={false}
        />
      </mesh>
      <mesh ref={halo} visible={false}>
        <ringGeometry args={[0.78, 0.81, 64]} />
        <meshBasicMaterial color={haloColor} toneMapped={false} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      {isHot && (
        <Html center position={[0, 0.95, 0]} zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
          <div className="whitespace-nowrap rounded-full border border-white/15 bg-black/45 px-3 py-1 font-mono text-[11px] font-bold tracking-[0.18em] text-white shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
            <span style={{ color: p.color }}>●</span> {p.title.toUpperCase()}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Skill constellation: one instanced draw call, per-instance raycast hover
function SkillField({ focusGroup }: { focusGroup: number | null }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const group = useRef<THREE.Group>(null!);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const items = useMemo(
    () => SKILL_GROUPS.flatMap((g, gi) => g.items.map((name) => ({ name, gi }))),
    []
  );
  const positions = useMemo(() => {
    const n = items.length;
    const golden = Math.PI * (3 - Math.sqrt(5));
    return items.map((_, i) => {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      const R = 4.3 + ((i * 7919) % 13) / 13 * 0.6;
      return new THREE.Vector3(Math.cos(th) * r * R, y * R * 0.62, Math.sin(th) * r * R);
    });
  }, [items]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    positions.forEach((p, i) => ref.current.setMatrixAt(i, m.makeTranslation(p.x, p.y, p.z)));
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [positions]);

  useLayoutEffect(() => {
    const c = new THREE.Color();
    items.forEach((it, i) => {
      const k = i === hoverIdx ? 5 : focusGroup === null ? 1.15 : focusGroup === it.gi ? 3.4 : 0.22;
      ref.current.setColorAt(i, c.set(SKILL_GROUPS[it.gi].color).multiplyScalar(k));
    });
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [items, focusGroup, hoverIdx]);

  useFrame((s, dt) => {
    group.current.rotation.y += dt * 0.03;
    group.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.05) * 0.15;
  });

  return (
    <group ref={group}>
      <instancedMesh
        ref={ref}
        args={[undefined, undefined, items.length]}
        onPointerMove={(e) => {
          e.stopPropagation();
          if (e.instanceId !== undefined && e.instanceId !== hoverIdx) setHoverIdx(e.instanceId);
        }}
        onPointerOut={() => setHoverIdx(null)}
      >
        <sphereGeometry args={[0.085, 16, 12]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {hoverIdx !== null && (
        <Html center position={positions[hoverIdx]} zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
          <div className="-translate-y-6 whitespace-nowrap rounded-md border border-white/15 bg-black/50 px-2 py-0.5 font-mono text-[11px] text-white backdrop-blur-md">
            {items[hoverIdx].name}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Ambient dust. Bounded output on purpose: drei <Sparkles> divides by the
// distance to the point centre, which yields Infinity in HalfFloat HDR buffers
// and blows the whole frame out to white through mipmap bloom.
function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null!);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 16;
      p[i * 3 + 1] = (Math.random() - 0.5) * 9;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10 - 1;
    }
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, [count]);
  const sprite = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 32;
    const ctx = c.getContext("2d")!;
    const grd = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(c);
  }, []);
  useEffect(() => () => {
    geo.dispose();
    sprite.dispose();
  }, [geo, sprite]);
  useFrame((s, dt) => {
    ref.current.rotation.y += dt * 0.012;
    ref.current.position.y = Math.sin(s.clock.elapsedTime * 0.15) * 0.2;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        map={sprite}
        size={0.06}
        sizeAttenuation
        color="#7cc7e8"
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Click shockwave
interface RippleData {
  id: number;
  point: THREE.Vector3;
  color: string;
}

function Ripple({ data, onDone }: { data: RippleData; onDone: (id: number) => void }) {
  const ref = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshBasicMaterial>(null!);
  const t = useRef(0);
  const done = useRef(false);
  const camera = useThree((s) => s.camera);
  const color = useMemo(() => hdr(data.color, 3), [data.color]);
  useLayoutEffect(() => {
    ref.current.position.copy(data.point);
    ref.current.quaternion.copy(camera.quaternion);
  }, [camera, data.point]);
  useFrame((_, dt) => {
    if (done.current) return;
    t.current += dt;
    const p = t.current / 0.85;
    if (p >= 1) {
      done.current = true;
      ref.current.visible = false;
      onDone(data.id);
      return;
    }
    ref.current.scale.setScalar(0.15 + p * 1.6);
    mat.current.opacity = (1 - p) ** 2;
  });
  return (
    <mesh ref={ref}>
      <ringGeometry args={[0.9, 1, 64]} />
      <meshBasicMaterial ref={mat} color={color} toneMapped={false} transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── Inertial orbit controls; touch keeps native vertical page scroll (pan-y)
function Controls({ autoRotate }: { autoRotate: boolean }) {
  const ref = useRef<OrbitControlsImpl>(null);
  useFrame(() => {
    const el = ref.current?.domElement as HTMLElement | undefined;
    if (el && el.style.touchAction !== "pan-y") el.style.touchAction = "pan-y";
  });
  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enableDamping
      dampingFactor={0.055}
      rotateSpeed={0.55}
      enableZoom={false}
      enablePan={false}
      autoRotate={autoRotate}
      autoRotateSpeed={0.45}
      minPolarAngle={Math.PI * 0.3}
      maxPolarAngle={Math.PI * 0.64}
    />
  );
}

function Stats({ fpsRef }: { fpsRef: UniverseProps["fpsRef"] }) {
  const acc = useRef({ frames: 0, time: 0 });
  useFrame((_, dt) => {
    const a = acc.current;
    a.frames++;
    a.time += dt;
    if (a.time >= 0.5) {
      const fps = Math.round(a.frames / a.time);
      if (fpsRef.current) fpsRef.current.textContent = String(fps);
      (window as unknown as { __universeFps?: number }).__universeFps = fps;
      a.frames = 0;
      a.time = 0;
    }
  });
  return null;
}

// Dev-only hook so browser tests can find node screen positions.
function TestHook({ setQuality }: { setQuality: (q: "high" | "low") => void }) {
  const { camera, scene, gl } = useThree();
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const v = new THREE.Vector3();
    const w = window as unknown as { __universe?: unknown };
    w.__universe = {
      nodes: () =>
        PROJECTS.map((p) => {
          const o = scene.getObjectByName(`project-${p.id}`);
          if (!o) return null;
          o.getWorldPosition(v).project(camera);
          const r = gl.domElement.getBoundingClientRect();
          return { id: p.id, x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
        }),
      info: () => ({ ...gl.info.render, programs: gl.info.programs?.length }),
      three: { scene, camera, gl },
      setQuality,
    };
    return () => {
      delete w.__universe;
    };
  }, [camera, scene, gl, setQuality]);
  return null;
}

// Chain: DOF → selective bloom (only HDR emissives > 1.0 pass the threshold)
// → ACES Filmic → contrast/saturation grade → vignette.
function Effects({ quality, mobile }: { quality: "high" | "low"; mobile: boolean }) {
  const grade = useMemo(() => new GradeEffect(), []);
  useEffect(() => () => grade.dispose(), [grade]);
  return (
    // multisampling stays fixed: changing it rebuilds the composer and recompiles every post shader
    <EffectComposer multisampling={mobile ? 0 : 2} enableNormalPass={false}>
      <DepthOfField
        worldFocusDistance={FOCUS_DIST}
        worldFocusRange={6}
        bokehScale={quality === "high" ? (mobile ? 1.6 : 3) : 1.2}
        resolutionScale={0.5}
      />
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.15} intensity={1.15} radius={0.72} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <primitive object={grade} />
      <Vignette offset={0.28} darkness={0.72} />
    </EffectComposer>
  );
}

// Studio reflections baked once with PMREMGenerator (replaces drei <Environment>
// children, which rebuilt a cube camera inside the first render frame), then
// every scene shader is compiled with compileAsync — KHR_parallel_shader_compile
// lets the driver build programs off the main thread instead of freezing the page.
function BakedEnv({ onReady }: { onReady: () => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    const env = new THREE.Scene();
    const add = (geo: THREE.BufferGeometry, color: string, k: number, pos: number[], rot: number[]) => {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.fromArray(pos);
      m.rotation.set(rot[0], rot[1], rot[2]);
      env.add(m);
    };
    add(new THREE.PlaneGeometry(10, 3), "#ffffff", 4, [0, 5, -2], [Math.PI / 2, 0, 0]);
    add(new THREE.PlaneGeometry(6, 2), "#7cc7e8", 2.6, [-6, 1, 2], [0, Math.PI / 2, 0]);
    add(new THREE.PlaneGeometry(6, 2), "#f5b544", 2.2, [6, -1, 2], [0, -Math.PI / 2, 0]);
    add(new THREE.RingGeometry(1.5, 3, 48), "#ffffff", 3, [0, 0, 8], [0, 0, 0]);
    const pmrem = new THREE.PMREMGenerator(gl);
    const rt = pmrem.fromScene(env, 0.02);
    pmrem.dispose();
    env.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      }
    });
    scene.environment = rt.texture;
    let live = true;
    gl.compileAsync(scene, camera)
      .catch(() => undefined)
      .then(() => live && onReady());
    return () => {
      live = false;
      scene.environment = null;
      rt.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);
  return null;
}

// Calls onDone once after n rendered frames.
function AfterFrames({ n, onDone }: { n: number; onDone: () => void }) {
  const count = useRef(0);
  useFrame(() => {
    if (++count.current === n) onDone();
  });
  return null;
}

function Scene({ active, hovered, focusGroup, setActive, setHovered, fpsRef, quality, mobile, setQuality, onEnvReady, fx, onWarm }: UniverseProps & {
  quality: "high" | "low";
  mobile: boolean;
  setQuality: (q: "high" | "low") => void;
  onEnvReady: () => void;
  fx: boolean;
  onWarm: () => void;
}) {
  const [ripples, setRipples] = useState<RippleData[]>([]);
  const nextId = useRef(0);
  const spawn = useCallback(
    (point: THREE.Vector3, color: string) =>
      setRipples((r) => [...r.slice(-4), { id: nextId.current++, point: point.clone(), color }]),
    []
  );
  const remove = useCallback((id: number) => setRipples((r) => r.filter((x) => x.id !== id)), []);

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 11, 24]} />
      <ambientLight intensity={0.12} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} color="#dff3ff" />
      <PointerLight />

      <BakedEnv onReady={onEnvReady} />

      <ViewRig />
      <ClusterRig>
        <Core onSelect={() => setActive(null)} onRipple={spawn} />
        <OrbitRings />
        {PROJECTS.map((p, i) => (
          <ProjectNode
            key={p.id}
            index={i}
            active={active}
            hovered={hovered}
            setActive={setActive}
            setHovered={setHovered}
            onRipple={spawn}
          />
        ))}
        <SkillField focusGroup={focusGroup} />
      </ClusterRig>
      <Dust count={mobile ? 120 : 260} />
      {ripples.map((r) => (
        <Ripple key={r.id} data={r} onDone={remove} />
      ))}

      <Controls autoRotate={!active && !hovered} />
      <Stats fpsRef={fpsRef} />
      <TestHook setQuality={setQuality} />
      {fx && <Effects quality={quality} mobile={mobile} />}
      {/* keyed so the count restarts once post-processing joins */}
      <AfterFrames key={fx ? "fx" : "base"} n={3} onDone={onWarm} />
    </>
  );
}

export default function UniverseCanvas(props: UniverseProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [quality, setQuality] = useState<"high" | "low">("high");
  const [mobile, setMobile] = useState(false);
  const [maxDpr, setMaxDpr] = useState(1);

  // Pixel budget: the post chain is fill-rate bound, so cap the drawing buffer
  // at ~1080p worth of pixels (≈0.9 MP on phones) instead of trusting raw DPR.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => {
      const m = mq.matches;
      setMobile(m);
      const budget = m ? 0.9e6 : 2.1e6;
      const css = window.innerWidth * window.innerHeight;
      setMaxDpr(Math.min(window.devicePixelRatio || 1, m ? 1.5 : 1.75, Math.sqrt(budget / css)));
    };
    update();
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Stop rendering entirely once the hero scrolls out of view.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Staged boot so the page never freezes on load:
  // 1) wait until the headline entrance has played and the browser is idle,
  // 2) mount the canvas paused, bake reflections, compile shaders asynchronously,
  // 3) start rendering, then add post-processing a few frames later,
  // 4) fade the finished scene in.
  const [boot, setBoot] = useState(false);
  const [live, setLive] = useState(false);
  const [fx, setFx] = useState(false);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const t = setTimeout(() => (w.requestIdleCallback ? w.requestIdleCallback(() => setBoot(true), { timeout: 700 }) : setBoot(true)), 850);
    return () => clearTimeout(t);
  }, []);
  const onWarm = useCallback(() => {
    if (!fx) setTimeout(() => setFx(true), 16);
    else setShown(true);
  }, [fx]);

  return (
    <div
      ref={wrap}
      data-testid="universe-canvas"
      data-ready={shown ? "1" : "0"}
      className="absolute inset-x-0 top-0 z-0 h-[100svh] lg:inset-0 lg:h-auto"
      style={{ opacity: shown ? 1 : 0, transition: "opacity 0.9s cubic-bezier(0.2, 0.7, 0.2, 1)" }}
    >
      {boot && (
        <Canvas
          dpr={quality === "high" ? maxDpr : maxDpr * 0.8}
          frameloop={live && visible ? "always" : "never"}
          camera={{ position: CAM_POS, fov: 40, near: 0.1, far: 60 }}
          gl={{ antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" }}
        >
          {shown && (
            <PerformanceMonitor
              onDecline={() => setQuality("low")}
              onIncline={() => setQuality("high")}
              onFallback={() => setQuality("low")}
              flipflops={3}
            />
          )}
          <Scene
            {...props}
            quality={quality}
            mobile={mobile}
            setQuality={setQuality}
            onEnvReady={() => setLive(true)}
            fx={fx}
            onWarm={onWarm}
          />
        </Canvas>
      )}
    </div>
  );
}
