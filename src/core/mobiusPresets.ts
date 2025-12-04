import { MobiusSystem } from './types';

/**
 * Apollonian Gasket
 * Circle packing fractal - infinitely nested circles
 */
export const apollonianGasket: MobiusSystem = {
  name: "Apollonian Gasket",
  scale: 0.4,
  center: [0, 0],
  maps: [
    // Inversion in circles creates the gasket pattern
    {
      a: [1, 0],
      b: [-1, 0],
      c: [1, 0],
      d: [1, 0],
      probability: 0.25,
      color: [1.0, 0.3, 0.5],
    },
    {
      a: [1, 0],
      b: [0.5, 0.866],
      c: [1, 0],
      d: [-0.5, -0.866],
      probability: 0.25,
      color: [0.3, 1.0, 0.5],
    },
    {
      a: [1, 0],
      b: [0.5, -0.866],
      c: [1, 0],
      d: [-0.5, 0.866],
      probability: 0.25,
      color: [0.5, 0.3, 1.0],
    },
    {
      a: [2, 0],
      b: [0, 0],
      c: [0, 0],
      d: [1, 0],
      probability: 0.25,
      color: [1.0, 1.0, 0.3],
    },
  ],
};

/**
 * Hyperbolic Spiral
 * Spiraling into infinity
 */
export const hyperbolicSpiral: MobiusSystem = {
  name: "Hyperbolic Spiral",
  scale: 0.5,
  center: [0, 0],
  maps: [
    // Rotation + slight contraction
    {
      a: [0.8, 0.3],
      b: [0.1, 0],
      c: [0, 0],
      d: [1, 0],
      probability: 0.4,
      color: [1.0, 0.2, 0.8],
    },
    // Counter rotation
    {
      a: [0.8, -0.3],
      b: [-0.1, 0],
      c: [0, 0],
      d: [1, 0],
      probability: 0.4,
      color: [0.2, 1.0, 0.8],
    },
    // Inversion for depth
    {
      a: [0, 0],
      b: [0.5, 0],
      c: [1, 0],
      d: [0, 0],
      probability: 0.2,
      color: [0.8, 0.8, 1.0],
    },
  ],
};

/**
 * Schottky Circles
 * Nested circle inversions creating fractal dust
 */
export const schottkyCircles: MobiusSystem = {
  name: "Schottky Circles",
  scale: 0.3,
  center: [0, 0],
  maps: [
    // Circle inversion 1
    {
      a: [1.5, 0],
      b: [1, 0],
      c: [1, 0],
      d: [1.5, 0],
      probability: 0.25,
      color: [1.0, 0.5, 0.2],
    },
    // Circle inversion 2
    {
      a: [1.5, 0],
      b: [-1, 0],
      c: [-1, 0],
      d: [1.5, 0],
      probability: 0.25,
      color: [0.2, 1.0, 0.5],
    },
    // Circle inversion 3
    {
      a: [1.5, 0],
      b: [0, 1],
      c: [0, 1],
      d: [1.5, 0],
      probability: 0.25,
      color: [0.5, 0.2, 1.0],
    },
    // Circle inversion 4
    {
      a: [1.5, 0],
      b: [0, -1],
      c: [0, -1],
      d: [1.5, 0],
      probability: 0.25,
      color: [1.0, 1.0, 0.2],
    },
  ],
};

/**
 * Grandma's Recipe
 * Classic Möbius group - creates lace-like patterns
 */
export const grandmasRecipe: MobiusSystem = {
  name: "Grandma's Recipe",
  scale: 0.25,
  center: [0, 0],
  maps: [
    {
      a: [1.87, 0.1],
      b: [0.06, 0.79],
      c: [-0.06, 0.79],
      d: [1.87, -0.1],
      probability: 0.25,
      color: [1.0, 0.3, 0.7],
    },
    {
      a: [1.87, -0.1],
      b: [-0.06, -0.79],
      c: [0.06, -0.79],
      d: [1.87, 0.1],
      probability: 0.25,
      color: [0.3, 1.0, 0.7],
    },
    {
      a: [-0.2, 0.98],
      b: [0.98, 0.2],
      c: [0.98, 0.2],
      d: [-0.2, 0.98],
      probability: 0.25,
      color: [0.7, 0.3, 1.0],
    },
    {
      a: [-0.2, -0.98],
      b: [0.98, -0.2],
      c: [0.98, -0.2],
      d: [-0.2, -0.98],
      probability: 0.25,
      color: [1.0, 0.9, 0.3],
    },
  ],
};

/**
 * Infinite Droste
 * The "picture within a picture" effect
 */
