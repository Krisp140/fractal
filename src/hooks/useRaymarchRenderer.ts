import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Fractal3D } from '../core/types';

// Import shaders
import raymarchVertexShader from '../shaders/raymarch.vert';
import raymarchFragmentShader from '../shaders/raymarch.frag';

export interface RaymarchRendererConfig {
  fractal: Fractal3D;
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
  colorLow: [number, number, number];
  colorHigh: [number, number, number];
  glow: number;
  maxIterations: number;
  bailout: number;
  power?: number;
  scale?: number;
  foldingLimit?: number;
}

export interface RaymarchRendererControls {
  getCameraPosition: () => [number, number, number];
  getCameraTarget: () => [number, number, number];
  setCameraPosition: (pos: [number, number, number]) => void;
  setCameraTarget: (target: [number, number, number]) => void;
}

export function useRaymarchRenderer(
  config: RaymarchRendererConfig,
  canvasRef: React.RefObject<HTMLCanvasElement>
): RaymarchRendererControls {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const cameraPosRef = useRef<THREE.Vector3>(
    new THREE.Vector3(...config.cameraPos)
  );
  const cameraTargetRef = useRef<THREE.Vector3>(
    new THREE.Vector3(...config.cameraTarget)
  );

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) {
      console.log('[Raymarch] Canvas not ready');
      return;
    }

    const canvas = canvasRef.current;
    const width = canvas.width || 800;
    const height = canvas.height || 600;

    console.log('[Raymarch] Initializing renderer:', width, height);

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: raymarchVertexShader,
      fragmentShader: raymarchFragmentShader,
      uniforms: {
        uResolution: { value: new THREE.Vector2(width, height) },
        uCameraPos: { value: cameraPosRef.current.clone() },
        uCameraTarget: { value: cameraTargetRef.current.clone() },
        uTime: { value: 0 },
        uFractalType: { value: config.fractal.type },
        uPower: { value: config.power || config.fractal.power || 8.0 },
        uScale: { value: config.scale || config.fractal.scale || 2.0 },
        uFoldingLimit: { value: config.foldingLimit || config.fractal.foldingLimit || 1.0 },
        uColorLow: { value: new THREE.Color(...config.colorLow) },
        uColorHigh: { value: new THREE.Color(...config.colorHigh) },
        uGlow: { value: config.glow },
        uMaxIterations: { value: config.maxIterations },
        uBailout: { value: config.bailout },
      },
    });

    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene.add(mesh);

    // Orthographic camera for fullscreen quad
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Handle resize
    const handleResize = () => {
      const w = canvas.width || 800;
      const h = canvas.height || 600;
      renderer.setSize(w, h, false);
      if (meshRef.current) {
        const mat = meshRef.current.material as THREE.ShaderMaterial;
        mat.uniforms.uResolution.value.set(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    console.log('[Raymarch] Renderer initialized');

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (!rendererRef.current || !sceneRef.current || !meshRef.current) return;

      timeRef.current += 0.016; // ~60fps

      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = timeRef.current;
      material.uniforms.uCameraPos.value.copy(cameraPosRef.current);
      material.uniforms.uCameraTarget.value.copy(cameraTargetRef.current);

      rendererRef.current.render(sceneRef.current, camera);
    };

    animate();

    return () => {
      console.log('[Raymarch] Cleaning up renderer');
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      scene.remove(mesh);
    };
  }, [canvasRef]);

  // Update uniforms when config changes
  useEffect(() => {
    if (!meshRef.current) return;

    const material = meshRef.current.material as THREE.ShaderMaterial;
    material.uniforms.uFractalType.value = config.fractal.type;
    material.uniforms.uPower.value = config.power || config.fractal.power || 8.0;
    material.uniforms.uScale.value = config.scale || config.fractal.scale || 2.0;
    material.uniforms.uFoldingLimit.value = config.foldingLimit || config.fractal.foldingLimit || 1.0;
    material.uniforms.uColorLow.value.setRGB(...config.colorLow);
    material.uniforms.uColorHigh.value.setRGB(...config.colorHigh);
    material.uniforms.uGlow.value = config.glow;
    material.uniforms.uMaxIterations.value = config.maxIterations;
    material.uniforms.uBailout.value = config.bailout;
  }, [config]);

  // Update camera when config changes
  useEffect(() => {
    cameraPosRef.current.set(...config.cameraPos);
    cameraTargetRef.current.set(...config.cameraTarget);
  }, [config.cameraPos, config.cameraTarget]);

  // Control interface
  return {
    getCameraPosition: () => cameraPosRef.current.toArray() as [number, number, number],
    getCameraTarget: () => cameraTargetRef.current.toArray() as [number, number, number],
    setCameraPosition: (pos: [number, number, number]) => {
      cameraPosRef.current.set(...pos);
    },
    setCameraTarget: (target: [number, number, number]) => {
      cameraTargetRef.current.set(...target);
    },
  };
}
