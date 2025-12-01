import { useRef, useEffect, useState } from 'react';
import { useFractalRenderer, FractalRendererConfig } from '../hooks/useFractalRenderer';

interface FractalCanvas2DProps {
  config: FractalRendererConfig;
  onPanChange?: (pan: [number, number]) => void;
  onZoomChange?: (zoom: number) => void;
}

export function FractalCanvas2D({ config, onPanChange, onZoomChange }: FractalCanvas2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [localPan, setLocalPan] = useState<[number, number]>(config.pan);
  const [localZoom, setLocalZoom] = useState(config.zoom);

  // Sync state with props
  useEffect(() => {
    setLocalPan(config.pan);
    setLocalZoom(config.zoom);
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

  // Mouse controls for 2D panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    const newPan: [number, number] = [
      localPan[0] - (dx / 200) / localZoom,
      localPan[1] + (dy / 200) / localZoom,
    ];

    setLocalPan(newPan);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (onPanChange) {
      onPanChange(localPan);
    }
  };

  // Scroll to zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(10, localZoom * delta));
    setLocalZoom(newZoom);
    if (onZoomChange) {
      onZoomChange(newZoom);
    }
  };

  // Export as image
  const handleExport = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `fractal-2d-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const renderConfig = {
    ...config,
    pan: localPan,
    zoom: localZoom,
  };

  useFractalRenderer(renderConfig, canvasRef);

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
