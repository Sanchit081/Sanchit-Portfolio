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
    groupRef.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 0.4 + index) * 0.15;
  });

  return (
    <Float
      speed={1.4}
      rotationIntensity={0.25}
      floatIntensity={0.6}
      floatingRange={[-0.08, 0.08]}
    >
      <group ref={groupRef} position={position}>
        <RoundedBox
          args={[1.35, 1.35, 0.18]}
          radius={0.12}
          smoothness={4}
          onPointerOver={(event) => {
            event.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "auto";
          }}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(appId);
          }}
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
