/**
 * Fractal Flame Presets - Carefully tuned for rich, structured patterns
 */

import { FlameSystem, VariationType } from './types';

// ============================================
// COLOR PALETTES
// ============================================

const firePalette: [number, number, number][] = [
  [0.1, 0, 0],
  [0.5, 0.1, 0],
  [0.9, 0.3, 0],
  [1, 0.6, 0.1],
  [1, 0.85, 0.4],
  [1, 1, 0.8],
];

const electricPalette: [number, number, number][] = [
  [0, 0, 0.2],
  [0, 0.3, 0.6],
  [0.2, 0.5, 1],
  [0.5, 0.8, 1],
  [0.8, 0.95, 1],
  [1, 1, 1],
];

const cosmicPalette: [number, number, number][] = [
  [0.1, 0, 0.15],
  [0.3, 0.05, 0.4],
  [0.5, 0.2, 0.7],
  [0.7, 0.4, 0.9],
  [0.9, 0.7, 1],
  [1, 0.95, 1],
];

const naturePalette: [number, number, number][] = [
  [0.05, 0.1, 0],
  [0.15, 0.3, 0.05],
  [0.3, 0.55, 0.1],
  [0.5, 0.75, 0.25],
  [0.75, 0.9, 0.5],
  [0.95, 1, 0.85],
];

const sunsetPalette: [number, number, number][] = [
  [0.15, 0, 0.1],
  [0.4, 0.05, 0.2],
  [0.7, 0.2, 0.3],
  [0.9, 0.4, 0.2],
  [1, 0.7, 0.3],
  [1, 0.95, 0.7],
];

const oceanPalette: [number, number, number][] = [
  [0, 0.1, 0.15],
  [0, 0.25, 0.35],
  [0.1, 0.45, 0.55],
  [0.3, 0.65, 0.7],
  [0.6, 0.85, 0.9],
  [0.9, 1, 1],
];

// ============================================
// FLAME PRESETS - Rich, Structured Patterns
// ============================================

/**
 * Spirograph - Interlocking spiral curves
 */
export const spirograph: FlameSystem = {
  name: "Spirograph",
  scale: 0.45,
  center: [0, 0],
  transforms: [
    {
      coefs: [0.7, -0.3, 0.3, 0.7, 0.2, 0],
      variations: [
        { type: VariationType.Linear, weight: 0.4 },
        { type: VariationType.Sinusoidal, weight: 0.4 },
        { type: VariationType.Handkerchief, weight: 0.2 },
      ],
      probability: 0.35,
      colorIndex: 0.1,
      colorSpeed: 0.5,
    },
    {
      coefs: [0.7, 0.3, -0.3, 0.7, -0.2, 0],
      variations: [
        { type: VariationType.Linear, weight: 0.4 },
        { type: VariationType.Sinusoidal, weight: 0.4 },
        { type: VariationType.Handkerchief, weight: 0.2 },
      ],
      probability: 0.35,
      colorIndex: 0.5,
      colorSpeed: 0.5,
    },
    {
      coefs: [0.5, 0, 0, 0.5, 0, 0],
      variations: [
        { type: VariationType.Spherical, weight: 0.6 },
        { type: VariationType.Linear, weight: 0.4 },
      ],
      probability: 0.3,
      colorIndex: 0.9,
      colorSpeed: 0.5,
    },
  ],
  palette: electricPalette,
};

/**
 * Phoenix - Symmetrical fiery wings
 */
