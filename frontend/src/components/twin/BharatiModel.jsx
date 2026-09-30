import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import HotspotMarker from './HotspotMarker';
import MetAnemometer from './MetAnemometer';
import ExhaustPlume from './ExhaustPlume';
import DirectionalFlowConduit from './DirectionalFlowConduit';

export default function BharatiModel({
  telemetry,
  onSelectHotspot,
  viewMode = 'NORMAL', // 'NORMAL' | 'THERMAL' | 'XRAY'
  isDaylight = true,
  isModalOpen = false,
  activeSubsystem = null,
}) {
  const chpBayRef = useRef();
  const stiltGroupRef = useRef();
  const glycolRef = useRef();

  const sim = telemetry?.simulation || {};
  const activeIncident = telemetry?.active_incident;
  const isChpTrip = activeIncident === 'CHP_GEN2_TRIP';
  const isGlycolDrop = activeIncident === 'GLYCOL_PRESSURE_DROP';
  const isBlizzard = activeIncident === 'BLIZZARD_ALERT';
  const windSpeed = telemetry?.kpis?.wind_speed ?? telemetry?.wind_speed ?? 22.4;
  const windDirection = telemetry?.wind_direction ?? 105;
  const powerKw = telemetry?.kpis?.power_kw ?? telemetry?.total_power_kw ?? 308;
  const glycolTemp = telemetry?.kpis?.thermal_temp ?? telemetry?.primary_thermal_temp ?? 60.2;
  const glycolPressure = sim.glycol_pressure ?? 3.05;
  const fuelBurn = sim.fuel_burn_rate ?? 28.5;
  const vibrationIndex = sim.vibration_index ?? 0.38;
  const structuralIntegrity = Math.max(90.0, Math.min(100.0, +(100 - (vibrationIndex * 1.8)).toFixed(1)));
  const batterySoc = telemetry?.kpis?.battery_soc ?? sim.battery_soc ?? 98.2;
  const batteryVoltage = telemetry?.kpis?.battery_voltage ?? sim.battery_voltage ?? 401.8;
  const batteryCurrent = telemetry?.kpis?.battery_current ?? sim.battery_current ?? (isChpTrip ? -68.0 : 8.0);
  const isBatteryDischarging = batteryCurrent < 0 || isChpTrip;

  const isThermal = viewMode === 'THERMAL';
  const isXRay = viewMode === 'XRAY';

  // Dynamic animations for structural stilt oscillations, glycol circulation, and CHP generator heat
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Structural chassis katabatic micro-oscillations during high winds
    if (stiltGroupRef.current) {
      if (windSpeed > 60 || isBlizzard) {
        const amplitude = (windSpeed / 100) * 0.035;
        stiltGroupRef.current.position.x = Math.sin(t * 26) * amplitude;
        stiltGroupRef.current.position.z = Math.cos(t * 22) * amplitude;
      } else {
        stiltGroupRef.current.position.x = 0;
        stiltGroupRef.current.position.z = 0;
      }
    }

    // 4. Glycol pipe material status
    if (glycolRef.current) {
      if (isGlycolDrop) {
        const blink = Math.sin(t * 8) > 0 ? 0.9 : 0.2;
        glycolRef.current.material.color.setRGB(0.9, 0.2, 0.2);
        glycolRef.current.material.emissive.setRGB(blink * 0.7, 0.1, 0.1);
      } else {
        glycolRef.current.material.color.setRGB(0.05, 0.75, 0.85);
        glycolRef.current.material.emissive.setRGB(0.02, 0.25, 0.35);
      }
    }

    // 5. CHP generator bay heat glow
    if (chpBayRef.current) {
      if (isChpTrip) {
        const blink = Math.sin(t * 8) > 0 ? 0.9 : 0.2;
        chpBayRef.current.material.emissive.setRGB(blink * 0.8, 0.1, 0.1);
      } else if (isThermal) {
        chpBayRef.current.material.color.setRGB(1.0, 0.35, 0.1);
      } else {
        chpBayRef.current.material.emissive.setRGB(0.1, 0.6, 0.4);
        chpBayRef.current.material.emissiveIntensity = 0.35 + Math.sin(t * 3) * 0.15;
      }
    }
  });

  const groundColor = isThermal ? '#0f172a' : isDaylight ? '#f8fafc' : '#1e293b';
  const rockColor = isThermal ? '#1e293b' : isDaylight ? '#64748b' : '#334155';
  const snowColor = isThermal ? '#0284c7' : isDaylight ? '#ffffff' : '#e2e8f0';
  const hullColor = isThermal ? '#38bdf8' : '#94a3b8';
  const stiltColor = isThermal ? '#0284c7' : '#334155';

  return (
    <group position={[0, 0, 0]}>
      {/* 1. TERRAIN BASE - Larsemann Hills coastal bedrock & snow ripples */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[95, 95, 32, 32]} />
        <meshStandardMaterial
          color={groundColor}
          roughness={0.9}
          metalness={0.05}
          wireframe={isXRay}
        />
      </mesh>

      {/* Rugged Rocky Ridges of Larsemann Hills */}
      {[-22, -6, 15, 26].map((x, i) =>
        [-16, 8, -14, 18].map((z, j) => (
          <mesh
            key={`${i}-${j}`}
            position={[x + Math.sin(i) * 2.5, 0.35, z + Math.cos(j) * 2.5]}
            rotation={[0.15, (i + j) * 0.7, -0.2]}
            castShadow
            receiveShadow
          >
            <dodecahedronGeometry args={[1.4 + (j % 2) * 0.7, 1]} />
            <meshStandardMaterial color={rockColor} roughness={0.95} />
          </mesh>
        ))
      )}

      {/* Wind-swept snow patches flowing under elevated stilts */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, -0.06, 0]} receiveShadow>
        <circleGeometry args={[22, 32]} />
        <meshStandardMaterial color={snowColor} roughness={0.65} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[18, -0.06, -8]} receiveShadow>
        <circleGeometry args={[16, 32]} />
        <meshStandardMaterial color={snowColor} roughness={0.7} />
      </mesh>

      {/* 2. ELEVATED STILTED CHASSIS & AERODYNAMIC STRUCTURE */}
      <group ref={stiltGroupRef}>
        {/* Structural Steel Stilts (18 columns raising station 3.5m above ground) */}
        {[-10, -5, 0, 5, 10].map((x) =>
          [-3.6, 3.6].map((z, idx) => (
            <group key={`${x}-${z}-${idx}`} position={[x, 1.75, z]}>
              {/* Tubular Heavy Column */}
              <mesh castShadow>
                <cylinderGeometry args={[0.26, 0.36, 3.5, 16]} />
                <meshStandardMaterial color={stiltColor} metalness={0.85} roughness={0.25} />
              </mesh>
              {/* Concrete Foundation Footing Pad */}
              <mesh position={[0, -1.7, 0]} receiveShadow>
                <boxGeometry args={[1.4, 0.3, 1.4]} />
                <meshStandardMaterial color="#0f172a" roughness={0.9} />
              </mesh>
              {/* Hydraulic Vibration Damper Ring */}
              <mesh position={[0, 0.6, 0]}>
                <torusGeometry args={[0.32, 0.08, 8, 16]} />
                <meshStandardMaterial
                  color={windSpeed > 60 ? '#ef4444' : '#f59e0b'}
                  emissive={windSpeed > 60 ? '#dc2626' : '#d97706'}
                  emissiveIntensity={windSpeed > 60 ? 0.8 : 0.3}
                  metalness={0.7}
                />
              </mesh>
            </group>
          ))
        )}

        {/* Diagonal Steel Cross-Bracing */}
        {[-7.5, 2.5].map((x, idx) => (
          <group key={idx}>
            <mesh position={[x, 1.8, 0]} rotation={[0, 0, 0.4]}>
              <cylinderGeometry args={[0.08, 0.08, 6.4, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.7} />
            </mesh>
            <mesh position={[x, 1.8, 0]} rotation={[0, 0, -0.4]}>
              <cylinderGeometry args={[0.08, 0.08, 6.4, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.7} />
            </mesh>
          </group>
        ))}

        {/* 3. MAIN AERODYNAMIC WEDGE STATION MODULE */}
        {/* Lower Main Hull (Double-deck containerized composite envelope) */}
        <mesh position={[0, 5.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[26, 3.6, 9.8]} />
          <meshStandardMaterial
            color={hullColor}
            metalness={0.75}
            roughness={0.25}
            wireframe={isXRay}
          />
        </mesh>

        {/* Aerodynamic Wind Deflection Nose / Bevel (Front wedge facing katabatic winds) */}
        <mesh position={[14.1, 4.9, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
          <boxGeometry args={[2.7, 2.7, 9.7]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Upper Observation Deck & Helideck Structure */}
        <mesh position={[2, 7.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[18.5, 1.3, 8.8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Helipad Marking on Roof with Runway Lights */}
        <group position={[5, 7.82, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[3.0, 32]} />
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.8, 1.8]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
            const angle = (idx * Math.PI) / 4;
            return (
              <mesh key={idx} position={[Math.cos(angle) * 2.8, 0.05, Math.sin(angle) * 2.8]}>
                <cylinderGeometry args={[0.06, 0.06, 0.1, 8]} />
                <meshStandardMaterial
                  color="#10b981"
                  emissive="#10b981"
                  emissiveIntensity={1.0}
                />
              </mesh>
            );
          })}
        </group>

        {/* Panoramic Observation Windows */}
        <mesh position={[1, 5.5, 4.92]}>
          <boxGeometry args={[22, 1.3, 0.1]} />
          <meshStandardMaterial
            color={isThermal ? '#f59e0b' : '#0284c7'}
            metalness={0.9}
            roughness={0.1}
            emissive={isThermal ? '#f59e0b' : '#38bdf8'}
            emissiveIntensity={0.25}
          />
        </mesh>
        <mesh position={[1, 5.5, -4.92]}>
          <boxGeometry args={[22, 1.3, 0.1]} />
          <meshStandardMaterial
            color={isThermal ? '#f59e0b' : '#0284c7'}
            metalness={0.9}
            roughness={0.1}
            emissive={isThermal ? '#f59e0b' : '#38bdf8'}
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* Indian Flag & Station Plaque */}
        <group position={[8.5, 5.3, 4.98]}>
          <mesh>
            <boxGeometry args={[2.6, 1.4, 0.05]} />
            <meshStandardMaterial color="#f97316" />
          </mesh>
          <mesh position={[0, 0.1, 0.03]}>
            <planeGeometry args={[2.4, 0.45]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0, -0.35, 0.03]}>
            <planeGeometry args={[2.4, 0.45]} />
            <meshStandardMaterial color="#16a34a" />
          </mesh>
        </group>

        {/* 4. TRI-GENERATION CHP GENERATOR BAY & EXHAUST FLUES */}
        {/* Service / Power Generation Module at Rear (-X end) */}
        <mesh position={[-11.8, 5.0, 0]} ref={chpBayRef} castShadow receiveShadow>
          <boxGeometry args={[4.8, 3.5, 9.4]} />
          <meshStandardMaterial
            color="#334155"
            emissive={isThermal ? '#f97316' : '#10b981'}
            emissiveIntensity={0.3}
            metalness={0.6}
            roughness={0.4}
            wireframe={isXRay}
          />
        </mesh>

        {/* 3 CHP Individual Exhaust Silencer Stacks */}
        {[-2.0, 0, 2.0].map((z, idx) => (
          <mesh key={idx} position={[-12.4, 8.0, z]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 2.4, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
        ))}

        {/* Dynamic Exhaust Plumes & Emergency Trip Strobes */}
        <ExhaustPlume
          position={[-12.4, 9.2, -2.0]}
          isActive={true}
          isTripped={false}
          powerKw={isChpTrip ? 158 : 108}
        />
        <ExhaustPlume
          position={[-12.4, 9.2, 0]}
          isActive={!isChpTrip}
          isTripped={isChpTrip}
          powerKw={isChpTrip ? 0 : 104}
        />
        <ExhaustPlume
          position={[-12.4, 9.2, 2.0]}
          isActive={true}
          isTripped={false}
          powerKw={isChpTrip ? 152 : 96}
        />

        {/* 5. CONNECTED 57% GLYCOL HYDRONIC HEATING LOOP (CHP Room -> Building Chassis -> AHUs) */}
        {/* Originates inside CHP Bay [-11.8, 3.5, -2.5], runs along underfloor chassis to [+9.0, 3.5, -2.5] */}
        <group position={[0, 0, 0]}>
          {/* Main Primary Glycol Supply Trunk (Red Band, 60°C) */}
          <mesh position={[-1.4, 3.45, -2.5]} rotation={[0, 0, Math.PI / 2]} ref={glycolRef} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 20.8, 16]} />
            <meshStandardMaterial color="#06b6d4" metalness={0.7} roughness={0.25} />
          </mesh>

          {/* Parallel Glycol Return Trunk (Blue Band, 45°C) */}
          <mesh position={[-1.4, 3.45, -2.8]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.14, 0.14, 20.8, 16]} />
            <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.25} />
          </mesh>

          {/* Vertical Riser Branches Penetrating Chassis into AHU Heating Coils */}
          {[-6.0, 0.5, 7.0].map((xPos, idx) => (
            <group key={idx} position={[xPos, 3.75, -2.65]}>
              {/* Vertical Gland Riser Pipe */}
              <mesh castShadow>
                <cylinderGeometry args={[0.12, 0.12, 0.6, 12]} />
                <meshStandardMaterial color="#0891b2" metalness={0.8} />
              </mesh>
              {/* Floor Penetration Sleeve Flange */}
              <mesh position={[0, 0.3, 0]}>
                <boxGeometry args={[0.4, 0.1, 0.4]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
              {/* Thermal Coil AHU Duct */}
              <mesh position={[0, 0.8, 0]}>
                <boxGeometry args={[1.2, 0.9, 1.0]} />
                <meshStandardMaterial color="#475569" metalness={0.7} />
              </mesh>
            </group>
          ))}

          {/* Glycol VFD Circulation Pumps & Pressure Indicator Skids */}
          {[-9.5, -3.5, 3.5].map((x, idx) => (
            <group key={idx} position={[x, 3.45, -2.5]}>
              <mesh>
                <boxGeometry args={[0.6, 0.6, 0.7]} />
                <meshStandardMaterial color="#0f172a" metalness={0.8} />
              </mesh>
              {/* Pressure Valve Indicator */}
              <mesh position={[0, 0.35, 0.3]}>
                <cylinderGeometry args={[0.12, 0.12, 0.08, 12]} />
                <meshStandardMaterial
                  color={isGlycolDrop ? '#ef4444' : '#10b981'}
                  emissive={isGlycolDrop ? '#dc2626' : '#059669'}
                  emissiveIntensity={0.8}
                />
              </mesh>
            </group>
          ))}

          {/* DIRECTIONAL GLYCOL HYDRONIC HEATING CONDUIT & PARTIAL MOVING LIGHT BEAMS */}
          <DirectionalFlowConduit
            points={[
              [-11.8, 3.45, -2.5],
              [-2.0, 3.45, -2.5],
              [8.2, 3.45, -2.5],
            ]}
            pipeRadius={0.16}
            baseColor="#1e293b"
            lineColor={isGlycolDrop ? '#ef4444' : '#06b6d4'}
            lightColor={isGlycolDrop ? '#f87171' : '#67e8f9'}
            speed={isGlycolDrop ? 0.8 : 3.0}
            numLights={3}
            lightLength={2.2}
            isWarning={isGlycolDrop}
            warningColor="#ef4444"
            warningLightColor="#f87171"
          />
        </group>

        {/* 6. TELECOM RADOME & PRIMARY RADAR */}
        <group position={[-5, 8.5, 0]}>
          <mesh position={[0, 0.9, 0]} castShadow>
            <sphereGeometry args={[1.3, 32, 24]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.65, 0.85, 0.9, 16]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      </group>

      {/* 7. EXTERNAL BULK FUEL STORAGE COMPLEX (Ground Tanks) */}
      <group position={[-19, 0, 9]}>
        {/* Double-Wall ISO Containerized Fuel Depot */}
        <mesh position={[0, 1.3, 0]} castShadow>
          <boxGeometry args={[6.5, 2.6, 5.5]} />
          <meshStandardMaterial color="#475569" metalness={0.6} />
        </mesh>
        {/* Yellow Safety Roof Cap */}
        <mesh position={[0, 2.7, 0]}>
          <boxGeometry args={[6.3, 0.2, 5.3]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
        {/* Fuel Pumping Skid Flange Port */}
        <mesh position={[2.8, 1.0, -1.0]}>
          <boxGeometry args={[1.0, 1.2, 1.2]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* 8. CONNECTED ELEVATED BULK FUEL SUPPLY PIPELINE (Ground Depot -> Elevated CHP Bay) */}
      {/* Runs from Depot Skid [-16.2, 1.2, 8.0] rising diagonally up to CHP Fuel Inlet [-11.8, 3.8, 3.2] */}
      <group position={[0, 0, 0]}>
        {/* DIRECTIONAL ELEVATED FUEL PIPELINE BRIDGE & PARTIAL MOVING LIGHT BEAMS */}
        <DirectionalFlowConduit
          points={[
            [-16.2, 1.2, 8.0],
            [-14.0, 2.5, 5.6],
            [-11.8, 3.8, 3.2],
          ]}
          pipeRadius={0.13}
          baseColor="#334155"
          lineColor="#eab308"
          lightColor="#fde047"
          speed={2.2}
          numLights={2}
          lightLength={1.6}
        />

        {/* Elevated Structural Steel Support Truss Pylons */}
        {[
          { x: -16.0, y: 1.4, z: 7.2 },
          { x: -13.5, y: 2.6, z: 5.0 },
        ].map((pt, idx) => (
          <group key={idx} position={[pt.x, 0, pt.z]}>
            <mesh position={[0, pt.y * 0.5, 0]}>
              <cylinderGeometry args={[0.1, 0.14, pt.y, 8]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <boxGeometry args={[0.8, 0.1, 0.8]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
          </group>
        ))}

        {/* Fuel Entry Port into CHP Service Block */}
        <mesh position={[-11.78, 3.8, 3.2]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.22, 0.22, 0.3, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} />
        </mesh>
      </group>

      {/* 8.5 INTEGRATED MICROGRID BESS & DUAL 60 kVA UPS INVERTERS (200 kWh LiFePO4 Array) */}
      <group position={[-7.5, 0, 0]}>
        {/* Suspended Technical Steel Mezzanine Platform */}
        <mesh position={[0, 1.25, 0]} receiveShadow>
          <boxGeometry args={[4.4, 0.2, 3.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Structural Platform H-Beam Supports tied to Stilts */}
        {[-1.8, 1.8].map((px, idx) => (
          <mesh key={idx} position={[px, 0.6, 0]}>
            <boxGeometry args={[0.2, 1.1, 3.2]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} />
          </mesh>
        ))}

        {/* Dual 60 kVA Online Double-Conversion PCS / Inverter Cabinets */}
        <group position={[-1.3, 2.2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.0, 1.7, 2.6]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Inverter Digital Telemetry Display & Vent Louvers */}
          <mesh position={[-0.51, 0.3, 0]}>
            <planeGeometry args={[1.8, 0.5]} rotation={[0, -Math.PI / 2, 0]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#0284c7"
              emissiveIntensity={0.6}
            />
          </mesh>
          <mesh position={[-0.51, -0.4, 0]}>
            <planeGeometry args={[2.0, 0.6]} rotation={[0, -Math.PI / 2, 0]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>

        {/* 4x 50 kWh Modular LiFePO4 High-C Battery Racks */}
        {[-0.9, -0.3, 0.3, 0.9].map((rz, rIdx) => (
          <group key={rIdx} position={[0.7, 2.2, rz]}>
            {/* Battery Enclosure Rack */}
            <mesh castShadow>
              <boxGeometry args={[1.8, 1.7, 0.48]} />
              <meshStandardMaterial
                color={isThermal ? '#0284c7' : '#0f172a'}
                metalness={0.8}
                roughness={0.2}
                wireframe={isXRay}
              />
            </mesh>
            {/* Front Smoked Acrylic Door with Illuminated Cell Modules */}
            <mesh position={[0, 0, 0.25]}>
              <boxGeometry args={[1.6, 1.5, 0.04]} />
              <meshStandardMaterial
                color={isBatteryDischarging ? '#f59e0b' : '#10b981'}
                emissive={isBatteryDischarging ? '#d97706' : '#059669'}
                emissiveIntensity={isBatteryDischarging ? 0.9 : 0.45}
                transparent
                opacity={0.85}
              />
            </mesh>
            {/* BMS Module Head Controller Bar */}
            <mesh position={[0, 0.72, 0.26]}>
              <boxGeometry args={[1.5, 0.1, 0.03]} />
              <meshStandardMaterial
                color={isBatteryDischarging ? '#f59e0b' : '#38bdf8'}
                emissive={isBatteryDischarging ? '#d97706' : '#0284c7'}
                emissiveIntensity={0.8}
              />
            </mesh>
          </group>
        ))}

        {/* Active BESS Status Beacon Light */}
        <mesh position={[0, 3.2, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.2, 12]} />
          <meshStandardMaterial
            color={isBatteryDischarging ? '#f59e0b' : '#10b981'}
            emissive={isBatteryDischarging ? '#d97706' : '#059669'}
            emissiveIntensity={1.3}
          />
        </mesh>
      </group>

      {/* Directional DC Microgrid Intertie Busbar (BESS PCS -> CHP Switchgear Module) */}
      <DirectionalFlowConduit
        points={[
          [-8.8, 2.4, 0],
          [-10.2, 3.2, 0],
          [-11.8, 4.2, 0],
        ]}
        pipeRadius={0.08}
        baseColor="#0f172a"
        lineColor={isBatteryDischarging ? '#f59e0b' : '#10b981'}
        lightColor={isBatteryDischarging ? '#fde047' : '#6ee7b7'}
        speed={isBatteryDischarging ? 3.0 : 1.2}
        numLights={2}
        lightLength={0.8}
        isWarning={isBatteryDischarging}
        warningColor="#f59e0b"
        warningLightColor="#fde047"
      />

      {/* 9. AWS METEOROLOGICAL TOWER WITH REAL-TIME ANEMOMETER */}
      <MetAnemometer
        position={[20, 0, 11]}
        windSpeed={windSpeed}
        windDirection={windDirection}
      />

      {/* 10. LIVE HOLOGRAPHIC SCADA TELEMETRY HOTSPOTS */}
      <HotspotMarker
        position={[-7.5, 4.3, 2.2]}
        label="Microgrid BESS & UPS"
        subsystemCode="BATTERY_STORAGE"
        status={isBatteryDischarging ? "WARNING" : "NOMINAL"}
        metricValue={batterySoc}
        metricUnit="% SOC"
        onClick={onSelectHotspot}
        isModalOpen={isModalOpen}
        activeHotspot={activeSubsystem}
      />
      <HotspotMarker
        position={[-12.4, 9.6, 0]}
        label={isChpTrip ? "CHP Gen #2 TRIPPED" : "3x CHP Microgrid"}
        subsystemCode="POWER_CHP"
        status={isChpTrip ? "CRITICAL" : "NOMINAL"}
        metricValue={powerKw}
        metricUnit="kW"
        onClick={onSelectHotspot}
        isModalOpen={isModalOpen}
        activeHotspot={activeSubsystem}
      />
      <HotspotMarker
        position={[-19, 4.2, 9]}
        label="Bulk Fuel Depot"
        subsystemCode="FUEL_STORAGE"
        status="NOMINAL"
        metricValue={fuelBurn}
        metricUnit="L/h"
        onClick={onSelectHotspot}
        isModalOpen={isModalOpen}
        activeHotspot={activeSubsystem}
      />
      <HotspotMarker
        position={[0, 2.4, -2.6]}
        label={isGlycolDrop ? "Glycol Loop CAVITATION" : "57% Glycol Hydronic Loop"}
        subsystemCode="HVAC_GLYCOL"
        status={isGlycolDrop ? "CRITICAL" : "NOMINAL"}
        metricValue={glycolTemp}
        metricUnit="°C"
        onClick={onSelectHotspot}
        isModalOpen={isModalOpen}
        activeHotspot={activeSubsystem}
      />
      <HotspotMarker
        position={[-5, 10.4, 0]}
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
        position={[20, 9.2, 11]}
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
