import { useControls, button, folder } from 'leva';
import { useState, useEffect } from 'react';
import { FractalCanvas2D } from './components/FractalCanvas2D';
import { FractalCanvas3D } from './components/FractalCanvas3D';
import { presets, defaultPreset } from './core/presets';
import { colorPalettes, defaultPalette } from './core/colorPalettes';
import { presets3D, defaultPreset3D } from './core/presets3D';
import { IFSSystem } from './core/types';
import { morphIFSSystems } from './core/morphing';
import { Leva } from 'leva';

// Generate random IFS system
function generateRandomIFS(): IFSSystem {
  const numMaps = Math.floor(Math.random() * 3) + 2; // 2-4 maps
  const maps = [];

  for (let i = 0; i < numMaps; i++) {
    // Random affine transformation
    const angle = Math.random() * Math.PI * 2;
    const scale = Math.random() * 0.5 + 0.3;
    const cos = Math.cos(angle) * scale;
    const sin = Math.sin(angle) * scale;

    maps.push({
      matrix: [cos, -sin, sin, cos] as [number, number, number, number],
      translation: [(Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5] as [number, number],
      probability: 1 / numMaps,
    });
  }

  return {
    name: "Random",
    maps,
  };
}

function App() {
  const [customSystem, setCustomSystem] = useState<IFSSystem | null>(null);
  const [animationTime, setAnimationTime] = useState(0);
  const [dmtModeActive, setDmtModeActive] = useState(false);
  const [forceRandomPreset, setForceRandomPreset] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(defaultPreset.name);
  const [selectedPreset3D, setSelectedPreset3D] = useState(defaultPreset3D.name);
  const [renderMode, setRenderMode] = useState<'2d' | '3d'>('2d');

  const config = useControls({
    mode: {
      value: '2D IFS',
      options: ['2D IFS', '3D Raymarch'],
      label: 'Renderer Mode',
      onChange: (value) => {
        const newMode = value === '2D IFS' ? '2d' : '3d';
        setRenderMode(newMode);
        // Turn off DMT mode when switching to 3D
        if (newMode === '3d') {
          setDmtModeActive(false);
        }
      },
    },
    '2D Settings': folder({
      preset: {
        value: selectedPreset,
        options: ['Random', ...presets.map(p => p.name)],
        render: (get) => get('mode') === '2D IFS',
      },
      randomize: button(() => {
        const randomSystem = generateRandomIFS();
        setCustomSystem(randomSystem);
        setForceRandomPreset(true);
        console.log('Generated random fractal:', randomSystem);
      }, {
        disabled: renderMode !== '2d',
      }),
    }),
    '3D Settings': folder({
      preset3D: {
        value: selectedPreset3D,
        options: presets3D.map(p => p.name),
        label: 'Preset',
        render: (get) => get('mode') === '3D Raymarch',
        onChange: (value) => setSelectedPreset3D(value),
      },
      power: {
        value: 8.0,
        min: 2,
        max: 16,
        step: 0.1,
        label: 'Power (Mandelbulb)',
        render: (get) => get('mode') === '3D Raymarch' && get('preset3D') === 'Mandelbulb',
      },
      scale: {
        value: 2.0,
        min: 0.5,
        max: 4.0,
        step: 0.1,
        label: 'Scale (Mandelbox)',
        render: (get) => get('mode') === '3D Raymarch' && get('preset3D') === 'Mandelbox',
      },
      foldingLimit: {
        value: 1.0,
        min: 0.1,
        max: 2.0,
        step: 0.1,
        label: 'Folding (Mandelbox)',
        render: (get) => get('mode') === '3D Raymarch' && get('preset3D') === 'Mandelbox',
      },
      glow: {
        value: 0.0,
        min: 0,
        max: 1,
        step: 0.05,
        label: 'Glow',
        render: (get) => get('mode') === '3D Raymarch',
      },
      maxIterations: {
        value: 15,
        min: 5,
        max: 30,
        step: 1,
        label: 'Max Iterations',
        render: (get) => get('mode') === '3D Raymarch',
      },
    }),
    dmtMode: {
      ...button(() => {
        setDmtModeActive(prev => !prev);
      }),
      render: (get) => get('mode') === '2D IFS',
    },
    colorPalette: {
      value: defaultPalette.name,
      options: ['Custom', ...colorPalettes.map(p => p.name)],
      label: 'Palette',
    },
    colorCycle: {
      value: false,
      label: 'Color Cycling',
    },
    cycleSpeed: {
      value: 1.0,
      min: 0.1,
      max: 5.0,
      step: 0.1,
      label: 'Cycle Speed',
      render: (get) => get('colorCycle'),
    },
    infiniteAccumulation: {
      value: false,
      label: 'Infinite Accumulation',
      render: (get) => get('mode') === '2D IFS',
    },
    iterationsPerFrame: {
      value: 10000,
      min: 1000,
      max: 100000,
      step: 1000,
      label: 'Iterations/Frame',
      render: (get) => get('mode') === '2D IFS',
    },
    animationMode: {
      value: false,
      label: 'Auto Animate',
      render: (get) => get('mode') === '2D IFS',
    },
    psychedelicMode: {
      value: false,
      label: 'Psychedelic Mode',
      render: (get) => get('mode') === '2D IFS',
    },
    morphMode: {
      value: false,
      label: 'Fractal Morphing',
      render: (get) => get('mode') === '2D IFS',
    },
    morphSpeed: {
      value: 1.0,
      min: 0.1,
      max: 5.0,
      step: 0.1,
      label: 'Morph Speed',
      render: (get) => get('mode') === '2D IFS' && get('morphMode'),
    },
    rotation: {
      value: false,
      label: 'Rotation',
      render: (get) => get('mode') === '2D IFS' && (get('animationMode') || get('psychedelicMode')),
    },
    kaleidoscope: {
      value: false,
      label: 'Kaleidoscope',
      render: (get) => get('mode') === '2D IFS',
    },
    kaleidoscopeSegments: {
      value: 6,
      min: 2,
      max: 12,
      step: 1,
      label: 'K-Segments',
      render: (get) => get('mode') === '2D IFS' && get('kaleidoscope'),
    },
    trails: {
      value: false,
      label: 'Motion Trails',
      render: (get) => get('mode') === '2D IFS',
    },
    trailDecay: {
      value: 0.95,
      min: 0.8,
      max: 0.99,
      step: 0.01,
      label: 'Trail Decay',
      render: (get) => get('mode') === '2D IFS' && get('trails'),
    },
    chromaticAberration: {
      value: 0,
      min: 0,
      max: 10,
      step: 0.5,
      label: 'Chromatic Aberration',
      render: (get) => get('mode') === '2D IFS',
    },
    zoom: {
      value: 1.0,
      min: 0.1,
      max: 10,
      step: 0.1,
      render: (get) => get('mode') === '2D IFS',
    },
    panX: {
      value: 0,
      min: -2,
      max: 2,
      step: 0.01,
      label: 'Pan X',
      render: (get) => get('mode') === '2D IFS',
    },
    panY: {
      value: 0,
      min: -2,
      max: 2,
      step: 0.01,
      label: 'Pan Y',
      render: (get) => get('mode') === '2D IFS',
    },
    brightness: {
      value: 100,
      min: 1,
      max: 1000,
      step: 1,
      render: (get) => get('mode') === '2D IFS',
    },
    bloom: {
      value: false,
      label: 'Bloom Effect',
      render: (get) => get('mode') === '2D IFS',
    },
    bloomIntensity: {
      value: 0.5,
      min: 0,
      max: 2,
      step: 0.1,
      label: 'Bloom Intensity',
      render: (get) => get('mode') === '2D IFS' && get('bloom'),
    },
    bloomThreshold: {
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.05,
      label: 'Bloom Threshold',
      render: (get) => get('mode') === '2D IFS' && get('bloom'),
    },
    colorLow: {
      value: defaultPalette.low,
      label: 'Color (Low)',
      render: (get) => get('colorPalette') === 'Custom',
    },
    colorHigh: {
      value: defaultPalette.high,
      label: 'Color (High)',
      render: (get) => get('colorPalette') === 'Custom',
    },
  });

  // DMT mode overrides - only apply in 2D mode
  const activeConfig = (dmtModeActive && renderMode === '2d') ? {
    ...config,
    psychedelicMode: true,
    animationMode: true,
    colorCycle: true,
    cycleSpeed: 3.0,
    infiniteAccumulation: true,
    bloom: true,
    bloomIntensity: 1.5,
    rotation: true,
    kaleidoscope: true,
    kaleidoscopeSegments: 8,
    trails: true,
    trailDecay: 0.97,
    chromaticAberration: 5.0,
    morphMode: true,
    morphSpeed: 2.0,
    colorPalette: 'DMT',
  } : config;

  // Animation loop for color cycling, auto-animation, and morphing
  useEffect(() => {
    if (!activeConfig.colorCycle && !activeConfig.animationMode && !activeConfig.psychedelicMode && !activeConfig.morphMode) return;

    let animationFrameId: number;
    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const speed = activeConfig.psychedelicMode ? activeConfig.cycleSpeed * 2 : activeConfig.cycleSpeed;
      setAnimationTime(prev => prev + delta * speed);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [activeConfig.colorCycle, activeConfig.animationMode, activeConfig.psychedelicMode, activeConfig.morphMode, activeConfig.cycleSpeed, activeConfig.morphSpeed]);

  // Sync preset selection from leva and handle forceRandomPreset reset
  useEffect(() => {
    if (config.preset !== selectedPreset) {
      setSelectedPreset(config.preset);
      if (config.preset !== 'Random') {
        setForceRandomPreset(false);
      }
    }
  }, [config.preset, selectedPreset]);

  // Find the selected preset or use custom
  const currentPreset = config.preset;
  let selectedSystem = presets.find(p => p.name === currentPreset) || defaultPreset;
  console.log('Selected preset:', currentPreset, '-> System:', selectedSystem.name);

  // Use custom random system if randomize was clicked
  if (forceRandomPreset && customSystem) {
    selectedSystem = customSystem;
  } else if (currentPreset === 'Random' && customSystem) {
    selectedSystem = customSystem;
  } else if (currentPreset === 'Random' && !customSystem) {
    const randomSys = generateRandomIFS();
    setCustomSystem(randomSys);
    selectedSystem = randomSys;
  }

  // Apply fractal morphing if enabled
  if (activeConfig.morphMode && !forceRandomPreset) {
    const morphDuration = 10 / activeConfig.morphSpeed; // Seconds per transition
    const totalTime = animationTime;
    const cycleProgress = (totalTime % (morphDuration * presets.length)) / morphDuration;
    const currentIndex = Math.floor(cycleProgress);
    const nextIndex = (currentIndex + 1) % presets.length;
    const t = cycleProgress - currentIndex;

    const systemA = presets[currentIndex];
    const systemB = presets[nextIndex];
    selectedSystem = morphIFSSystems(systemA, systemB, t);
  }

  // Convert hex colors to RGB arrays
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255,
        ]
      : [0, 0, 0];
  };

  // Get colors from selected palette or use custom colors
  let colorLow: [number, number, number];
  let colorHigh: [number, number, number];

  if (activeConfig.colorPalette === 'Custom') {
    // Use custom colors from the color pickers
    colorLow = hexToRgb(activeConfig.colorLow);
    colorHigh = hexToRgb(activeConfig.colorHigh);
  } else {
    // Use colors from the selected palette
    const selectedPalette = colorPalettes.find(p => p.name === activeConfig.colorPalette) || defaultPalette;
    colorLow = hexToRgb(selectedPalette.low);
    colorHigh = hexToRgb(selectedPalette.high);
  }

  if (activeConfig.colorCycle) {
    const hueShift = (animationTime * 50) % 360;
    const shiftColor = (rgb: [number, number, number], hue: number): [number, number, number] => {
      // Simple hue rotation approximation
      const angle = (hue * Math.PI) / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [
        Math.max(0, Math.min(1, rgb[0] * cos - rgb[1] * sin)),
        Math.max(0, Math.min(1, rgb[0] * sin + rgb[1] * cos)),
        rgb[2],
      ];
    };
    colorLow = shiftColor(colorLow, hueShift);
    colorHigh = shiftColor(colorHigh, hueShift);
  }

  // Apply auto-animation to zoom/pan/everything if enabled
  let zoom = activeConfig.zoom;
  let panX = activeConfig.panX;
  let panY = activeConfig.panY;
  let iterations = activeConfig.iterationsPerFrame;
  let brightness = activeConfig.brightness;
  let bloomIntensity = activeConfig.bloomIntensity;
  let rotation = 0;

  if (activeConfig.animationMode || activeConfig.psychedelicMode) {
    const t = animationTime;

    // Enhanced psychedelic mode
    if (activeConfig.psychedelicMode) {
      // Breathing zoom effect
      zoom = activeConfig.zoom * (1 + Math.sin(t * 0.8) * 0.5 + Math.cos(t * 1.3) * 0.3);

      // Complex spiral movement
      const spiralRadius = 0.3 + Math.sin(t * 0.5) * 0.2;
      panX = activeConfig.panX + Math.sin(t * 0.7) * spiralRadius + Math.cos(t * 1.5) * 0.1;
      panY = activeConfig.panY + Math.cos(t * 0.7) * spiralRadius + Math.sin(t * 1.5) * 0.1;

      // Pulsing iterations for density changes
      const iterBase = activeConfig.iterationsPerFrame;
      iterations = Math.floor(iterBase * (0.7 + Math.sin(t) * 0.3));

      // Breathing brightness
      brightness = activeConfig.brightness * (0.8 + Math.sin(t * 1.2) * 0.4);

      // Pulsing bloom
      bloomIntensity = activeConfig.bloomIntensity * (1 + Math.sin(t * 0.9) * 0.5);

      // Rotation
      if (activeConfig.rotation) {
        rotation = t * 0.3;
      }
    } else {
      // Regular animation mode
      zoom = activeConfig.zoom * (1 + Math.sin(t * 0.5) * 0.3);
      panX = activeConfig.panX + Math.sin(t * 0.3) * 0.2;
      panY = activeConfig.panY + Math.cos(t * 0.4) * 0.2;

      if (activeConfig.rotation) {
        rotation = t * 0.2;
      }
    }
  }

  // 2D Renderer Config
  const rendererConfig2D = {
    system: selectedSystem,
    iterationsPerFrame: Math.max(1000, iterations),
    zoom,
    pan: [panX, panY] as [number, number],
    brightness,
    colorLow,
    colorHigh,
    infiniteAccumulation: activeConfig.infiniteAccumulation,
    bloom: activeConfig.bloom,
    bloomIntensity,
    bloomThreshold: activeConfig.bloomThreshold,
    rotation,
    kaleidoscope: activeConfig.kaleidoscope,
    kaleidoscopeSegments: activeConfig.kaleidoscopeSegments,
    trails: activeConfig.trails,
    trailDecay: activeConfig.trailDecay,
    chromaticAberration: activeConfig.chromaticAberration,
  };

  // 3D Renderer Config
  const selected3DFractal = presets3D.find(p => p.name === selectedPreset3D) || defaultPreset3D;
  const rendererConfig3D = {
    fractal: selected3DFractal,
    cameraPos: selected3DFractal.defaultCameraPos || [0, 0, 3] as [number, number, number],
    cameraTarget: selected3DFractal.defaultCameraTarget || [0, 0, 0] as [number, number, number],
    colorLow,
    colorHigh,
    glow: config.glow || 0,
    maxIterations: config.maxIterations || 15,
    bailout: 2.0,
    power: config.power,
    scale: config.scale,
    foldingLimit: config.foldingLimit,
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Leva
        theme={{
          sizes: {
            rootWidth: '500px',
            controlWidth: '280px',
          }
        }}
      />
      {renderMode === '2d' ? (
        <FractalCanvas2D config={rendererConfig2D} />
      ) : (
        <FractalCanvas3D config={rendererConfig3D} />
      )}
    </div>
  );
}

export default App
