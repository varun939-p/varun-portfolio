"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  Html,
} from "@react-three/drei";
import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import * as THREE from "three";

// ─── Global Mouse Coordinates Tracker (Smooth NDC, No Re-renders) ────────────
const mouse = { x: 0, y: 0 };

if (typeof window !== "undefined") {
  window.addEventListener(
    "mousemove",
    (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    },
    { passive: true }
  );
}

// ─── Camera Parallax Rig with Architectural Easing ───────────────────────────
function CameraRig() {
  const { camera, size } = useThree();
  const lerpX = useRef(0);
  const lerpY = useRef(0);
  const lerpZ = useRef(9.5);

  useFrame(() => {
    const isMobile = size.width < 768;
    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const maxScroll = typeof window !== "undefined" ? (document.documentElement.scrollHeight - window.innerHeight || 1) : 1;
    const scrollProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

    const targetX = isMobile ? 0 : mouse.x * 0.7;
    const targetY = isMobile ? -scrollProgress * 2.0 : mouse.y * 0.45 - scrollProgress * 2.6;
    const targetZ = 9.5 + scrollProgress * 2.0;

    lerpX.current = THREE.MathUtils.lerp(lerpX.current, targetX, 0.035);
    lerpY.current = THREE.MathUtils.lerp(lerpY.current, targetY, 0.035);
    lerpZ.current = THREE.MathUtils.lerp(lerpZ.current, targetZ, 0.035);

    (camera as THREE.PerspectiveCamera).position.x = lerpX.current;
    (camera as THREE.PerspectiveCamera).position.y = lerpY.current;
    (camera as THREE.PerspectiveCamera).position.z = lerpZ.current;
    camera.lookAt(0, -scrollProgress * 1.0, 0);
  });

  return null;
}

// ─── Dynamic Mouse Follow Light (Focused, non-distracting specular highlight) ─
function MouseLight() {
  const lightRef = useRef<THREE.PointLight>(null!);

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, mouse.x * 6, 0.06);
      lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, mouse.y * 5, 0.06);
    }
  });

  return (
    <pointLight
      ref={lightRef}
      intensity={3.8}
      distance={16}
      color="#00e5ff"
      position={[0, 0, 4.5]}
    />
  );
}

// ─── Custom GLSL Shader for Architectural Telemetry Core ─────────────────────
const telemetryVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uHover;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    
    vec3 pos = position;
    // Harmonic wave representing live telemetry data stream processing
    float wave = sin(pos.x * 2.5 + uTime * 1.4) * cos(pos.y * 2.5 + uTime * 1.1) * 0.022 * (1.0 + uHover * 1.2);
    pos += normal * wave;
    
    vPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const telemetryFragShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uHover;
  uniform vec3 uColor1;
  uniform vec3 uColor2;

  void main() {
    // Sharp Fresnel rim edge for high-end PBR cyber appearance
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.8);
    
    // Dynamic color gradient flow
    float t = uTime * 0.35;
    vec3 colorA = mix(uColor1, uColor2, 0.5 + 0.5 * sin(t));
    
    // Controlled grid pulse lines
    float pulse = sin(vUv.x * 32.0 + uTime * 1.8) * 0.5 + 0.5;
    pulse *= sin(vUv.y * 32.0 - uTime * 1.4) * 0.5 + 0.5;
    pulse = pow(pulse, 4.0) * 0.22;
    
    vec3 finalColor = colorA * (fresnel * 1.8 + 0.25) + vec3(pulse);
    float alpha = fresnel * 0.85 + 0.12 + uHover * 0.15;
    
    gl_FragColor = vec4(finalColor + vec3(uHover * 0.25), alpha);
  }
