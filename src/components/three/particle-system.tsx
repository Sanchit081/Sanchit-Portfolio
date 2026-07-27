"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleSystemProps {
  count?: number;
  color?: string;
  size?: number;
  radius?: number;
}

export function ParticleSystem({
  count = 2000,
  color = "#2563eb",
  size = 2.0,
  radius = 8,
}: ParticleSystemProps) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const spherical = new THREE.Spherical(
        radius * (0.55 + Math.random() * 0.45),
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI
      );

      const vector = new THREE.Vector3().setFromSpherical(spherical);
      positions[i3] = vector.x;
      positions[i3 + 1] = vector.y;
      positions[i3 + 2] = vector.z;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [count, radius]);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      map: createGlowTexture(),
    });
  }, [color, size]);

  useFrame((state) => {
    const rotation = state.clock.elapsedTime * 0.01;
    geometry.rotateY(rotation * 0.2);
    geometry.rotateX(rotation * 0.1);
  });

  return <points geometry={geometry} material={material} />;
}

function createGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.2, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.3)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
