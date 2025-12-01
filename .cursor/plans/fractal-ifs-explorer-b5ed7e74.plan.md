<!-- b5ed7e74-42db-47c0-930c-2114a7a3c6eb 3e5c5a8f-81eb-46a2-99fb-388b23179033 -->
# Fractal IFS Explorer - Implementation Plan

## Architecture Overview

```
src/
├── main.tsx                 # Entry point
├── App.tsx                  # Main app with Leva controls
├── components/
│   ├── FractalCanvas.tsx    # Three.js canvas wrapper
│   └── PresetSelector.tsx   # Preset dropdown
├── core/
│   ├── types.ts             # IFS types (AffineMap, IFSSystem)
│   ├── chaosGame.ts         # Chaos game iteration logic
│   └── presets.ts           # Preset fractal definitions
├── shaders/
│   ├── accumulate.frag      # Histogram accumulation shader
│   ├── tonemap.frag         # Tone mapping for display
│   └── common.vert          # Shared vertex shader
└── hooks/
    └── useFractalRenderer.ts # Three.js render loop hook
```

## Phase 1: MVP - Core Rendering (Primary Focus)

### 1.1 Project Setup

- Initialize Vite + React + TypeScript project
- Install dependencies: `three`, `@react-three/fiber`, `leva`, `@types/three`
- Configure TypeScript for GLSL imports

### 1.2 IFS Core Types

Define the mathematical foundation in `src/core/types.ts`:

```typescript
interface AffineMap {
  // 2x2 linear transformation matrix [a, b, c, d]
  matrix: [number, number, number, number];
  // Translation vector [e, f]
  translation: [number, number];
  // Selection probability
  probability: number;
}

interface IFSSystem {
  name: string;
  maps: AffineMap[];
}
```

### 1.3 Chaos Game Implementation

The chaos game algorithm in `src/core/chaosGame.ts`:

- Start at random point in [-1, 1] x [-1, 1]
- Each iteration: randomly select an affine map (weighted by probability)
- Apply transformation: `p' = M * p + t`
- Output point coordinates to GPU buffer

### 1.4 WebGL Rendering Pipeline

Two-pass shader architecture:

**Pass 1 - Accumulation (`accumulate.frag`):**

- Render chaos game points as GL_POINTS
- Use additive blending to float texture (RGBA32F)
- Each point increments pixel density

**Pass 2 - Tone Mapping (`tonemap.frag`):**

- Read accumulated histogram
- Apply logarithmic tone mapping: `color = log(1 + density) / log(1 + maxDensity)`
- Apply color palette/gradient

### 1.5 React Integration

- `FractalCanvas.tsx`: Three.js canvas using @react-three/fiber
- `useFractalRenderer.ts`: Custom hook managing render targets, shader uniforms, and animation loop
- Leva controls in `App.tsx` for basic parameters:
  - Iterations per frame (1000-100000)
  - Zoom level
  - Color palette selection

### 1.6 First Preset - Sierpiński Triangle

Classic IFS with 3 affine maps (scale 0.5, translate to corners):

```typescript
const sierpinski: IFSSystem = {
  name: "Sierpiński Triangle",
  maps: [
    { matrix: [0.5, 0, 0, 0.5], translation: [0, 0], probability: 1/3 },
    { matrix: [0.5, 0, 0, 0.5], translation: [0.5, 0], probability: 1/3 },
    { matrix: [0.5, 0, 0, 0.5], translation: [0.25, 0.5], probability: 1/3 },
  ]
};
```

## Phase 2: Interactive Editing (After MVP)

- Drag handles for transformation control points
- Per-map sliders for rotation, scale, translation
- Per-map probability adjustment
- Real-time preview updates

## Phase 3: Preset Gallery (After MVP)

Add classic fractals:

- Barnsley Fern
- Dragon Curve
- Koch Snowflake variations
- Maple Leaf

## Phase 4: Color Transformations (After MVP)

Extend `AffineMap` with:

```typescript
colorMatrix?: [number, number, number, number, number, number, number, number, number];
colorBias?: [number, number, number];
```

## Phase 5: Collage Mode (Future)

- Image upload and display
- Split-screen comparison view
- Error heatmap overlay
- SSIM/SSD metric computation
- Parameter optimization guidance

## Key Technical Decisions

| Decision | Choice | Rationale |

|----------|--------|-----------|

| Point rendering | GPU via WebGL | Performance for millions of iterations |

| Accumulation buffer | Float32 texture | High dynamic range density storage |

| State management | Leva + React state | Simple, no Redux needed |

| Coordinate system | Normalized [-1,1] | Shader-friendly, zoom via uniform |

## Performance Targets

- 100k+ iterations per frame at 60fps
- Smooth interaction while rendering
- Progressive refinement (low iterations during drag, high on release)

### To-dos

- [ ] Initialize Vite + React + TypeScript project with Three.js and Leva dependencies
- [ ] Define IFS core types (AffineMap, IFSSystem) in src/core/types.ts
- [ ] Implement Sierpiński triangle preset in src/core/presets.ts
- [ ] Implement chaos game algorithm with GPU point buffer generation
- [ ] Create accumulation and tone-mapping GLSL shaders
- [ ] Build Three.js renderer with two-pass pipeline and render targets
- [ ] Create FractalCanvas React component with @react-three/fiber
- [ ] Wire up Leva controls for iterations, zoom, and color palette
- [ ] Add basic styling, loading state, and README documentation