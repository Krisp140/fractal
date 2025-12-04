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
 * Complex number represented as [real, imaginary]
 */
export type Complex = [number, number];

/**
 * Möbius transformation: f(z) = (az + b) / (cz + d)
 * Works in the complex plane for hyperbolic/conformal mappings
 */
export interface MobiusMap {
  // Complex coefficients [real, imag]
  a: Complex;
  b: Complex;
  c: Complex;
  d: Complex;

  // Selection probability
  probability: number;

  // Optional color
  color?: [number, number, number];
}

/**
 * Möbius IFS System - uses complex Möbius transformations
 */
export interface MobiusSystem {
  name: string;
  maps: MobiusMap[];
  scale?: number;
  center?: Complex;
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
