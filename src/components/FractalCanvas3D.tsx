import { useRef, useEffect, useState } from 'react';
import { useRaymarchRenderer, RaymarchRendererConfig } from '../hooks/useRaymarchRenderer';

interface FractalCanvas3DProps {
  config: RaymarchRendererConfig;
  onCameraPosChange?: (pos: [number, number, number]) => void;
  onCameraTargetChange?: (target: [number, number, number]) => void;
}

export function FractalCanvas3D({ config, onCameraPosChange }: FractalCanvas3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [localCameraPos, setLocalCameraPos] = useState<[number, number, number]>(config.cameraPos);
  const [localCameraTarget, setLocalCameraTarget] = useState<[number, number, number]>(config.cameraTarget);

  // Sync state with props
  useEffect(() => {
    setLocalCameraPos(config.cameraPos);
    setLocalCameraTarget(config.cameraTarget);
  }, [config]);

  // Set canvas dimensions to match container
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const updateSize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height;
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Mouse controls for 3D orbit
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const sensitivity = 0.005;

    // Calculate orbit (spherical coordinates)
    const offset = [
      localCameraPos[0] - localCameraTarget[0],
      localCameraPos[1] - localCameraTarget[1],
      localCameraPos[2] - localCameraTarget[2],
    ];

    const radius = Math.sqrt(offset[0] * offset[0] + offset[1] * offset[1] + offset[2] * offset[2]);
    let theta = Math.atan2(offset[0], offset[2]);
    let phi = Math.acos(Math.max(-1, Math.min(1, offset[1] / radius)));

    // Update angles
    theta -= dx * sensitivity;
    phi -= dy * sensitivity;
    phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi)); // Clamp to prevent gimbal lock

    // Convert back to cartesian
    const newPos: [number, number, number] = [
      localCameraTarget[0] + radius * Math.sin(phi) * Math.sin(theta),
      localCameraTarget[1] + radius * Math.cos(phi),
      localCameraTarget[2] + radius * Math.sin(phi) * Math.cos(theta),
    ];

    setLocalCameraPos(newPos);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (onCameraPosChange) {
      onCameraPosChange(localCameraPos);
    }
  };

  // Scroll to zoom (move camera closer/farther)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1.1 : 0.9;
    const offset = [
      localCameraPos[0] - localCameraTarget[0],
      localCameraPos[1] - localCameraTarget[1],
      localCameraPos[2] - localCameraTarget[2],
    ];

    const newPos: [number, number, number] = [
      localCameraTarget[0] + offset[0] * delta,
      localCameraTarget[1] + offset[1] * delta,
      localCameraTarget[2] + offset[2] * delta,
    ];

    setLocalCameraPos(newPos);
    if (onCameraPosChange) {
      onCameraPosChange(newPos);
    }
  };

  // Export as image
  const handleExport = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `fractal-3d-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const renderConfig = {
    ...config,
    cameraPos: localCameraPos,
    cameraTarget: localCameraTarget,
  };

  useRaymarchRenderer(renderConfig, canvasRef);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      />
      <button
        onClick={handleExport}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '10px 20px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '5px',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: '14px',
        }}
      >
        Export PNG
      </button>
    </div>
  );
}
