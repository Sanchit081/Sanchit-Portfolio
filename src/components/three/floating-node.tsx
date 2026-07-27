"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html, RoundedBox } from "@react-three/drei";
import type { Group } from "three";
import type { AppId } from "@/types";

const NODE_COLORS: Record<string, string> = {
  projects: "#2563eb",
  experience: "#7c3aed",
  terminal: "#0891b2",
  devops: "#059669",
  "ai-assistant": "#6366f1",
  arcade: "#d97706",
  about: "#db2777",
  contact: "#0d9488",
};

interface FloatingNodeProps {
  appId: AppId;
  label: string;
  position: [number, number, number];
  onSelect: (appId: AppId) => void;
  index: number;
}

export function FloatingNode({
  appId,
  label,
  position,
  onSelect,
  index,
}: FloatingNodeProps) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const color = NODE_COLORS[appId] ?? "#2563eb";

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.3 + index * 0.8) * 0.13;
    groupRef.current.rotation.z = Math.sin(t * 0.18 + index * 0.5) * 0.05;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.9 + index * 0.7) * 0.02;
  });

  const handlePointerEnter = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerLeave = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  const handleSelect = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    onSelect(appId);
  };

  return (
    <Float
      speed={0.8 + (index % 3) * 0.07}
      rotationIntensity={0.12}
      floatIntensity={0.4}
      floatingRange={[-0.05, 0.05]}
    >
      <group
        ref={groupRef}
        position={position}
        onPointerOver={handlePointerEnter}
        onPointerOut={handlePointerLeave}
        onClick={handleSelect}
      >
        <mesh position={[0, 0, 0.01]} scale={[1.65, 1.65, 0.4]}>
          <boxGeometry args={[1, 1, 0.04]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        <RoundedBox
          args={[1.35, 1.35, 0.18]}
          radius={0.12}
          smoothness={4}
          scale={hovered ? 1.13 : 1}
        >
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={hovered ? 0.96 : 0.84}
            roughness={0.12}
            metalness={0.38}
            clearcoat={1}
            clearcoatRoughness={0.08}
            emissive={color}
            emissiveIntensity={hovered ? 0.4 : 0.14}
          />
        </RoundedBox>

        <mesh position={[0, 0, 0.12]}>
          <planeGeometry args={[1.1, 1.1]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.18}
          />
        </mesh>

        <Html
          center
          distanceFactor={8}
          position={[0, 0.95, 0.2]}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div
            className="whitespace-nowrap rounded-full border border-white/60 bg-white/90 px-3 py-1 text-xs font-semibold shadow-lg backdrop-blur-md"
            style={{ color }}
          >
            {label}
          </div>
        </Html>
      </group>
    </Float>
  );
}
