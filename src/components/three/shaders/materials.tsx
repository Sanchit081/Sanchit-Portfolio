import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

const ParticleMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color("#2563eb"),
    uSize: 1.0,
    uPixelRatio: 1,
  },
  /* glsl */ `
    attribute float aScale;
    attribute vec3 aRandomness;
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectedPosition = projectionMatrix * viewPosition;
      
      gl_Position = projectedPosition;
      
      gl_PointSize = uSize * aScale * uPixelRatio;
      gl_PointSize *= (1.0 / -viewPosition.z);
      
      vColor = uColor;
      vAlpha = aScale;
    }
  `,
  /* glsl */ `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
      float strength = 0.05 / distanceToCenter - 0.1;
      
      float twinkle = sin(uTime * 3.0 + gl_FragCoord.x * 0.1) * 0.5 + 0.5;
      
      vec3 finalColor = vColor * (1.0 + twinkle * 0.3);
      float alpha = strength * vAlpha * (0.8 + twinkle * 0.2);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
);

const TrailMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color("#7c3aed"),
  },
  /* glsl */ `
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
  /* glsl */ `
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
  `
);

const HolographicMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color("#2563eb"),
    uIntensity: 1,
    uFresnelPower: 2.8,
  },
  /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  /* glsl */ `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uIntensity;
    uniform float uFresnelPower;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), uFresnelPower);

      float scanline = sin(vWorldPosition.y * 12.0 + uTime * 3.0) * 0.5 + 0.5;
      float pulse = sin(uTime * 2.0 + vUv.x * 6.283) * 0.5 + 0.5;
      float shimmer = sin(uTime * 4.0 + vWorldPosition.x * 8.0) * 0.5 + 0.5;

      vec3 innerGlow = uColor * (0.3 + pulse * 0.2);
      vec3 edgeGlow = uColor * fresnel * uIntensity * (1.0 + shimmer * 0.4);
      vec3 scan = uColor * scanline * fresnel * 0.3;

      vec3 finalColor = innerGlow + edgeGlow + scan;
      float alpha = fresnel * 0.75 + 0.15;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
);

const AuroraMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorA: new THREE.Color("#dbeafe"),
    uColorB: new THREE.Color("#e0e7ff"),
    uColorC: new THREE.Color("#f0f9ff"),
  },
  /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl */ `
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;
    varying vec2 vUv;

    float noise(vec2 p) {
      return sin(p.x * 10.0 + uTime) * sin(p.y * 8.0 - uTime * 0.7) * 0.5 + 0.5;
    }

    void main() {
      vec2 uv = vUv;
      float n1 = noise(uv * 2.0 + uTime * 0.1);
      float n2 = noise(uv * 3.0 - uTime * 0.08);
      float blend = n1 * 0.6 + n2 * 0.4;

      vec3 col = mix(uColorA, uColorB, blend);
      col = mix(col, uColorC, uv.y * 0.5);
      float vignette = 1.0 - length(uv - 0.5) * 0.8;

      gl_FragColor = vec4(col * vignette, 1.0);
    }
  `
);

extend({ ParticleMaterial, TrailMaterial, HolographicMaterial, AuroraMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    particleMaterial: THREE.ShaderMaterial & {
      uTime: number;
      uColor: THREE.Color;
      uSize: number;
      uPixelRatio: number;
    };
    trailMaterial: THREE.ShaderMaterial & {
      uTime: number;
      uColor: THREE.Color;
    };
    holographicMaterial: THREE.ShaderMaterial & {
      uTime: number;
      uColor: THREE.Color;
      uIntensity: number;
      uFresnelPower: number;
    };
    auroraMaterial: THREE.ShaderMaterial & {
      uTime: number;
      uColorA: THREE.Color;
      uColorB: THREE.Color;
      uColorC: THREE.Color;
    };
  }
}

export { ParticleMaterial, TrailMaterial, HolographicMaterial, AuroraMaterial };