export const phoenix: FlameSystem = {
  name: "Phoenix",
  scale: 0.4,
  center: [0, 0],
  transforms: [
    {
      coefs: [0.6, 0.2, -0.2, 0.6, 0, 0.4],
      variations: [
        { type: VariationType.Linear, weight: 0.5 },
        { type: VariationType.Swirl, weight: 0.3 },
        { type: VariationType.Horseshoe, weight: 0.2 },
      ],
      probability: 0.33,
      colorIndex: 0.15,
      colorSpeed: 0.4,
    },
    {
      coefs: [-0.6, 0.2, -0.2, -0.6, 0, 0.4],
      variations: [
        { type: VariationType.Linear, weight: 0.5 },
        { type: VariationType.Swirl, weight: 0.3 },
        { type: VariationType.Horseshoe, weight: 0.2 },
      ],
      probability: 0.33,
      colorIndex: 0.5,
      colorSpeed: 0.4,
    },
    {
      coefs: [0.45, 0, 0, 0.45, 0, -0.3],
      variations: [
        { type: VariationType.Spherical, weight: 0.4 },
        { type: VariationType.Linear, weight: 0.6 },
      ],
      probability: 0.34,
      colorIndex: 0.85,
      colorSpeed: 0.5,
    },
  ],
  palette: firePalette,
};

/**
 * Nautilus - Golden spiral shell
 */
export const nautilus: FlameSystem = {
  name: "Nautilus",
  scale: 0.4,
  center: [0, 0],
  transforms: [
    {
      coefs: [0.8, 0.15, -0.15, 0.8, 0.1, 0],
      variations: [
        { type: VariationType.Linear, weight: 0.6 },
        { type: VariationType.Spiral, weight: 0.3 },
        { type: VariationType.Polar, weight: 0.1 },
      ],
      probability: 0.5,
      colorIndex: 0.2,
      colorSpeed: 0.3,
    },
    {
      coefs: [0.4, 0.1, -0.1, 0.4, 0.5, 0],
      variations: [
        { type: VariationType.Linear, weight: 0.5 },
        { type: VariationType.Disc, weight: 0.3 },
        { type: VariationType.Spherical, weight: 0.2 },
      ],
      probability: 0.25,
      colorIndex: 0.55,
      colorSpeed: 0.4,
    },
    {
      coefs: [0.4, -0.1, 0.1, 0.4, -0.5, 0],
      variations: [
        { type: VariationType.Linear, weight: 0.5 },
        { type: VariationType.Disc, weight: 0.3 },
        { type: VariationType.Spherical, weight: 0.2 },
      ],
      probability: 0.25,
      colorIndex: 0.9,
      colorSpeed: 0.4,
    },
  ],
  palette: oceanPalette,
};

/**
 * Nebula - Cosmic swirling clouds
 */
export const nebula: FlameSystem = {
  name: "Nebula",
  scale: 0.45,
  center: [0, 0],
  transforms: [
    {
      coefs: [0.65, 0.25, -0.25, 0.65, 0, 0],
      variations: [
        { type: VariationType.Linear, weight: 0.3 },
        { type: VariationType.Swirl, weight: 0.4 },
        { type: VariationType.Bubble, weight: 0.3 },
      ],
      probability: 0.4,
      colorIndex: 0.15,
      colorSpeed: 0.3,
    },
    {
      coefs: [0.5, 0.3, -0.3, 0.5, 0.3, 0.2],
      variations: [
        { type: VariationType.Linear, weight: 0.4 },
        { type: VariationType.Eyefish, weight: 0.35 },
        { type: VariationType.Sinusoidal, weight: 0.25 },
      ],
      probability: 0.3,
      colorIndex: 0.5,
      colorSpeed: 0.4,
    },
    {
      coefs: [0.5, -0.3, 0.3, 0.5, -0.3, -0.2],
      variations: [
        { type: VariationType.Linear, weight: 0.4 },
        { type: VariationType.Eyefish, weight: 0.35 },
        { type: VariationType.Sinusoidal, weight: 0.25 },
      ],
      probability: 0.3,
      colorIndex: 0.85,
      colorSpeed: 0.4,
    },
  ],
  palette: cosmicPalette,
};

/**
 * Lotus - Radiant flower petals
 */
