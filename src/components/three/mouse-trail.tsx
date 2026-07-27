"use client";

import { useRef, useMemo, useState, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface MouseTrailProps {
  mouse: { x: number; y: number };
}

const MAX_TRAIL_POINTS = 50;
const TRAIL_LIFETIME = 1.5;

interface TrailPoint {
  position: THREE.Vector3;
  life: number;
  size: number;
}

export function MouseTrail({ mouse }: MouseTrailProps) {
  const trailRef = useRef<TrailPoint[]>([]);
  const { camera, viewport } = useThree();
  const [geometry, material] = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(MAX_TRAIL_POINTS * 3);
    const lives = new Float32Array(MAX_TRAIL_POINTS);
    const sizes = new Float32Array(MAX_TRAIL_POINTS);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aLife', new THREE.BufferAttribute(lives, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color("#7c3aed") },
      },
      vertexShader: `
        attribute float aLife;
        attribute float aSize;
        varying float vLife;
        varying float vSize;

        void main() {
          vLife = aLife;
          vSize = aSize;
          
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;
          
          gl_Position = projectedPosition;
          gl_PointSize = aSize * (200.0 / -viewPosition.z);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        varying float vLife;
        varying float vSize;

        void main() {
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          float strength = 0.05 / distanceToCenter - 0.1;
          
          float fade = smoothstep(0.0, 0.2, vLife) * smoothstep(1.0, 0.8, vLife);
          
          vec3 finalColor = uColor + vec3(0.2) * sin(uTime * 2.0);
          float alpha = strength * fade;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return [geometry, material];
  }, []);

  const addTrailPoint = useCallback(() => {
    const vector = new THREE.Vector3(mouse.x * 3, mouse.y * 2, 0);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance * 0.5));

    trailRef.current.push({
      position: pos,
      life: 1.0,
      size: 15 + Math.random() * 10,
    });

    if (trailRef.current.length > MAX_TRAIL_POINTS) {
      trailRef.current.shift();
    }
  }, [mouse, camera]);

  useFrame((state, delta) => {
    addTrailPoint();

    const positions = geometry.attributes.position.array as Float32Array;
    const lives = geometry.attributes.aLife.array as Float32Array;
    const sizes = geometry.attributes.aSize.array as Float32Array;

    for (let i = trailRef.current.length - 1; i >= 0; i--) {
      const point = trailRef.current[i];
      point.life -= delta / TRAIL_LIFETIME;

      if (point.life <= 0) {
        trailRef.current.splice(i, 1);
        continue;
      }

      const i3 = i * 3;
      positions[i3] = point.position.x;
      positions[i3 + 1] = point.position.y;
      positions[i3 + 2] = point.position.z;
      lives[i] = point.life;
      sizes[i] = point.size * point.life;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.aLife.needsUpdate = true;
    geometry.attributes.aSize.needsUpdate = true;

    material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <points geometry={geometry}>
      <primitive object={material} attach="material" />
    </points>
  );
}
