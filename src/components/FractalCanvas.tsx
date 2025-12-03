import { useRef, useEffect, useState } from 'react';
import { useFractalRenderer, FractalRendererConfig } from '../hooks/useFractalRenderer';
import { useRaymarchRenderer, RaymarchRendererConfig } from '../hooks/useRaymarchRenderer';

interface FractalCanvasProps {
  mode: '2d' | '3d';
  config2D?: FractalRendererConfig;
  config3D?: RaymarchRendererConfig;
  onPanChange?: (pan: [number, number]) => void;
  onZoomChange?: (zoom: number) => void;
  onCameraPosChange?: (pos: [number, number, number]) => void;
  onCameraTargetChange?: (target: [number, number, number]) => void;
}

export function FractalCanvas({
  mode,
  config2D,
  config3D,
  onPanChange,
  onZoomChange,
  onCameraPosChange,
}: FractalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 2D state
  const [localPan, setLocalPan] = useState<[number, number]>(config2D?.pan || [0, 0]);
  const [localZoom, setLocalZoom] = useState(config2D?.zoom || 1);

  // 3D state
  const [localCameraPos, setLocalCameraPos] = useState<[number, number, number]>(
    config3D?.cameraPos || [0, 0, 3]
  );
  const [localCameraTarget, setLocalCameraTarget] = useState<[number, number, number]>(
    config3D?.cameraTarget || [0, 0, 0]
  );

  // Sync 2D state with props
  useEffect(() => {
    if (config2D && mode === '2d') {
      setLocalPan(config2D.pan);
      setLocalZoom(config2D.zoom);
    }
  }, [config2D, mode]);

  // Sync 3D state with props
  useEffect(() => {
    if (config3D && mode === '3d') {
      setLocalCameraPos(config3D.cameraPos);
      setLocalCameraTarget(config3D.cameraTarget);
    }
  }, [config3D, mode]);

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

  // Mouse controls
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    if (mode === '2d') {
      // 2D panning
      const newPan: [number, number] = [
        localPan[0] - (dx / 200) / localZoom,
        localPan[1] + (dy / 200) / localZoom,
      ];
      setLocalPan(newPan);
    } else {
      // 3D orbit controls
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
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    // Update parent state when done dragging
    if (mode === '2d') {
      if (onPanChange) {
        onPanChange(localPan);
      }
    } else {
      if (onCameraPosChange) {
        onCameraPosChange(localCameraPos);
      }
    }
  };

  // Scroll to zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    if (mode === '2d') {
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(100, localZoom * delta));
      setLocalZoom(newZoom);
      if (onZoomChange) {
        onZoomChange(newZoom);
      }
    } else {
      // 3D zoom (move camera closer/farther)
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
    }
  };

  // Export as image
  const handleExport = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `fractal-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  // Use appropriate renderer based on mode
  const renderConfig2D = config2D ? {
    ...config2D,
    pan: localPan,
    zoom: localZoom,
  } : undefined;

  const renderConfig3D = config3D ? {
    ...config3D,
    cameraPos: localCameraPos,
    cameraTarget: localCameraTarget,
  } : undefined;

  // Render with appropriate hook
  if (mode === '3d' && renderConfig3D) {
    useRaymarchRenderer(renderConfig3D, canvasRef);
  } else if (mode === '2d' && renderConfig2D) {
    useFractalRenderer(renderConfig2D, canvasRef);
  }

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
