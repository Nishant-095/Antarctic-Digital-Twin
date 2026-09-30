import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import MaitriModel from './MaitriModel';
import BharatiModel from './BharatiModel';
import BlizzardParticles from './BlizzardParticles';
import {
  Maximize2,
  Minimize2,
  Eye,
  Wind,
  Layers,
  Thermometer,
  Box,
  Compass,
  Zap,
  Flame,
  Droplets,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

function CameraRig({ targetPosition, targetLookAt, waypointTrigger, controlsRef }) {
  const isTransitioningRef = useRef(false);
  const targetPosVec = useRef(new THREE.Vector3());
  const targetLookVec = useRef(new THREE.Vector3());
  const prevTriggerRef = useRef(null);

  // Only trigger smooth flight when waypointTrigger explicitly changes
  useEffect(() => {
    if (waypointTrigger !== undefined && waypointTrigger !== null && waypointTrigger !== prevTriggerRef.current) {
      prevTriggerRef.current = waypointTrigger;
      if (targetPosition && targetLookAt) {
        targetPosVec.current.set(...targetPosition);
        targetLookVec.current.set(...targetLookAt);
        isTransitioningRef.current = true;
      }
    }
  }, [waypointTrigger, targetPosition, targetLookAt]);

  // Cancel transition IMMEDIATELY upon any user interaction with OrbitControls (wheel, drag, touch)
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const handleUserStart = () => {
      isTransitioningRef.current = false;
    };
    controls.addEventListener('start', handleUserStart);
    return () => controls.removeEventListener('start', handleUserStart);
  }, [controlsRef]);

  useFrame((state, delta) => {
    if (!controlsRef.current || !isTransitioningRef.current) return;
    const controls = controlsRef.current;

    controls.object.position.lerp(
      targetPosVec.current,
      Math.min(1.0, delta * 3.5)
    );
    controls.target.lerp(
      targetLookVec.current,
      Math.min(1.0, delta * 3.5)
    );
    controls.update();

    if (
      controls.object.position.distanceTo(targetPosVec.current) < 0.15 &&
      controls.target.distanceTo(targetLookVec.current) < 0.15
    ) {
      isTransitioningRef.current = false;
    }
  });

  return null;
}

