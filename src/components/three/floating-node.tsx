"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, Html, RoundedBox } from "@react-three/drei";
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
  const [magneticPosition, setMagneticPosition] = useState<[number, number, number]>(position);
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
    
    // Enhanced rotation animation
    groupRef.current.rotation.y = Math.sin(t * 0.4 + index * 0.8) * 0.15;
    groupRef.current.rotation.z = Math.sin(t * 0.25 + index * 0.5) * 0.08;
    
    // Floating animation with more variation
    groupRef.current.position.y = position[1] + Math.sin(t * 1.1 + index * 0.7) * 0.03;
    
    // Magnetic effect on hover
    if (hovered) {
      const targetX = position[0] + mouse.x * 0.3;
      const targetY = position[1] + mouse.y * 0.2;
      setMagneticPosition([
        MathUtils.damp(magneticPosition[0], targetX, 5, state.clock.getDelta()),
        MathUtils.damp(magneticPosition[1], targetY, 5, state.clock.getDelta()),
        position[2],
      ]);
    } else {
      setMagneticPosition([
        MathUtils.damp(magneticPosition[0], position[0], 3, state.clock.getDelta()),
        MathUtils.damp(magneticPosition[1], position[1], 3, state.clock.getDelta()),
        position[2],
      ]);
    }
    
    // Pulsing glow effect
    const pulseIntensity = hovered ? 0.6 + Math.sin(t * 4) * 0.2 : 0.2 + Math.sin(t * 2) * 0.1;
    if (glowRef.current.material && 'opacity' in glowRef.current.material) {
      (glowRef.current.material as any).opacity = pulseIntensity;
    }
    
    // Scale animation on hover
    const targetScale = hovered ? 1.15 : 1;
    meshRef.current.scale.x = MathUtils.damp(meshRef.current.scale.x, targetScale, 8, state.clock.getDelta());
    meshRef.current.scale.y = MathUtils.damp(meshRef.current.scale.y, targetScale, 8, state.clock.getDelta());
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
    <Float
      speed={0.8 + (index % 3) * 0.07}
      rotationIntensity={0.15}
      floatIntensity={0.5}
      floatingRange={[-0.08, 0.08]}
    >
      <group
        ref={groupRef}
        position={magneticPosition}
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
          args={[1.35, 1.35, 0.18]}
          radius={0.12}
          smoothness={4}
        >
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={hovered ? 0.98 : 0.88}
            roughness={0.08}
            metalness={0.45}
            clearcoat={1}
            clearcoatRoughness={0.05}
            emissive={color}
            emissiveIntensity={hovered ? 0.5 : 0.18}
          />
        </RoundedBox>

        <mesh ref={glowRef} position={[0, 0, 0.15]}>
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        <mesh position={[0, 0, 0.12]}>
          <planeGeometry args={[1.1, 1.1]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.22}
          />
        </mesh>

        <Html
          center
          distanceFactor={8}
          position={[0, 0.95, 0.2]}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div
            className="whitespace-nowrap rounded-full border border-white/70 bg-white/95 px-4 py-1.5 text-xs font-bold shadow-xl backdrop-blur-md transition-all duration-300"
            style={{ 
              color,
              transform: hovered ? 'scale(1.1)' : 'scale(1)',
              boxShadow: hovered ? `0 0 20px ${color}80` : '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            {label}
          </div>
        </Html>
      </group>
    </Float>
  );
}
