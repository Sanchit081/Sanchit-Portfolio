"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  Grid,
  MeshDistortMaterial,
  Sparkles,
  Stars,
} from "@react-three/drei";
import { MathUtils, type Group, type Mesh } from "three";
import { FloatingNode } from "./floating-node";
import type { AppId } from "@/types";

const DESKTOP_APPS: { id: AppId; label: string; angle: number; radius: number }[] = [
  { id: "projects", label: "Projects", angle: 0, radius: 3.2 },
  { id: "experience", label: "Experience", angle: Math.PI / 4, radius: 3.2 },
  { id: "terminal", label: "Terminal", angle: Math.PI / 2, radius: 3.2 },
  { id: "devops", label: "DevOps Lab", angle: (3 * Math.PI) / 4, radius: 3.2 },
  { id: "ai-assistant", label: "AI Assistant", angle: Math.PI, radius: 3.2 },
  { id: "arcade", label: "Arcade", angle: (5 * Math.PI) / 4, radius: 3.2 },
  { id: "about", label: "About", angle: (3 * Math.PI) / 2, radius: 3.2 },
  { id: "contact", label: "Contact", angle: (7 * Math.PI) / 4, radius: 3.2 },
];

interface HomeWorldProps {
  onOpenApp: (appId: AppId) => void;
  mouse: { x: number; y: number };
}

function CoreSphere() {
  const meshRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current || !glowRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x = t * 0.08 + 0.2;
    meshRef.current.rotation.y = t * 0.12 + 0.35;
    glowRef.current.rotation.x = t * 0.04;
    glowRef.current.rotation.y = -t * 0.06;
  });

  return (
    <Float speed={1.1} rotationIntensity={0.28} floatIntensity={0.24}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.1, 2]} />
        <MeshDistortMaterial
          color="#2563eb"
          emissive="#7c3aed"
          emissiveIntensity={0.25}
          roughness={0.1}
          metalness={0.6}
          distort={0.28}
          speed={1.8}
          transparent
          opacity={0.92}
        />
      </mesh>
      <mesh ref={glowRef}>
        <torusGeometry args={[1.55, 0.04, 16, 100]} />
        <meshStandardMaterial
          color="#0891b2"
          emissive="#0891b2"
          emissiveIntensity={0.7}
          transparent
          opacity={0.8}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.9, 0.028, 16, 100]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#7c3aed"
          emissiveIntensity={0.42}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

function CameraRig({ mouse }: { mouse: { x: number; y: number } }) {
  const { camera } = useThree();

  useFrame((state, delta) => {
    const targetX = mouse.x * 1.35;
    const targetY = mouse.y * 0.7 + 1.9;
    const parallax = Math.sin(state.clock.elapsedTime * 0.4) * 0.08;

    camera.position.x = MathUtils.damp(camera.position.x, targetX + parallax, 2.6, delta);
    camera.position.y = MathUtils.damp(camera.position.y, targetY + Math.sin(state.clock.elapsedTime * 0.25) * 0.04, 2.6, delta);
    camera.position.z = MathUtils.damp(camera.position.z, 6.2 + Math.abs(mouse.x) * 0.15, 2.4, delta);
    camera.lookAt(0, 0.18, 0);
  });

  return null;
}

export function HomeWorld({ onOpenApp, mouse }: HomeWorldProps) {
  const nodesRef = useRef<Group>(null);

  const nodeElements = useMemo(
    () =>
      DESKTOP_APPS.map((app, index) => {
        const angle = app.angle + (index % 2 === 0 ? 0.16 : -0.16);
        const radius = app.radius + (index % 2 === 0 ? 0.18 : -0.12);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(index * 0.85 + 0.4) * 0.48 + (index % 2 === 0 ? 0.16 : -0.14);

        return (
          <FloatingNode
            key={app.id}
            appId={app.id}
            label={app.label}
            position={[x, y, z]}
            onSelect={onOpenApp}
            index={index}
          />
        );
      }),
    [onOpenApp]
  );

  useFrame((state) => {
    if (!nodesRef.current) return;
    nodesRef.current.rotation.y = state.clock.elapsedTime * 0.025;
    nodesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.015;
  });

  return (
    <>
      <color attach="background" args={["#eef2f7"]} />
      <fog attach="fog" args={["#eef2f7", 8, 22]} />

      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 8, 5]} intensity={1.35} color="#ffffff" />
      <directionalLight position={[-4, 3, -2]} intensity={0.65} color="#c4b5fd" />
      <pointLight position={[0, 2, 0]} intensity={1.2} color="#2563eb" />
      <pointLight position={[2.5, 1.5, 3]} intensity={0.7} color="#38bdf8" />

      <CameraRig mouse={mouse} />

      <CoreSphere />

      <group ref={nodesRef}>{nodeElements}</group>

      <Grid
        position={[0, -2.2, 0]}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.4}
        cellColor="#cbd5e1"
        sectionSize={2}
        sectionThickness={0.8}
        sectionColor="#94a3b8"
        fadeDistance={18}
        fadeStrength={1.2}
        infiniteGrid
      />

      <Sparkles
        count={120}
        scale={[14, 8, 14]}
        size={2.5}
        speed={0.35}
        opacity={0.45}
        color="#2563eb"
      />

      <Stars
        radius={30}
        depth={20}
        count={1200}
        factor={2}
        saturation={0.2}
        fade
        speed={0.4}
      />
    </>
  );
}
