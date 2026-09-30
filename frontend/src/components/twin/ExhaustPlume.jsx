import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ExhaustPlume({
  position = [0, 0, 0],
  isActive = true,
  isTripped = false,
  powerKw = 100,
}) {
  const pointsRef = useRef();
  const strobeRef = useRef();

  const count = 35;
  const [positions, offsets] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const offs = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 1] = Math.random() * 2.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
      offs[i] = Math.random();
    }
    return [pos, offs];
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Red Emergency Strobe Flasher when tripped
    if (strobeRef.current) {
      if (isTripped) {
        const flash = Math.sin(t * 12) > 0 ? 1.0 : 0.05;
        strobeRef.current.material.emissiveIntensity = flash;
        strobeRef.current.material.opacity = flash;
      }
    }

    if (!pointsRef.current || !isActive || isTripped) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const arr = posAttr.array;

    const speed = 1.2 + (powerKw / 120.0);

    for (let i = 0; i < count; i++) {
      // Rise along Y with slight wind drift along X
      arr[i * 3 + 1] += delta * speed * (0.8 + offsets[i] * 0.6);
      arr[i * 3] += delta * 0.8; // wind drift
      arr[i * 3 + 2] += (Math.random() - 0.5) * 0.02;

      // Reset when particle reaches top
      if (arr[i * 3 + 1] > 3.0) {
        arr[i * 3] = (Math.random() - 0.5) * 0.2;
        arr[i * 3 + 1] = 0.0;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <group position={position}>
      {/* Emergency Trip Hazard Beacon */}
      {isTripped && (
        <group position={[0, 0.4, 0]}>
          <mesh ref={strobeRef}>
            <cylinderGeometry args={[0.15, 0.15, 0.25, 12]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ff0000"
              emissiveIntensity={1.0}
              roughness={0.2}
              transparent
            />
          </mesh>
          <pointLight color="#ff0000" intensity={2.5} distance={8} />
        </group>
      )}

      {/* Heat Exhaust Shimmer Particles */}
      {isActive && !isTripped && (
        <points ref={pointsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={positions.length / 3}
              array={positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.16}
            color="#e2e8f0"
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
}
