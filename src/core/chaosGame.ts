import { IFSSystem, AffineMap, FlameSystem, FlameTransform } from './types';
import { applyVariations, applyAffine } from './flameVariations';

/**
 * Applies an affine transformation to a point
 * p' = M * p + t
 */
function applyAffineMap(
  x: number,
  y: number,
  map: AffineMap
): [number, number] {
  const [a, b, c, d] = map.matrix;
  const [e, f] = map.translation;

  return [
    a * x + b * y + e,
    c * x + d * y + f,
  ];
}

/**
 * Selects a random affine map based on probability weights
 */
function selectRandomMap(maps: AffineMap[]): AffineMap {
  const rand = Math.random();
  let cumulative = 0;

  for (const map of maps) {
    cumulative += map.probability;
    if (rand < cumulative) {
      return map;
    }
  }

  // Fallback to last map (handles floating point precision issues)
  return maps[maps.length - 1];
}

/**
 * Generator that yields points from the chaos game algorithm
 * @param system - The IFS system to iterate
 * @param iterations - Number of points to generate
 * @param skipInitial - Number of initial iterations to skip (for convergence)
 */
export function* chaosGame(
  system: IFSSystem,
  iterations: number,
  skipInitial = 100
): Generator<{ pos: [number, number]; color?: [number, number, number] }> {
  // Start at a random point
  let x = Math.random() * 2 - 1; // [-1, 1]
  let y = Math.random() * 2 - 1;

  // Skip initial iterations to let the point converge to the attractor
  for (let i = 0; i < skipInitial; i++) {
    const map = selectRandomMap(system.maps);
    [x, y] = applyAffineMap(x, y, map);
  }

  // Generate and yield points with optional colors
  for (let i = 0; i < iterations; i++) {
    const map = selectRandomMap(system.maps);
    [x, y] = applyAffineMap(x, y, map);
    yield { pos: [x, y], color: map.color };
  }
}

/**
 * Generates a batch of points with colors as Float32Arrays for GPU upload
 * @param system - The IFS system to iterate
 * @param count - Number of points to generate
 * @returns Object with positions and optional colors arrays
 */
export function generatePointBatch(
  system: IFSSystem,
  count: number
): { positions: Float32Array; colors?: Float32Array } {
  console.log('[ChaosGame] Generating points for:', system.name, 'with', system.maps.length, 'maps');
  const positions = new Float32Array(count * 2);
  const hasColors = system.maps.some(m => m.color !== undefined);
  const colors = hasColors ? new Float32Array(count * 3) : undefined;

  // Get normalization parameters
  const scale = system.scale ?? 1.0;
  const centerX = system.center?.[0] ?? 0;
  const centerY = system.center?.[1] ?? 0;

  const generator = chaosGame(system, count);

  let posIndex = 0;
  let colorIndex = 0;

  for (const { pos, color } of generator) {
    // Apply scale and center normalization
    // This ensures all fractals appear at similar sizes
    positions[posIndex++] = (pos[0] - centerX) * scale;
    positions[posIndex++] = (pos[1] - centerY) * scale;

    if (colors && color) {
      colors[colorIndex++] = color[0];
      colors[colorIndex++] = color[1];
      colors[colorIndex++] = color[2];
    } else if (colors) {
      // Default white if no color specified
      colors[colorIndex++] = 1.0;
      colors[colorIndex++] = 1.0;
      colors[colorIndex++] = 1.0;
    }
  }

  return { positions, colors };
}

// ============================================
// FRACTAL FLAMES
// ============================================

/**
 * Default color palette for flames (fire-like gradient)
 */
const defaultFlamePalette: [number, number, number][] = [
  [0, 0, 0],       // Black
  [0.5, 0, 0],     // Dark red
  [1, 0.2, 0],     // Orange-red
  [1, 0.5, 0],     // Orange
  [1, 0.8, 0.2],   // Yellow-orange
  [1, 1, 0.5],     // Light yellow
  [1, 1, 1],       // White
];

/**
 * Interpolate color from palette based on index (0-1)
 */
function samplePalette(
  palette: [number, number, number][],
  index: number
): [number, number, number] {
  // Wrap index to 0-1
  const t = ((index % 1) + 1) % 1;
  const scaledT = t * (palette.length - 1);
  const i = Math.floor(scaledT);
  const frac = scaledT - i;

  const c0 = palette[Math.min(i, palette.length - 1)];
  const c1 = palette[Math.min(i + 1, palette.length - 1)];

  return [
    c0[0] + frac * (c1[0] - c0[0]),
    c0[1] + frac * (c1[1] - c0[1]),
    c0[2] + frac * (c1[2] - c0[2]),
  ];
}

