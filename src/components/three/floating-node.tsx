"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import { MathUtils, type Group, type Mesh } from "three";
import * as THREE from "three";
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
  gallery: "#ec4899",
  music: "#8b5cf6",
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
  const meshRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const color = NODE_COLORS[appId] ?? "#2563eb";
  const { mouse } = useThree();

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "auto";
    }
  }, [hovered]);

  useFrame((state) => {
    if (!groupRef.current || !meshRef.current || !glowRef.current) return;
    const t = state.clock.elapsedTime;
    const delta = state.clock.getDelta();

    groupRef.current.rotation.y = Math.sin(t * 0.16 + index * 0.6) * 0.04;
    groupRef.current.rotation.z = Math.sin(t * 0.1 + index * 0.3) * 0.02;

    const hoverOffsetX = hovered ? mouse.x * 0.04 : 0;
    const hoverOffsetY = hovered ? mouse.y * 0.02 : 0;
    const floatY = position[1] + Math.sin(t * 0.7 + index * 0.4) * 0.01 + hoverOffsetY;

    groupRef.current.position.set(
      MathUtils.damp(groupRef.current.position.x, position[0] + hoverOffsetX, 4, delta),
      MathUtils.damp(groupRef.current.position.y, floatY, 4, delta),
      position[2]
    );

    const pulseIntensity = hovered ? 0.08 : 0.04;
    if (glowRef.current.material && "opacity" in glowRef.current.material) {
      (glowRef.current.material as any).opacity = pulseIntensity;
    }

    const targetScale = hovered ? 1.02 : 1;
    meshRef.current.scale.x = MathUtils.damp(meshRef.current.scale.x, targetScale, 6, delta);
    meshRef.current.scale.y = MathUtils.damp(meshRef.current.scale.y, targetScale, 6, delta);
  });

  const handlePointerEnter = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    setHovered(true);
  };

  const handlePointerLeave = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    setHovered(false);
  };

  const handleSelect = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    onSelect(appId);
  };

  return (
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
          ref={meshRef}
          args={[1.25, 1.25, 0.12]}
          radius={0.08}
          smoothness={2}
        >
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={hovered ? 0.92 : 0.82}
            roughness={0.18}
            metalness={0.16}
            clearcoat={0.6}
            clearcoatRoughness={0.16}
            emissive={color}
            emissiveIntensity={hovered ? 0.06 : 0.02}
          />
        </RoundedBox>

        <mesh ref={glowRef} position={[0, 0, 0.15]}>
          <planeGeometry args={[1.2, 1.2]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.04}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        <Html
          center
          distanceFactor={8}
          position={[0, 0.95, 0.2]}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div
            className="whitespace-nowrap rounded-full border border-slate-700/60 bg-slate-950/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-slate-200 shadow-sm backdrop-blur-sm transition-all duration-300"
            style={{ 
              color,
              transform: hovered ? 'scale(1.01)' : 'scale(1)',
              boxShadow: hovered ? `0 4px 10px ${color}16` : '0 2px 6px rgba(0,0,0,0.12)'
            }}
          >
            {label}
          </div>
        </Html>
      </group>
  );
}