export const lotus: FlameSystem = {
  name: "Lotus",
  scale: 0.45,
  center: [0, 0],
  transforms: [
    {
      coefs: [0.5, 0, 0, 0.5, 0.5, 0],
      variations: [
        { type: VariationType.Linear, weight: 0.5 },
        { type: VariationType.Julia, weight: 0.35 },
        { type: VariationType.Polar, weight: 0.15 },
      ],
      probability: 0.25,
      colorIndex: 0.1,
      colorSpeed: 0.4,
    },
    {
      coefs: [0.5, 0, 0, 0.5, -0.25, 0.433],
      variations: [
        { type: VariationType.Linear, weight: 0.5 },
        { type: VariationType.Julia, weight: 0.35 },
        { type: VariationType.Polar, weight: 0.15 },
      ],
      probability: 0.25,
      colorIndex: 0.35,
      colorSpeed: 0.4,
    },
    {
      coefs: [0.5, 0, 0, 0.5, -0.25, -0.433],
      variations: [
        { type: VariationType.Linear, weight: 0.5 },
        { type: VariationType.Julia, weight: 0.35 },
        { type: VariationType.Polar, weight: 0.15 },
      ],
      probability: 0.25,
      colorIndex: 0.65,
      colorSpeed: 0.4,
    },
    {
      coefs: [0.4, 0, 0, 0.4, 0, 0],
      variations: [
        { type: VariationType.Spherical, weight: 0.5 },
        { type: VariationType.Linear, weight: 0.5 },
      ],
      probability: 0.25,
      colorIndex: 0.9,
      colorSpeed: 0.5,
    },
  ],
  palette: naturePalette,
};

/**
 * Vortex - Swirling energy funnel
 */
export const vortex: FlameSystem = {
  name: "Vortex",
  scale: 0.4,
  center: [0, 0],
  transforms: [
    {
      coefs: [0.75, 0.2, -0.2, 0.75, 0, 0],
      variations: [
        { type: VariationType.Linear, weight: 0.3 },
        { type: VariationType.Swirl, weight: 0.5 },
        { type: VariationType.Polar, weight: 0.2 },
      ],
      probability: 0.45,
      colorIndex: 0.2,
      colorSpeed: 0.35,
    },
    {
      coefs: [0.45, 0, 0, 0.45, 0, 0.4],
      variations: [
        { type: VariationType.Linear, weight: 0.5 },
        { type: VariationType.Handkerchief, weight: 0.3 },
        { type: VariationType.Spherical, weight: 0.2 },
      ],
      probability: 0.275,
      colorIndex: 0.55,
      colorSpeed: 0.45,
    },
    {
      coefs: [0.45, 0, 0, 0.45, 0, -0.4],
      variations: [
        { type: VariationType.Linear, weight: 0.5 },
        { type: VariationType.Handkerchief, weight: 0.3 },
        { type: VariationType.Spherical, weight: 0.2 },
      ],
      probability: 0.275,
      colorIndex: 0.85,
      colorSpeed: 0.45,
    },
  ],
  palette: electricPalette,
};

/**
 * Dragon - Serpentine flowing curves
 */
export const dragon: FlameSystem = {
  name: "Dragon",
  scale: 0.4,
  center: [0, 0],
  transforms: [
    {
      coefs: [0.7, 0.2, -0.15, 0.75, 0.15, 0],
      variations: [
        { type: VariationType.Linear, weight: 0.45 },
        { type: VariationType.Bent, weight: 0.3 },
        { type: VariationType.Horseshoe, weight: 0.25 },
      ],
      probability: 0.4,
      colorIndex: 0.1,
      colorSpeed: 0.4,
    },
    {
      coefs: [-0.5, 0.35, 0.35, 0.5, 0.25, 0.15],
      variations: [
        { type: VariationType.Linear, weight: 0.4 },
        { type: VariationType.Sinusoidal, weight: 0.35 },
        { type: VariationType.Hyperbolic, weight: 0.25 },
      ],
      probability: 0.35,
      colorIndex: 0.5,
      colorSpeed: 0.45,
    },
    {
      coefs: [0.45, -0.25, 0.25, 0.45, -0.25, -0.15],
      variations: [
        { type: VariationType.Linear, weight: 0.5 },
        { type: VariationType.Swirl, weight: 0.3 },
        { type: VariationType.Spherical, weight: 0.2 },
      ],
      probability: 0.25,
      colorIndex: 0.9,
      colorSpeed: 0.5,
    },
  ],
  palette: firePalette,
};

