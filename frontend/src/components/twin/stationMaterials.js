import * as THREE from 'three';

// Small, deterministic insulated-panel finish used by the station envelopes.
// The light seams give long modules scale without relying on remote textures.
export function createCladdingTexture(baseColor, seamColor = 'rgba(31,55,69,0.16)') {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  context.fillStyle = baseColor;
  context.fillRect(0, 0, size, size);

  const glow = context.createLinearGradient(0, 0, size, 0);
  glow.addColorStop(0, 'rgba(255,255,255,0.06)');
  glow.addColorStop(0.48, 'rgba(255,255,255,0)');
  glow.addColorStop(1, 'rgba(20,35,45,0.05)');
  context.fillStyle = glow;
  context.fillRect(0, 0, size, size);

  for (let x = 0; x <= size; x += 32) {
    context.fillStyle = seamColor;
    context.fillRect(x, 0, 1, size);
    context.fillStyle = 'rgba(255,255,255,0.2)';
    context.fillRect(x + 1, 0, 1, size);
  }
  for (let y = 0; y <= size; y += 128) {
    context.fillStyle = 'rgba(28,45,56,0.13)';
    context.fillRect(0, y, size, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
