"use client";

import { useMemo, useRef, useState } from "react";
import { Warmup } from "./fx3d";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// A 14k-point GPU wave field. The surface swells under the cursor and every
// tap sends a shockwave ring across it. All motion runs in the vertex shader.
const vert = /* glsl */ `
uniform float uTime;
uniform vec2 uPointer;
uniform float uHover;
uniform vec2 uClick;
uniform float uClickTime;
varying float vH;
varying float vRing;
varying float vFade;
void main() {
  vec3 p = position;
  float w = sin(p.x * 0.35 + uTime * 0.8) * 0.32
          + cos(p.z * 0.45 + uTime * 0.6) * 0.28
          + sin((p.x + p.z) * 0.2 + uTime * 0.4) * 0.22;
  float d = distance(p.xz, uPointer);
  w += uHover * exp(-d * d * 0.12) * 1.1;
  float ct = uTime - uClickTime;
  float cd = distance(p.xz, uClick);
  float ring = exp(-pow(cd - ct * 7.0, 2.0) * 0.5) * exp(-ct * 0.8) * step(0.0, ct);
  w += ring * 1.5;
  p.y += w;
  vH = w;
  vRing = ring;
  vFade = 1.0 - smoothstep(9.0, 19.0, length(p.xz));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = (1.6 + ring * 3.0 + uHover * exp(-d * d * 0.12) * 1.5) * (42.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;
const frag = /* glsl */ `
uniform vec3 uA;
uniform vec3 uB;
varying float vH;
varying float vRing;
varying float vFade;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = dot(c, c);
  if (r > 0.25) discard;
  float a = smoothstep(0.25, 0.0, r);
  vec3 col = mix(uA, uB, clamp(vH * 0.55 + 0.5, 0.0, 1.0)) + vRing * vec3(0.9);
  gl_FragColor = vec4(col, a * vFade * (0.6 + vRing));
}
`;

function Field() {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(40, 24, 170, 100);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uHover: { value: 0 },
      uClick: { value: new THREE.Vector2(0, 0) },
      uClickTime: { value: -100 },
      uA: { value: new THREE.Color("#14325a") },
      uB: { value: new THREE.Color("#9fd8f0") },
    }),
    []
  );
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector2(), []);
  const lastPointer = useRef({ x: 9, y: 9, idle: 0 });

  useFrame((s, dt) => {
    const u = uniforms;
    u.uTime.value = s.clock.elapsedTime;
    s.raycaster.setFromCamera(s.pointer, s.camera);
    const lp = lastPointer.current;
    const moved = lp.x !== s.pointer.x || lp.y !== s.pointer.y;
    lp.x = s.pointer.x;
    lp.y = s.pointer.y;
    lp.idle = moved ? 0 : lp.idle + dt;
    if (s.raycaster.ray.intersectPlane(plane, hit)) target.set(hit.x, hit.z);
    u.uPointer.value.lerp(target, 1 - Math.exp(-dt * 8));
    u.uHover.value = THREE.MathUtils.damp(u.uHover.value, lp.idle < 1.5 ? 1 : 0, 4, dt);
  });

  return (
    <>
      {/* invisible catch-plane: one cheap triangle test per tap instead of raycasting 17k points */}
      <mesh
        rotation-x={-Math.PI / 2}
        name="wave-hit"
        onPointerDown={(e) => {
          uniforms.uClick.value.set(e.point.x, e.point.z);
          uniforms.uClickTime.value = uniforms.uTime.value;
        }}
      >
        <planeGeometry args={[60, 40]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      <points geometry={geo}>
      <shaderMaterial
        ref={mat}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
      </points>
    </>
  );
}

export default function ContactWave3D({ visible }: { visible: boolean }) {
  const [ready, setReady] = useState(false);
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={ready && visible ? "always" : "never"}
      camera={{ position: [0, 5.5, 11], fov: 50 }}
      onCreated={({ camera }) => camera.lookAt(0, -1, 0)}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y", opacity: ready ? 1 : 0, transition: "opacity 1.2s ease" }}
    >
      <Field />
      <Warmup onReady={() => setReady(true)} />
    </Canvas>
  );
}
