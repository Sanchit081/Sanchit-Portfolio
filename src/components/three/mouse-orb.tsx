"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const TRAIL_COUNT = 50;

function createTrailGeometry() {
  const positions = new Float32Array(TRAIL_COUNT * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geo;
}

export function MouseOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);
  const trailLifetimesRef = useRef<Float32Array>(new Float32Array(TRAIL_COUNT));
  const trailIndexRef = useRef(0);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const uniforms = {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#38f9ff") },
  };
  const { viewport } = useThree();

  useEffect(() => {
    trailLifetimesRef.current.fill(0);
    const geo = createTrailGeometry();
    geometryRef.current = geo;

    if (trailRef.current) {
      trailRef.current.geometry = geo;
    }

    return () => {
      geo.dispose();
      geometryRef.current = null;
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.position.x = THREE.MathUtils.damp(
        meshRef.current.position.x,
        state.pointer.x * viewport.width * 0.4,
        3,
        state.clock.getDelta()
      );
      meshRef.current.position.y = THREE.MathUtils.damp(
        meshRef.current.position.y,
        state.pointer.y * viewport.height * 0.4,
        3,
        state.clock.getDelta()
      );

      const scale = 0.06 + Math.sin(t * 3) * 0.015;
      meshRef.current.scale.setScalar(scale / 0.06);
    }

    const geo = geometryRef.current;
    if (geo) {
      const posAttr = geo.attributes.position as THREE.BufferAttribute;
      const lifetimes = trailLifetimesRef.current;

      for (let i = 0; i < TRAIL_COUNT; i++) {
        lifetimes[i] -= 0.02;
      }

      for (let i = 0; i < TRAIL_COUNT; i++) {
        if (lifetimes[i] <= 0) {
          lifetimes[i] = 1.0;
          const idx = (trailIndexRef.current % TRAIL_COUNT) * 3;
          posAttr.array[idx] =
            (meshRef.current?.position.x ?? 0) + (Math.random() - 0.5) * 0.3;
          posAttr.array[idx + 1] =
            (meshRef.current?.position.y ?? 0) + (Math.random() - 0.5) * 0.3;
          posAttr.array[idx + 2] =
            (meshRef.current?.position.z ?? 0) + (Math.random() - 0.5) * 0.3;
          trailIndexRef.current++;
          break;
        }
      }

      posAttr.needsUpdate = true;
    }

    uniforms.uTime.value = t;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={`
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              vViewPosition = -mvPosition.xyz;
              gl_Position = projectionMatrix * mvPosition;
            }
          `}
          fragmentShader={`
            uniform float uTime;
            uniform vec3 uColor;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            void main() {
              vec3 viewDir = normalize(vViewPosition);
              float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 3.0);
              float pulse = sin(uTime * 4.0) * 0.2 + 0.8;
              vec3 finalColor = uColor * (1.0 + fresnel * 0.8);
              float alpha = fresnel * 0.9 * pulse + 0.15;
              gl_FragColor = vec4(finalColor, alpha);
            }
          `}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <points ref={trailRef}>
        <bufferGeometry />
        <pointsMaterial
          color="#38f9ff"
          size={0.04}
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