export default function StationCanvas({
  stationSlug,
  telemetry,
  onSelectHotspot,
  isFullscreen,
  onToggleFullscreen,
  cameraTargetPosition,
  cameraTargetLookAt,
  waypointTrigger,
  isModalOpen = false,
  activeSubsystem = null,
}) {
  const { isDark } = useTheme();
  const controlsRef = useRef();
  const [viewMode, setViewMode] = useState('NORMAL'); // 'NORMAL' | 'THERMAL' | 'XRAY'
  const [lightingEnv, setLightingEnv] = useState('DAYLIGHT'); // 'DAYLIGHT' | 'NIGHT'

  const isMaitri = stationSlug === 'maitri';
  const isDaylight = lightingEnv === 'DAYLIGHT';
  const windSpeed = telemetry?.kpis?.wind_speed ?? 25;
  const windDirection = telemetry?.wind_direction ?? 115;
  const activeIncident = telemetry?.active_incident;

  // Camera presets
  const applyCameraPreset = (camPos, targetPos) => {
    if (controlsRef.current) {
      controlsRef.current.object.position.set(...camPos);
      controlsRef.current.target.set(...targetPos);
      controlsRef.current.update();
    }
  };

  const resetCamera = () => {
    applyCameraPreset([24, 15, 28], [0, 3, 0]);
  };

  const zoomIn = () => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      const cam = controls.object;
      const target = controls.target;
      const offset = new THREE.Vector3().subVectors(cam.position, target);
      if (offset.length() > 4.0) {
        offset.multiplyScalar(0.78);
        cam.position.copy(target).add(offset);
        controls.update();
      }
    }
  };

  const zoomOut = () => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      const cam = controls.object;
      const target = controls.target;
      const offset = new THREE.Vector3().subVectors(cam.position, target);
      if (offset.length() < 90.0) {
        offset.multiplyScalar(1.28);
        cam.position.copy(target).add(offset);
        controls.update();
      }
    }
  };

  const hudBg = isDark ? 'bg-slate-950/90 border-slate-700/80 text-slate-200' : 'bg-white/95 border-slate-300 text-slate-800 shadow-sm';
  const hudSubText = isDark ? 'text-slate-400' : 'text-slate-500';
  const hudValText = isDark ? 'text-white' : 'text-slate-900';

  return (
    <div className={`relative w-full h-full overflow-hidden select-none transition-colors ${
      isDaylight ? 'bg-white' : 'bg-[#080d1a]'
    }`}>
      {/* 1. TOP-LEFT: HUD Coordinates & Live Katabatic Vector */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        <div className={`flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono border shadow-sm transition-colors ${hudBg}`}>
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-status-blink" />
          <span className="font-bold uppercase tracking-wider">
            {isMaitri ? 'MAITRI DIGITAL TWIN (1989)' : 'BHARATI DIGITAL TWIN (2012)'}
          </span>
          <span className={`text-[10px] ${hudSubText}`}>
            {isMaitri ? '70°45\'58"S 11°44\'09"E' : '69°24\'28"S 76°11\'14"E'}
          </span>
        </div>

        {/* Katabatic Vector Pill */}
        <div className={`flex items-center gap-2 px-2.5 py-1 rounded text-[11px] font-mono border shadow-sm transition-colors ${hudBg}`}>
          <Wind className="w-3.5 h-3.5 text-sky-500" />
          <span>
            KATABATIC STREAM: <span className={`font-bold font-mono-num ${hudValText}`}>{windSpeed.toFixed(1)} km/h</span> @{' '}
            <span className={`font-bold font-mono-num ${hudValText}`}>{windDirection.toFixed(0)}°</span>
          </span>
          {activeIncident === 'BLIZZARD_ALERT' && (
            <span className="bg-rose-600 text-white px-1.5 py-0.2 rounded font-bold animate-status-blink text-[10px]">
              GALE ALERT
            </span>
          )}
        </div>
      </div>

      {/* 2. TOP-RIGHT: View Mode, Day/Night Environment & Fullscreen */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {/* Day / Night 3D Lighting Environment Toggle */}
        <button
          onClick={() => setLightingEnv((prev) => (prev === 'DAYLIGHT' ? 'NIGHT' : 'DAYLIGHT'))}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono font-bold transition-all border shadow-sm cursor-pointer ${
            isDaylight
              ? 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900'
              : 'bg-indigo-950/90 hover:bg-indigo-900 border-indigo-700 text-indigo-200'
          }`}
          title={isDaylight ? "Switch to Polar Night Mode" : "Switch to Polar Daylight Mode"}
        >
          {isDaylight ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '12s' }} />
              <span>DAYLIGHT</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>POLAR NIGHT</span>
            </>
          )}
        </button>

        {/* View Mode Toggle */}
        <div className={`flex border rounded p-0.5 text-[11px] font-mono shadow-sm transition-colors ${
          isDark ? 'bg-slate-950/90 border-slate-700' : 'bg-white/95 border-slate-300'
        }`}>
          <button
            onClick={() => setViewMode('NORMAL')}
            className={`px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
              viewMode === 'NORMAL'
                ? isDark ? 'bg-slate-800 text-white font-bold' : 'bg-slate-200 text-slate-900 font-bold'
                : hudSubText
            }`}
            title="Standard Realistic Polar Material Mode"
          >
            <Box className="w-3 h-3 text-sky-500" />
            <span>REAL</span>
          </button>
          <button
            onClick={() => setViewMode('THERMAL')}
            className={`px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
              viewMode === 'THERMAL'
                ? 'bg-purple-950 text-purple-300 font-bold border border-purple-700'
                : hudSubText
            }`}
            title="Thermal Infrared Heat Map Mode"
          >
            <Thermometer className="w-3 h-3 text-purple-500" />
            <span>THERMAL IR</span>
          </button>
          <button
            onClick={() => setViewMode('XRAY')}
            className={`px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
              viewMode === 'XRAY'
                ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-700'
                : hudSubText
            }`}
            title="Structural Container Wireframe Mode"
          >
            <Layers className="w-3 h-3 text-emerald-500" />
            <span>X-RAY</span>
          </button>
        </div>

        {/* Reset Camera */}
        <button
          onClick={resetCamera}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded text-xs font-mono transition-colors shadow-sm cursor-pointer ${
            isDark
              ? 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
              : 'bg-white/95 hover:bg-slate-100 border-slate-300 text-slate-800'
          }`}
          title="Reset Camera to Overview"
        >
          <Eye className="w-3.5 h-3.5 text-sky-500" />
          <span>RESET</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className={`p-1.5 border rounded transition-colors shadow-sm cursor-pointer ${
            isDark
              ? 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              : 'bg-white/95 hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
          }`}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D View'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 3. FLOATING CAMERA ZOOM & ORBIT CONTROLS (Right-Side Toolbar) */}
      <div className="absolute top-14 right-3 z-10 flex flex-col gap-1.5 items-end">
        <div className={`flex flex-col border rounded p-1 shadow-md gap-1 transition-colors ${
          isDark ? 'bg-slate-950/90 border-slate-700' : 'bg-white/95 border-slate-300'
        }`}>
          <button
            onClick={zoomIn}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
            }`}
            title="Zoom In (Scroll Wheel Up)"
          >
            <ZoomIn className="w-4 h-4 text-sky-500" />
          </button>
          <button
            onClick={zoomOut}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
            }`}
            title="Zoom Out (Scroll Wheel Down)"
          >
            <ZoomOut className="w-4 h-4 text-sky-500" />
          </button>
          <div className={`h-[1px] my-0.5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <button
            onClick={resetCamera}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
            }`}
            title="Reset Camera Orientation"
          >
            <RotateCcw className="w-4 h-4 text-amber-500" />
          </button>
        </div>

        {/* Scroll Wheel Hint Pill */}
        <div className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono border shadow-xs pointer-events-none transition-colors ${
          isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-white/90 border-slate-200 text-slate-600'
        }`}>
          <span>↕ Scroll: Zoom • Drag: Orbit</span>
        </div>
      </div>

      {/* 4. Three.js Canvas */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[24, 15, 28]} fov={45} />

        {/* OrbitControls with buttery-smooth free scrolling, orbiting, and panning */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={1.8}
          maxDistance={125.0}
          enableZoom={true}
          zoomSpeed={1.4}
          enableRotate={true}
          rotateSpeed={0.85}
          enablePan={true}
          panSpeed={1.0}
          screenSpacePanning={true}
          maxPolarAngle={Math.PI / 2 - 0.02} // Constrain camera above the ground plane
          target={[0, 3, 0]}
        />

        {/* Dynamic Smooth Camera Rig for Waypoint Transitions */}
        <CameraRig
          targetPosition={cameraTargetPosition}
          targetLookAt={cameraTargetLookAt}
          waypointTrigger={waypointTrigger}
          controlsRef={controlsRef}
        />

        {/* Polar Daylight or Polar Night Sky Canvas Background */}
        <color attach="background" args={[isDaylight ? '#ffffff' : '#080d1a']} />

        {/* Atmospheric Polar Fog */}
        <fog attach="fog" args={[isDaylight ? '#ffffff' : '#080d1a', isDaylight ? 45 : 30, isDaylight ? 100 : 85]} />

        {/* Ambient & High Polar Albedo Lighting */}
        <ambientLight
          intensity={viewMode === 'THERMAL' ? 0.25 : (isDaylight ? 0.95 : 0.45)}
          color={isDaylight ? '#f0f9ff' : '#e0f2fe'}
        />

        {/* Harsh Low-Angle Antarctic Sun */}
        <directionalLight
          position={[-22, 28, 25]}
          intensity={viewMode === 'THERMAL' ? 0.6 : (isDaylight ? 2.3 : 1.3)}
          color={isDaylight ? '#fffef2' : '#fffbeb'}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={95}
          shadow-camera-left={-32}
          shadow-camera-right={32}
          shadow-camera-top={32}
          shadow-camera-bottom={-32}
        />

        {/* Ice / Snow Surface Diffuse Upward Bounce Light */}
        <directionalLight
          position={[15, -8, -15]}
          intensity={isDaylight ? 0.65 : 0.3}
          color={isDaylight ? '#e0f2fe' : '#38bdf8'}
        />

        {/* Dynamic Blizzard / Katabatic Snow Drift Particles */}
        <BlizzardParticles windSpeed={windSpeed} />

        {/* 3D Station Twins with Real-Time Connected Unit House Piping */}
        <Suspense fallback={null}>
          {isMaitri ? (
            <MaitriModel
              telemetry={telemetry}
              onSelectHotspot={onSelectHotspot}
              viewMode={viewMode}
              isDaylight={isDaylight}
              isModalOpen={isModalOpen}
              activeSubsystem={activeSubsystem}
            />
          ) : (
            <BharatiModel
              telemetry={telemetry}
              onSelectHotspot={onSelectHotspot}
              viewMode={viewMode}
              isDaylight={isDaylight}
              isModalOpen={isModalOpen}
              activeSubsystem={activeSubsystem}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
