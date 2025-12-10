import { useControls, button, folder } from 'leva';
import { useState, useEffect, useRef } from 'react';
import { FractalCanvas2D } from './components/FractalCanvas2D';
import { FractalCanvas3D } from './components/FractalCanvas3D';
import { presets, defaultPreset } from './core/presets';
import { flamePresets, defaultFlamePreset } from './core/flamePresets';
import { colorPalettes, defaultPalette } from './core/colorPalettes';
import { presets3D, defaultPreset3D } from './core/presets3D';
import { IFSSystem, FlameSystem } from './core/types';
import { morphIFSSystems, morphFlameSystems } from './core/morphing';
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
  const [selectedFlamePreset, setSelectedFlamePreset] = useState(defaultFlamePreset.name);
  const [renderMode, setRenderMode] = useState<'2d' | '3d'>('2d');
  const [fractalType, setFractalType] = useState<'affine' | 'flame'>('affine');

  // Use refs to persist zoom and pan - these NEVER reset
  const zoomRef = useRef(1.0);
  const panXRef = useRef(0);
  const panYRef = useRef(0);

  // Callbacks to handle mouse zoom/pan - update both Leva sliders and refs
  const handleZoomChange = (newZoom: number) => {
    zoomRef.current = newZoom;
    set({ zoom: newZoom });
  };

  const handlePanChange = (newPan: [number, number]) => {
    panXRef.current = newPan[0];
    panYRef.current = newPan[1];
    set({ panX: newPan[0], panY: newPan[1] });
  };

  const [config, set] = useControls(() => ({
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
      fractalType: {
        value: 'Affine IFS',
        options: ['Affine IFS', 'Flame'],
        label: 'Fractal Type',
        render: (get) => get('mode') === '2D IFS',
        onChange: (value) => {
          if (value === 'Flame') setFractalType('flame');
          else setFractalType('affine');
        },
      },
      preset: {
        value: selectedPreset,
        options: ['Random', ...presets.map(p => p.name)],
        render: (get) => get('mode') === '2D IFS' && get('2D Settings.fractalType') === 'Affine IFS',
      },
      flamePreset: {
        value: selectedFlamePreset,
        options: flamePresets.map(p => p.name),
        label: 'Flame Preset',
        render: (get) => get('mode') === '2D IFS' && get('2D Settings.fractalType') === 'Flame',
        onChange: (value) => setSelectedFlamePreset(value),
      },
      randomize: button(() => {
        const randomSystem = generateRandomIFS();
        setCustomSystem(randomSystem);
        setForceRandomPreset(true);
        console.log('Generated random fractal:', randomSystem);
      }, {
        disabled: renderMode !== '2d' || fractalType !== 'affine',
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
      maxIterations3D: {
        value: 15,
        min: 5,
        max: 30,
        step: 1,
        label: 'Max Iterations',
        render: (get) => get('mode') === '3D Raymarch',
      },
      animate3D: {
        value: false,
        label: 'Animate Parameters',
        render: (get) => get('mode') === '3D Raymarch',
      },
      animateSpeed3D: {
        value: 1.0,
        min: 0.1,
        max: 3.0,
        step: 0.1,
        label: 'Animation Speed',
        render: (get) => get('mode') === '3D Raymarch' && get('3D Settings.animate3D'),
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
    adaptiveDetail: {
      value: true,
      label: 'Adaptive Detail (∞)',
      render: (get) => get('mode') === '2D IFS',
    },
    baseIterationsK: {
      value: 100,
      min: 10,
      max: 200,
      step: 10,
      label: 'Base Iterations (k)',
      render: (get) => get('mode') === '2D IFS',
    },
    maxIterationsK: {
      value: 1000,
      min: 100,
      max: 3000,
      step: 100,
      label: 'Max Iterations (k)',
      render: (get) => get('mode') === '2D IFS' && get('adaptiveDetail'),
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
    // BACKGROUND EFFECTS
    backgroundMode: {
      value: 'Simple',
      options: ['Simple', 'Plasma', 'Flow', 'Geometry', 'Starfield', 'Nebula'],
      label: 'Background',
      render: (get) => get('mode') === '2D IFS',
    },
    // NEW PSYCHEDELIC EFFECTS
    'Psychedelic FX': folder({
      spiralDistortion: {
        value: 0,
        min: 0,
        max: 2,
        step: 0.1,
        label: 'Spiral Vortex',
      },
      radialPulse: {
        value: 0,
        min: 0,
        max: 1,
        step: 0.05,
        label: 'Breathing Pulse',
      },
      waveDistortion: {
        value: 0,
        min: 0,
        max: 1,
        step: 0.05,
        label: 'Wave Distortion',
      },
      tunnelEffect: {
        value: 0,
        min: 0,
        max: 1,
        step: 0.05,
        label: 'Tunnel Zoom',
      },
      ripple: {
        value: 0,
        min: 0,
        max: 1,
        step: 0.05,
        label: 'Ripples',
      },
      prismEffect: {
        value: 0,
        min: 0,
        max: 5,
        step: 0.25,
        label: 'Prism Split',
      },
      colorShift: {
        value: 0,
        min: 0,
        max: 5,
        step: 0.25,
        label: 'Hue Rotation',
      },
      invertPulse: {
        value: 0,
        min: 0,
        max: 1,
        step: 0.05,
        label: 'Inversion Pulse',
      },
      edgeGlow: {
        value: 0,
        min: 0,
        max: 2,
        step: 0.1,
        label: 'Edge Glow',
      },
      fractalNoise: {
        value: 0,
        min: 0,
        max: 1,
        step: 0.05,
        label: 'Noise Warp',
      },
      feedbackZoom: {
        value: 0,
        min: 0,
        max: 2,
        step: 0.1,
        label: 'Feedback Zoom',
      },
      hyperKaleidoscope: {
        value: false,
        label: 'Hyper Kaleidoscope',
      },
      kaleidoscopeRotation: {
        value: 0,
        min: 0,
        max: 2,
        step: 0.1,
        label: 'K-Rotation Speed',
      },
      pixelate: {
        value: 0,
        min: 0,
        max: 1,
        step: 0.05,
        label: 'Pixelate',
      },
      posterize: {
        value: 0,
        min: 0,
        max: 1,
        step: 0.05,
        label: 'Posterize',
      },
    }, { collapsed: true, render: (get) => get('mode') === '2D IFS' }),
    zoom: {
      value: 1.0,
      min: 0.1,
      max: 100,
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
  }));

  // DMT mode overrides - only apply in 2D mode - SLOW DREAMY PSYCHEDELIA
  const activeConfig = (dmtModeActive && renderMode === '2d') ? {
    ...config,
    psychedelicMode: true,
    animationMode: true,
    colorCycle: true,
    cycleSpeed: 0.8,  // MUCH slower color cycling
    infiniteAccumulation: true,
    bloom: true,
    bloomIntensity: 1.5,
    bloomThreshold: 0.2,
    rotation: true,
    kaleidoscope: true,
    kaleidoscopeSegments: 8,
    trails: true,
    trailDecay: 0.985,  // Longer trails
    chromaticAberration: 4.0,
    morphMode: true,
    morphSpeed: 0.4,  // MUCH slower morphing - dreamy transitions
    colorPalette: 'DMT',
    // SLOWER PSYCHEDELIC EFFECTS
    spiralDistortion: 0.5,
    radialPulse: 0.3,
    waveDistortion: 0.2,
    tunnelEffect: 0.25,
    ripple: 0.2,
    prismEffect: 1.5,
    colorShift: 1.0,  // Slower hue rotation
    invertPulse: 0.15,  // Subtle inversion
    edgeGlow: 0.8,
    fractalNoise: 0.15,
    feedbackZoom: 0.3,
    hyperKaleidoscope: true,
    kaleidoscopeRotation: 0.2,  // Slow kaleidoscope rotation
    backgroundMode: 'Nebula',   // Cosmic background for DMT mode
  } : config;

  // Animation loop for color cycling, auto-animation, morphing, and 3D parameter animation
  useEffect(() => {
    if (!activeConfig.colorCycle && !activeConfig.animationMode && !activeConfig.psychedelicMode && !activeConfig.morphMode && !config.animate3D) return;

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
  }, [activeConfig.colorCycle, activeConfig.animationMode, activeConfig.psychedelicMode, activeConfig.morphMode, activeConfig.cycleSpeed, activeConfig.morphSpeed, config.animate3D]);

  // Sync preset selection from leva and handle forceRandomPreset reset
  useEffect(() => {
    if (config.preset !== selectedPreset) {
      setSelectedPreset(config.preset);
      if (config.preset !== 'Random') {
        setForceRandomPreset(false);
      }
    }
  }, [config.preset, selectedPreset]);

  // Find the selected system based on fractal type
  let selectedSystem: IFSSystem | FlameSystem;
  let currentSystemType: 'affine' | 'flame' = fractalType;

  if (fractalType === 'flame') {
    // Flame mode
    selectedSystem = flamePresets.find(p => p.name === selectedFlamePreset) || defaultFlamePreset;
    console.log('Selected Flame preset:', selectedFlamePreset, '-> System:', selectedSystem.name);

    // Apply fractal morphing if enabled (for flames)
    if (activeConfig.morphMode) {
      const morphDuration = 10 / activeConfig.morphSpeed; // Seconds per transition
      const totalTime = animationTime;
      const cycleProgress = (totalTime % (morphDuration * flamePresets.length)) / morphDuration;
      const currentIndex = Math.floor(cycleProgress);
      const nextIndex = (currentIndex + 1) % flamePresets.length;
      const t = cycleProgress - currentIndex;

      const systemA = flamePresets[currentIndex];
      const systemB = flamePresets[nextIndex];
      selectedSystem = morphFlameSystems(systemA, systemB, t);
    }
  } else {
    // Affine IFS mode
    const currentPreset = config.preset;
    selectedSystem = presets.find(p => p.name === currentPreset) || defaultPreset;
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

    // Apply fractal morphing if enabled (only for affine)
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

  // Update refs when Leva controls change (but refs don't trigger re-renders)
  // This way we capture the latest user input
  if (activeConfig.zoom !== undefined && activeConfig.zoom !== zoomRef.current) {
    zoomRef.current = activeConfig.zoom;
  }
  if (activeConfig.panX !== undefined && activeConfig.panX !== panXRef.current) {
    panXRef.current = activeConfig.panX;
  }
  if (activeConfig.panY !== undefined && activeConfig.panY !== panYRef.current) {
    panYRef.current = activeConfig.panY;
  }

  // Always use ref values (which persist across renders) instead of Leva values
  let zoom = zoomRef.current;
  let panX = panXRef.current;
  let panY = panYRef.current;
  let iterations = (activeConfig.baseIterationsK || 100) * 1000;
  let brightness = activeConfig.brightness;
  let bloomIntensity = activeConfig.bloomIntensity;
  let rotation = 0;

  if (activeConfig.animationMode || activeConfig.psychedelicMode) {
    const t = animationTime;

    // Enhanced psychedelic mode - SLOW AND DREAMY
    if (activeConfig.psychedelicMode) {
      // Slow breathing zoom effect
      zoom = activeConfig.zoom * (1 + Math.sin(t * 0.15) * 0.3 + Math.cos(t * 0.25) * 0.15);

      // Gentle drifting movement
      const spiralRadius = 0.15 + Math.sin(t * 0.1) * 0.1;
      panX = activeConfig.panX + Math.sin(t * 0.12) * spiralRadius + Math.cos(t * 0.2) * 0.05;
      panY = activeConfig.panY + Math.cos(t * 0.12) * spiralRadius + Math.sin(t * 0.2) * 0.05;

      // Gentle density pulsing
      const iterBase = (activeConfig.baseIterationsK || 100) * 1000;
      iterations = Math.floor(iterBase * (0.85 + Math.sin(t * 0.2) * 0.15));

      // Slow breathing brightness
      brightness = activeConfig.brightness * (0.9 + Math.sin(t * 0.25) * 0.2);

      // Gentle bloom pulsing
      bloomIntensity = activeConfig.bloomIntensity * (1 + Math.sin(t * 0.18) * 0.3);

      // Slow rotation
      if (activeConfig.rotation) {
        rotation = t * 0.08;  // Much slower rotation
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

  // Calculate animated psychedelic effect values
  let spiralDistortion = activeConfig.spiralDistortion || 0;
  let radialPulse = activeConfig.radialPulse || 0;
  let waveDistortion = activeConfig.waveDistortion || 0;
  let tunnelEffect = activeConfig.tunnelEffect || 0;
  let rippleEffect = activeConfig.ripple || 0;
  let prismEffect = activeConfig.prismEffect || 0;
  let colorShift = activeConfig.colorShift || 0;
  let invertPulse = activeConfig.invertPulse || 0;
  let edgeGlow = activeConfig.edgeGlow || 0;
  let fractalNoise = activeConfig.fractalNoise || 0;
  let feedbackZoom = activeConfig.feedbackZoom || 0;
  let kaleidoscopeRotation = activeConfig.kaleidoscopeRotation || 0;

  // In psychedelic mode, make effects pulse and vary - SLOW AND SMOOTH
  if (activeConfig.psychedelicMode) {
    const t = animationTime;
    // Very slow pulsing spiral
    spiralDistortion *= (0.6 + 0.4 * Math.sin(t * 0.12));
    // Slow breathing
    radialPulse *= (0.7 + 0.3 * Math.sin(t * 0.08));
    // Gentle waves
    waveDistortion *= (0.7 + 0.3 * Math.cos(t * 0.1));
    // Slow tunnel pulse
    tunnelEffect *= (0.6 + 0.4 * Math.sin(t * 0.06));
    // Gentle ripples
    rippleEffect *= (0.5 + 0.5 * Math.abs(Math.sin(t * 0.1)));
    // Slow edge glow pulse
    edgeGlow *= (0.7 + 0.3 * Math.sin(t * 0.15));
    // Very slow kaleidoscope rotation variation
    kaleidoscopeRotation *= (0.6 + 0.4 * Math.sin(t * 0.05));
  }

  // 2D Renderer Config
  const rendererConfig2D = {
    system: selectedSystem,
    systemType: currentSystemType,
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
    adaptiveDetail: activeConfig.adaptiveDetail,
    maxIterations: (activeConfig.maxIterationsK || 1000) * 1000,
    // NEW PSYCHEDELIC EFFECTS
    time: animationTime,
    spiralDistortion,
    radialPulse,
    waveDistortion,
    tunnelEffect,
    ripple: rippleEffect,
    prismEffect,
    colorShift,
    invertPulse,
    edgeGlow,
    fractalNoise,
    feedbackZoom,
    mirrorDimensions: activeConfig.hyperKaleidoscope ? 2 : 0,
    kaleidoscopeRotation,
    pixelate: activeConfig.pixelate || 0,
    posterize: activeConfig.posterize || 0,
    backgroundMode: ['Simple', 'Plasma', 'Flow', 'Geometry', 'Starfield', 'Nebula'].indexOf(activeConfig.backgroundMode || 'Simple'),
  };

  // 3D Renderer Config
  const selected3DFractal = presets3D.find(p => p.name === selectedPreset3D) || defaultPreset3D;

  // Animate parameters based on fractal type
  let power3D = config.power || 8.0;
  let scale3D = config.scale || 2.0;
  let foldingLimit3D = config.foldingLimit || 1.0;

  if (config.animate3D) {
    const t = animationTime * (config.animateSpeed3D || 1.0);

    // Mandelbulb: sweep power 6-10
    power3D = 8.0 + Math.sin(t * 0.3) * 2.0;

    // Mandelbox: sweep scale 1.5-2.5 and folding 0.8-1.2
    scale3D = 2.0 + Math.sin(t * 0.25) * 0.5;
    foldingLimit3D = 1.0 + Math.sin(t * 0.4) * 0.2;
  }

  const rendererConfig3D = {
    fractal: selected3DFractal,
    cameraPos: selected3DFractal.defaultCameraPos || [0, 0, 3] as [number, number, number],
    cameraTarget: selected3DFractal.defaultCameraTarget || [0, 0, 0] as [number, number, number],
    colorLow,
    colorHigh,
    glow: config.glow || 0,
    maxIterations: config.maxIterations3D || 15,
    bailout: 2.0,
    power: power3D,
    scale: scale3D,
    foldingLimit: foldingLimit3D,
    animateAmount: config.animate3D ? (config.animateSpeed3D || 1.0) : 0.0,
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
        <FractalCanvas2D
          config={rendererConfig2D}
          onZoomChange={handleZoomChange}
          onPanChange={handlePanChange}
        />
      ) : (
        <FractalCanvas3D config={rendererConfig3D} />
      )}
    </div>
  );
}

export default App
