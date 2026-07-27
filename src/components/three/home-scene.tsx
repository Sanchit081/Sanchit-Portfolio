"use client";

import dynamic from "next/dynamic";
import type { AppId } from "@/types";

const SceneCanvasInner = dynamic(
  () => import("./scene-canvas").then((mod) => mod.SceneCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="glass-panel rounded-3xl px-8 py-6 text-center">
          <div className="font-heading text-lg font-semibold">Loading 3D Engine...</div>
          <div className="mt-2 text-sm text-muted">Initializing interactive scene</div>
        </div>
      </div>
    ),
  }
);

interface HomeSceneProps {
  onOpenApp: (appId: AppId) => void;
}

export function HomeScene({ onOpenApp }: HomeSceneProps) {
  return (
    <SceneCanvasInner
      className="fixed inset-0 h-screen w-full"
      onOpenApp={onOpenApp}
    />
  );
}