/**
 * Aurora - Flowing northern lights
 */
export const aurora: FlameSystem = {
  name: "Aurora",
  scale: 0.4,
  center: [0, 0],
  transforms: [
    {
      coefs: [0.8, 0.1, -0.1, 0.8, 0, 0],
      variations: [
        { type: VariationType.Linear, weight: 0.4 },
        { type: VariationType.Sinusoidal, weight: 0.35 },
        { type: VariationType.Waves, weight: 0.25, params: { b: 0.4, c: 0.4, e: 0.2, f: 0.2 } },
      ],
      probability: 0.45,
      colorIndex: 0.15,
      colorSpeed: 0.25,
    },
    {
      coefs: [0.55, 0.3, -0.3, 0.55, 0.2, 0.3],
      variations: [
        { type: VariationType.Linear, weight: 0.5 },
        { type: VariationType.Cosine, weight: 0.3 },
        { type: VariationType.Cylinder, weight: 0.2 },
      ],
      probability: 0.3,
      colorIndex: 0.5,
      colorSpeed: 0.35,
    },
    {
      coefs: [0.5, -0.25, 0.25, 0.5, -0.2, -0.3],
      variations: [
        { type: VariationType.Linear, weight: 0.55 },
        { type: VariationType.Fisheye, weight: 0.3 },
        { type: VariationType.Sinusoidal, weight: 0.15 },
      ],
      probability: 0.25,
      colorIndex: 0.85,
      colorSpeed: 0.4,
    },
  ],
  palette: naturePalette,
};

/**
 * Chrysanthemum - Intricate petal layers
 */
export const chrysanthemum: FlameSystem = {
  name: "Chrysanthemum",
  scale: 0.45,
  center: [0, 0],
  transforms: [
    {
      coefs: [0.55, 0, 0, 0.55, 0, 0],
      variations: [
        { type: VariationType.Linear, weight: 0.3 },
        { type: VariationType.Julia, weight: 0.4 },
        { type: VariationType.Polar, weight: 0.3 },
      ],
      probability: 0.35,
      colorIndex: 0.2,
      colorSpeed: 0.4,
    },
    {
      coefs: [0.45, 0.2, -0.2, 0.45, 0.35, 0],
      variations: [
        { type: VariationType.Linear, weight: 0.45 },
        { type: VariationType.Sinusoidal, weight: 0.3 },
        { type: VariationType.Spherical, weight: 0.25 },
      ],
      probability: 0.325,
      colorIndex: 0.5,
      colorSpeed: 0.45,
    },
    {
      coefs: [0.45, -0.2, 0.2, 0.45, -0.35, 0],
      variations: [
        { type: VariationType.Linear, weight: 0.45 },
        { type: VariationType.Sinusoidal, weight: 0.3 },
        { type: VariationType.Spherical, weight: 0.25 },
      ],
      probability: 0.325,
      colorIndex: 0.8,
      colorSpeed: 0.45,
    },
  ],
  palette: sunsetPalette,
};

/**
 * Plasma - Electric energy tendrils
 */
export const plasma: FlameSystem = {
  name: "Plasma",
  scale: 0.45,
  center: [0, 0],
  transforms: [
    {
      coefs: [0.65, 0.2, -0.2, 0.65, 0, 0],
      variations: [
        { type: VariationType.Linear, weight: 0.35 },
        { type: VariationType.Ex, weight: 0.35 },
        { type: VariationType.Spherical, weight: 0.3 },
      ],
      probability: 0.4,
      colorIndex: 0.1,
      colorSpeed: 0.45,
    },
    {
      coefs: [0.5, 0.25, -0.25, 0.5, 0.25, 0.2],
      variations: [
        { type: VariationType.Linear, weight: 0.4 },
        { type: VariationType.Diamond, weight: 0.35 },
        { type: VariationType.Swirl, weight: 0.25 },
      ],
      probability: 0.3,
      colorIndex: 0.45,
      colorSpeed: 0.5,
    },
    {
      coefs: [0.5, -0.25, 0.25, 0.5, -0.25, -0.2],
      variations: [
        { type: VariationType.Linear, weight: 0.4 },
        { type: VariationType.Diamond, weight: 0.35 },
        { type: VariationType.Swirl, weight: 0.25 },
      ],
      probability: 0.3,
      colorIndex: 0.8,
      colorSpeed: 0.5,
    },
  ],
  palette: electricPalette,
};

