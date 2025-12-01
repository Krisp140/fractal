import { IFSSystem, AffineMap } from './types';

/**
 * Linear interpolation between two values
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Interpolate between two affine maps
 */
function lerpAffineMap(mapA: AffineMap, mapB: AffineMap, t: number): AffineMap {
  return {
    matrix: [
      lerp(mapA.matrix[0], mapB.matrix[0], t),
      lerp(mapA.matrix[1], mapB.matrix[1], t),
      lerp(mapA.matrix[2], mapB.matrix[2], t),
      lerp(mapA.matrix[3], mapB.matrix[3], t),
    ] as [number, number, number, number],
    translation: [
      lerp(mapA.translation[0], mapB.translation[0], t),
      lerp(mapA.translation[1], mapB.translation[1], t),
    ] as [number, number],
    probability: lerp(mapA.probability, mapB.probability, t),
    color: mapA.color && mapB.color ? [
      lerp(mapA.color[0], mapB.color[0], t),
      lerp(mapA.color[1], mapB.color[1], t),
      lerp(mapA.color[2], mapB.color[2], t),
    ] as [number, number, number] : undefined,
  };
}

/**
 * Morphs between two IFS systems
 * @param systemA First IFS system
 * @param systemB Second IFS system
 * @param t Interpolation factor (0 = systemA, 1 = systemB)
 */
export function morphIFSSystems(systemA: IFSSystem, systemB: IFSSystem, t: number): IFSSystem {
  // Clamp t to [0, 1]
  t = Math.max(0, Math.min(1, t));

  // Handle systems with different numbers of maps
  const maxMaps = Math.max(systemA.maps.length, systemB.maps.length);
  const maps: AffineMap[] = [];

  for (let i = 0; i < maxMaps; i++) {
    // Use the last map if we've run out of maps in a system
    const mapA = systemA.maps[i] || systemA.maps[systemA.maps.length - 1];
    const mapB = systemB.maps[i] || systemB.maps[systemB.maps.length - 1];

    maps.push(lerpAffineMap(mapA, mapB, t));
  }

  // Normalize probabilities to sum to 1
  const totalProb = maps.reduce((sum, map) => sum + map.probability, 0);
  maps.forEach(map => map.probability /= totalProb);

  return {
    name: `${systemA.name} → ${systemB.name}`,
    maps,
  };
}