/**
 * Select random flame transform based on probability
 */
function selectRandomFlameTransform(transforms: FlameTransform[]): FlameTransform {
  const rand = Math.random();
  let cumulative = 0;

  for (const transform of transforms) {
    cumulative += transform.probability;
    if (rand < cumulative) {
      return transform;
    }
  }

  return transforms[transforms.length - 1];
}

/**
 * Apply a complete flame transform: affine -> variations -> post
 */
function applyFlameTransform(
  x: number,
  y: number,
  transform: FlameTransform
): [number, number] {
  // 1. Apply pre-affine transform
  let [tx, ty] = applyAffine(x, y, transform.coefs);

  // 2. Apply variations (weighted sum)
  [tx, ty] = applyVariations(tx, ty, transform.variations);

  // 3. Apply post-affine transform if specified
  if (transform.post) {
    [tx, ty] = applyAffine(tx, ty, transform.post);
  }

  return [tx, ty];
}

/**
 * Generator for fractal flame chaos game
 */
export function* flameChaosGame(
  system: FlameSystem,
  iterations: number,
  skipInitial = 20
): Generator<{ pos: [number, number]; color: [number, number, number] }> {
  // Start at a random point
  let x = Math.random() * 2 - 1;
  let y = Math.random() * 2 - 1;
  let colorIndex = Math.random(); // Color evolves through iterations

  const palette = system.palette || defaultFlamePalette;
  const globalRotate = system.rotate || 0;
  const cos = Math.cos(globalRotate);
  const sin = Math.sin(globalRotate);

  // Skip initial iterations for convergence
  for (let i = 0; i < skipInitial; i++) {
    const transform = selectRandomFlameTransform(system.transforms);
    [x, y] = applyFlameTransform(x, y, transform);

    // Evolve color
    const colorSpeed = transform.colorSpeed ?? 0.5;
    colorIndex = (colorIndex + transform.colorIndex) * colorSpeed + (1 - colorSpeed) * colorIndex;

    // Keep in bounds
    const mag = Math.sqrt(x * x + y * y);
    if (mag > 100 || !isFinite(x) || !isFinite(y)) {
      x = Math.random() * 2 - 1;
      y = Math.random() * 2 - 1;
    }
  }

  // Generate points
  for (let i = 0; i < iterations; i++) {
    const transform = selectRandomFlameTransform(system.transforms);
    [x, y] = applyFlameTransform(x, y, transform);

    // Apply final transform if exists
    if (system.finalTransform) {
      [x, y] = applyFlameTransform(x, y, system.finalTransform);
    }

    // Evolve color
    const colorSpeed = transform.colorSpeed ?? 0.5;
    colorIndex = transform.colorIndex * colorSpeed + (1 - colorSpeed) * colorIndex;

    // Keep in bounds
    const mag = Math.sqrt(x * x + y * y);
    if (mag > 100 || !isFinite(x) || !isFinite(y)) {
      x = Math.random() * 2 - 1;
      y = Math.random() * 2 - 1;
      continue; // Skip this point
    }

    // Apply global rotation
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;

    // Sample color from palette
    const color = samplePalette(palette, colorIndex);

    yield { pos: [rx, ry], color };
  }
}

/**
 * Generate flame points as Float32Arrays
 */
export function generateFlamePointBatch(
  system: FlameSystem,
  count: number
): { positions: Float32Array; colors: Float32Array } {
  console.log('[FlameChaos] Generating points for:', system.name);
  const positions = new Float32Array(count * 2);
  const colors = new Float32Array(count * 3);

  const scale = system.scale ?? 0.5;
  const centerX = system.center?.[0] ?? 0;
  const centerY = system.center?.[1] ?? 0;

  const generator = flameChaosGame(system, count);

  let posIndex = 0;
  let colorIndex = 0;

  for (const { pos, color } of generator) {
    positions[posIndex++] = (pos[0] - centerX) * scale;
    positions[posIndex++] = (pos[1] - centerY) * scale;

    colors[colorIndex++] = color[0];
    colors[colorIndex++] = color[1];
    colors[colorIndex++] = color[2];
  }

  return { positions, colors };
}