/**
 * Fern - Organic branching fronds
 */
export const fern: FlameSystem = {
  name: "Fern",
  scale: 0.35,
  center: [0, 0.5],
  transforms: [
    {
      coefs: [0, 0, 0, 0.16, 0, 0],
      variations: [
        { type: VariationType.Linear, weight: 1 },
      ],
      probability: 0.01,
      colorIndex: 0.1,
      colorSpeed: 0.2,
    },
    {
      coefs: [0.85, 0.04, -0.04, 0.85, 0, 1.6],
      variations: [
        { type: VariationType.Linear, weight: 0.7 },
        { type: VariationType.Sinusoidal, weight: 0.2 },
        { type: VariationType.Bent, weight: 0.1 },
      ],
      probability: 0.85,
      colorIndex: 0.4,
      colorSpeed: 0.35,
    },
    {
      coefs: [0.2, -0.26, 0.23, 0.22, 0, 1.6],
      variations: [
        { type: VariationType.Linear, weight: 0.75 },
        { type: VariationType.Sinusoidal, weight: 0.25 },
      ],
      probability: 0.07,
      colorIndex: 0.65,
      colorSpeed: 0.4,
    },
    {
      coefs: [-0.15, 0.28, 0.26, 0.24, 0, 0.44],
      variations: [
        { type: VariationType.Linear, weight: 0.75 },
        { type: VariationType.Sinusoidal, weight: 0.25 },
      ],
      probability: 0.07,
      colorIndex: 0.9,
      colorSpeed: 0.4,
    },
  ],
  palette: naturePalette,
};

/**
 * Jellyfish - Flowing bioluminescent creature
 */
export const jellyfish: FlameSystem = {
  name: "Jellyfish",
  scale: 0.45,
  center: [0, 0],
  transforms: [
    {
      coefs: [0.7, 0.1, -0.1, 0.7, 0, 0.15],
      variations: [
        { type: VariationType.Linear, weight: 0.4 },
        { type: VariationType.Bubble, weight: 0.35 },
        { type: VariationType.Fisheye, weight: 0.25 },
      ],
      probability: 0.4,
      colorIndex: 0.2,
      colorSpeed: 0.3,
    },
    {
      coefs: [0.5, 0.2, -0.2, 0.5, 0, -0.25],
      variations: [
        { type: VariationType.Linear, weight: 0.45 },
        { type: VariationType.Sinusoidal, weight: 0.3 },
        { type: VariationType.Waves, weight: 0.25, params: { b: 0.5, c: 0.3, e: 0.4, f: 0.4 } },
      ],
      probability: 0.35,
      colorIndex: 0.55,
      colorSpeed: 0.4,
    },
    {
      coefs: [0.4, 0, 0, 0.4, 0, -0.5],
      variations: [
        { type: VariationType.Linear, weight: 0.5 },
        { type: VariationType.Curl, weight: 0.3, params: { c1: 0.4, c2: 0.15 } },
        { type: VariationType.Spherical, weight: 0.2 },
      ],
      probability: 0.25,
      colorIndex: 0.85,
      colorSpeed: 0.45,
    },
  ],
  palette: cosmicPalette,
};

// Export all flame presets
export const flamePresets: FlameSystem[] = [
  spirograph,
  phoenix,
  nautilus,
  nebula,
  lotus,
  vortex,
  dragon,
  aurora,
  chrysanthemum,
  plasma,
  fern,
  jellyfish,
];

export const defaultFlamePreset = spirograph;