export const infiniteDroste: MobiusSystem = {
  name: "Infinite Droste",
  scale: 0.6,
  center: [0, 0],
  maps: [
    // Logarithmic spiral
    {
      a: [0.7, 0.2],
      b: [0.3, 0],
      c: [0, 0],
      d: [1, 0],
      probability: 0.35,
      color: [1.0, 0.4, 0.6],
    },
    {
      a: [0.7, -0.2],
      b: [-0.3, 0],
      c: [0, 0],
      d: [1, 0],
      probability: 0.35,
      color: [0.4, 1.0, 0.6],
    },
    // Scale down and rotate
    {
      a: [0.5, 0.5],
      b: [0, 0],
      c: [0, 0],
      d: [1, 0],
      probability: 0.3,
      color: [0.6, 0.4, 1.0],
    },
  ],
};

/**
 * Kleinian Pearls
 * Kleinian group limit set - pearl necklace pattern
 */
export const kleinianPearls: MobiusSystem = {
  name: "Kleinian Pearls",
  scale: 0.35,
  center: [0, 0],
  maps: [
    {
      a: [1, 1],
      b: [0, 0],
      c: [1, 0],
      d: [1, 0],
      probability: 0.25,
      color: [0.9, 0.3, 0.9],
    },
    {
      a: [1, -1],
      b: [0, 0],
      c: [-1, 0],
      d: [1, 0],
      probability: 0.25,
      color: [0.3, 0.9, 0.9],
    },
    {
      a: [1, 0],
      b: [2, 0],
      c: [0, 0],
      d: [1, 0],
      probability: 0.25,
      color: [0.9, 0.9, 0.3],
    },
    {
      a: [1, 0],
      b: [-2, 0],
      c: [0, 0],
      d: [1, 0],
      probability: 0.25,
      color: [0.5, 0.5, 1.0],
    },
  ],
};

/**
 * Modular Group
 * The fundamental domain of PSL(2,Z)
 */
export const modularGroup: MobiusSystem = {
  name: "Modular Group",
  scale: 0.4,
  center: [0, -0.5],
  maps: [
    // S: z -> -1/z
    {
      a: [0, 0],
      b: [-1, 0],
      c: [1, 0],
      d: [0, 0],
      probability: 0.33,
      color: [1.0, 0.2, 0.2],
    },
    // T: z -> z + 1
    {
      a: [1, 0],
      b: [1, 0],
      c: [0, 0],
      d: [1, 0],
      probability: 0.33,
      color: [0.2, 1.0, 0.2],
    },
    // T^-1: z -> z - 1
    {
      a: [1, 0],
      b: [-1, 0],
      c: [0, 0],
      d: [1, 0],
      probability: 0.34,
      color: [0.2, 0.2, 1.0],
    },
  ],
};

/**
 * Vortex
 * Spiraling vortex pattern
 */
export const vortex: MobiusSystem = {
  name: "Vortex",
  scale: 0.5,
  center: [0, 0],
  maps: [
    // Spiral inward
    {
      a: [0.9, 0.3],
      b: [0, 0],
      c: [0.05, 0.02],
      d: [1, 0],
      probability: 0.4,
      color: [1.0, 0.0, 0.5],
    },
    // Spiral outward
    {
      a: [0.9, -0.3],
      b: [0, 0],
      c: [-0.05, 0.02],
      d: [1, 0],
      probability: 0.4,
      color: [0.0, 1.0, 0.5],
    },
    // Inversion kick
    {
      a: [0.1, 0],
      b: [0.3, 0],
      c: [0.3, 0],
      d: [0.1, 0],
      probability: 0.2,
      color: [0.5, 0.5, 1.0],
    },
  ],
};

/**
 * Cosmic Web
 * Filament-like structure
 */
export const cosmicWeb: MobiusSystem = {
  name: "Cosmic Web",
  scale: 0.3,
  center: [0, 0],
  maps: [
    {
      a: [1.2, 0.4],
      b: [0.5, 0.3],
      c: [0.3, 0.1],
      d: [1.2, -0.4],
      probability: 0.2,
      color: [0.8, 0.2, 1.0],
    },
    {
      a: [1.2, -0.4],
      b: [-0.5, 0.3],
      c: [-0.3, 0.1],
      d: [1.2, 0.4],
      probability: 0.2,
      color: [0.2, 0.8, 1.0],
    },
    {
      a: [0.8, 0],
      b: [0, 0.6],
      c: [0, 0.2],
      d: [0.8, 0],
      probability: 0.2,
      color: [1.0, 0.8, 0.2],
    },
    {
      a: [0.8, 0],
      b: [0, -0.6],
      c: [0, -0.2],
      d: [0.8, 0],
      probability: 0.2,
      color: [0.2, 1.0, 0.8],
    },
    {
      a: [0.6, 0.6],
      b: [0, 0],
      c: [0, 0],
      d: [1, 0],
      probability: 0.2,
      color: [1.0, 0.5, 0.5],
    },
  ],
};

// Export all Möbius presets
export const mobiusPresets: MobiusSystem[] = [
  apollonianGasket,
  hyperbolicSpiral,
  schottkyCircles,
  grandmasRecipe,
  infiniteDroste,
  kleinianPearls,
  modularGroup,
  vortex,
  cosmicWeb,
];

export const defaultMobiusPreset = hyperbolicSpiral;
