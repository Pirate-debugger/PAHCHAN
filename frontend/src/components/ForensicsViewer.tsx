import React, { useState, useEffect, useRef } from 'react';
import type { TamperingAnalysis, ForensicRegion } from '../types';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye 
} from 'lucide-react';
import { applyForensicsFilter, type ForensicsFilterMode } from '../utils/forensics';

interface ForensicsViewerProps {
  documentImageUrl: string;
  tampering: TamperingAnalysis;
  onSelectRegion?: (region: ForensicRegion | null) => void;
  selectedRegion?: ForensicRegion | null;
  className?: string;
}

export const ForensicsViewer: React.FC<ForensicsViewerProps> = ({
  documentImageUrl,
  tampering,
  onSelectRegion,
  selectedRegion,
  className = ''
}) => {
  const [filterMode, setFilterMode] = useState<ForensicsFilterMode>('ORIGINAL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [splitRatio, setSplitRatio] = useState<number>(0.5);
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hiddenSourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Render forensic filter on canvas
  useEffect(() => {
    if (!documentImageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!hiddenSourceCanvasRef.current) {
        hiddenSourceCanvasRef.current = document.createElement('canvas');
      }
      const srcCanvas = hiddenSourceCanvasRef.current;
      srcCanvas.width = img.width || 900;
      srcCanvas.height = img.height || 600;
      const srcCtx = srcCanvas.getContext('2d');
      if (srcCtx) {
        srcCtx.drawImage(img, 0, 0);
      }

      if (canvasRef.current) {
        applyForensicsFilter(
          srcCanvas,
          canvasRef.current,
          filterMode,
          tampering.regions,
          splitRatio
        );
      }
    };
    img.src = documentImageUrl;
  }, [documentImageUrl, filterMode, splitRatio, tampering.regions]);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.max(0.7, Math.min(3.0, prev + delta)));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    if (onSelectRegion) onSelectRegion(null);
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !isDraggingSplit) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    } else if (isDraggingSplit && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const ratio = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
      setSplitRatio(ratio);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingSplit(false);
  };

  const regions = tampering.regions || [];

  return (
    <div className={`bg-slate-900 rounded-lg border border-slate-800 shadow-md flex flex-col overflow-hidden text-slate-100 ${className}`}>
      
      {/* Top Inspection Stage Toolbar */}
      <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Left: View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800">
          <button
            onClick={() => setFilterMode('ORIGINAL')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              filterMode === 'ORIGINAL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Original
          </button>
          <button
            onClick={() => setFilterMode('ELA')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              filterMode === 'ELA' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ELA Heatmap
          </button>
          <button
            onClick={() => setFilterMode('EDGES')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              filterMode === 'EDGES' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Edge Gradient
          </button>
          <button
            onClick={() => setFilterMode('SPLIT')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              filterMode === 'SPLIT' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Compare (Split)
          </button>
        </div>

        {/* Right: Overlays Toggle & Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors flex items-center gap-1 ${
              showOverlays 
                ? 'bg-blue-950/60 border-blue-700 text-blue-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>{showOverlays ? 'Overlays On' : 'Overlays Off'}</span>
          </button>

          <div className="flex items-center bg-slate-900 rounded border border-slate-800">
            <button
              onClick={() => handleZoom(-0.2)}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1.5 text-slate-400">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.2)}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white border-l border-slate-800 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* Main Forensic Canvas Viewport */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex-1 relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing select-none bg-[#020617] min-h-[360px]"
      >
        <div 
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.15s ease-out'
          }}
          className="relative max-w-full max-h-full"
        >
          {/* Main Visual / Processed Canvas */}
          <canvas
            ref={canvasRef}
            className="max-h-[500px] object-contain rounded shadow-2xl block mx-auto pointer-events-none"
          />

          {/* Interactive Evidence Bounding Boxes */}
          {(showOverlays || !!selectedRegion) && regions.map((region) => {
            const isSelected = selectedRegion?.id === region.id;
            const isAnomaly = region.status === 'ALERT' || region.status === 'WARNING' || region.riskScore > 0;

            return (
              <div
                key={region.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectRegion) onSelectRegion(region);
                }}
                style={{
                  left: `${region.x}%`,
                  top: `${region.y}%`,
                  width: `${region.width}%`,
                  height: `${region.height}%`,
                }}
                className={`absolute cursor-pointer transition-all rounded ${
                  isSelected
                    ? 'border-2 border-blue-400 bg-blue-500/20 shadow-lg ring-2 ring-blue-400/50'
                    : isAnomaly
                    ? 'border border-rose-500 bg-rose-500/10 hover:bg-rose-500/20'
                    : 'border border-emerald-500/80 bg-emerald-500/5 hover:bg-emerald-500/15'
                }`}
              >
                {/* Region Label Tag */}
                <div className={`absolute -top-5 left-0 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold whitespace-nowrap ${
                  isAnomaly ? 'bg-rose-900 text-rose-200 border border-rose-700' : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {region.name} {isAnomaly && '⚠'}
                </div>
              </div>
            );
          })}

          {/* Curtain Split Mode Handle */}
          {filterMode === 'SPLIT' && (
            <div
              style={{ left: `${splitRatio * 100}%` }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsDraggingSplit(true);
              }}
              className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-20 flex items-center justify-center shadow-lg"
            >
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shadow-md">
                ↔
              </div>
            </div>
          )}
        </div>

        {/* Selected Region Detailed Context Pill (Level 2 Progressive Disclosure) */}
        {selectedRegion && (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 border border-slate-700 rounded-md p-2.5 shadow-xl text-xs flex items-center justify-between gap-3 animate-in fade-in duration-150 z-20">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white font-mono text-xs">
                  {selectedRegion.name}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  (selectedRegion.status === 'ALERT' || selectedRegion.riskScore > 0) ? 'bg-rose-900/80 text-rose-300 border border-rose-700' : 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                }`}>
                  {(selectedRegion.status === 'ALERT' || selectedRegion.riskScore > 0) ? 'ANOMALY DETECTED' : 'INTEGRITY VERIFIED'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                {selectedRegion.explanation}
              </p>
            </div>

            <button
              onClick={() => onSelectRegion && onSelectRegion(null)}
              className="text-[11px] text-slate-400 hover:text-white px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded transition-colors flex-shrink-0"
            >
              Clear Focus
            </button>
          </div>
        )}

      </div>

      {/* Forensic Bottom Status Strip */}
      <div className="bg-slate-950 px-3 py-1.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span>ELA VARIANCE: <strong className="text-slate-200">{(tampering.elaVariance ?? 5.4).toFixed(1)}</strong></span>
          <span>&bull;</span>
          <span>REGIONS INSPECTED: <strong className="text-slate-200">{regions.length}</strong></span>
        </div>
        <div className="text-slate-500">
          Click region to focus &bull; Drag to pan &bull; Scroll/buttons to zoom
        </div>
      </div>

    </div>
  );
};
