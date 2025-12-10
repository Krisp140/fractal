import { IFSSystem, AffineMap, FlameSystem, FlameTransform, WeightedVariation, VariationType } from './types';

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

  // Interpolate scale and center for smooth size transitions
  const scaleA = systemA.scale ?? 1.0;
  const scaleB = systemB.scale ?? 1.0;
  const centerA = systemA.center ?? [0, 0];
  const centerB = systemB.center ?? [0, 0];

  return {
    name: `${systemA.name} → ${systemB.name}`,
    maps,
    scale: lerp(scaleA, scaleB, t),
    center: [
      lerp(centerA[0], centerB[0], t),
      lerp(centerA[1], centerB[1], t),
    ],
  };
}

// ============================================
// FLAME MORPHING
// ============================================

/**
 * Interpolate between two 6-element coefficient arrays
 */
function lerpCoefs(
  a: [number, number, number, number, number, number],
  b: [number, number, number, number, number, number],
  t: number
): [number, number, number, number, number, number] {
  return [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
    lerp(a[3], b[3], t),
    lerp(a[4], b[4], t),
    lerp(a[5], b[5], t),
  ];
}

/**
 * Interpolate between two color arrays
 */
function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
  ];
}

/**
 * Interpolate between two weighted variations
 * If types differ, crossfade weights
 */
function lerpVariations(
  varsA: WeightedVariation[],
  varsB: WeightedVariation[],
  t: number
): WeightedVariation[] {
  // Collect all unique variation types from both
  const allTypes = new Set<VariationType>();
  varsA.forEach(v => allTypes.add(v.type));
  varsB.forEach(v => allTypes.add(v.type));

  const result: WeightedVariation[] = [];

  for (const type of allTypes) {
    const varA = varsA.find(v => v.type === type);
    const varB = varsB.find(v => v.type === type);

    // Get weights (0 if not present)
    const weightA = varA?.weight ?? 0;
    const weightB = varB?.weight ?? 0;
    const weight = lerp(weightA, weightB, t);

    // Only include if weight is significant
    if (weight > 0.001) {
      // Merge params if both have them
      let params: Record<string, number> | undefined;
      if (varA?.params || varB?.params) {
        params = {};
        const allParamKeys = new Set([
          ...Object.keys(varA?.params || {}),
          ...Object.keys(varB?.params || {}),
        ]);
        for (const key of allParamKeys) {
          const pA = varA?.params?.[key] ?? 0;
          const pB = varB?.params?.[key] ?? 0;
          params[key] = lerp(pA, pB, t);
        }
      }

      result.push({ type, weight, params });
    }
  }

  return result;
}

/**
 * Interpolate between two flame transforms
 */
function lerpFlameTransform(
  transformA: FlameTransform,
  transformB: FlameTransform,
  t: number
): FlameTransform {
  const result: FlameTransform = {
    coefs: lerpCoefs(transformA.coefs, transformB.coefs, t),
    variations: lerpVariations(transformA.variations, transformB.variations, t),
    probability: lerp(transformA.probability, transformB.probability, t),
    colorIndex: lerp(transformA.colorIndex, transformB.colorIndex, t),
    colorSpeed: lerp(transformA.colorSpeed ?? 0.5, transformB.colorSpeed ?? 0.5, t),
  };

  // Handle post-transform
  if (transformA.post || transformB.post) {
    const postA = transformA.post ?? [1, 0, 0, 1, 0, 0] as [number, number, number, number, number, number];
    const postB = transformB.post ?? [1, 0, 0, 1, 0, 0] as [number, number, number, number, number, number];
    result.post = lerpCoefs(postA, postB, t);
  }

  return result;
}

/**
 * Interpolate between two color palettes
 */
