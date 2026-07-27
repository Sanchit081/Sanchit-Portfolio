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
    groupRef.current.rotation.y = Math.sin(t * 0.28 + index * 0.8) * 0.12;
    groupRef.current.rotation.z = Math.sin(t * 0.2 + index * 0.5) * 0.04;
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
      speed={0.9 + (index % 3) * 0.08}
      rotationIntensity={0.16}
      floatIntensity={0.45}
      floatingRange={[-0.06, 0.06]}
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
          scale={hovered ? 1.12 : 1}
        >
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={hovered ? 0.95 : 0.82}
            roughness={0.15}
            metalness={0.35}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive={color}
            emissiveIntensity={hovered ? 0.35 : 0.12}
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
