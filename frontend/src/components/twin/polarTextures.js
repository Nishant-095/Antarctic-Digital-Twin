import * as THREE from 'three';

const DEFAULT_SIZE = 512;
const MAX_SIZE = 1024;
const MAX_ANISOTROPY = 16;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function textureOptions(options = {}) {
  const size = clamp(Math.round(options.size ?? DEFAULT_SIZE), 128, MAX_SIZE);
  const repeat = options.repeat ?? [1, 1];
  const repeatX = Number.isFinite(repeat[0]) ? repeat[0] : 1;
  const repeatY = Number.isFinite(repeat[1]) ? repeat[1] : 1;
  const anisotropy = clamp(Math.round(options.anisotropy ?? 8), 1, MAX_ANISOTROPY);
  return { size, repeatX, repeatY, anisotropy };
}

function makeCanvas(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function makeCanvasTexture(canvas, { repeatX, repeatY, anisotropy }, colorSpace) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = anisotropy;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function smoothLine(distance, width) {
  const t = clamp((distance - width) / width, 0, 1);
  return 1 - t * t * (3 - 2 * t);
}

function periodicDistance(value) {
  const nearest = Math.round(value);
  return Math.abs(value - nearest);
}

/**
 * Deep, tileable glacial water for Bharati's fjord.
 * Returns one sRGB color texture. The caller owns it and must dispose it.
 */
export function createPolarWaterTexture(options = {}) {
  const config = textureOptions(options);
  const { size } = config;
  const canvas = makeCanvas(size);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const image = context.createImageData(size, size);

  // Integer-frequency waves make the field periodic at both texture edges.
  for (let y = 0; y < size; y += 1) {
    const v = y / size;
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const wave =
        0.5 * Math.sin(2 * Math.PI * (3 * v + 0.42 * Math.sin(2 * Math.PI * (2 * u + 0.13)))) +
        0.3 * Math.sin(2 * Math.PI * (7 * v - 1.25 * u + 0.2 * Math.sin(2 * Math.PI * 3 * u))) +
        0.2 * Math.sin(2 * Math.PI * (13 * v + 2 * u));
      const grain =
        0.5 * Math.sin(2 * Math.PI * (37 * u + 53 * v)) +
        0.3 * Math.sin(2 * Math.PI * (71 * u - 29 * v)) +
        0.2 * Math.sin(2 * Math.PI * (113 * u + 89 * v));

      const striation = smoothLine(periodicDistance(21 * (v + 0.014 * Math.sin(2 * Math.PI * (2 * u + 0.1)))), 0.075);
      const secondaryStriation = smoothLine(periodicDistance(39 * (v - 0.009 * Math.sin(2 * Math.PI * (3 * u + 0.37)))), 0.045);
      const leadA = smoothLine(periodicDistance(v + 0.045 * Math.sin(2 * Math.PI * (u + 0.12)) - 0.29), 0.012);
      const leadB = smoothLine(periodicDistance(v - 0.035 * Math.sin(2 * Math.PI * (2 * u + 0.4)) - 0.73), 0.008);
      const shimmer = Math.max(striation * 0.16, secondaryStriation * 0.08);
      const paleLead = Math.max(leadA * 0.25, leadB * 0.17);
      const depth = wave * 5 + grain * 1.8 + shimmer * 12;
      const index = (y * size + x) * 4;
      image.data[index] = clamp(36 + depth + paleLead * 62, 0, 255);
      image.data[index + 1] = clamp(90 + depth * 1.45 + shimmer * 23 + paleLead * 104, 0, 255);
      image.data[index + 2] = clamp(118 + depth * 1.85 + shimmer * 32 + paleLead * 126, 0, 255);
      image.data[index + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
  return makeCanvasTexture(canvas, config, THREE.SRGBColorSpace);
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function drawWrappedCracks(context, size, seed, count, width, color) {
  const random = seededRandom(seed);
  const copies = [-1, 0, 1];
  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineCap = 'round';
  context.lineJoin = 'round';

  for (let crack = 0; crack < count; crack += 1) {
    const points = [];
    const x = random() * size;
    const y = random() * size;
    const angle = random() * Math.PI * 2;
    const length = size * (0.08 + random() * 0.19);
    const steps = 4 + Math.floor(random() * 5);
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps;
      const bend = Math.sin(t * Math.PI * (1 + random() * 0.3)) * size * 0.006;
      points.push([
        x + Math.cos(angle) * length * t - Math.sin(angle) * bend,
        y + Math.sin(angle) * length * t + Math.cos(angle) * bend,
      ]);
    }

    for (const offsetX of copies) {
      for (const offsetY of copies) {
        context.beginPath();
        context.moveTo(points[0][0] + offsetX * size, points[0][1] + offsetY * size);
        for (let i = 1; i < points.length; i += 1) {
          context.lineTo(points[i][0] + offsetX * size, points[i][1] + offsetY * size);
        }
        context.stroke();
      }
    }
  }
}

function makeIceColorCanvas(size) {
  const canvas = makeCanvas(size);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const image = context.createImageData(size, size);
  for (let y = 0; y < size; y += 1) {
    const v = y / size;
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const grain =
        0.45 * Math.sin(2 * Math.PI * (31 * u + 47 * v)) +
        0.32 * Math.sin(2 * Math.PI * (73 * u - 61 * v)) +
        0.23 * Math.sin(2 * Math.PI * (127 * u + 101 * v));
      const broadShade = 1.2 * Math.sin(2 * Math.PI * (3 * u + 5 * v));
      const value = grain * 2.2 + broadShade;
      const index = (y * size + x) * 4;
      image.data[index] = clamp(190 + value, 0, 255);
      image.data[index + 1] = clamp(215 + value, 0, 255);
      image.data[index + 2] = clamp(222 + value * 1.15, 0, 255);
      image.data[index + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);

  // Fine and hairline cracks are low contrast and duplicated across tile edges.
  drawWrappedCracks(context, size, 0x1ce504, 38, Math.max(0.55, size / 1024), 'rgba(46, 91, 112, 0.13)');
  drawWrappedCracks(context, size, 0x91a7, 25, Math.max(0.35, size / 1400), 'rgba(247, 253, 255, 0.36)');
  return canvas;
}

function makeIceBumpCanvas(size) {
  const canvas = makeCanvas(size);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const image = context.createImageData(size, size);
  for (let y = 0; y < size; y += 1) {
    const v = y / size;
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const grain =
        0.48 * Math.sin(2 * Math.PI * (43 * u + 67 * v)) +
        0.31 * Math.sin(2 * Math.PI * (89 * u - 53 * v)) +
        0.21 * Math.sin(2 * Math.PI * (131 * u + 107 * v));
      const value = clamp(128 + grain * 3.8, 0, 255);
      const index = (y * size + x) * 4;
      image.data[index] = value;
      image.data[index + 1] = value;
      image.data[index + 2] = value;
      image.data[index + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  drawWrappedCracks(context, size, 0x1ce504, 38, Math.max(0.65, size / 900), 'rgba(92, 92, 92, 0.38)');
  return canvas;
}

/**
 * Subtle Lake Priyadarshini ice finish: an sRGB color map and a grayscale
 * bump map with matching deterministic cracks. Callers own and must dispose
 * both returned textures. Use a restrained material bumpScale (about 0.02–0.06).
 */
export function createIceSurfaceTexture(options = {}) {
  const config = textureOptions(options);
  const map = makeCanvasTexture(makeIceColorCanvas(config.size), config, THREE.SRGBColorSpace);
  const bumpMap = makeCanvasTexture(makeIceBumpCanvas(config.size), config, THREE.NoColorSpace);
  map.name = 'lake-priyadarshini-frosted-ice';
  bumpMap.name = 'lake-priyadarshini-ice-bump';
  return { map, bumpMap };
}
