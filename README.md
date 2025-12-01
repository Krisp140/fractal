# Fractal IFS Explorer

An interactive fractal visualization tool using Iterated Function Systems (IFS) and the chaos game algorithm. Explore beautiful mathematical fractals with real-time GPU-accelerated rendering, interactive controls, and stunning visual effects.

![Fractal Visualization](https://img.shields.io/badge/WebGL-Accelerated-blue) ![React](https://img.shields.io/badge/React-18.3.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue)

## Features

- 🎨 **Multiple Fractal Presets**: Sierpiński Triangle, Barnsley Fern, Dragon Curve, Maple Leaf, Spiral, Tree, and more
- 🖱️ **Interactive Controls**: Mouse drag to pan, scroll to zoom
- 🌈 **Color Palettes**: Multiple color schemes with custom color support
- ✨ **Visual Effects**: 
  - Bloom/glow effects
  - Color cycling
  - Fractal morphing between presets
  - Kaleidoscope mode
  - Motion trails
  - Chromatic aberration
  - Rotation animations
- 🎛️ **Real-time Controls**: Adjust zoom, pan, brightness, iterations, and more via Leva control panel
- 📸 **Export**: Save fractals as PNG images
- 🚀 **High Performance**: GPU-accelerated rendering with 100k+ points per frame at 60fps

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher) or **yarn**
- A modern web browser with WebGL support (Chrome, Firefox, Safari, Edge)

## Setup Instructions

### 1. Clone or Download the Repository

If you have the repository URL:
```bash
git clone <repository-url>
cd fractal
```

Or if you already have the project files, navigate to the project directory:
```bash
cd fractal
```

### 2. Install Dependencies

Install all required npm packages:

```bash
npm install
```

This will install:
- React and React DOM
- Three.js for WebGL rendering
- Leva for the control panel UI
- TypeScript and build tools
- Vite for development and building

### 3. Start the Development Server

Run the development server:

```bash
npm run dev
```

The application will start and you should see output like:
```
  VITE v6.0.1  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 4. Open in Browser

Open your browser and navigate to:
```
http://localhost:5173/
```

You should see the fractal explorer interface with a control panel on the left side.

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist/` directory. You can preview the production build with:

```bash
npm run preview
```

## Usage Guide

### Basic Controls

- **Mouse Drag**: Pan around the fractal
- **Mouse Wheel**: Zoom in/out
- **Control Panel**: Use the Leva panel on the left to adjust settings

### Control Panel Options

#### Fractal Selection
- **Preset**: Choose from available fractal presets or "Random"
- **Randomize**: Generate a random fractal system

#### Rendering
- **Iterations/Frame**: Number of points generated per frame (1000-100000)
- **Zoom**: Magnification level (0.1-10)
- **Pan X/Y**: Camera position (-2 to 2)
- **Brightness**: Overall brightness multiplier (1-1000)

#### Colors
- **Palette**: Choose from preset color palettes or "Custom"
- **Color (Low/High)**: Custom color gradient endpoints (when Palette is "Custom")
- **Color Cycling**: Animate colors over time
- **Cycle Speed**: Speed of color animation (0.1-5.0)

#### Visual Effects
- **Bloom Effect**: Enable glow/bloom post-processing
- **Bloom Intensity**: Strength of bloom effect (0-2)
- **Bloom Threshold**: Brightness threshold for bloom (0-1)
- **Chromatic Aberration**: RGB separation effect (0-10)
- **Kaleidoscope**: Mirror/reflect the fractal
- **K-Segments**: Number of kaleidoscope segments (2-12)
- **Rotation**: Rotate the fractal
- **Motion Trails**: Add trailing effect
- **Trail Decay**: How quickly trails fade (0.8-0.99)

#### Animation Modes
- **Auto Animate**: Automatic zoom/pan animation
- **Psychedelic Mode**: Intense animated effects (breathing zoom, spiral movement, pulsing)
- **Fractal Morphing**: Smoothly transition between different fractals
- **Morph Speed**: Speed of morphing transitions (0.1-5.0)
- **Infinite Accumulation**: Keep accumulating points without clearing

#### Special Modes
- **DMT Mode**: One-click button to enable all psychedelic effects at once

### Exporting Fractals

Click the **"Export PNG"** button in the top-right corner to save the current fractal as a PNG image.

## Project Structure

