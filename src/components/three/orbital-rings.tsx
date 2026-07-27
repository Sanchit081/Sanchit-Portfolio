"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 600;

interface OrbitalRingProps {
  radius?: number;
  tilt?: number;
  speed?: number;
  color?: string;
  particleSize?: number;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export function OrbitalRing({
  radius = 2.2,
  tilt = 0,
  speed = 0.3,
  color = "#2563eb",
  particleSize = 1.5,
}: OrbitalRingProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const basePositionsRef = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT));
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const basePositions = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
      const r = radius + (seededRandom(i * 3.7) - 0.5) * 0.12;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = (seededRandom(i * 5.3) - 0.5) * 0.04;
      positions[i * 3 + 2] = Math.sin(angle) * r;
      sizes[i] = particleSize * (0.5 + seededRandom(i * 2.1) * 0.5);
      basePositions[i] = angle;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    geometryRef.current = geo;
    basePositionsRef.current = basePositions;

    if (pointsRef.current) {
      pointsRef.current.geometry = geo;
    }

    return () => {
      geo.dispose();
      geometryRef.current = null;
    };
  }, [radius, particleSize]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    pointsRef.current.rotation.y = t * speed;
    pointsRef.current.rotation.x = tilt;

    const geo = geometryRef.current;
    if (!geo) return;

    const positions = geo.attributes.position.array as Float32Array;
    const basePos = basePositionsRef.current;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const baseAngle = basePos[i];
      const wobble = Math.sin(t * 2 + baseAngle * 5) * 0.015;
      positions[i * 3 + 1] = wobble;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        color={color}
        size={particleSize}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function OrbitalRingSystem() {
  return (
    <group>
      <OrbitalRing
        radius={2.2}
        tilt={Math.PI * 0.08}
        speed={0.25}
        color="#2563eb"
        particleSize={1.2}
      />
      <OrbitalRing
        radius={2.6}
        tilt={Math.PI * 0.35}
        speed={-0.18}
        color="#7c3aed"
        particleSize={1.0}
      />
      <OrbitalRing
        radius={1.8}
        tilt={Math.PI * 0.52}
        speed={0.32}
        color="#0891b2"
        particleSize={0.9}
      />
    </group>
  );
}
