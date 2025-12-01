# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fractal IFS Explorer is an interactive fractal visualization tool using Iterated Function Systems (IFS) and the chaos game algorithm. It features real-time GPU-accelerated WebGL rendering via Three.js, React-based UI with Leva controls, and TypeScript for type safety.

## Development Commands

```bash
# Start development server (Vite at http://localhost:5173)
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build
npm run preview
```

## Core Architecture

### Rendering Pipeline (Two-Pass GPU Rendering)

The application uses a sophisticated two-pass WebGL rendering pipeline implemented in `src/hooks/useFractalRenderer.ts`:

**Pass 1 - Accumulation:**
- Generate points using the chaos game algorithm on CPU
- Upload points as WebGL point primitives to GPU
- Render to a float texture (accumulation buffer) with additive blending
- Each pixel accumulates density of points that hit it
- Uses `src/shaders/point.vert` and `src/shaders/accumulate.frag`

**Pass 2 - Tone Mapping & Display:**
- Render full-screen quad with accumulation texture
- Apply logarithmic tone mapping: `color = log(1 + density) / log(1 + brightness)`
- Map density to color gradient
- Apply post-processing effects (bloom, chromatic aberration, kaleidoscope, rotation)
- Uses `src/shaders/common.vert` and `src/shaders/tonemap.frag`

### Chaos Game Algorithm (`src/core/chaosGame.ts`)

Generates fractal points by iteratively applying randomly selected affine transformations:
1. Start at random point in [-1, 1]²
2. Skip initial iterations (default 100) for convergence to attractor
3. For each iteration:
   - Select transformation based on probability weights
   - Apply transformation: `p' = M * p + t` where M is 2×2 matrix, t is translation
   - Yield point with optional per-transform color

Points are batched as Float32Arrays for efficient GPU upload.

### IFS System Structure (`src/core/types.ts`)

```typescript
interface AffineMap {
  matrix: [a, b, c, d];        // 2×2 linear transformation
  translation: [e, f];          // Translation vector
  probability: number;          // Selection weight (should sum to 1.0)
  color?: [r, g, b];           // Optional per-transform color
}

interface IFSSystem {
  name: string;
  maps: AffineMap[];           // Collection of transformations
}
```

### State Management

- React hooks manage component state
- Leva (`useControls`) handles control panel state
- Three.js renderer state stored in refs to prevent unnecessary re-renders
- Animation state tracked via `requestAnimationFrame` loop

### Key Components

- **`src/App.tsx`**: Main application component with Leva control panel, handles preset selection, animation modes (auto-animate, psychedelic, morphing), DMT mode, color cycling
- **`src/components/FractalCanvas.tsx`**: Canvas wrapper with mouse interaction handlers (drag to pan, wheel to zoom)
- **`src/hooks/useFractalRenderer.ts`**: Core Three.js rendering logic, manages WebGL state, render targets, shaders, and animation loop

### Fractal Morphing (`src/core/morphing.ts`)

Smoothly interpolates between different IFS systems by linearly interpolating transformation matrices, translations, probabilities, and colors. Handles systems with different numbers of maps by padding shorter system.

## Adding Features

### New Fractal Presets

Edit `src/core/presets.ts`:
```typescript
export const myFractal: IFSSystem = {
  name: "My Fractal",
  maps: [
    {
      matrix: [a, b, c, d],
      translation: [e, f],
      probability: 0.5,  // Must sum to 1.0 across all maps
      color: [r, g, b],  // Optional, 0-1 range
    },
    // ... more maps
  ],
};
```

### New Color Palettes

Edit `src/core/colorPalettes.ts`:
```typescript
export const myPalette: ColorPalette = {
  name: "My Palette",
  low: "#000000",   // Hex for low density
  high: "#ffffff",  // Hex for high density
};
```

### New Shaders

Shader files are in `src/shaders/` with `.vert` and `.frag` extensions. Import via `vite-plugin-glsl`:
```typescript
import myShader from '../shaders/my.frag';
```

Shaders are standard GLSL. Key uniforms in tone mapping shader:
- `uAccumTexture`: Accumulation buffer (sampler2D)
- `uBrightness`: Tone mapping brightness multiplier
- `uColorLow`/`uColorHigh`: Color gradient
- `uBloomIntensity`/`uBloomThreshold`: Bloom effect parameters
- `uRotation`: Rotation angle in radians
- `uKaleidoscope`/`uKaleidoscopeSegments`: Kaleidoscope effect
- `uChromaticAberration`: RGB separation amount

### New Visual Effects

Add parameters to `FractalRendererConfig` interface in `src/hooks/useFractalRenderer.ts`, add uniforms to shader materials, implement effect logic in fragment shaders, and expose controls in `src/App.tsx` via `useControls`.

## Important Implementation Details

### Performance Considerations

- Default 10k-100k points generated per frame at 60fps
- Point generation happens on CPU (JavaScript), rendering on GPU
- Accumulation buffer allows building up density over multiple frames
- Use Float32Array for efficient GPU data upload
- Infinite accumulation mode skips buffer clearing for long-exposure effect

### Coordinate Systems

- IFS transformations work in 2D (x, y)
- Points converted to 3D (x, y, 0) for Three.js
- Vertex shader applies zoom/pan transformation
- Orthographic camera with [-1, 1] frustum
- Canvas is full viewport size

### Animation Modes

- **Auto Animate**: Automatic zoom/pan with sine wave variations
- **Psychedelic Mode**: Combines breathing zoom, spiral movement, pulsing brightness, fast color cycling
- **Fractal Morphing**: Interpolates between fractals, automatically cycles through presets
- **Motion Trails**: Uses trail decay to fade previous frames instead of clearing
- **DMT Mode**: One-click button to enable all psychedelic effects

### Three.js Scene Structure

- Scene contains two objects toggled per pass:
  - Points mesh (visible during accumulation pass)
  - Display quad mesh (visible during display pass)
- Single orthographic camera used for both passes
- Render targets switched between passes via `setRenderTarget()`

## Build System

Vite is the build tool with React and GLSL plugins:
- `@vitejs/plugin-react`: JSX/TSX transformation, React Refresh for HMR
- `vite-plugin-glsl`: Import GLSL shaders as strings

TypeScript configuration split between `tsconfig.app.json` (app code) and `tsconfig.node.json` (Vite config).
