import { IFSSystem } from './types';

/**
 * Classic Sierpiński Triangle
 * Uses 3 contractive maps that scale by 0.5 toward three vertices
 * Maps: p' = 0.5 * p + 0.5 * vertex
 * Vertices at (-0.8, -0.8), (0.8, -0.8), (0, 0.8)
 */
export const sierpinski: IFSSystem = {
  name: "Sierpiński Triangle",
  maps: [
    {
      matrix: [0.5, 0, 0, 0.5],
      translation: [-0.4, -0.4],  // 0.5 * (-0.8, -0.8)
      probability: 1/3,
    },
    {
      matrix: [0.5, 0, 0, 0.5],
      translation: [0.4, -0.4],   // 0.5 * (0.8, -0.8)
      probability: 1/3,
    },
    {
      matrix: [0.5, 0, 0, 0.5],
      translation: [0, 0.4],      // 0.5 * (0, 0.8)
      probability: 1/3,
    },
  ],
};

/**
 * Barnsley Fern
 * Classic fern fractal with 4 affine transformations
 */
export const barnsleyFern: IFSSystem = {
  name: "Barnsley Fern",
  maps: [
    {
      matrix: [0, 0, 0, 0.16],
      translation: [0, 0],
      probability: 0.01,
    },
    {
      matrix: [0.85, 0.04, -0.04, 0.85],
      translation: [0, 1.6],
      probability: 0.85,
    },
    {
      matrix: [0.2, -0.26, 0.23, 0.22],
      translation: [0, 1.6],
      probability: 0.07,
    },
    {
      matrix: [-0.15, 0.28, 0.26, 0.24],
      translation: [0, 0.44],
      probability: 0.07,
    },
  ],
};

/**
 * Dragon Curve
 * Self-similar curve that tiles the plane
 */
export const dragonCurve: IFSSystem = {
  name: "Dragon Curve",
  maps: [
    {
      matrix: [0.5, -0.5, 0.5, 0.5],
      translation: [0, 0],
      probability: 0.5,
    },
    {
      matrix: [-0.5, -0.5, 0.5, -0.5],
      translation: [0.5, 0.5],
      probability: 0.5,
    },
  ],
};

/**
 * Sierpiński Carpet
 * Square variation of the Sierpiński Triangle
 */
export const sierpinskiCarpet: IFSSystem = {
  name: "Sierpiński Carpet",
  maps: [
    { matrix: [1/3, 0, 0, 1/3], translation: [-0.6, -0.6], probability: 1/8 },
    { matrix: [1/3, 0, 0, 1/3], translation: [0, -0.6], probability: 1/8 },
    { matrix: [1/3, 0, 0, 1/3], translation: [0.6, -0.6], probability: 1/8 },
    { matrix: [1/3, 0, 0, 1/3], translation: [-0.6, 0], probability: 1/8 },
    { matrix: [1/3, 0, 0, 1/3], translation: [0.6, 0], probability: 1/8 },
    { matrix: [1/3, 0, 0, 1/3], translation: [-0.6, 0.6], probability: 1/8 },
    { matrix: [1/3, 0, 0, 1/3], translation: [0, 0.6], probability: 1/8 },
    { matrix: [1/3, 0, 0, 1/3], translation: [0.6, 0.6], probability: 1/8 },
  ],
};

/**
 * Maple Leaf
 * Organic-looking fractal resembling a leaf
 */
export const mapleLeaf: IFSSystem = {
  name: "Maple Leaf",
  maps: [
    {
      matrix: [0.14, 0.01, 0, 0.51],
      translation: [-0.08, -1.31],
      probability: 0.25,
    },
    {
      matrix: [0.43, 0.52, -0.45, 0.5],
      translation: [1.49, -0.75],
      probability: 0.25,
    },
    {
      matrix: [0.45, -0.49, 0.47, 0.47],
      translation: [-1.62, -0.74],
      probability: 0.25,
    },
    {
      matrix: [0.49, 0, 0, 0.51],
      translation: [0.02, 1.62],
      probability: 0.25,
    },
  ],
};

/**
 * Spiral
 * Creates a beautiful spiral pattern
 */
export const spiral: IFSSystem = {
  name: "Spiral",
  maps: [
    {
      matrix: [0.787879, -0.424242, 0.242424, 0.859848],
      translation: [1.758647, 1.408065],
      probability: 0.90,
    },
    {
      matrix: [-0.121212, 0.257576, 0.151515, 0.053030],
      translation: [-6.721654, 1.377236],
      probability: 0.05,
    },
    {
      matrix: [0.181818, -0.136364, 0.090909, 0.181818],
      translation: [6.086107, 1.568035],
      probability: 0.05,
    },
  ],
};

/**
 * Koch Snowflake Variant
 */
export const kochVariant: IFSSystem = {
  name: "Koch Variant",
  maps: [
    {
      matrix: [1/3, 0, 0, 1/3],
      translation: [-0.5, -0.3],
      probability: 0.25,
    },
    {
      matrix: [1/6, -0.289, 0.289, 1/6],
      translation: [-0.167, 0.067],
      probability: 0.25,
    },
    {
      matrix: [1/6, 0.289, -0.289, 1/6],
      translation: [0.167, 0.067],
      probability: 0.25,
    },
    {
      matrix: [1/3, 0, 0, 1/3],
      translation: [0.5, -0.3],
      probability: 0.25,
    },
  ],
};

/**
 * Tree
 * Branching tree structure
 */
export const tree: IFSSystem = {
  name: "Tree",
  maps: [
    {
      matrix: [0.05, 0, 0, 0.6],
      translation: [0, 0],
      probability: 0.05,
    },
    {
      matrix: [0.45, -0.22, 0.22, 0.45],
      translation: [0, 0.4],
      probability: 0.4,
    },
    {
      matrix: [0.45, 0.22, -0.22, 0.45],
      translation: [0, 0.4],
      probability: 0.4,
    },
    {
      matrix: [0.3, 0.3, -0.3, 0.3],
      translation: [0, 0.3],
      probability: 0.15,
    },
  ],
};

/**
 * Rainbow Sierpiński - Same as Sierpiński but with colors per transformation
 */
export const rainbowSierpinski: IFSSystem = {
  name: "Rainbow Sierpiński",
  maps: [
    {
      matrix: [0.5, 0, 0, 0.5],
      translation: [-0.4, -0.4],
      probability: 1/3,
      color: [1.0, 0.2, 0.2], // Red
    },
    {
      matrix: [0.5, 0, 0, 0.5],
      translation: [0.4, -0.4],
      probability: 1/3,
      color: [0.2, 1.0, 0.2], // Green
    },
    {
      matrix: [0.5, 0, 0, 0.5],
      translation: [0, 0.4],
      probability: 1/3,
      color: [0.2, 0.2, 1.0], // Blue
    },
  ],
};

export const presets: IFSSystem[] = [
  sierpinski,
  rainbowSierpinski,
  barnsleyFern,
  dragonCurve,
  sierpinskiCarpet,
  mapleLeaf,
  spiral,
  kochVariant,
  tree,
];

export const defaultPreset = sierpinski;
