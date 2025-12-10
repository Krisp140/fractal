/**
 * Affine transformation map for IFS
 * Represents: p' = M * p + t
 * where M is the 2x2 matrix [a, b; c, d] and t is the translation vector [e, f]
 */
export interface AffineMap {
  // 2x2 linear transformation matrix [a, b, c, d]
  // Applied as: x' = a*x + b*y, y' = c*x + d*y
  matrix: [number, number, number, number];

  // Translation vector [e, f]
  translation: [number, number];

  // Selection probability for this map in the chaos game
  probability: number;

  // Optional color for this transformation
  color?: [number, number, number];
}

/**
 * Iterated Function System - collection of affine transformations
 */
export interface IFSSystem {
  name: string;
  maps: AffineMap[];
  // Normalization properties for consistent sizing during morphing
  scale?: number;           // Scale factor to normalize size (default 1.0)
  center?: [number, number]; // Center offset to normalize position (default [0, 0])
}

// ============================================
// FRACTAL FLAMES
// ============================================

/**
 * Variation types for fractal flames
 * Each variation is a non-linear function applied after the affine transform
 */
export enum VariationType {
  Linear = 0,
  Sinusoidal = 1,
  Spherical = 2,
  Swirl = 3,
  Horseshoe = 4,
  Polar = 5,
  Handkerchief = 6,
  Heart = 7,
  Disc = 8,
  Spiral = 9,
  Hyperbolic = 10,
  Diamond = 11,
  Ex = 12,
  Julia = 13,
  Bent = 14,
  Waves = 15,
  Fisheye = 16,
  Popcorn = 17,
  Exponential = 18,
  Power = 19,
  Cosine = 20,
  Rings = 21,
  Fan = 22,
  Blob = 23,
  PDJ = 24,
  Fan2 = 25,
  Rings2 = 26,
  Eyefish = 27,
  Bubble = 28,
  Cylinder = 29,
  Tangent = 30,
  Cross = 31,
  Noise = 32,
  Curl = 33,
  Rectangles = 34,
  Arch = 35,
}

/**
 * Variation with weight - allows blending multiple variations
 */
export interface WeightedVariation {
  type: VariationType;
  weight: number;
  // Variation-specific parameters
  params?: Record<string, number>;
}

/**
 * Flame transform - affine + variations + color
 */
export interface FlameTransform {
  // Affine pre-transform coefficients [a, b, c, d, e, f]
  // x' = a*x + b*y + e
  // y' = c*x + d*y + f
  coefs: [number, number, number, number, number, number];

  // Optional post-transform (applied after variations)
  post?: [number, number, number, number, number, number];

  // Variations to apply (can blend multiple)
  variations: WeightedVariation[];

  // Selection probability
  probability: number;

  // Color index (0-1) for palette lookup
  colorIndex: number;

  // Color speed - how fast color evolves
  colorSpeed?: number;
}

/**
 * Fractal Flame System
 */
export interface FlameSystem {
  name: string;
  transforms: FlameTransform[];

  // Final transform (applied to all points at the end)
  finalTransform?: FlameTransform;

  // Rendering parameters
  scale?: number;
  center?: [number, number];
  rotate?: number;  // Global rotation in radians

  // Palette (array of RGB colors to interpolate)
  palette?: [number, number, number][];
}

/**
 * Raymarched 3D Fractal types
 */
export enum Fractal3DType {
  Mandelbulb = 0,
  Mandelbox = 1,
  MengerSponge = 2,
  JuliaSet = 3,
}

/**
 * Raymarched 3D Fractal configuration
 */
export interface Fractal3D {
  name: string;
  type: Fractal3DType;
  power?: number;        // For Mandelbulb
  scale?: number;        // For Mandelbox
  foldingLimit?: number; // For Mandelbox
  defaultCameraPos?: [number, number, number];
  defaultCameraTarget?: [number, number, number];
}
