"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils } from "three";

interface IntroCameraRigProps {
  mouse: { x: number; y: number };
}

export function IntroCameraRig({ mouse }: IntroCameraRigProps) {
  const { camera } = useThree();
  const introProgress = useRef(0);
  const introComplete = useRef(false);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (!introComplete.current) {
      introProgress.current = Math.min(introProgress.current + delta * 0.35, 1);
      if (introProgress.current >= 1) {
        introComplete.current = true;
      }
    }

    const p = introProgress.current;
    const ease = 1 - Math.pow(1 - p, 4);

    const targetX = mouse.x * 1.35;
    const targetY = mouse.y * 0.7 + 1.9;

    const introX = MathUtils.damp(
      camera.position.x,
      MathUtils.lerp(8, targetX, ease),
      1.5,
      delta
    );
    const introY = MathUtils.damp(
      camera.position.y,
      MathUtils.lerp(6, targetY, ease),
      1.5,
      delta
    );
    const introZ = MathUtils.damp(
      camera.position.z,
      MathUtils.lerp(16, 6.2 + Math.abs(mouse.x) * 0.15, ease),
      1.5,
      delta
    );

    const parallax = Math.sin(t * 0.4) * 0.08;

    camera.position.set(
      introX + (introComplete.current ? parallax : 0),
      introY +
        (introComplete.current ? Math.sin(t * 0.25) * 0.04 : 0),
      introZ
    );

    camera.lookAt(0, 0.18, 0);
  });

  return null;
}
