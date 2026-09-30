import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function MetAnemometer({ windSpeed = 25, windDirection = 120, position = [0, 0, 0] }) {
  const rotorRef = useRef();
  const vaneRef = useRef();

  useFrame((state, delta) => {
    if (rotorRef.current) {
      // Rotational speed directly proportional to live wind velocity telemetry
      const rps = Math.max(0.2, (windSpeed / 12.0));
      rotorRef.current.rotation.y += rps * delta * 3.5;
    }

    if (vaneRef.current) {
      // Wind vane smoothly aligns with wind direction degrees
      const targetRad = (windDirection * Math.PI) / 180;
      vaneRef.current.rotation.y = targetRad;
    }
  });

  return (
    <group position={position}>
      {/* Structural Met Mast */}
      <mesh position={[0, 4.0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.16, 8.0, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Lattice Guy Wires */}
      {[-2, 2].map((x, idx) => (
        <mesh key={idx} position={[x, 3.5, 0]} rotation={[0, 0, x > 0 ? -0.35 : 0.35]}>
          <cylinderGeometry args={[0.02, 0.02, 7.5, 4]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      ))}

      {/* Top Crossarm Bar */}
      <mesh position={[0, 8.0, 0]} castShadow>
        <boxGeometry args={[1.6, 0.08, 0.08]} />
        <meshStandardMaterial color="#334155" metalness={0.7} />
      </mesh>

      {/* LEFT: 3-Cup Spinning Anemometer */}
      <group position={[-0.7, 8.2, 0]}>
        {/* Axle Bearing */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 12]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {/* Spinning Rotor Group */}
        <group ref={rotorRef}>
          {/* Central Hub */}
          <mesh>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.6} />
          </mesh>

          {/* 3 Radial Arms with Hemispherical Wind Cups */}
          {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, idx) => (
            <group key={idx} rotation={[0, angle, 0]}>
              {/* Radial Arm */}
              <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
              {/* Anemometer Cup (Half Sphere) */}
              <mesh position={[0.4, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <sphereGeometry args={[0.08, 12, 12, 0, Math.PI]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.3} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* RIGHT: Directional Wind Vane */}
      <group position={[0.7, 8.2, 0]} ref={vaneRef}>
        {/* Axle */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 12]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Vane Shaft */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.04, 0.04, 0.7]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Vane Tail Fin */}
        <mesh position={[0, 0.18, -0.32]}>
          <boxGeometry args={[0.02, 0.22, 0.24]} />
          <meshStandardMaterial color="#f97316" roughness={0.4} />
        </mesh>
        {/* Counterweight Pointer */}
        <mesh position={[0, 0.1, 0.35]}>
          <coneGeometry args={[0.06, 0.15, 12]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Pyranometer Solar Sensor */}
      <mesh position={[0, 8.1, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.1, 12]} />
        <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}
