import { IFSSystem, AffineMap } from './types';

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

  const generator = chaosGame(system, count);

  let posIndex = 0;
  let colorIndex = 0;

  for (const { pos, color } of generator) {
    positions[posIndex++] = pos[0];
    positions[posIndex++] = pos[1];

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
