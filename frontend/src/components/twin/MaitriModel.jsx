import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import HotspotMarker from './HotspotMarker';
import MetAnemometer from './MetAnemometer';
import ExhaustPlume from './ExhaustPlume';
import DirectionalFlowConduit from './DirectionalFlowConduit';

export default function MaitriModel({
  telemetry,
  onSelectHotspot,
  viewMode = 'NORMAL', // 'NORMAL' | 'THERMAL' | 'XRAY'
  isDaylight = true,
  isModalOpen = false,
  activeSubsystem = null,
}) {
  const pipeRef = useRef();
  const genBayRef = useRef();

  const sim = telemetry?.simulation || {};
  const activeIncident = telemetry?.active_incident;
  const isPipeFreeze = activeIncident === 'LAKE_PIPE_FREEZE';
  const isBlizzard = activeIncident === 'BLIZZARD_ALERT';
  const isTraceOn = telemetry?.kpis?.trace_heating_active || sim.trace_heating_active;
  const windSpeed = telemetry?.kpis?.wind_speed ?? telemetry?.wind_speed ?? 12.2;
  const windDirection = telemetry?.wind_direction ?? 115;
  const powerKw = telemetry?.kpis?.power_kw ?? telemetry?.total_power_kw ?? 180;
  const pipeTemp = telemetry?.kpis?.thermal_temp ?? telemetry?.primary_thermal_temp ?? 3.5;
  const fuelBurn = sim.fuel_burn_rate ?? 24.2;
  const vibrationIndex = sim.vibration_index ?? 0.42;
  const structuralIntegrity = Math.max(90.0, Math.min(100.0, +(100 - (vibrationIndex * 1.8)).toFixed(1)));
  const batterySoc = telemetry?.kpis?.battery_soc ?? sim.battery_soc ?? 97.4;
  const batteryVoltage = telemetry?.kpis?.battery_voltage ?? sim.battery_voltage ?? 241.8;
  const batteryCurrent = telemetry?.kpis?.battery_current ?? sim.battery_current ?? 8.0;
  const isBatteryDischarging = batteryCurrent < 0;

  // View mode materials
  const isThermal = viewMode === 'THERMAL';
  const isXRay = viewMode === 'XRAY';

  // Real-time animation loop for generator heat and pipeline status
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 1. Pipeline material status
    if (pipeRef.current) {
      if (isPipeFreeze) {
        const blink = Math.sin(t * 8) > 0 ? 0.9 : 0.2;
        pipeRef.current.material.color.setRGB(0.9, 0.2, 0.2);
        pipeRef.current.material.emissive.setRGB(blink * 0.8, 0.1, 0.1);
      } else if (isTraceOn) {
        const pulse = 0.5 + Math.sin(t * 3) * 0.25;
        pipeRef.current.material.color.setRGB(0.08, 0.65, 0.88);
        pipeRef.current.material.emissive.setRGB(0.04 * pulse, 0.28 * pulse, 0.42 * pulse);
      } else {
        pipeRef.current.material.color.setRGB(0.4, 0.45, 0.5);
        pipeRef.current.material.emissive.setRGB(0, 0, 0);
      }
    }

    // 4. Generator bay heat glow
    if (genBayRef.current) {
      const loadFactor = Math.min(1.0, powerKw / 220.0);
      if (isThermal) {
        genBayRef.current.material.color.setRGB(1.0, 0.2 + loadFactor * 0.5, 0.1);
      } else {
        const pulse = 0.3 + Math.sin(t * 4) * 0.15;
        genBayRef.current.material.emissiveIntensity = pulse;
      }
    }
  });

  // Dynamic colors based on Daylight and Thermal IR Mode
  const groundColor = isThermal ? '#0f172a' : isDaylight ? '#f1f5f9' : '#293548';
  const rockColor = isThermal ? '#1e293b' : isDaylight ? '#57534e' : '#334155';
  const sastrugiColor = isThermal ? '#0284c7' : isDaylight ? '#ffffff' : '#cbd5e1';
  const lakeIceColor = isThermal ? '#0369a1' : isDaylight ? '#0284c7' : '#38bdf8';
  const containerColor = isThermal ? '#38bdf8' : '#eab308';
  const corridorColor = isThermal ? '#0284c7' : '#f8fafc';
  const genColor = isThermal ? '#f97316' : '#475569';

  return (
    <group position={[0, 0, 0]}>
      {/* 1. TERRAIN BASE - Schirmacher Oasis rocky permafrost & ice */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[95, 95, 32, 32]} />
        <meshStandardMaterial
          color={groundColor}
          roughness={0.9}
          metalness={0.05}
          wireframe={isXRay}
        />
      </mesh>

      {/* Rugged Rock Outcrops (Schirmacher Oasis bedrock) */}
      {[-20, -7, 12, 24].map((x, i) =>
        [-14, 10, -18, 16].map((z, j) => (
          <mesh
            key={`${i}-${j}`}
            position={[x + Math.sin(i) * 3, 0.3, z + Math.cos(j) * 3]}
            rotation={[0.2, (i + j) * 0.8, -0.1]}
            castShadow
            receiveShadow
          >
            <dodecahedronGeometry args={[1.3 + (i % 2) * 0.6, 1]} />
            <meshStandardMaterial color={rockColor} roughness={0.95} />
          </mesh>
        ))
      )}

      {/* Wind-blown snow ripples & sastrugi drifts */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6, -0.06, 8]} receiveShadow>
        <circleGeometry args={[16, 32]} />
        <meshStandardMaterial color={sastrugiColor} roughness={0.65} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-16, -0.06, -10]} receiveShadow>
        <circleGeometry args={[19, 32]} />
        <meshStandardMaterial color={sastrugiColor} roughness={0.7} />
      </mesh>

      {/* Lake Priyadarshini Basin (Deep Frozen Ice Sheet) */}
      <group position={[25, 0, -18]}>
        {/* Crystal Clear Polar Lake Ice */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
          <circleGeometry args={[14, 40]} />
          <meshStandardMaterial
            color={lakeIceColor}
            roughness={0.12}
            metalness={0.65}
            transparent
            opacity={0.94}
          />
        </mesh>
        {/* Lake Ice Shore Line */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
          <ringGeometry args={[13.8, 14.6, 36]} />
          <meshStandardMaterial color={isDaylight ? '#94a3b8' : '#64748b'} roughness={0.9} />
        </mesh>

        {/* Lake Water Intake Pump Skid on Lake Edge (Target for Connected Pipeline) */}
        <group position={[-3, 0.6, 3]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.4, 1.4, 2.2]} />
            <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Intake House Roof Hatch & Beacon */}
          <mesh position={[0, 0.75, 0]}>
            <boxGeometry args={[1.8, 0.15, 1.6]} />
            <meshStandardMaterial color="#0369a1" />
          </mesh>
          {/* Intake Flange Entry Port */}
          <mesh position={[-1.22, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.26, 0.26, 0.15, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
          {/* Operational Beacon */}
          <mesh position={[0, 0.95, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.25, 8]} />
            <meshStandardMaterial
              color={isPipeFreeze ? '#ef4444' : '#10b981'}
              emissive={isPipeFreeze ? '#dc2626' : '#059669'}
              emissiveIntensity={1.0}
            />
          </mesh>
        </group>
      </group>

      {/* 2. MAITRI MAIN DOUBLE-BLOCK STATION */}
      {/* Heavy Structural Steel Plinths (Foundation I-Beams) */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[19, 0.7, 13]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.8} />
      </mesh>

      {/* Block A: Living & Scientific Research Quarters (Indian Polar Yellow) */}
      <group position={[0, 2.3, -3.2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[17, 3.4, 5.2]} />
          <meshStandardMaterial
            color={containerColor}
            roughness={0.4}
            metalness={0.3}
            wireframe={isXRay}
          />
        </mesh>
        {/* Ribbed Container Seams */}
        {[-7, -4.5, -2, 0.5, 3, 5.5].map((x, idx) => (
          <mesh key={idx} position={[x, 0, 2.62]}>
            <boxGeometry args={[0.08, 3.3, 0.06]} />
            <meshStandardMaterial color="#ca8a04" />
          </mesh>
        ))}
        {/* Double-Glazed Observation Window Band */}
        <mesh position={[0, 0.4, -2.62]}>
          <boxGeometry args={[15, 0.8, 0.08]} />
          <meshStandardMaterial
            color={isThermal ? '#f59e0b' : '#0284c7'}
            roughness={0.1}
            metalness={0.9}
            emissive={isThermal ? '#f59e0b' : '#38bdf8'}
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0, 0.4, 2.62]}>
          <boxGeometry args={[15, 0.8, 0.08]} />
          <meshStandardMaterial
            color={isThermal ? '#f59e0b' : '#0284c7'}
            roughness={0.1}
            metalness={0.9}
            emissive={isThermal ? '#f59e0b' : '#38bdf8'}
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Block A Water Treatment Facility Penetration Gland (Pipeline Origin) */}
        <group position={[8.52, -0.4, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.3, 1.2, 1.2]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          {/* Twin Pipe Flange Sleeves */}
          <mesh position={[0.2, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.24, 0.24, 0.2, 16]} />
            <meshStandardMaterial color="#0284c7" metalness={0.7} />
          </mesh>
          <mesh position={[0.2, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
            <meshStandardMaterial color="#0284c7" metalness={0.7} />
          </mesh>
        </group>
      </group>

      {/* Block B: Medical, Workshop & Habitation (Polar Indian Yellow) */}
      <group position={[0, 2.3, 3.2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[17, 3.4, 5.2]} />
          <meshStandardMaterial
            color={containerColor}
            roughness={0.4}
            metalness={0.3}
            wireframe={isXRay}
          />
        </mesh>
        {/* Ribbed Container Seams */}
        {[-7, -4.5, -2, 0.5, 3, 5.5].map((x, idx) => (
          <mesh key={idx} position={[x, 0, 2.62]}>
            <boxGeometry args={[0.08, 3.3, 0.06]} />
            <meshStandardMaterial color="#ca8a04" />
          </mesh>
        ))}
        {/* Window Band */}
        <mesh position={[0, 0.4, 2.62]}>
          <boxGeometry args={[15, 0.8, 0.08]} />
          <meshStandardMaterial
            color={isThermal ? '#f59e0b' : '#0284c7'}
            roughness={0.1}
            metalness={0.9}
            emissive={isThermal ? '#f59e0b' : '#38bdf8'}
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>

      {/* Central Enclosed Arctic Corridor / Vestibule (White Insulated Tunnel) */}
      <mesh position={[0, 2.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 3.2, 3.4]} />
        <meshStandardMaterial color={corridorColor} roughness={0.3} wireframe={isXRay} />
      </mesh>

      {/* Access Staircase & Grated Steel Landing */}
      <group position={[-9.2, 1.2, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.6, 2.4, 2.2]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        {/* Handrail (Safety Yellow) */}
        <mesh position={[0.7, 1.6, 0]}>
          <boxGeometry args={[0.05, 0.9, 2.2]} />
          <meshStandardMaterial color="#eab308" />
        </mesh>
      </group>

      {/* Indian National Tricolor Flag & Station Plaque */}
      <group position={[-6.5, 2.6, 5.85]}>
        <mesh>
          <boxGeometry args={[2.4, 1.4, 0.06]} />
          <meshStandardMaterial color="#f97316" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.1, 0.04]}>
          <planeGeometry args={[2.2, 0.45]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0, -0.35, 0.04]}>
          <planeGeometry args={[2.2, 0.45]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
      </group>

      {/* 3. DIESEL GENERATOR POWER HOUSE BAY */}
      <group position={[-12.5, 0, 0]}>
        {/* Generator House Envelope */}
        <mesh position={[0, 1.9, 0]} ref={genBayRef} castShadow receiveShadow>
          <boxGeometry args={[5.5, 3.8, 6.8]} />
          <meshStandardMaterial
            color={genColor}
            emissive={isThermal ? '#f97316' : '#10b981'}
            emissiveIntensity={0.3}
            roughness={0.5}
            metalness={0.5}
            wireframe={isXRay}
          />
        </mesh>
        {/* Acoustic Louver Grilles */}
        <mesh position={[-2.78, 1.8, 0]}>
          <boxGeometry args={[0.06, 1.8, 4.0]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {/* Dual Vertical Exhaust Silencer Stacks */}
        <mesh position={[-1.2, 4.5, 1.2]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 2.0, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh position={[-1.2, 4.5, -1.2]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 2.0, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>

        {/* Dynamic Exhaust Plumes */}
        <ExhaustPlume
          position={[-1.2, 5.5, 1.2]}
          isActive={true}
          isTripped={false}
          powerKw={powerKw * 0.51}
        />
        <ExhaustPlume
          position={[-1.2, 5.5, -1.2]}
          isActive={true}
          isTripped={false}
          powerKw={powerKw * 0.49}
        />

        {/* South Wall Fuel Port Penetration (where Fuel Rack enters) */}
        <group position={[0, 1.5, 3.42]}>
          <mesh>
            <boxGeometry args={[1.2, 1.0, 0.15]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[-0.25, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.2, 16]} />
            <meshStandardMaterial color="#eab308" metalness={0.8} />
          </mesh>
          <mesh position={[0.25, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.2, 16]} />
            <meshStandardMaterial color="#f97316" metalness={0.8} />
          </mesh>
        </group>
      </group>

      {/* 4. OVERHEAD THERMAL COGENERATION CONDUIT (Gen House -> Main Living Station) */}
      <group position={[-9.1, 2.3, 0]}>
        {/* Directional Flow Conduit with Partial Moving Heat Light */}
        <DirectionalFlowConduit
          points={[
            [-1.1, 0, 0],
            [0, 0, 0],
            [1.1, 0, 0],
          ]}
          pipeRadius={0.16}
          baseColor="#475569"
          lineColor="#f97316"
          lightColor="#fdba74"
          numLights={1}
          lightLength={0.9}
          speed={1.8}
        />
        {/* Support Bracket */}
        <mesh position={[0, -0.6, 0]}>
          <boxGeometry args={[0.1, 1.0, 0.4]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
      </group>

      {/* 5. BULK FUEL STORAGE DEPOT (Tanks A & B with Secondary Berm) */}
      <group position={[-12.5, 0, 10.5]}>
        {/* Secondary Spill Containment Bund */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[8.5, 0.5, 6.2]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Tank 1 (A-Depot Horizontal Cylinder) */}
        <mesh position={[0, 1.5, -1.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[1.15, 1.15, 6.2, 24]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Tank 2 (B-Depot Horizontal Cylinder) */}
        <mesh position={[0, 1.5, 1.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[1.15, 1.15, 6.2, 24]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Fuel Transfer Manifold Pipe Skid */}
        <group position={[0, 0.8, -2.4]}>
          <mesh>
            <boxGeometry args={[2.5, 0.9, 0.8]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.6} />
          </mesh>
          {/* Isolation Valve Handwheels */}
          <mesh position={[-0.4, 0.6, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.08, 12]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0.4, 0.6, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.08, 12]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </group>
      </group>

      {/* 6. ELEVATED DIESEL FUEL SUPPLY & RETURN PIPE RACK (Fuel Depot -> Gen House) */}
      <group position={[-12.5, 0, 0]}>
        {/* Dual Pipe Run spanning Z=8.1 to Z=3.4 */}
        {/* Fuel Supply Line (Yellow band) */}
        <mesh position={[-0.25, 1.5, 5.75]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 4.7, 16]} />
          <meshStandardMaterial color="#eab308" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Fuel Return Line (Orange band) */}
        <mesh position={[0.25, 1.5, 5.75]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.10, 0.10, 4.7, 16]} />
          <meshStandardMaterial color="#f97316" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Structural Pipe Rack Support Gantry Frames */}
        {[7.2, 5.6, 4.2].map((zPos, idx) => (
          <group key={idx} position={[0, 0, zPos]}>
            {/* Crossbeam */}
            <mesh position={[0, 1.4, 0]}>
              <boxGeometry args={[1.4, 0.12, 0.15]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
            {/* Vertical Support Legs */}
            <mesh position={[-0.6, 0.7, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 1.4, 8]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[0.6, 0.7, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 1.4, 8]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            {/* Concrete Pad */}
            <mesh position={[0, 0.05, 0]}>
              <boxGeometry args={[1.6, 0.1, 0.4]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
          </group>
        ))}

        {/* Directional Fuel Supply Line & Partial Moving Light Beams (Fuel Depot -> Gen House) */}
        <DirectionalFlowConduit
          points={[
            [-0.25, 1.5, 8.1],
            [-0.25, 1.5, 5.75],
            [-0.25, 1.5, 3.4],
          ]}
          pipeRadius={0.11}
          baseColor="#334155"
          lineColor="#eab308"
          lightColor="#fef08a"
          speed={2.2}
          numLights={2}
          lightLength={1.4}
        />
      </group>

      {/* 7. TELECOMMUNICATIONS RADOME TOWER & PARABOLIC DISH */}
      <group position={[6.5, 4.0, 0]}>
        {/* Steel Lattice Pedestal */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[1.0, 1.4, 1.4, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        {/* Geodesic Radome Sphere */}
        <mesh position={[0, 1.8, 0]} castShadow>
          <sphereGeometry args={[1.6, 32, 24]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.1} />
        </mesh>
      </group>

      {/* Satellite Dish Antenna */}
      <group position={[10, 4.0, 3]}>
        <mesh position={[0, 0.8, 0]} rotation={[0.4, -0.6, 0]}>
          <cylinderGeometry args={[1.0, 0.1, 0.3, 24]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 1.2, 8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>

      {/* Automated Weather Station (AWS) with Real-Time Spinning Anemometer */}
      <MetAnemometer
        position={[14, 0, 9]}
        windSpeed={windSpeed}
        windDirection={windDirection}
      />

      {/* 8. COMPLETE CONNECTED WATER PIPELINE TO LAKE PRIYADARSHINI */}
      {/* Runs continuously from Block A Wall Gland [8.5, 1.8, -3.2] down to Lake Intake [22.0, 0.6, -15.0] */}
      <group position={[0, 0, 0]}>
        {/* A. Omega Thermal Expansion Goose-Neck at Block A Exit */}
        <group position={[8.7, 1.8, -3.2]}>
          {/* Horizontal Riser Out */}
          <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.4, 16]} />
            <meshStandardMaterial color="#0284c7" metalness={0.6} />
          </mesh>
          {/* Rising Loop Arc */}
          <mesh position={[0.4, 0.4, 0]}>
            <boxGeometry args={[0.2, 0.8, 0.3]} />
            <meshStandardMaterial color="#0284c7" metalness={0.6} />
          </mesh>
          <mesh position={[0.6, 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.5, 16]} />
            <meshStandardMaterial color="#0284c7" metalness={0.6} />
          </mesh>
        </group>

        {/* B. Segment 1: Elevated Gantry Run from Block A to Terrain Cradle */}
        {/* From [9.2, 1.4, -3.2] to [13.5, 0.65, -6.5] */}
        <mesh
          position={[11.35, 1.0, -4.85]}
          rotation={[0.25, -0.65, 0.16]}
          ref={pipeRef}
          castShadow
        >
          <cylinderGeometry args={[0.20, 0.20, 6.2, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial
            color={isPipeFreeze ? '#ef4444' : '#0284c7'}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>

        {/* C. Segment 2: Permafrost Run heading across oasis toward lake basin */}
        {/* From [13.5, 0.65, -6.5] to [18.0, 0.55, -11.0] */}
        <mesh
          position={[15.75, 0.60, -8.75]}
          rotation={[0.04, -0.78, 0.03]}
          castShadow
        >
          <cylinderGeometry args={[0.20, 0.20, 6.4, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial
            color={isPipeFreeze ? '#ef4444' : '#0284c7'}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>

        {/* D. Segment 3: Lake Shore Entry Run connecting directly into Lake Pump Skid */}
        {/* From [18.0, 0.55, -11.0] to [22.0, 0.6, -15.0] */}
        <mesh
          position={[20.0, 0.58, -13.0]}
          rotation={[-0.02, -0.78, 0.0]}
          castShadow
        >
          <cylinderGeometry args={[0.20, 0.20, 5.7, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial
            color={isPipeFreeze ? '#ef4444' : '#0284c7'}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>

        {/* Structural Steel Cradle Saddles with Yellow Trace-Heating Junction Boxes */}
        {[
          { x: 9.8, y: 1.1, z: -3.7 },
          { x: 12.0, y: 0.75, z: -5.3 },
          { x: 14.5, y: 0.55, z: -7.4 },
          { x: 17.0, y: 0.50, z: -9.8 },
          { x: 19.5, y: 0.50, z: -12.4 },
          { x: 21.6, y: 0.55, z: -14.5 },
        ].map((pt, idx) => (
          <group key={idx} position={[pt.x, 0, pt.z]}>
            {/* Structural Saddle H-Beam */}
            <mesh position={[0, pt.y * 0.5, 0]}>
              <boxGeometry args={[0.4, pt.y, 0.4]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            {/* Pipe Clamp Ring */}
            <mesh position={[0, pt.y, 0]}>
              <torusGeometry args={[0.26, 0.05, 8, 16]} />
              <meshStandardMaterial color="#475569" metalness={0.9} />
            </mesh>
            {/* Trace Heating Controller Junction Box with Active LED */}
            <mesh position={[0.22, pt.y, 0]}>
              <boxGeometry args={[0.18, 0.18, 0.12]} />
              <meshStandardMaterial
                color={isTraceOn ? (isPipeFreeze ? '#ef4444' : '#10b981') : '#f59e0b'}
                emissive={isTraceOn ? (isPipeFreeze ? '#dc2626' : '#059669') : '#d97706'}
                emissiveIntensity={0.8}
              />
            </mesh>
          </group>
        ))}

        {/* DIRECTIONAL THERMAL HEAT-TRACE FLOW LINE & MOVING PARTIAL LIGHT BEAMS */}
        <DirectionalFlowConduit
          points={[
            [8.5, 1.8, -3.2],
            [11.0, 1.2, -4.8],
            [13.5, 0.7, -6.5],
            [16.0, 0.55, -8.8],
            [18.5, 0.55, -11.5],
            [22.0, 0.6, -15.0],
          ]}
          pipeRadius={0.14}
          baseColor="#334155"
          lineColor={isPipeFreeze ? '#ef4444' : '#0284c7'}
          lightColor={isPipeFreeze ? '#f87171' : '#7dd3fc'}
          speed={isPipeFreeze ? 0.3 : 2.5}
          numLights={3}
          lightLength={1.8}
          isWarning={isPipeFreeze}
          warningColor="#ef4444"
          warningLightColor="#f87171"
        />
      </group>

      {/* 8b. CENTRAL EMERGENCY BESS & UPS ENCLOSURE (150 kWh Deep-Cycle VRLA / LiFePO4) */}
      <group position={[-16.5, 0, 4.5]}>
        {/* Concrete Foundation Skid */}
        <mesh position={[0, 0.15, 0]} receiveShadow>
          <boxGeometry args={[3.8, 0.3, 2.8]} />
          <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.7} />
        </mesh>

        {/* Heavy-Duty ISO Battery Container Envelope */}
        <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.4, 2.2, 2.4]} />
          <meshStandardMaterial
            color={isThermal ? '#0284c7' : '#1e293b'}
            metalness={0.6}
            roughness={0.4}
            wireframe={isXRay}
          />
        </mesh>

        {/* Structural Roof Rim & Weather Flashing */}
        <mesh position={[0, 2.52, 0]}>
          <boxGeometry args={[3.5, 0.08, 2.5]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>

        {/* Twin Roof-Mounted Climatizer HVAC Pods (Maintains 18-22°C against Katabatic Freezing) */}
        <group position={[-0.8, 2.75, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.45, 0.8]} />
            <meshStandardMaterial color="#475569" metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.24, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.04, 16]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>
        <group position={[0.8, 2.75, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.45, 0.8]} />
            <meshStandardMaterial color="#475569" metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.24, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.04, 16]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>

        {/* Front Access Doors & High Voltage Arc Flash Hazard Strip */}
        <mesh position={[1.71, 1.3, 0]}>
          <boxGeometry args={[0.04, 1.8, 1.8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
        <mesh position={[1.73, 1.3, 0]}>
          <planeGeometry args={[0.04, 1.6]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        {/* Safety Warning Emblem */}
        <mesh position={[1.74, 1.6, 0.4]}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshStandardMaterial
            color="#eab308"
            emissive="#ca8a04"
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Real-time Dynamic Battery SOC Glowing Status Bar */}
        <mesh position={[1.74, 0.8, 0]}>
          <boxGeometry args={[0.02, 0.12, 1.2]} />
          <meshStandardMaterial
            color={isBatteryDischarging ? '#f59e0b' : '#10b981'}
            emissive={isBatteryDischarging ? '#d97706' : '#059669'}
            emissiveIntensity={0.9}
          />
        </mesh>

        {/* Overhead Status Beacon Light */}
        <mesh position={[0, 2.65, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.22, 12]} />
          <meshStandardMaterial
            color={isBatteryDischarging ? '#f59e0b' : '#10b981'}
            emissive={isBatteryDischarging ? '#d97706' : '#059669'}
            emissiveIntensity={1.2}
          />
        </mesh>

        {/* DC Output Junction Flange */}
        <mesh position={[1.72, 0.4, -0.6]}>
          <boxGeometry args={[0.1, 0.4, 0.4]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
      </group>

      {/* Heavy-Duty DC Tie-in Power Conduit (BESS -> Generator Switchgear Annex) */}
      <DirectionalFlowConduit
        points={[
          [-14.8, 0.4, 3.9],
          [-13.8, 0.4, 3.2],
          [-12.5, 0.8, 2.6],
        ]}
        pipeRadius={0.07}
        baseColor="#0f172a"
        lineColor={isBatteryDischarging ? '#f59e0b' : '#10b981'}
        lightColor={isBatteryDischarging ? '#fde047' : '#6ee7b7'}
        speed={isBatteryDischarging ? 2.8 : 1.2}
        numLights={2}
        lightLength={0.7}
        isWarning={isBatteryDischarging}
        warningColor="#f59e0b"
        warningLightColor="#fde047"
      />

      {/* 9. LIVE HOLOGRAPHIC SCADA TELEMETRY HOTSPOTS */}
      <HotspotMarker
        position={[-16.5, 3.8, 4.5]}
        label="Central BESS & UPS"
        subsystemCode="BATTERY_STORAGE"
        status={isBatteryDischarging ? "WARNING" : "NOMINAL"}
        metricValue={batterySoc}
        metricUnit="% SOC"
        onClick={onSelectHotspot}
        isModalOpen={isModalOpen}
        activeHotspot={activeSubsystem}
      />
      <HotspotMarker
        position={[-12.5, 5.2, 0]}
        label="Diesel Gensets"
        subsystemCode="POWER_CHP"
        status="NOMINAL"
        metricValue={powerKw}
        metricUnit="kW"
        onClick={onSelectHotspot}
        isModalOpen={isModalOpen}
        activeHotspot={activeSubsystem}
      />
      <HotspotMarker
        position={[-12.5, 3.8, 10.5]}
        label="A/B Fuel Depot"
        subsystemCode="FUEL_STORAGE"
        status="NOMINAL"
        metricValue={fuelBurn}
        metricUnit="L/h"
        onClick={onSelectHotspot}
        isModalOpen={isModalOpen}
        activeHotspot={activeSubsystem}
      />
      <HotspotMarker
        position={[16, 2.4, -9]}
        label={isPipeFreeze ? "Priyadarshini Line FREEZE" : "Priyadarshini Pipeline"}
        subsystemCode="WATER_INTAKE"
        status={isPipeFreeze ? "CRITICAL" : "NOMINAL"}
        metricValue={pipeTemp}
        metricUnit="°C"
        onClick={onSelectHotspot}
        isModalOpen={isModalOpen}
        activeHotspot={activeSubsystem}
      />
      <HotspotMarker
        position={[6.5, 6.6, 0]}
        label="Radome & Telecom"
        subsystemCode="STRUCTURAL_HEALTH"
        status={isBlizzard ? "WARNING" : "NOMINAL"}
        metricValue={structuralIntegrity}
        metricUnit="% Integrity"
        onClick={onSelectHotspot}
        isModalOpen={isModalOpen}
        activeHotspot={activeSubsystem}
      />
      <HotspotMarker
        position={[14, 9.2, 9]}
        label="AWS Met Anemometer"
        subsystemCode="WEATHER"
        status={isBlizzard ? "CRITICAL" : "NOMINAL"}
        metricValue={windSpeed}
        metricUnit="km/h"
        onClick={onSelectHotspot}
        isModalOpen={isModalOpen}
        activeHotspot={activeSubsystem}
      />
    </group>
  );
}
