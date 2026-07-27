"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function SceneCanvas({ onOpenApp, className }: SceneCanvasProps) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [motionReady, setMotionReady] = useState(false);

  const updateInput = useCallback((x: number, y: number) => {
    setMouse({
      x: clamp(x, -1, 1),
      y: clamp(y, -1, 1),
    });
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      updateInput(x * 0.7, y * 0.7);
    },
    [updateInput]
  );

  const enableMotion = useCallback(async () => {
    if (typeof window === "undefined") return;

    const orientationApi = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<"granted" | "denied">;
    };

    if (!orientationApi) return;

    if (typeof orientationApi.requestPermission === "function") {
      try {
        const response = await orientationApi.requestPermission();
        if (response !== "granted") {
          return;
        }
      } catch {
        return;
      }
    }

    setMotionEnabled(true);
    setMotionReady(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !motionEnabled) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const tiltX = clamp((event.gamma ?? 0) / 45, -1, 1);
      const tiltY = clamp((event.beta ?? 0) / 45, -1, 1);
      updateInput(tiltX * 0.5, -tiltY * 0.35);
    };

    window.addEventListener("deviceorientation", handleOrientation, true);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, [motionEnabled, updateInput]);

  return (
    <div
      className={className}
      onPointerMove={handlePointerMove}
      onPointerDown={enableMotion}
      onTouchStart={enableMotion}
      onTouchMove={(event) => {
        if (!event.touches?.length) return;
        const touch = event.touches[0];
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
        updateInput(x * 0.65, y * 0.65);
      }}
      aria-hidden
      style={{ touchAction: "none" }}
    >
      <Canvas
        camera={{ position: [8, 6, 16], fov: 45 }}
        dpr={typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 1.5) : 1}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={<SceneLoader />}>
          <HomeWorld onOpenApp={onOpenApp} mouse={mouse} />
        </Suspense>
      </Canvas>
    </div>
  );
}
