"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Scene() {
  const coreRef = useRef<THREE.Mesh>(null!);
  const outerRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    coreRef.current.rotation.x = t * 0.15;
    coreRef.current.rotation.y = t * 0.2;
    outerRef.current.rotation.z = t * 0.1;
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Sphere ref={coreRef} args={[1.3, 64, 64]}>
          <MeshDistortMaterial
            color="#9d50bb"
            speed={3}
            distort={0.4}
            emissive="#6a11cb"
            emissiveIntensity={0.5}
          />
        </Sphere>
      </Float>
      
      <Float speed={4} rotationIntensity={0.5} floatIntensity={2}>
        <Sphere ref={outerRef} args={[2.4, 32, 32]}>
          <meshPhongMaterial
            wireframe
            color="#00d2ff"
            transparent
            opacity={0.1}
            emissive="#00d2ff"
            emissiveIntensity={0.3}
          />
        </Sphere>
      </Float>

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00d2ff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#9d50bb" />
    </group>
  );
}

export default function HeroCanvas() {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 75 }}>
        <Scene />
      </Canvas>
    </div>
  );
}