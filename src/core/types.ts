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
