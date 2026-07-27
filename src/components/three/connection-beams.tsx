"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

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

interface ConnectionBeamsProps {
  nodePositions: { appId: string; position: [number, number, number] }[];
}

function AnimatedBeam({
  start,
  end,
  color,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uStart: { value: start },
      uEnd: { value: end },
    }),
    [color, start, end]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  const tubeGeometry = useMemo(() => {
    const mid = new THREE.Vector3(
      (start.x + end.x) / 2,
      Math.max(start.y, end.y) + 0.8,
      (start.z + end.z) / 2
    );
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return new THREE.TubeGeometry(curve, 32, 0.008, 6, false);
  }, [start, end]);

  return (
    <mesh ref={meshRef} geometry={tubeGeometry}>
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
          uniform vec3 uColor;
          varying vec2 vUv;
          void main() {
            float t = uTime;
            float dash = sin(vUv.x * 40.0 - t * 4.0) * 0.5 + 0.5;
            dash = smoothstep(0.3, 0.7, dash);
            float flow = sin(vUv.x * 8.0 - t * 2.0) * 0.5 + 0.5;
            float pulse = sin(vUv.x * 2.0 + t * 1.5) * 0.5 + 0.5;
            float alpha = dash * 0.4 * (0.6 + flow * 0.4) * (0.7 + pulse * 0.3);
            vec3 finalColor = uColor * (1.0 + flow * 0.3);
            gl_FragColor = vec4(finalColor, alpha);
          }
        `}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function ConnectionBeams({ nodePositions }: ConnectionBeamsProps) {
  const center = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  return (
    <group>
      {nodePositions.map((node) => (
        <AnimatedBeam
          key={node.appId}
          start={center}
          end={new THREE.Vector3(...node.position)}
          color={NODE_COLORS[node.appId] ?? "#2563eb"}
        />
      ))}
    </group>
  );
}
