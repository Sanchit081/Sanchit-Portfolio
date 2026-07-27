"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function CoreSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
  });

  return (
    <mesh ref={meshRef} scale={0.32}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshStandardMaterial color="#1e293b" emissive="#111827" emissiveIntensity={0.08} />
    </mesh>
  );
}

function WireframeShell() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.x = t * 0.12;
    groupRef.current.rotation.y = t * 0.18;
  });

  return (
    <group ref={groupRef}>
      <mesh scale={0.82}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial
          color="#64748b"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>
      <mesh scale={0.92}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#94a3b8"
          wireframe
          transparent
          opacity={0.05}
        />
      </mesh>
    </group>
  );
}

function MinimalRings() {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ringsRef.current) return;
    const t = state.clock.elapsedTime;
    ringsRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const scale = 1.0 + Math.sin(t * 0.35 + i * 0.8) * 0.02;
      mesh.scale.set(scale, scale, scale);
      mesh.rotation.z = t * 0.04 * (i % 2 === 0 ? 1 : -1);
    });
  });

  return (
    <group ref={ringsRef}>
      {[1.05, 1.2].map((radius, i) => (
        <mesh key={i}>
          <torusGeometry args={[radius, 0.006, 8, 64]} />
          <meshBasicMaterial color="#64748b" transparent opacity={0.1} />
        </mesh>
      ))}
    </group>
  );
}

export function EnergyCore() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.06;
  });

  return (
    <Float speed={0.6} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={groupRef}>
        <CoreSphere />
        <WireframeShell />
        <MinimalRings />
      </group>
    </Float>
  );
}
