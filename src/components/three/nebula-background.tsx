"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

function VolumetricNebula() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = {
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color("#0a0520") },
    uColor2: { value: new THREE.Color("#1a0a3e") },
    uColor3: { value: new THREE.Color("#0f172a") },
    uColor4: { value: new THREE.Color("#2563eb") },
  };

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={[0, 0, -20]} rotation={[0, 0, 0]}>
      <planeGeometry args={[120, 120]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          uniform vec3 uColor3;
          uniform vec3 uColor4;
          varying vec2 vUv;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }

          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
          }

          float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            for (int i = 0; i < 5; i++) {
              v += a * noise(p);
              p *= 2.0;
              a *= 0.5;
            }
            return v;
          }

          void main() {
            vec2 uv = vUv;
            float t = uTime * 0.03;

            float n1 = fbm(uv * 3.0 + t * 0.4);
            float n2 = fbm(uv * 2.0 - t * 0.3 + 42.0);
            float n3 = fbm(uv * 1.5 + vec2(n1, n2) * 0.8 + t * 0.2);

            vec3 col = mix(uColor1, uColor2, n1);
            col = mix(col, uColor3, n2 * 0.6);
            col = mix(col, uColor4, pow(n3, 3.0) * 0.25);

            float vignette = 1.0 - length(uv - 0.5) * 0.7;
            col *= vignette * vignette;

            float glow = pow(n3, 4.0) * 0.15;
            col += uColor4 * glow;

            gl_FragColor = vec4(col, 1.0);
          }
        `}
        depthWrite={false}
      />
    </mesh>
  );
}

function StarField() {
  const pointsRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    const count = 1800;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 24 + seededRandom(i * 1.1) * 20;
      const theta = seededRandom(i * 2.3) * Math.PI * 2;
      const phi = Math.acos(2 * seededRandom(i * 3.7) - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometryRef.current = geo;

    if (pointsRef.current) {
      pointsRef.current.geometry = geo;
    }

    return () => {
      geo.dispose();
      geometryRef.current = null;
    };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015;
    pointsRef.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.04) * 0.03;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        color="#ffffff"
        size={0.18}
        transparent
        opacity={0.9}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

export function NebulaBackground() {
  return (
    <group>
      <VolumetricNebula />
      <StarField />
    </group>
  );
}
