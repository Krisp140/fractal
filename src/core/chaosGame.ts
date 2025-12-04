import { IFSSystem, AffineMap, MobiusSystem, MobiusMap, Complex } from './types';

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
// MÖBIUS TRANSFORMATIONS
// ============================================

/**
 * Complex number operations
 */
function complexMul(a: Complex, b: Complex): Complex {
  return [
    a[0] * b[0] - a[1] * b[1],
    a[0] * b[1] + a[1] * b[0]
  ];
}

function complexAdd(a: Complex, b: Complex): Complex {
  return [a[0] + b[0], a[1] + b[1]];
}

function complexDiv(a: Complex, b: Complex): Complex {
  const denom = b[0] * b[0] + b[1] * b[1];
  if (denom < 1e-10) {
    // Avoid division by zero - return large value
    return [1000, 1000];
  }
  return [
    (a[0] * b[0] + a[1] * b[1]) / denom,
    (a[1] * b[0] - a[0] * b[1]) / denom
  ];
}

/**
 * Apply Möbius transformation: f(z) = (az + b) / (cz + d)
 */
function applyMobius(z: Complex, map: MobiusMap): Complex {
  const az = complexMul(map.a, z);
  const azPlusB = complexAdd(az, map.b);

  const cz = complexMul(map.c, z);
  const czPlusD = complexAdd(cz, map.d);

  return complexDiv(azPlusB, czPlusD);
}

/**
 * Select random Möbius map based on probability
 */
function selectRandomMobiusMap(maps: MobiusMap[]): MobiusMap {
  const rand = Math.random();
  let cumulative = 0;

  for (const map of maps) {
    cumulative += map.probability;
    if (rand < cumulative) {
      return map;
    }
  }

  return maps[maps.length - 1];
}

/**
 * Generator for Möbius chaos game
 */
export function* mobiusChaosGame(
  system: MobiusSystem,
  iterations: number,
  skipInitial = 100
): Generator<{ pos: Complex; color?: [number, number, number] }> {
  // Start at a random point in the complex plane
  let z: Complex = [Math.random() * 2 - 1, Math.random() * 2 - 1];

  // Skip initial iterations
  for (let i = 0; i < skipInitial; i++) {
    const map = selectRandomMobiusMap(system.maps);
    z = applyMobius(z, map);

    // Keep in bounds
    const mag = Math.sqrt(z[0] * z[0] + z[1] * z[1]);
    if (mag > 10) {
      z = [z[0] / mag * 2, z[1] / mag * 2];
    }
  }

  // Generate points
  for (let i = 0; i < iterations; i++) {
    const map = selectRandomMobiusMap(system.maps);
    z = applyMobius(z, map);

    // Keep in bounds - Möbius can send points to infinity
    const mag = Math.sqrt(z[0] * z[0] + z[1] * z[1]);
    if (mag > 10) {
      z = [z[0] / mag * 2, z[1] / mag * 2];
    }

    if (isFinite(z[0]) && isFinite(z[1])) {
      yield { pos: z, color: map.color };
    }
  }
}

/**
 * Generate Möbius points as Float32Arrays
 */
export function generateMobiusPointBatch(
  system: MobiusSystem,
  count: number
): { positions: Float32Array; colors?: Float32Array } {
  console.log('[MobiusChaos] Generating points for:', system.name);
  const positions = new Float32Array(count * 2);
  const hasColors = system.maps.some(m => m.color !== undefined);
  const colors = hasColors ? new Float32Array(count * 3) : undefined;

  const scale = system.scale ?? 1.0;
  const centerX = system.center?.[0] ?? 0;
  const centerY = system.center?.[1] ?? 0;

  const generator = mobiusChaosGame(system, count);

  let posIndex = 0;
  let colorIndex = 0;

  for (const { pos, color } of generator) {
    positions[posIndex++] = (pos[0] - centerX) * scale;
    positions[posIndex++] = (pos[1] - centerY) * scale;

    if (colors && color) {
      colors[colorIndex++] = color[0];
      colors[colorIndex++] = color[1];
      colors[colorIndex++] = color[2];
    } else if (colors) {
      colors[colorIndex++] = 1.0;
      colors[colorIndex++] = 1.0;
      colors[colorIndex++] = 1.0;
    }
  }

  return { positions, colors };
}
