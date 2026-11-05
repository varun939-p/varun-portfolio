"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Html, useCursor } from "@react-three/drei";
import * as THREE from "three";
import { LAYERS } from "../Universe/data";
import { layerDetail, openDetail } from "./detail";
import { Burst, DragOrbit, Spring, Warmup, tapOrigin, type BurstHandle } from "./fx3d";

// A stacked AI core: four layers (Data → API → AI → Ship). Every effect runs
// on the GPU with additive blending (no post-processing), so it stays at 60 fps
// on integrated graphics:
//   • radar-sweep scanner shader on each layer, with a ripple where you hover
//   • comet-tailed signals flowing up the wires (one draw call, no CPU per frame)
//   • dashes of light streaming along every wire
//   • a breathing fresnel "neural core" on the AI layer, a light beam, rising data
const Y = [-1.65, -0.55, 0.55, 1.65];
const R = [1.85, 1.5, 1.5, 1.85];
const PER = 10;
const TAIL = 7;

const nodePos = (l: number, i: number) => {
  const a = (i / PER) * Math.PI * 2 + l * 0.35;
  return new THREE.Vector3(Math.cos(a) * R[l], Y[l], Math.sin(a) * R[l]);
};

const SOFT_DOT = /* glsl */ `
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float glow = smoothstep(0.5, 0.0, d);
  glow *= glow;
`;

