import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { IFSSystem, FlameSystem } from '../core/types';
import { generatePointBatch, generateFlamePointBatch } from '../core/chaosGame';

// Import shaders as strings
import pointVertexShader from '../shaders/point.vert';
import accumulateFragmentShader from '../shaders/accumulate.frag';
import commonVertexShader from '../shaders/common.vert';
import tonemapFragmentShader from '../shaders/tonemap.frag';

export interface FractalRendererConfig {
  system: IFSSystem | FlameSystem;
  systemType?: 'affine' | 'flame';  // Type of system (default: 'affine')
  iterationsPerFrame: number;
  zoom: number;
  pan: [number, number];
  brightness: number;
  colorLow: [number, number, number];
  colorHigh: [number, number, number];
  infiniteAccumulation?: boolean;
  bloom?: boolean;
  bloomIntensity?: number;
  bloomThreshold?: number;
  rotation?: number;
  kaleidoscope?: boolean;
  kaleidoscopeSegments?: number;
  trails?: boolean;
  trailDecay?: number;
  chromaticAberration?: number;
  adaptiveDetail?: boolean;
  maxIterations?: number;
  // NEW PSYCHEDELIC EFFECTS
  time?: number;
  spiralDistortion?: number;
  radialPulse?: number;
  waveDistortion?: number;
  tunnelEffect?: number;
  prismEffect?: number;
  mirrorDimensions?: number;
  colorShift?: number;
  invertPulse?: number;
  edgeGlow?: number;
  fractalNoise?: number;
  kaleidoscopeRotation?: number;
  feedbackZoom?: number;
  ripple?: number;
  pixelate?: number;
  posterize?: number;
  backgroundMode?: number;  // 0=simple, 1=plasma, 2=flow, 3=geometry, 4=starfield, 5=nebula
}