function lerpPalette(
  paletteA: [number, number, number][],
  paletteB: [number, number, number][],
  t: number
): [number, number, number][] {
  const maxLen = Math.max(paletteA.length, paletteB.length);
  const result: [number, number, number][] = [];

  for (let i = 0; i < maxLen; i++) {
    // Sample from each palette at this position
    const posA = i / (maxLen - 1) * (paletteA.length - 1);
    const posB = i / (maxLen - 1) * (paletteB.length - 1);

    const idxA = Math.floor(posA);
    const idxB = Math.floor(posB);
    const fracA = posA - idxA;
    const fracB = posB - idxB;

    // Interpolate within palette A
    const colorA1 = paletteA[Math.min(idxA, paletteA.length - 1)];
    const colorA2 = paletteA[Math.min(idxA + 1, paletteA.length - 1)];
    const colorA = lerpColor(colorA1, colorA2, fracA);

    // Interpolate within palette B
    const colorB1 = paletteB[Math.min(idxB, paletteB.length - 1)];
    const colorB2 = paletteB[Math.min(idxB + 1, paletteB.length - 1)];
    const colorB = lerpColor(colorB1, colorB2, fracB);

    // Interpolate between palettes
    result.push(lerpColor(colorA, colorB, t));
  }

  return result;
}

/**
 * Morphs between two flame systems
 * @param systemA First flame system
 * @param systemB Second flame system
 * @param t Interpolation factor (0 = systemA, 1 = systemB)
 */
export function morphFlameSystems(
  systemA: FlameSystem,
  systemB: FlameSystem,
  t: number
): FlameSystem {
  // Clamp t to [0, 1]
  t = Math.max(0, Math.min(1, t));

  // Handle systems with different numbers of transforms
  const maxTransforms = Math.max(systemA.transforms.length, systemB.transforms.length);
  const transforms: FlameTransform[] = [];

  for (let i = 0; i < maxTransforms; i++) {
    // Use the last transform if we've run out
    const transformA = systemA.transforms[i] || systemA.transforms[systemA.transforms.length - 1];
    const transformB = systemB.transforms[i] || systemB.transforms[systemB.transforms.length - 1];

    transforms.push(lerpFlameTransform(transformA, transformB, t));
  }

  // Normalize probabilities
  const totalProb = transforms.reduce((sum, tr) => sum + tr.probability, 0);
  transforms.forEach(tr => tr.probability /= totalProb);

  // Interpolate scale, center, rotate
  const scaleA = systemA.scale ?? 0.5;
  const scaleB = systemB.scale ?? 0.5;
  const centerA = systemA.center ?? [0, 0];
  const centerB = systemB.center ?? [0, 0];
  const rotateA = systemA.rotate ?? 0;
  const rotateB = systemB.rotate ?? 0;

  // Interpolate palettes
  const defaultPalette: [number, number, number][] = [
    [0, 0, 0], [1, 0.5, 0], [1, 1, 0.5], [1, 1, 1]
  ];
  const paletteA = systemA.palette ?? defaultPalette;
  const paletteB = systemB.palette ?? defaultPalette;

  // Handle final transform
  let finalTransform: FlameTransform | undefined;
  if (systemA.finalTransform || systemB.finalTransform) {
    const defaultFinal: FlameTransform = {
      coefs: [1, 0, 0, 1, 0, 0],
      variations: [{ type: VariationType.Linear, weight: 1 }],
      probability: 1,
      colorIndex: 0.5,
    };
    finalTransform = lerpFlameTransform(
      systemA.finalTransform ?? defaultFinal,
      systemB.finalTransform ?? defaultFinal,
      t
    );
  }

  return {
    name: `${systemA.name} → ${systemB.name}`,
    transforms,
    finalTransform,
    scale: lerp(scaleA, scaleB, t),
    center: [lerp(centerA[0], centerB[0], t), lerp(centerA[1], centerB[1], t)],
    rotate: lerp(rotateA, rotateB, t),
    palette: lerpPalette(paletteA, paletteB, t),
  };
}
