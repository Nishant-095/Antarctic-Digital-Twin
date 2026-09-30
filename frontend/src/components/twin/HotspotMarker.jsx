import React, { useState } from 'react';
import { Html } from '@react-three/drei';

export default function HotspotMarker({
  position,
  label,
  subsystemCode,
  status = 'NOMINAL',
  metricValue,
  metricUnit,
  onClick,
  isModalOpen = false,
  activeHotspot = null,
}) {
  const [hovered, setHovered] = useState(false);

  const isAlert = status === 'CRITICAL' || status === 'WARNING' || status === 'EMERGENCY';
  const isTrip = status === 'CRITICAL';

  // When a modal is open or another hotspot is opened, the other badges must not be on screen
  const shouldHideBadge = isModalOpen || (activeHotspot && activeHotspot !== subsystemCode);

  return (
    <group position={position}>
      {/* 3D Anchor Ring & Sphere */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(subsystemCode);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial
          color={isTrip ? '#ef4444' : isAlert ? '#f59e0b' : '#10b981'}
          emissive={isTrip ? '#dc2626' : isAlert ? '#d97706' : '#059669'}
          emissiveIntensity={hovered ? 1.0 : 0.5}
        />
      </mesh>

      {/* Floating Holographic Live Telemetry Badge - Completely hidden when modal or another hotspot is open */}
      {!shouldHideBadge && (
        <Html distanceFactor={22} center position={[0, 0.75, 0]} zIndexRange={[12, 0]}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(subsystemCode);
            }}
            className={`cursor-pointer select-none transition-all duration-200 ${
              hovered ? 'scale-110 z-10' : 'scale-100 z-0'
            }`}
          >
          <div
            className={`hotspot-badge flex flex-col rounded shadow-2xl font-mono text-[10px] overflow-hidden border backdrop-blur-none ${
              isTrip
                ? 'bg-red-600 border-red-300 shadow-[0_0_20px_rgba(239,68,68,0.8)] ring-2 ring-red-400/80 animate-status-blink'
                : isAlert
                ? 'bg-amber-500 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)] ring-1 ring-amber-300/80'
                : 'bg-slate-900 border-slate-600 text-slate-100 hover:border-sky-400'
            }`}
            style={{
              backgroundColor: isTrip ? '#dc2626' : isAlert ? '#d97706' : '#0f172a',
              borderColor: isTrip ? '#f87171' : isAlert ? '#fbbf24' : '#475569',
              color: '#ffffff',
            }}
          >
            {/* Top Label & Status Indicator */}
            <div
              className="flex items-center justify-between gap-3 px-2 py-1 border-b border-white/20"
              style={{
                backgroundColor: isTrip ? '#b91c1c' : isAlert ? '#b45309' : '#1e293b',
              }}
            >
              <span
                className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-[9px] text-white"
                style={{ color: '#ffffff' }}
              >
                <span
                  className="w-2 h-2 rounded-full ring-1 ring-white/50"
                  style={{
                    backgroundColor: isTrip ? '#ffffff' : isAlert ? '#ffffff' : '#34d399',
                  }}
                />
                <span style={{ color: '#ffffff', fontWeight: 800 }}>{label}</span>
              </span>
              <span
                className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs"
                style={{
                  backgroundColor: '#ffffff',
                  color: isTrip ? '#b91c1c' : isAlert ? '#92400e' : '#047857',
                  fontWeight: 900,
                }}
              >
                {status}
              </span>
            </div>

            {/* Bottom Live Value Bar (Ticks in Real Time) */}
            {metricValue !== undefined && (
              <div
                className="px-2 py-1 flex items-baseline justify-between gap-3 font-mono"
                style={{
                  backgroundColor: isTrip ? '#991b1b' : isAlert ? '#78350f' : '#020617',
                }}
              >
                <span
                  className="text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: isTrip ? '#fecaca' : isAlert ? '#fef3c7' : '#94a3b8' }}
                >
                  LIVE:
                </span>
                <span
                  className="font-black text-[12px] font-mono-num"
                  style={{ color: '#ffffff', fontWeight: 900 }}
                >
                  {typeof metricValue === 'number' ? metricValue.toFixed(1) : metricValue}{' '}
                  <span
                    className="text-[9px] font-medium"
                    style={{ color: isTrip ? '#fecaca' : isAlert ? '#fef3c7' : '#cbd5e1' }}
                  >
                    {metricUnit}
                  </span>
                </span>
              </div>
            )}

            {/* Hover Prompt */}
            {hovered && (
              <div
                className="px-2 py-0.5 text-[8px] font-bold text-center uppercase tracking-wider border-t border-white/20"
                style={{
                  backgroundColor: isTrip ? '#7f1d1d' : isAlert ? '#78350f' : '#0369a1',
                  color: '#ffffff',
                }}
              >
                Click for Full SCADA Diagnostics
              </div>
            )}
          </div>
        </div>
      </Html>
    )}
  </group>
);
}