`;

// ─── Telemetry Conduit Ring with Traveling High-Speed Data Pulses ───────────
function TelemetryRing({
  radius,
  color,
  speed,
  tiltX = 0,
  tiltZ = 0,
  thickness = 0.016,
}: {
  radius: number;
  color: string;
  speed: number;
  tiltX?: number;
  tiltZ?: number;
  thickness?: number;
}) {
  const ringRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    if (ringRef.current) {
      ringRef.current.rotation.y = t;
      ringRef.current.rotation.x = tiltX + Math.sin(t * 0.3) * 0.05;
      ringRef.current.rotation.z = tiltZ + Math.cos(t * 0.25) * 0.04;
    }
  });

  return (
    <group ref={ringRef}>
      {/* Physical Conduit Ring */}
      <mesh>
        <torusGeometry args={[radius, thickness, 6, 200]} />
        <meshBasicMaterial color={color} transparent opacity={0.65} toneMapped={false} />
      </mesh>
      {/* Outer Halo */}
      <mesh>
        <torusGeometry args={[radius, thickness * 3.0, 4, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.06} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ─── Orbiting Data Stream Packet ─────────────────────────────────────────────
function DataPacketOrbit({
  radius,
  speed,
  color,
  size = 0.08,
  yAmplitude = 0.25,
}: {
  radius: number;
  speed: number;
  color: string;
  size?: number;
  yAmplitude?: number;
}) {
  const packetRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    if (packetRef.current) {
      packetRef.current.position.set(
        Math.cos(t) * radius,
        Math.sin(t * 2.0) * yAmplitude,
        Math.sin(t) * radius
      );
    }
  });

  return (
    <mesh ref={packetRef}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={3.5}
        roughness={0}
        metalness={1}
        toneMapped={false}
      />
    </mesh>
  );
}

// ─── Central Architectural Tech Core: Quantum Processor ───────────────────────
function QuantumProcessorCore() {
  const { size } = useThree();
  const isMobile = size.width < 768;
  const isTablet = size.width >= 768 && size.width < 1024;

  const coreGroup = useRef<THREE.Group>(null!);
  const knotRef = useRef<THREE.Mesh>(null!);
  const cageRef = useRef<THREE.Mesh>(null!);
  const plasmaRef = useRef<THREE.Mesh>(null!);
  const innerSphereRef = useRef<THREE.Mesh>(null!);
  const shaderRef = useRef<THREE.ShaderMaterial>(null!);

  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const scaleRef = useRef(1);
  const hoverRef = useRef(0);

  // Position: perfectly framed on the right side of desktop, centered on mobile
  const corePos: [number, number, number] = isMobile
    ? [0, -0.4, -2]
    : isTablet
    ? [1.3, 0, -1]
    : [2.2, 0, 0];

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uHover: { value: 0 },
    uColor1: { value: new THREE.Color("#00d2ff") },
    uColor2: { value: new THREE.Color("#9d50bb") },
  }), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Smooth hover zoom: NO ROTATION FLIP, PURE ELEGANT SCALE (1.0 -> 1.12)
    const targetHover = hovered ? 1.0 : 0.0;
    hoverRef.current = THREE.MathUtils.lerp(hoverRef.current, targetHover, 0.06);

    const targetScale = 1.0 + hoverRef.current * 0.12;
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, 0.06);
    if (coreGroup.current) coreGroup.current.scale.setScalar(scaleRef.current);

    // Continuous, graceful rotation
    if (knotRef.current) {
      knotRef.current.rotation.x = t * 0.08 + mouse.y * 0.1;
      knotRef.current.rotation.y = t * 0.12 + mouse.x * 0.1;
      knotRef.current.rotation.z = t * 0.04;
    }

    if (cageRef.current) {
      cageRef.current.rotation.x = -t * 0.06 + mouse.y * 0.05;
      cageRef.current.rotation.y = -t * 0.09;
      cageRef.current.rotation.z = t * 0.03;
    }

    if (plasmaRef.current) {
      const pulse = 1 + Math.sin(t * 3.5) * 0.12 + hoverRef.current * 0.08;
      plasmaRef.current.scale.setScalar(pulse);
    }

    if (innerSphereRef.current) {
      innerSphereRef.current.rotation.y = t * 0.25;
      innerSphereRef.current.rotation.x = t * 0.18;
    }

    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = t;
      shaderRef.current.uniforms.uHover.value = hoverRef.current;
    }
  });

  return (
    <group position={corePos}>
      <group ref={coreGroup}>
        {/* Core Manifold with Custom Shader */}
        <mesh ref={knotRef}>
          <torusKnotGeometry args={[1.16, 0.38, 280, 34, 2, 3]} />
          <shaderMaterial
            ref={shaderRef}
            vertexShader={telemetryVertexShader}
            fragmentShader={telemetryFragShader}
            uniforms={uniforms}
            transparent
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>

        {/* Outer Cyber Architecture Lattice */}
        <mesh ref={cageRef}>
          <torusKnotGeometry args={[1.36, 0.42, 150, 20, 2, 3]} />
          <meshBasicMaterial color="#00d2ff" wireframe transparent opacity={0.12} toneMapped={false} />
        </mesh>

        {/* Inner Pulsing Telemetry Singularity */}
        <mesh ref={plasmaRef}>
          <sphereGeometry args={[0.5, 40, 40]} />
          <meshStandardMaterial
            color="#00f5ff"
            emissive="#00f5ff"
            emissiveIntensity={4.2}
            roughness={0}
            metalness={1}
            toneMapped={false}
          />
        </mesh>

        {/* Inner Distort Manifold (drei) */}
        <mesh ref={innerSphereRef}>
          <sphereGeometry args={[0.82, 40, 40]} />
          <MeshDistortMaterial
            color="#080816"
            emissive="#7c3aed"
            emissiveIntensity={0.5}
            distort={0.3}
            speed={2.5}
            roughness={0.06}
            metalness={0.96}
            toneMapped={false}
          />
        </mesh>

        {/* 3 Concentric Telemetry Conduits */}
        <TelemetryRing radius={2.3} color="#00d2ff" speed={0.38} tiltX={0.7} tiltZ={0.3} thickness={0.016} />
        <TelemetryRing radius={2.9} color="#9d50bb" speed={-0.28} tiltX={1.2} tiltZ={0.6} thickness={0.014} />
        <TelemetryRing radius={3.55} color="#3b82f6" speed={0.22} tiltX={0.4} tiltZ={1.1} thickness={0.01} />

        {/* Orbiting Data Packets */}
        <DataPacketOrbit radius={2.3} speed={0.85} color="#00d2ff" size={0.08} />
        <DataPacketOrbit radius={2.9} speed={-0.65} color="#c084fc" size={0.09} yAmplitude={0.42} />
        <DataPacketOrbit radius={3.55} speed={0.42} color="#60a5fa" size={0.07} yAmplitude={0.3} />

        {/* INVISIBLE HIT SPHERE: Guarantees ZERO-FLICKER hover detection */}
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            setClicked(true);
            setTimeout(() => setClicked(false), 2600);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            if (typeof document !== "undefined") document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(false);
            if (typeof document !== "undefined") document.body.style.cursor = "auto";
          }}
        >
          <sphereGeometry args={[2.6, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Interactive 3D System Badge on Click */}
        {clicked && (
          <Html position={[0, 2.5, 0]} center distanceFactor={7} className="pointer-events-none select-none">
            <div className="px-4 py-2 rounded-xl bg-[#090d18]/95 backdrop-blur-xl border border-cyan shadow-[0_0_30px_rgba(0,240,255,0.7)] text-xs font-mono text-cyan flex items-center gap-2 whitespace-nowrap animate-bounce">
              <span className="w-2 h-2 rounded-full bg-cyan animate-ping" />
              <span>CORE ARCHITECTURE: ONLINE · P99 &lt;35ms</span>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

// ─── Distributed Microservice Node (Floating Data Crystal) ───────────────────
interface NodeProps {
  position: [number, number, number];
  color: string;
  type: "icosahedron" | "octahedron" | "dodecahedron";
  size?: number;
  speed?: number;
  label: string;
}

function ArchitectureNode({
  position,
  color,
  type,
  size = 0.25,
  speed = 0.55,
  label,
}: NodeProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  const basePos = useRef(new THREE.Vector3(...position));
  const [hovered, setHovered] = useState(false);
  const hoverRef = useRef(0);
  const scaleRef = useRef(1);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    const targetHover = hovered ? 1 : 0;
    hoverRef.current = THREE.MathUtils.lerp(hoverRef.current, targetHover, 0.08);

    if (groupRef.current) {
      groupRef.current.position.y = basePos.current.y + Math.sin(t) * 0.32;
      groupRef.current.position.x = basePos.current.x + Math.cos(t * 0.7) * 0.18;

      // Pure smooth zoom on hover, NO rotation jumping
      const targetScale = 1.0 + hoverRef.current * 0.28;
      scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, 0.08);
      groupRef.current.scale.setScalar(scaleRef.current);
    }

    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.55;
      meshRef.current.rotation.y = t * 0.75;
      meshRef.current.rotation.z = t * 0.35;
    }

    if (matRef.current) {
      const baseEmissive = 0.5 + Math.sin(t * 2.0) * 0.25;
      matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        matRef.current.emissiveIntensity,
        hovered ? baseEmissive + 1.2 : baseEmissive,
        0.1
      );
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={meshRef}>
        {type === "icosahedron" && <icosahedronGeometry args={[size, 1]} />}
        {type === "octahedron" && <octahedronGeometry args={[size, 0]} />}
        {type === "dodecahedron" && <dodecahedronGeometry args={[size, 0]} />}
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={0.55}
          metalness={0.94}
          roughness={0.07}
          toneMapped={false}
        />
      </mesh>
      {/* Outer subtle glow */}
      <mesh>
        {type === "icosahedron" && <icosahedronGeometry args={[size * 1.3, 1]} />}
        {type === "octahedron" && <octahedronGeometry args={[size * 1.3, 0]} />}
        {type === "dodecahedron" && <dodecahedronGeometry args={[size * 1.3, 0]} />}
        <meshBasicMaterial color={color} transparent opacity={0.06} toneMapped={false} />
      </mesh>
      {/* Invisible hit proxy sphere */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        <sphereGeometry args={[size * 2.4, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Floating Node Label on Hover */}
      {hovered && (
        <Html position={[0, size * 2.2, 0]} center distanceFactor={8} className="pointer-events-none select-none">
          <div className="px-3.5 py-1.5 rounded-lg bg-[#090d18]/95 border border-cyan/40 text-xs font-mono text-cyan whitespace-nowrap shadow-xl">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Subtle Ground Cybernetic Grid Floor (Architectural Studio) ──────────────
function CyberGridFloor() {
  const gridRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (gridRef.current) {
      gridRef.current.position.y = -7.5 + Math.sin(t * 0.2) * 0.1;
    }
  });

  const gridGeometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const gridSize = 20;
    const step = 2.0;
    const half = (gridSize / 2) * step;
    for (let i = 0; i <= gridSize; i++) {
      const pos = -half + i * step;
      pts.push(new THREE.Vector3(pos, 0, -half), new THREE.Vector3(pos, 0, half));
      pts.push(new THREE.Vector3(-half, 0, pos), new THREE.Vector3(half, 0, pos));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  return (
    <group ref={gridRef} position={[0, -7.5, 0]}>
      <lineSegments geometry={gridGeometry}>
        <lineBasicMaterial color="#00d2ff" transparent opacity={0.035} toneMapped={false} />
      </lineSegments>
    </group>
  );
}

// ─── Clean Architectural Studio Scene Assembly (NO SPACE, NO STARS) ───────────
function Scene() {
  return (
    <>
      <CameraRig />
      <MouseLight />

      {/* Architectural Studio Grid Floor */}
      <CyberGridFloor />

      {/* Central Quantum Architecture Core */}
      <Float speed={0.9} rotationIntensity={0.12} floatIntensity={0.45}>
        <QuantumProcessorCore />
      </Float>

      {/* Balanced Studio Lighting Rig — Crisp High-Contrast Reflections */}
      <ambientLight intensity={0.5} color="#081022" />
      <pointLight position={[6, 5, 5]} intensity={4.5} color="#00d2ff" distance={22} />
      <pointLight position={[-6, -4, -3]} intensity={3.5} color="#9d50bb" distance={20} />
      <pointLight position={[0, 8, -5]} intensity={2.8} color="#3b82f6" distance={22} />
      <pointLight position={[7, -5, 4]} intensity={2.0} color="#06b6d4" distance={18} />
      <pointLight position={[-8, 5, 5]} intensity={1.8} color="#c084fc" distance={18} />
      <directionalLight position={[0, 12, 6]} intensity={1.8} color="#ffffff" />
    </>
  );
}

// ─── Exported HeroCanvas Component ───────────────────────────────────────────
export default function HeroCanvas() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden bg-[#04060e]" />
    );
  }

  return (
    <div className="absolute inset-0 z-0 h-full w-full overflow-hidden pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 9.5], fov: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        style={{ pointerEvents: "auto" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}