export function useFractalRenderer(
  config: FractalRendererConfig,
  canvasRef: React.RefObject<HTMLCanvasElement>
) {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const accumTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const displayMeshRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Three.js scene once
  useEffect(() => {
    if (!canvasRef.current) {
      console.log('Canvas not ready');
      return;
    }

    const canvas = canvasRef.current;
    const width = canvas.width || 800;
    const height = canvas.height || 600;

    console.log('Initializing renderer:', width, height);

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Setup camera (orthographic for 2D rendering)
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create accumulation render target (float texture)
    const accumTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    });
    accumTargetRef.current = accumTarget;

    // Clear the accumulation buffer initially
    renderer.setRenderTarget(accumTarget);
    renderer.clear();
    renderer.setRenderTarget(null);

    // Handle window resize
    const handleResize = () => {
      const w = canvas.width || 800;
      const h = canvas.height || 600;
      renderer.setSize(w, h, false);
      accumTarget.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    console.log('Renderer initialized');

    return () => {
      console.log('Cleaning up renderer');
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
      accumTarget.dispose();
    };
  }, [canvasRef]);

  // Create/update point cloud
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;

    // Calculate actual iterations based on zoom (for infinite detail)
    // Scale with zoom^2.5 for more aggressive detail increase
    const baseIterations = config.iterationsPerFrame;
    const maxIterations = config.maxIterations || 1000000; // Safety cap
    const actualIterations = config.adaptiveDetail
      ? Math.min(maxIterations, Math.floor(baseIterations * Math.pow(config.zoom, 2.5)))
      : baseIterations;

    console.log('Creating point cloud with', actualIterations, 'iterations (base:', baseIterations, 'zoom:', config.zoom, 'pan:', config.pan, ')');
    console.log('System:', config.system.name, 'type:', config.systemType || 'affine');

    // Generate points using the appropriate chaos game
    let points2D: Float32Array;
    let colors: Float32Array | undefined;

    if (config.systemType === 'flame') {
      const result = generateFlamePointBatch(config.system as FlameSystem, actualIterations);
      points2D = result.positions;
      colors = result.colors;
    } else {
      const result = generatePointBatch(config.system as IFSSystem, actualIterations);
      points2D = result.positions;
      colors = result.colors;
    }
    const points3D = new Float32Array(points2D.length / 2 * 3);
    for (let i = 0; i < points2D.length / 2; i++) {
      points3D[i * 3] = points2D[i * 2];      // x
      points3D[i * 3 + 1] = points2D[i * 2 + 1]; // y
      points3D[i * 3 + 2] = 0;                  // z
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(points3D, 3));

    // Add color attribute if available
    if (colors) {
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }

    // Create shader material for points
    const material = new THREE.ShaderMaterial({
      vertexShader: pointVertexShader,
      fragmentShader: accumulateFragmentShader,
      uniforms: {
        uZoom: { value: config.zoom },
        uPan: { value: new THREE.Vector2(config.pan[0], config.pan[1]) },
      },
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
    });

    // Remove old point cloud if it exists
    if (pointsRef.current) {
      scene.remove(pointsRef.current);
      pointsRef.current.geometry.dispose();
      (pointsRef.current.material as THREE.Material).dispose();
    }

    const pointCloud = new THREE.Points(geometry, material);
    pointsRef.current = pointCloud;
    scene.add(pointCloud);

    console.log('Point cloud created');

    return () => {
      if (pointsRef.current) {
        scene.remove(pointsRef.current);
        pointsRef.current.geometry.dispose();
        (pointsRef.current.material as THREE.Material).dispose();
      }
    };
  }, [
    config.system,
    config.iterationsPerFrame,
    config.adaptiveDetail,
    config.maxIterations,
    // When adaptive detail is on, regenerate when zoom changes (to generate more/fewer points)
    config.adaptiveDetail ? config.zoom : null,
    // Include zoom and pan so we read current values when regenerating
    config.zoom,
    config.pan[0],
    config.pan[1],
  ]);

  // Create display quad once
  useEffect(() => {
    if (!sceneRef.current || !accumTargetRef.current) return;

    const scene = sceneRef.current;

    console.log('Creating display mesh');

    // Full-screen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: commonVertexShader,
      fragmentShader: tonemapFragmentShader,
      uniforms: {
        uAccumTexture: { value: accumTargetRef.current.texture },
        uBrightness: { value: config.brightness },
        uColorLow: { value: new THREE.Color(...config.colorLow) },
        uColorHigh: { value: new THREE.Color(...config.colorHigh) },
        uBloomIntensity: { value: config.bloom ? (config.bloomIntensity || 0.5) : 0 },
        uBloomThreshold: { value: config.bloomThreshold || 0.5 },
        uResolution: { value: new THREE.Vector2(
          canvasRef.current?.width || 800,
          canvasRef.current?.height || 600
        )},
        uRotation: { value: config.rotation || 0 },
        uKaleidoscope: { value: config.kaleidoscope || false },
        uKaleidoscopeSegments: { value: config.kaleidoscopeSegments || 6 },
        uChromaticAberration: { value: config.chromaticAberration || 0 },
        // NEW PSYCHEDELIC UNIFORMS
        uTime: { value: config.time || 0 },
        uSpiralDistortion: { value: config.spiralDistortion || 0 },
        uRadialPulse: { value: config.radialPulse || 0 },
        uWaveDistortion: { value: config.waveDistortion || 0 },
        uTunnelEffect: { value: config.tunnelEffect || 0 },
        uPrismEffect: { value: config.prismEffect || 0 },
        uMirrorDimensions: { value: config.mirrorDimensions || 0 },
        uColorShift: { value: config.colorShift || 0 },
        uInvertPulse: { value: config.invertPulse || 0 },
        uEdgeGlow: { value: config.edgeGlow || 0 },
        uFractalNoise: { value: config.fractalNoise || 0 },
        uKaleidoscopeRotation: { value: config.kaleidoscopeRotation || 0 },
        uFeedbackZoom: { value: config.feedbackZoom || 0 },
        uRipple: { value: config.ripple || 0 },
        uPixelate: { value: config.pixelate || 0 },
        uPosterize: { value: config.posterize || 0 },
        uBackgroundMode: { value: config.backgroundMode || 0 },
      },
    });

    const mesh = new THREE.Mesh(geometry, material);
    displayMeshRef.current = mesh;
    scene.add(mesh);

    console.log('Display mesh created');

    return () => {
      geometry.dispose();
      material.dispose();
      scene.remove(mesh);
    };
  }, []);

  // Update uniforms when config changes
  useEffect(() => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uZoom.value = config.zoom;
      material.uniforms.uPan.value.set(config.pan[0], config.pan[1]);
    }

    if (displayMeshRef.current) {
      const material = displayMeshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uBrightness.value = config.brightness;
      material.uniforms.uColorLow.value.setRGB(...config.colorLow);
      material.uniforms.uColorHigh.value.setRGB(...config.colorHigh);
      material.uniforms.uBloomIntensity.value = config.bloom ? (config.bloomIntensity || 0.5) : 0;
      material.uniforms.uBloomThreshold.value = config.bloomThreshold || 0.5;
      material.uniforms.uRotation.value = config.rotation || 0;
      material.uniforms.uKaleidoscope.value = config.kaleidoscope || false;
      material.uniforms.uKaleidoscopeSegments.value = config.kaleidoscopeSegments || 6;
      material.uniforms.uChromaticAberration.value = config.chromaticAberration || 0;
      // NEW PSYCHEDELIC UNIFORMS
      material.uniforms.uTime.value = config.time || 0;
      material.uniforms.uSpiralDistortion.value = config.spiralDistortion || 0;
      material.uniforms.uRadialPulse.value = config.radialPulse || 0;
      material.uniforms.uWaveDistortion.value = config.waveDistortion || 0;
      material.uniforms.uTunnelEffect.value = config.tunnelEffect || 0;
      material.uniforms.uPrismEffect.value = config.prismEffect || 0;
      material.uniforms.uMirrorDimensions.value = config.mirrorDimensions || 0;
      material.uniforms.uColorShift.value = config.colorShift || 0;
      material.uniforms.uInvertPulse.value = config.invertPulse || 0;
      material.uniforms.uEdgeGlow.value = config.edgeGlow || 0;
      material.uniforms.uFractalNoise.value = config.fractalNoise || 0;
      material.uniforms.uKaleidoscopeRotation.value = config.kaleidoscopeRotation || 0;
      material.uniforms.uFeedbackZoom.value = config.feedbackZoom || 0;
      material.uniforms.uRipple.value = config.ripple || 0;
      material.uniforms.uPixelate.value = config.pixelate || 0;
      material.uniforms.uPosterize.value = config.posterize || 0;
      material.uniforms.uBackgroundMode.value = config.backgroundMode || 0;
    }
  }, [config]);

  // Clear accumulation buffer when system changes or infinite mode is toggled off
  // Track previous system to avoid clearing on iteration changes
  const prevSystemRef = useRef<IFSSystem | FlameSystem | null>(null);

  useEffect(() => {
    if (!rendererRef.current || !accumTargetRef.current) return;

    const renderer = rendererRef.current;
    const accumTarget = accumTargetRef.current;

    // Only clear buffer if the system actually changed (not just iterations/zoom)
    const systemChanged = prevSystemRef.current && prevSystemRef.current.name !== config.system.name;
    const shouldClear = systemChanged || config.infiniteAccumulation === false;

    if (shouldClear) {
      renderer.setRenderTarget(accumTarget);
      renderer.clear();
      renderer.setRenderTarget(null);
      console.log('Cleared accumulation buffer');
    }

    prevSystemRef.current = config.system;
  }, [config.system, config.infiniteAccumulation]);

  // Render loop
  useEffect(() => {
    let frameCount = 0;

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Check if everything is ready
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
      if (!accumTargetRef.current || !pointsRef.current || !displayMeshRef.current) return;

      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const accumTarget = accumTargetRef.current;
      const points = pointsRef.current;
      const displayMesh = displayMeshRef.current;

      // Clear accumulation buffer periodically if not in infinite mode or trails
      const shouldClear = !config.infiniteAccumulation && !config.trails;
      if (shouldClear && frameCount % 300 === 0) {
        renderer.setRenderTarget(accumTarget);
        renderer.clear();
      }

      // Pass 1: Render points to accumulation buffer (with additive blending)
      displayMesh.visible = false;
      points.visible = true;
      renderer.setRenderTarget(accumTarget);
      renderer.render(scene, camera);

      // Pass 2: Tone map and display
      displayMesh.visible = true;
      points.visible = false;
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);

      frameCount++;
    };

    console.log('Starting render loop');
    animate();

    return () => {
      console.log('Stopping render loop');
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [config.infiniteAccumulation, config.trails]); // Re-run when accumulation or trails settings change

  return null;
}
