"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Grid, Stars } from "@react-three/drei";
import type { Group } from "three";
import { EnergyCore } from "./energy-core";
import { ConnectionBeams } from "./connection-beams";
import { MouseOrb } from "./mouse-orb";
import { OrbitalRingSystem } from "./orbital-rings";
import { IntroCameraRig } from "./intro-camera";
import { FloatingNode } from "./floating-node";
import { NebulaBackground } from "./nebula-background";
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
  { id: "gallery", label: "Gallery", angle: 0.2, radius: 4.0 },
  { id: "music", label: "Music", angle: Math.PI + 0.2, radius: 4.0 },
];

interface HomeWorldProps {
  onOpenApp: (appId: AppId) => void;
  mouse: { x: number; y: number };
}

export function HomeWorld({ onOpenApp, mouse }: HomeWorldProps) {
  const nodesRef = useRef<Group>(null);

  const nodeData = useMemo(
    () =>
      DESKTOP_APPS.map((app, index) => {
        const angle = app.angle + (index % 2 === 0 ? 0.16 : -0.16);
        const radius = app.radius + (index % 2 === 0 ? 0.18 : -0.12);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y =
          Math.sin(index * 0.85 + 0.4) * 0.48 +
          (index % 2 === 0 ? 0.16 : -0.14);

        return { ...app, position: [x, y, z] as [number, number, number] };
      }),
    []
  );

  const nodeElements = useMemo(
    () =>
      nodeData.map((node, index) => (
        <FloatingNode
          key={node.id}
          appId={node.id}
          label={node.label}
          position={node.position}
          onSelect={onOpenApp}
          index={index}
        />
      )),
    [nodeData, onOpenApp]
  );

  useFrame((state) => {
    if (!nodesRef.current) return;
    nodesRef.current.rotation.y = state.clock.elapsedTime * 0.025;
    nodesRef.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.18) * 0.015;
  });

  return (
    <>
      <color attach="background" args={["#02030a"]} />
      <fog attach="fog" args={["#02030a", 10, 22]} />

      <ambientLight intensity={0.12} />
      <directionalLight position={[4, 6, 4]} intensity={0.16} color="#f8fafc" />
      <pointLight position={[0, 0, 0]} intensity={0.2} color="#60a5fa" distance={5} decay={2} />

      <IntroCameraRig mouse={mouse} />

      <EnergyCore />

      <ConnectionBeams
        nodePositions={nodeData.map((n) => ({
          appId: n.id,
          position: n.position,
        }))}
      />

      <group ref={nodesRef}>{nodeElements}</group>

      <MouseOrb />

      <Grid
        position={[0, -2.2, 0]}
        args={[20, 20]}
        cellSize={0.8}
        cellThickness={0.18}
        cellColor="#1f2937"
        sectionSize={4}
        sectionThickness={0.25}
        sectionColor="#374151"
        fadeDistance={14}
        fadeStrength={0.7}
        infiniteGrid
      />
    </>
  );
}
