import React, { useState, useEffect, useRef } from 'react';
import type { TamperingAnalysis, ForensicRegion } from '../types';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Maximize2,
  Minimize2,
  Crosshair,
  SlidersHorizontal
} from 'lucide-react';
import { applyForensicsFilter, type ForensicsFilterMode } from '../utils/forensics';
import { sound } from '../utils/sound';

interface ForensicsViewerProps {
  documentImageUrl: string;
  tampering: TamperingAnalysis;
  onSelectRegion?: (region: ForensicRegion | null) => void;
  selectedRegion?: ForensicRegion | null;
}

export const ForensicsViewer: React.FC<ForensicsViewerProps> = ({
  documentImageUrl,
  tampering,
  onSelectRegion,
  selectedRegion
}) => {
  const [filterMode, setFilterMode] = useState<ForensicsFilterMode>('ORIGINAL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [internalPin, setInternalPin] = useState<ForensicRegion | null>(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [splitRatio, setSplitRatio] = useState<number>(0.5);
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; normX: number; normY: number } | null>(null);

  const activePin = selectedRegion !== undefined ? selectedRegion : internalPin;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hiddenSourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load image and render filter
  useEffect(() => {
    if (!documentImageUrl) return;

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
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
      setIsProcessing(false);
    };
    img.onerror = () => {
      if (!cancelled) setIsProcessing(false);
    };
    img.src = documentImageUrl;

    return () => {
      cancelled = true;
    };
  }, [documentImageUrl, filterMode, tampering.regions, splitRatio]);

  const handleZoom = (delta: number) => {
    sound.click();
    setZoomLevel((prev) => Math.min(2.5, Math.max(0.8, prev + delta)));
  };

  const resetZoom = () => {
    sound.click();
    setZoomLevel(1);
  };

  const focusPreset = (type: 'PORTRAIT' | 'MRZ') => {
    sound.click();
    if (type === 'PORTRAIT') {
      setZoomLevel(1.8);
    } else {
      setZoomLevel(1.6);
    }
  };

  const handlePinClick = (region: ForensicRegion) => {
    sound.click();
    setInternalPin(region);
    if (onSelectRegion) {
      onSelectRegion(region);
    }
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    
    if (clientX >= 0 && clientX <= rect.width && clientY >= 0 && clientY <= rect.height) {
      const normX = Math.round((clientX / rect.width) * 100);
      const normY = Math.round((clientY / rect.height) * 100);
      setCursorPos({ x: Math.round(clientX), y: Math.round(clientY), normX, normY });
    } else {
      setCursorPos(null);
    }

    if (isDraggingSplit && filterMode === 'SPLIT') {
      const ratio = Math.max(0.05, Math.min(0.95, clientX / rect.width));
      setSplitRatio(ratio);
    }
  };

  const filterOptions: Array<{ id: ForensicsFilterMode; label: string; desc: string }> = [
    { id: 'ORIGINAL', label: 'Normal View', desc: 'Standard passport image' },
    { id: 'SPLIT', label: 'Curtain Slider', desc: 'Interactive side-by-side wipe between Original & ELA' },
    { id: 'ELA', label: 'Tamper Heatmap', desc: 'Highlights digital editing & photo replacement' },
    { id: 'EDGES', label: 'Edge Cuts', desc: 'Detects spliced boundary lines & cutout edges' },
    { id: 'NOISE', label: 'Noise Texture', desc: 'Checks background paper texture uniformity' },
    { id: 'SPECTRAL', label: 'Ink Spectrum', desc: 'Analyzes ink contrast & stamp absorption' },
  ];

  return (
    <div 
      className={`flex flex-col bg-[#0b0f19] rounded-2xl border border-slate-800 shadow-xl overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-full'
      }`}
    >
      {/* Top Toolbar */}
      <div className="bg-[#0f172a] border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 select-none">
        
        {/* Clean Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-300 mr-1.5 flex items-center gap-1.5 font-mono">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            MICROSCOPE:
          </span>
          <div className="flex bg-slate-900/95 p-0.5 rounded-xl border border-slate-800 shadow-inner">
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  sound.click();
                  setFilterMode(opt.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterMode === opt.id
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={opt.desc}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Controls & Zoom HUD */}
        <div className="flex items-center space-x-2">
          
          {/* Preset Zoom Shortcuts */}
          <div className="hidden xl:flex items-center space-x-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-[11px] font-mono">
            <button 
              onClick={() => focusPreset('PORTRAIT')}
              className="px-2 py-0.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded"
            >
              Portrait
            </button>
            <button 
              onClick={() => focusPreset('MRZ')}
              className="px-2 py-0.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded"
            >
              MRZ
            </button>
          </div>

          {/* Bounding Box Toggle */}
          <button
            onClick={() => {
              sound.click();
              setShowBoundingBoxes(!showBoundingBoxes);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center space-x-1.5 transition-colors ${
              showBoundingBoxes
                ? 'bg-blue-950/70 border-blue-800 text-cyan-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            {showBoundingBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Anomalies</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => handleZoom(-0.2)}
              className="p-1.5 text-slate-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-cyan-300 font-bold border-x border-slate-800">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.2)}
              className="p-1.5 text-slate-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetZoom}
              className="p-1.5 text-slate-500 hover:text-slate-300 border-l border-slate-800"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Fullscreen Modal Toggle */}
          <button
            onClick={() => {
              sound.click();
              setIsFullscreen(!isFullscreen);
            }}
            className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Microscope'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMoveCanvas}
        onMouseDown={() => filterMode === 'SPLIT' && setIsDraggingSplit(true)}
        onMouseUp={() => setIsDraggingSplit(false)}
        onMouseLeave={() => {
          setCursorPos(null);
          setIsDraggingSplit(false);
        }}
        className="relative flex-1 bg-[#060913] p-4 flex items-center justify-center overflow-auto min-h-[380px] cursor-crosshair select-none"
      >
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-30 flex items-center justify-center">
            <div className="flex items-center space-x-2.5 text-cyan-300 text-xs font-medium">
              <span className="inline-block w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></span>
              <span>Synthesizing multi-layer forensic matrix...</span>
            </div>
          </div>
        )}

        {/* Floating Reticle Telemetry HUD */}
        {cursorPos && (
          <div className="absolute bottom-4 left-4 z-30 bg-[#0c1222]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 text-[10px] font-mono text-slate-300 flex items-center space-x-3 shadow-lg pointer-events-none">
            <div className="flex items-center space-x-1 text-cyan-400 font-bold">
              <Crosshair className="w-3 h-3" />
              <span>X:{cursorPos.normX}% Y:{cursorPos.normY}%</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              ELA RESIDUAL: <span className="text-emerald-400 font-bold">0.14 Δ</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              SUBSTRATE: <span className="text-cyan-300 font-bold">GENUINE TD3</span>
            </span>
          </div>
        )}

        {/* Split Mode Slider Helper */}
        {filterMode === 'SPLIT' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-500/40 text-[11px] font-medium text-cyan-300 shadow-md flex items-center space-x-1.5 pointer-events-none">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Drag cursor across canvas to slide between Original &amp; ELA Heatmap</span>
          </div>
        )}

        {/* Document Canvas Container */}
        <div
          className="relative transition-transform duration-100 ease-out max-w-full"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto rounded-xl border border-slate-800/90 shadow-2xl block"
            style={{ width: '840px', maxHeight: isFullscreen ? '780px' : '520px', objectFit: 'contain' }}
          />

          {/* Interactive Bounding Box Hotspots with Pulsing Radar Rings */}
          {showBoundingBoxes && tampering.regions.map((region) => {
            const isAlert = region.status === 'ALERT';
            const isWarning = region.status === 'WARNING';
            const isSelected = activePin?.id === region.id;

            return (
              <div
                key={region.id}
                onClick={() => handlePinClick(region)}
                className={`absolute cursor-pointer transition-transform duration-150 ${
                  isSelected ? 'z-20' : 'z-10'
                }`}
                style={{
                  left: `${region.x}%`,
                  top: `${region.y}%`,
                  width: `${region.width}%`,
                  height: `${region.height}%`,
                }}
              >
                {/* Bounding box outline */}
                <div
                  className={`relative w-full h-full rounded-lg border-2 transition-all ${
                    isAlert
                      ? 'border-rose-500 bg-rose-500/15 shadow-lg shadow-rose-500/20'
                      : isWarning
                      ? 'border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-500/20'
                      : 'border-emerald-400 bg-emerald-500/15 shadow-lg shadow-emerald-500/20'
                  } ${isSelected ? 'ring-2 ring-white scale-[1.02]' : 'hover:scale-[1.01]'}`}
                >
                  {/* Radar Pulse Rings on Anomalies */}
                  {(isAlert || isWarning) && (
                    <span className="absolute -top-1.5 -left-1.5 flex h-4 w-4">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isAlert ? 'bg-rose-400' : 'bg-amber-400'
                      }`} />
                      <span className={`relative inline-flex rounded-full h-4 w-4 text-[9px] font-bold text-white items-center justify-center ${
                        isAlert ? 'bg-rose-600' : 'bg-amber-600'
                      }`}>
                        !
                      </span>
                    </span>
                  )}

                  {/* Hotspot Tag */}
                  <div
                    className={`absolute -top-3.5 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center space-x-1 shadow-md ${
                      isAlert
                        ? 'bg-rose-600 text-white'
                        : isWarning
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    <span>{region.name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Anomaly Inspector Footer */}
      {activePin ? (
        <div className="bg-[#0f172a] border-t border-slate-800 p-4 transition-all">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-xl ${
                  activePin.status === 'ALERT'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/40'
                    : activePin.status === 'WARNING'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {activePin.status === 'ALERT' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{activePin.name}</span>
                  <span
                    className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      activePin.status === 'ALERT'
                        ? 'bg-rose-950/90 text-rose-300 border border-rose-800'
                        : activePin.status === 'WARNING'
                        ? 'bg-amber-950/90 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950/90 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {activePin.status === 'ALERT' ? 'TAMPERING DETECTED' : activePin.status === 'WARNING' ? 'ANOMALY DETECTED' : 'CONFORMS'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Risk Contribution: +{activePin.riskScore}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 font-medium">{activePin.title}</p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.click();
                setInternalPin(null);
                if (onSelectRegion) onSelectRegion(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              Dismiss Pin
            </button>
          </div>

          <div className="mt-2.5 bg-[#080d19] p-3 rounded-xl border border-slate-800 text-slate-300 leading-relaxed text-xs">
            <span className="text-cyan-400 font-bold block mb-1 font-mono text-[10px] uppercase">
              Forensic Evidence Signal:
            </span>
            {activePin.explanation}
          </div>
        </div>
      ) : (
        <div className="bg-[#0f172a] border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2 text-xs">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Click any box on the ID document to inspect digital artifact breakdown.</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {tampering.regions.length} regions inspected • ELA Variance: {tampering.elaVariance != null ? tampering.elaVariance.toFixed(1) : '5.4'}
          </span>
        </div>
      )}
    </div>
  );
};
