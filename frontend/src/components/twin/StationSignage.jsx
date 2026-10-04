import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';

const SITE_COPY = {
  maitri: {
    name: 'MAITRI',
    designation: 'INDIAN ANTARCTIC RESEARCH STATION',
  },
  bharati: {
    name: 'BHARATI',
    designation: 'INDIAN ANTARCTIC RESEARCH STATION',
  },
};

function roundedRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function drawIndianFlag(context, x, y, width, height) {
  const bandHeight = height / 3;
  context.save();
  roundedRect(context, x, y, width, height, 7);
  context.clip();
  context.fillStyle = '#ff9933';
  context.fillRect(x, y, width, bandHeight);
  context.fillStyle = '#ffffff';
  context.fillRect(x, y + bandHeight, width, bandHeight);
  context.fillStyle = '#138808';
  context.fillRect(x, y + bandHeight * 2, width, bandHeight);

  const cx = x + width / 2;
  const cy = y + height / 2;
  const radius = bandHeight * 0.36;
  context.strokeStyle = '#000080';
  context.lineWidth = 3.2;
  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2);
  context.stroke();

  context.lineWidth = 1.8;
  for (let spoke = 0; spoke < 24; spoke += 1) {
    const angle = (spoke * Math.PI * 2) / 24;
    context.beginPath();
    context.moveTo(cx, cy);
    context.lineTo(cx + Math.cos(angle) * radius * 0.9, cy + Math.sin(angle) * radius * 0.9);
    context.stroke();
  }
  context.fillStyle = '#000080';
  context.beginPath();
  context.arc(cx, cy, 3.5, 0, Math.PI * 2);
  context.fill();
  context.restore();

  context.strokeStyle = 'rgba(224, 237, 246, 0.8)';
  context.lineWidth = 2;
  roundedRect(context, x, y, width, height, 7);
  context.stroke();
}

function createSignTexture(site) {
  const { name, designation } = SITE_COPY[site];
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 384;
  const context = canvas.getContext('2d');

  const background = context.createLinearGradient(0, 0, 0, canvas.height);
  background.addColorStop(0, '#172b3c');
  background.addColorStop(0.52, '#102334');
  background.addColorStop(1, '#0b1a28');
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = '#b89357';
  context.lineWidth = 5;
  roundedRect(context, 15, 15, canvas.width - 30, canvas.height - 30, 14);
  context.stroke();

  // Fine, restrained brushed-metal grain gives the printed face a physical finish.
  context.save();
  context.globalAlpha = 0.07;
  context.strokeStyle = '#d9e4ec';
  context.lineWidth = 1;
  for (let line = 0; line < 24; line += 1) {
    const y = 34 + line * 13;
    context.beginPath();
    context.moveTo(300, y);
    context.lineTo(990, y);
    context.stroke();
  }
  context.restore();

  drawIndianFlag(context, 56, 105, 178, 119);
  context.fillStyle = 'rgba(205, 224, 235, 0.38)';
  context.fillRect(271, 68, 2, 248);

  context.textBaseline = 'alphabetic';
  context.fillStyle = '#f2f7fa';
  context.font = '700 89px Arial, Helvetica, sans-serif';
  context.fillText(name, 314, 175);

  context.fillStyle = '#a9c3d1';
  context.font = '600 25px Arial, Helvetica, sans-serif';
  context.letterSpacing = '3px';
  context.fillText(designation, 320, 222);

  context.fillStyle = '#b89357';
  context.fillRect(316, 257, 634, 2);
  context.fillStyle = '#f2f7fa';
  context.font = '700 25px Arial, Helvetica, sans-serif';
  context.letterSpacing = '1.2px';
  context.fillText('NCPOR', 320, 302);

  context.fillStyle = 'rgba(205, 224, 235, 0.55)';
  context.fillRect(430, 280, 2, 30);
  context.fillStyle = '#d9e5ec';
  context.font = '500 22px Arial, Helvetica, sans-serif';
  context.letterSpacing = '1px';
  context.fillText('INDIAN ANTARCTIC PROGRAMME', 454, 302);

  context.textAlign = 'right';
  context.fillStyle = '#9fb4c1';
  context.font = '600 15px Arial, Helvetica, sans-serif';
  context.letterSpacing = '2px';
  context.fillText('ANTARCTICA  /  INDIA', 952, 345);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/** A compact, locally textured exterior identity plaque for an Antarctic station. */
export default function StationSignage({
  site = 'maitri',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  width = 5.2,
  height = 1.95,
  depth = 0.14,
}) {
  const normalizedSite = site === 'bharati' ? 'bharati' : 'maitri';
  const texture = useMemo(() => createSignTexture(normalizedSite), [normalizedSite]);

  useEffect(() => () => texture.dispose(), [texture]);

  const faceWidth = width - 0.08;
  const faceHeight = height - 0.08;
  const screwPositions = [
    [-width / 2 + 0.14, -height / 2 + 0.14],
    [width / 2 - 0.14, -height / 2 + 0.14],
    [-width / 2 + 0.14, height / 2 - 0.14],
    [width / 2 - 0.14, height / 2 - 0.14],
  ];

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Dark anodized backing forms the raised, durable metal perimeter. */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#17232d" metalness={0.78} roughness={0.48} />
      </mesh>

      {/* Printed face sits just proud of the metal backing. */}
      <mesh position={[0, 0, depth / 2 + 0.004]}>
        <planeGeometry args={[faceWidth, faceHeight]} />
        <meshStandardMaterial map={texture} metalness={0.18} roughness={0.62} />
      </mesh>

      {screwPositions.map(([x, y], index) => (
        <mesh
          key={index}
          position={[x, y, depth / 2 + 0.018]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.047, 0.047, 0.04, 16]} />
          <meshStandardMaterial color="#c1a16b" metalness={0.82} roughness={0.32} />
        </mesh>
      ))}
    </group>
  );
}