```
fractal/
├── src/
│   ├── main.tsx                 # Application entry point
│   ├── App.tsx                  # Main app component with controls
│   ├── index.css                # Global styles
│   ├── components/
│   │   └── FractalCanvas.tsx    # Canvas wrapper with mouse controls
│   ├── core/
│   │   ├── types.ts             # TypeScript type definitions
│   │   ├── chaosGame.ts         # Chaos game algorithm implementation
│   │   ├── presets.ts           # Fractal preset definitions
│   │   ├── colorPalettes.ts     # Color palette definitions
│   │   └── morphing.ts          # Fractal morphing logic
│   ├── hooks/
│   │   └── useFractalRenderer.ts # Three.js renderer hook
│   └── shaders/
│       ├── point.vert           # Point rendering vertex shader
│       ├── accumulate.frag     # Histogram accumulation fragment shader
│       ├── tonemap.frag         # Tone mapping fragment shader
│       ├── fade.frag            # Fade effect fragment shader
│       └── common.vert          # Common vertex shader utilities
├── dist/                        # Production build output
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts              # Vite build configuration
└── README.md                    # This file
```

## How It Works

### Iterated Function Systems (IFS)

An IFS is a collection of affine transformations that, when applied iteratively, create a fractal attractor. Each transformation is defined by:

- A 2×2 matrix for rotation/scaling/shearing: `[a, b, c, d]`
- A translation vector: `[e, f]`
- A selection probability: `p`

The transformation formula: `p' = [a b; c d] * p + [e; f]`

### Chaos Game Algorithm

1. Start at a random point
2. Randomly select an affine transformation (weighted by probability)
3. Apply the transformation to the current point
4. Repeat for thousands/millions of iterations

The resulting points, when visualized as a density histogram, reveal the fractal structure.

### Rendering Pipeline

**Pass 1 - Accumulation:**
- Render chaos game points as GL_POINTS to a float texture
- Use additive blending to build a density histogram
- Each pixel accumulates the number of points that hit it

**Pass 2 - Tone Mapping:**
- Apply logarithmic tone mapping: `color = log(1 + density) / log(1 + brightness)`
- Map density to a color gradient
- Apply post-processing effects (bloom, chromatic aberration, etc.)
- Display the final result

## Adding New Fractals

To add a new fractal preset, edit `src/core/presets.ts`:

```typescript
export const myFractal: IFSSystem = {
  name: "My Fractal",
  maps: [
    {
      matrix: [a, b, c, d],  // 2x2 transformation matrix
      translation: [e, f],    // Translation vector
      probability: 0.5,       // Selection probability (should sum to 1.0)
      color: [r, g, b],      // Optional: RGB color (0-1 range)
    },
    // ... add more maps
  ],
};

// Add to presets array
export const presets: IFSSystem[] = [
  // ... existing presets
  myFractal,
];
```

## Adding New Color Palettes

Edit `src/core/colorPalettes.ts`:

```typescript
export const myPalette: ColorPalette = {
  name: "My Palette",
  low: "#000000",   // Hex color for low density
  high: "#ffffff",  // Hex color for high density
};

// Add to colorPalettes array
export const colorPalettes: ColorPalette[] = [
  // ... existing palettes
  myPalette,
];
```

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically try the next available port. Check the terminal output for the actual port number.

### WebGL Not Supported

If you see errors about WebGL, ensure:
- Your browser supports WebGL (check at https://get.webgl.org/)
- Your graphics drivers are up to date
- Hardware acceleration is enabled in your browser

### Performance Issues

If the app is running slowly:
- Reduce "Iterations/Frame" in the control panel
- Disable visual effects (bloom, trails, etc.)
- Close other browser tabs/applications
- Check browser console for errors

### Build Errors

If you encounter build errors:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist
```

## Technologies Used

- **[Vite](https://vitejs.dev/)** - Fast build tool and dev server
- **[React](https://react.dev/)** - UI framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Three.js](https://threejs.org/)** - WebGL rendering engine
- **[Leva](https://github.com/pmndrs/leva)** - Control panel UI
- **[vite-plugin-glsl](https://github.com/UstymUkhman/vite-plugin-glsl)** - GLSL shader import support

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Any browser with WebGL 2.0 support

## License

MIT

## Contributing

Contributions are welcome! Feel free to:
- Add new fractal presets
- Improve performance
- Add new visual effects
- Fix bugs
- Improve documentation

## Acknowledgments

- Classic fractals based on well-known IFS systems (Sierpiński, Barnsley Fern, etc.)
- Built with modern web technologies for high-performance visualization
