"use client";

import { Suspense, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import type { AppId } from "@/types";

const HomeWorld = dynamic(
  () => import("./home-world").then((mod) => mod.HomeWorld),
  { ssr: false }
);

interface SceneCanvasProps {
  onOpenApp: (appId: AppId) => void;
  className?: string;
}

function SceneLoader() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#2563eb" wireframe />
    </mesh>
  );
}

export function SceneCanvas({ onOpenApp, className }: SceneCanvasProps) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    setMouse({ x, y });
  }, []);

  return (
    <div
      className={className}
      onPointerMove={handlePointerMove}
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 1.8, 6.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={<SceneLoader />}>
          <HomeWorld onOpenApp={onOpenApp} mouse={mouse} />
        </Suspense>
      </Canvas>
    </div>
  );
}
