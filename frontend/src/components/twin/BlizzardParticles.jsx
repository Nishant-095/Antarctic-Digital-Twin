import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MAX_PARTICLES = 2500;

export default function BlizzardParticles({ windSpeed = 30 }) {
  const pointsRef = useRef();

  // Determine active count based on wind speed
  const activeCount = useMemo(() => {
    if (windSpeed > 85) return 2500;
    if (windSpeed > 60) return 1600;
    return 800;
  }, [windSpeed]);

  // Allocate fixed maximum buffer ONCE to prevent GPU buffer reallocations & WebGL stutter
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(MAX_PARTICLES * 3);
    const spd = new Float32Array(MAX_PARTICLES);

    for (let i = 0; i < MAX_PARTICLES; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;     // X (wind direction)
      pos[i * 3 + 1] = Math.random() * 25;         // Y (height)
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80; // Z
      spd[i] = 0.5 + Math.random() * 1.0;
    }
    return [pos, spd];
  }, []);

  // Update draw range when particle count changes, without destroying WebGL buffer
  useEffect(() => {
    if (pointsRef.current?.geometry) {
      pointsRef.current.geometry.setDrawRange(0, activeCount);
    }
  }, [activeCount]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    if (!posAttr) return;
    const array = posAttr.array;

    // Wind speed multiplier
    const speedFactor = Math.max(0.4, (windSpeed / 25.0) * 1.4);
    const countToUpdate = activeCount;

    for (let i = 0; i < countToUpdate; i++) {
      // Move snow along X axis (katabatic drift) with downward slight gravity
      array[i * 3] += speeds[i] * speedFactor * delta * 25;
      array[i * 3 + 1] -= speeds[i] * delta * 4;

      // Wrap around bounds
      if (array[i * 3] > 40) array[i * 3] = -40;
      if (array[i * 3 + 1] < 0) array[i * 3 + 1] = 25;
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={MAX_PARTICLES}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={windSpeed > 75 ? 0.22 : 0.14}
        color={windSpeed > 85 ? '#e2e8f0' : '#cbd5e1'}
        transparent
        opacity={windSpeed > 85 ? 0.9 : 0.65}
        depthWrite={false}
      />
    </points>
  );
}