// ── Layer disc: radar sweep, grid rings, hover ripple ──────────────────────
const discVert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const discFrag = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;
uniform float uHover;
uniform float uPhase;
uniform vec2 uHit;
uniform float uHitTime;
varying vec2 vUv;
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  if (r > 1.0) discard;
  float ang = atan(p.y, p.x) / 6.28318 + 0.5;
  float sweep = fract(ang - uTime * 0.14 + uPhase);
  float wedge = pow(sweep, 14.0) * smoothstep(1.0, 0.15, r);
  float grid = 1.0 - smoothstep(0.0, 0.035, abs(fract(r * 4.0) - 0.5) - 0.465);
  float rim = smoothstep(0.9, 1.0, r);
  float ht = uTime - uHitTime;
  float ripple = exp(-pow(distance(p, uHit) - ht * 1.7, 2.0) * 70.0) * exp(-ht * 1.6) * step(0.0, ht);
  float a = 0.03 + uHover * 0.07 + wedge * (0.32 + uHover * 0.35) + grid * (0.05 + uHover * 0.06) + rim * 0.1 + ripple * 0.9;
  gl_FragColor = vec4(uColor * (1.0 + wedge * 1.4 + ripple * 2.2), a);
}
`;

function LayerDisc({ l, hl, setHl, onHit }: { l: number; hl: number | null; setHl: (i: number | null) => void; onHit: (l: number, e: { point: THREE.Vector3; x: number; y: number }) => void }) {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(LAYERS[l].color) },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uPhase: { value: l * 0.27 },
      uHit: { value: new THREE.Vector2(9, 9) },
      uHitTime: { value: -10 },
    }),
    [l]
  );
  useFrame((s, dt) => {
    uniforms.uTime.value = s.clock.elapsedTime;
    uniforms.uHover.value = THREE.MathUtils.damp(uniforms.uHover.value, hl === l ? 1 : 0, 7, dt);
  });
  const ping = (uv?: THREE.Vector2) => {
    if (!uv) return;
    uniforms.uHit.value.set(uv.x * 2 - 1, uv.y * 2 - 1);
    uniforms.uHitTime.value = uniforms.uTime.value;
  };
  return (
    <mesh
      rotation-x={-Math.PI / 2}
      name={`layer-${l}`}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHl(l);
        ping(e.uv);
      }}
      onPointerOut={() => setHl(null)}
      onClick={(e) => {
        e.stopPropagation();
        if (e.delta > 6) return;
        ping(e.uv);
        onHit(l, { point: e.point, ...tapOrigin(e) });
      }}
    >
      <circleGeometry args={[R[l] + 0.25, 72]} />
      <shaderMaterial ref={mat} vertexShader={discVert} fragmentShader={discFrag} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

// ── Wires with light streaming along them ─────────────────────────────────
const wireVert = /* glsl */ `
attribute float lineDistance;
attribute vec3 aColor;
varying float vD;
varying vec3 vC;
void main() { vD = lineDistance; vC = aColor; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const wireFrag = /* glsl */ `
uniform float uTime;
varying float vD;
varying vec3 vC;
void main() {
  float f = fract(vD * 1.6 - uTime * 0.55);
  float a = 0.07 + smoothstep(0.78, 1.0, f) * 0.45;
  gl_FragColor = vec4(vC, a);
}
`;

// ── Comet pulses: head + fading tail, animated entirely in the shader ─────
const cometVert = /* glsl */ `
uniform float uTime;
attribute vec3 aStart;
attribute vec3 aEnd;
attribute float aPhase;
attribute float aSpeed;
attribute float aTail;
attribute vec3 aColor;
varying vec3 vC;
varying float vA;
void main() {
  float t = fract(aPhase + uTime * aSpeed) - aTail * 0.035;
  float live = step(0.0, t);
  vec3 p = mix(aStart, aEnd, clamp(t, 0.0, 1.0));
  float fade = 1.0 - aTail / ${TAIL.toFixed(1)};
  vC = aColor;
  vA = live * fade * sin(clamp(t, 0.0, 1.0) * 3.14159);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = live * (aTail < 0.5 ? 26.0 : 15.0 * fade + 3.0) * (1.0 / -mv.z) * 4.0;
  gl_Position = projectionMatrix * mv;
}
`;
const cometFrag = /* glsl */ `
varying vec3 vC;
varying float vA;
void main() {
  ${SOFT_DOT}
  gl_FragColor = vec4(vC * (1.0 + glow * 1.5), glow * vA);
}
`;

// ── Rising data motes around the stack ────────────────────────────────────
const moteVert = /* glsl */ `
uniform float uTime;
attribute float aSpeed;
attribute float aSeed;
varying float vA;
void main() {
  vec3 p = position;
  p.y = mod(p.y + uTime * aSpeed + 2.4, 4.8) - 2.4;
  float a = uTime * 0.15 + aSeed * 6.28;
  p.xz = mat2(cos(a * 0.1), -sin(a * 0.1), sin(a * 0.1), cos(a * 0.1)) * p.xz;
  vA = smoothstep(2.4, 1.6, abs(p.y)) * (0.35 + 0.65 * fract(aSeed * 7.3));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = (2.0 + fract(aSeed * 13.1) * 3.0) * (4.0 / -mv.z) * 2.0;
  gl_Position = projectionMatrix * mv;
}
`;
const moteFrag = /* glsl */ `
varying float vA;
void main() {
  ${SOFT_DOT}
  gl_FragColor = vec4(vec3(0.62, 0.86, 1.0), glow * vA);
}
`;

// ── Beam of light rising through the stack ────────────────────────────────
const beamFrag = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
float h(float n) { return fract(sin(n) * 43758.5453); }
void main() {
  float core = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 3.0);
  float bands = 0.55 + 0.45 * sin(vUv.y * 26.0 - uTime * 5.0);
  float ends = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
  gl_FragColor = vec4(vec3(0.75, 0.92, 1.0) * (1.0 + bands), core * bands * ends * 0.75);
}
`;

// ── Fresnel neural core (AI layer) ────────────────────────────────────────
const coreVert = /* glsl */ `
uniform float uTime;
varying vec3 vN;
varying vec3 vV;
void main() {
  vec3 p = position + normal * (sin(position.y * 9.0 + uTime * 2.4) * 0.025 + sin(position.x * 7.0 - uTime * 1.7) * 0.02);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;
const coreFrag = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;
varying vec3 vN;
varying vec3 vV;
void main() {
  float fres = pow(1.0 - max(dot(vN, vV), 0.0), 2.4);
  float pulse = 0.75 + 0.25 * sin(uTime * 2.2);
  gl_FragColor = vec4(uColor * (0.35 + fres * 2.2) * pulse, 0.25 + fres * 0.75);
}
`;

const glowTex = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.3, "rgba(255,255,255,0.35)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();

interface Props {
  visible: boolean;
  hl: number | null;
  setHl: (i: number | null) => void;
}

function Core({ hl, setHl }: Omit<Props, "visible">) {
  const tilt = useRef<THREE.Group>(null!);
  const spin = useRef<THREE.Group>(null!);
  const nodes = useRef<THREE.InstancedMesh>(null!);
  const burst = useRef<BurstHandle>(null);
  const springs = useMemo(() => LAYERS.map(() => new Spring(1, 160, 12)), []);
  const ringMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const narrow = useThree((s) => s.size.width < 560);
  const gl = useThree((s) => s.gl);
  useCursor(hl !== null);

  const pts = useMemo(() => LAYERS.map((_, l) => Array.from({ length: PER }, (_, i) => nodePos(l, i))), []);
  const edges = useMemo(() => {
    const e: [number, number, number][] = [];
    for (let l = 0; l < LAYERS.length - 1; l++)
      for (let i = 0; i < PER; i++) {
        e.push([l, i, i]);
        e.push([l, i, (i + 3) % PER]);
      }
    return e;
  }, []);

  // wires: per-vertex colour blends from the lower layer's colour to the upper's
  const wireGeo = useMemo(() => {
    const pos = new Float32Array(edges.length * 6);
    const col = new Float32Array(edges.length * 6);
    const dist = new Float32Array(edges.length * 2);
    const c = new THREE.Color();
    edges.forEach(([l, a, b], k) => {
      pts[l][a].toArray(pos, k * 6);
      pts[l + 1][b].toArray(pos, k * 6 + 3);
      c.set(LAYERS[l].color).toArray(col, k * 6);
      c.set(LAYERS[l + 1].color).toArray(col, k * 6 + 3);
      dist[k * 2] = 0;
      dist[k * 2 + 1] = pts[l][a].distanceTo(pts[l + 1][b]);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    g.setAttribute("lineDistance", new THREE.BufferAttribute(dist, 1));
    return g;
  }, [edges, pts]);

  // comets: one per wire, TAIL samples each, all animated in the vertex shader
  const cometGeo = useMemo(() => {
    const n = edges.length * TAIL;
    const start = new Float32Array(n * 3);
    const end = new Float32Array(n * 3);
    const phase = new Float32Array(n);
    const speed = new Float32Array(n);
    const tail = new Float32Array(n);
    const col = new Float32Array(n * 3);
    const c = new THREE.Color();
    edges.forEach(([l, a, b], k) => {
      const ph = Math.random();
      const sp = 0.32 + Math.random() * 0.22;
      c.set(LAYERS[l + 1].color);
      for (let t = 0; t < TAIL; t++) {
        const i = k * TAIL + t;
        pts[l][a].toArray(start, i * 3);
        pts[l + 1][b].toArray(end, i * 3);
        phase[i] = ph;
        speed[i] = sp;
        tail[i] = t;
        c.toArray(col, i * 3);
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(start.slice(), 3));
    g.setAttribute("aStart", new THREE.BufferAttribute(start, 3));
    g.setAttribute("aEnd", new THREE.BufferAttribute(end, 3));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    g.setAttribute("aTail", new THREE.BufferAttribute(tail, 1));
    g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
    return g;
  }, [edges, pts]);

  const moteGeo = useMemo(() => {
    const n = 140;
    const pos = new Float32Array(n * 3);
    const sp = new Float32Array(n);
    const seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const r = 0.4 + Math.random() * 2.1;
      const a = Math.random() * Math.PI * 2;
      pos.set([Math.cos(a) * r, Math.random() * 4.8 - 2.4, Math.sin(a) * r], i * 3);
      sp[i] = 0.12 + Math.random() * 0.3;
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(sp, 1));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
    return g;
  }, []);

  const time = useMemo(() => ({ value: 0 }), []);
  const wireU = useMemo(() => ({ uTime: time }), [time]);
  const cometU = useMemo(() => ({ uTime: time }), [time]);
  const moteU = useMemo(() => ({ uTime: time }), [time]);
  const beamU = useMemo(() => ({ uTime: time }), [time]);
  const coreU = useMemo(() => ({ uTime: time, uColor: { value: new THREE.Color(LAYERS[2].color) } }), [time]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);

  // node colours + hover scale (only when the highlight changes)
  useLayoutEffect(() => {
    let k = 0;
    LAYERS.forEach((L, l) =>
      pts[l].forEach((p) => {
        dummy.position.copy(p);
        dummy.scale.setScalar(hl === l ? 1.8 : 1);
        dummy.updateMatrix();
        nodes.current.setMatrixAt(k, dummy.matrix);
        nodes.current.setColorAt(k, col.set(L.color).multiplyScalar(hl === null || hl === l ? 1.6 : 0.45));
        k++;
      })
    );
    nodes.current.instanceMatrix.needsUpdate = true;
    if (nodes.current.instanceColor) nodes.current.instanceColor.needsUpdate = true;
  }, [hl, pts, dummy, col]);

  useFrame((s, dt) => {
    time.value = s.clock.elapsedTime;
    spin.current.rotation.y += dt * 0.16;
    // scroll-linked tilt: the stack leans toward you as the section scrolls past
    const r = gl.domElement.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const prog = THREE.MathUtils.clamp((vh - r.top) / (vh + r.height), 0, 1);
    tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, -0.18 + prog * 0.36, 4, dt);
    springs.forEach((sp, l) => {
      sp.target = hl === l ? 1.06 : 1;
      const k = sp.step(dt);
      const ring = spin.current.children[l] as THREE.Object3D | undefined;
      if (ring) ring.scale.setScalar(k);
      const m = ringMats.current[l];
      if (m) m.opacity = hl === null || hl === l ? 0.95 : 0.3;
    });
  });

  const open = (l: number, e: { point: THREE.Vector3; x: number; y: number }) => {
    springs[l].kick(4);
    burst.current?.fire(e.point, LAYERS[l].color);
    openDetail(layerDetail(l, { x: e.x, y: e.y }));
  };

  return (
    <group ref={tilt}>
      <group ref={spin}>
        {LAYERS.map((L, l) => (
          <group key={L.name} position-y={Y[l]}>
            <mesh rotation-x={Math.PI / 2}>
              <torusGeometry args={[R[l], 0.012, 8, 160]} />
              <meshBasicMaterial
                ref={(m) => {
                  ringMats.current[l] = m;
                }}
                color={new THREE.Color(L.color).multiplyScalar(1.5)}
                toneMapped={false}
                transparent
              />
            </mesh>
            <LayerDisc l={l} hl={hl} setHl={setHl} onHit={open} />
            {l === 2 ? (
              <mesh>
                <icosahedronGeometry args={[0.3, 5]} />
                <shaderMaterial vertexShader={coreVert} fragmentShader={coreFrag} uniforms={coreU} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
              </mesh>
            ) : (
              <mesh>
                <sphereGeometry args={[0.1, 20, 16]} />
                <meshBasicMaterial color={new THREE.Color(L.color).multiplyScalar(2)} toneMapped={false} />
              </mesh>
            )}
            {/* fake bloom: additive glow sprite at each layer hub */}
            <sprite scale={l === 2 ? 1.9 : 0.9}>
              <spriteMaterial map={glowTex} color={L.color} transparent opacity={l === 2 ? 0.55 : 0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
            </sprite>
          </group>
        ))}
        <lineSegments geometry={wireGeo}>
          <shaderMaterial vertexShader={wireVert} fragmentShader={wireFrag} uniforms={wireU} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </lineSegments>
        <instancedMesh ref={nodes} args={[undefined, undefined, PER * LAYERS.length]}>
          <sphereGeometry args={[0.062, 14, 10]} />
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
        <points geometry={cometGeo} frustumCulled={false}>
          <shaderMaterial vertexShader={cometVert} fragmentShader={cometFrag} uniforms={cometU} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
      </group>
      <Billboard lockX lockZ>
        <mesh>
          <planeGeometry args={[0.42, 4.6]} />
          <shaderMaterial vertexShader={discVert} fragmentShader={beamFrag} uniforms={beamU} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </Billboard>
      <points geometry={moteGeo} frustumCulled={false}>
        <shaderMaterial vertexShader={moteVert} fragmentShader={moteFrag} uniforms={moteU} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {LAYERS.map((L, l) => (
        <Html
          key={L.name}
          // phones: pin labels to the front of each ring so they never leave the canvas
          position={narrow ? [0, Y[l] - 0.08, R[l] + 0.1] : [R[l] + 0.45, Y[l], 0]}
          center={narrow}
          zIndexRange={[20, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-md transition-all duration-300 ${hl === l ? "scale-110 text-white" : "text-slate-300"}`}
            style={{ borderColor: `${L.color}66`, background: hl === l ? `${L.color}33` : "rgba(0,0,0,0.45)" }}
          >
            {l + 1}. {L.name}
          </div>
        </Html>
      ))}
      <Burst ref={burst} />
    </group>
  );
}

export default function AICore3D({ visible, hl, setHl }: Props) {
  const [ready, setReady] = useState(false);
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={ready && visible ? "always" : "never"}
      style={{ opacity: ready ? 1 : 0, transition: "opacity 0.9s ease" }}
      camera={{ position: [0, 2.5, 8.4], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Core hl={hl} setHl={setHl} />
      <DragOrbit minPolar={0.25} maxPolar={0.55} />
      <Warmup onReady={() => setReady(true)} />
    </Canvas>
  );
}
