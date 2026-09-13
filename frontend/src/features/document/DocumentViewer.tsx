import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Layers,
  Eye,
  EyeOff,
  Sliders,
  Maximize2,
  Minimize2,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ForensicFinding, ExtractedField } from '../../types';

interface DocumentViewerProps {
  documentUrl: string;
  heatmapUrl?: string;
  findings: ForensicFinding[];
  fields: ExtractedField[];
  selectedFindingId?: string | null;
  selectedFieldKey?: string | null;
  hoveredFieldKey?: string | null;
  onSelectFinding?: (id: string) => void;
  onSelectField?: (key: string) => void;
  onOpenSuspiciousRegionModal?: (finding: ForensicFinding) => void;
  isScanning?: boolean;
  activeScanStep?: string;
  detectedTags?: string[];
  documentType?: string;
  currentPage?: number;
  totalPages?: number;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentUrl,
  heatmapUrl,
  findings,
  fields,
  selectedFindingId,
  selectedFieldKey,
  hoveredFieldKey,
  onSelectFinding,
  onSelectField,
  onOpenSuspiciousRegionModal,
  isScanning = false,
  activeScanStep,
  detectedTags = [],
  documentType = 'PASSPORT',
  currentPage = 1,
  totalPages = 1,
  onNextPage,
  onPrevPage
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Layer & filter toggles
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showHighContrast, setShowHighContrast] = useState(false);
  const [heatmapOpacity, setHeatmapOpacity] = useState(85);

  // Mouse coordinate tracker
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number; pctX: number; pctY: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleSetZoomPreset = (val: number) => {
    setZoom(val);
    setPan({ x: 0, y: 0 });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }

    if (imgRef.current) {
      const rect = imgRef.current.getBoundingClientRect();
      const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      setMouseCoords({
        x: Math.round(normX * 1280),
        y: Math.round(normY * 850),
        pctX: Math.round(normX * 100),
        pctY: Math.round(normY * 100)
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      ref={wrapperRef}
      className={`bg-slate-900 rounded-2xl overflow-hidden flex flex-col border border-slate-800 shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-full w-full'
      }`}
    >
      
      {/* Top Forensic Toolbar */}
      <div className="bg-slate-950/95 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 select-none">
        
        {/* Left Side: Document Meta & Image Quality Indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80">
            {documentType}
          </span>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>300+ DPI</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-300">SHARPNESS 98%</span>
          </div>

          {/* Page Counter for multi-page docs */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px] font-mono">
              <button
                type="button"
                onClick={onPrevPage}
                disabled={currentPage <= 1}
                className="hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span>{currentPage}/{totalPages}</span>
              <button
                type="button"
                onClick={onNextPage}
                disabled={currentPage >= totalPages}
                className="hover:text-white disabled:opacity-30"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Interactive Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold px-1 text-slate-300 min-w-9 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2X Loupe Zoom */}
          <button
            type="button"
            onClick={() => handleSetZoomPreset(zoom === 2 ? 1 : 2)}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition border ${
              zoom === 2 ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Toggle 200% Precision Loupe Zoom"
          >
            2X LOUPE
          </button>

          {/* Rotate 90 degrees */}
          <button
            type="button"
            onClick={handleRotate}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-800 transition"
            title="Rotate 90° Clockwise"
          >
            <RotateCw className="w-3 h-3 text-cyan-400" />
            <span>Rotate</span>
          </button>

          {/* Fit / Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition border border-slate-800 text-[11px] font-semibold"
            title="Fit to Canvas"
          >
            Fit
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-0.5" />

          {/* Toggle Bounding Boxes */}
          <button
            type="button"
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition border ${
              showAnnotations
                ? 'bg-blue-900/70 text-blue-200 border-blue-700'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Field Bounding Boxes"
          >
            {showAnnotations ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>Boxes</span>
          </button>

          {/* Toggle Contrast Filter */}
          <button
            type="button"
            onClick={() => setShowHighContrast(!showHighContrast)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition border ${
              showHighContrast
                ? 'bg-cyan-900 text-cyan-100 border-cyan-700'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Microprint & Substrate Ink Contrast Filter"
          >
            <Sliders className="w-3 h-3 text-cyan-400" />
            <span>Contrast</span>
          </button>

          {/* ELA Heatmap Toggle */}
          {heatmapUrl && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  showHeatmap
                    ? 'bg-purple-700 text-white ring-1 ring-purple-400'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Toggle Error Level Analysis (ELA) Compression Heatmap"
              >
                <Layers className="w-3 h-3" />
                <span>ELA Heatmap</span>
              </button>

              {showHeatmap && (
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={heatmapOpacity}
                  onChange={(e) => setHeatmapOpacity(parseInt(e.target.value))}
                  className="w-14 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  title="Heatmap Opacity"
                />
              )}
            </div>
          )}

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition border border-slate-800"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Canvas'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex-1 relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing p-4 bg-slate-950 forensic-grid-pattern min-h-[420px]"
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
          className="relative max-w-full max-h-full inline-block"
        >
          {/* Base Document Image */}
          <img
            ref={imgRef}
            src={documentUrl}
            alt="Document under inspection"
            style={{
              filter: showHighContrast ? 'contrast(240%) grayscale(100%) brightness(88%)' : 'none'
            }}
            className="max-h-[560px] w-auto max-w-full object-contain rounded-lg border border-slate-800 shadow-2xl pointer-events-none transition-all duration-200"
          />

          {/* Error Level Analysis (ELA) Heatmap Alpha Blended Overlay */}
          {showHeatmap && heatmapUrl && (
            <img
              src={heatmapUrl}
              alt="ELA Heatmap overlay"
              style={{
                opacity: heatmapOpacity / 100,
                mixBlendMode: 'screen'
              }}
              className="absolute inset-0 max-h-[560px] w-full h-full object-contain pointer-events-none rounded-lg"
            />
          )}

          {/* Subtle Scanning Laser Line (Active during verification analysis) */}
          {isScanning && (
            <div className="forensic-laser-line" />
          )}

          {/* Dynamic Detected Region Tags Overlay */}
          {isScanning && detectedTags.length > 0 && (
            <div className="absolute top-4 left-4 z-30 flex flex-col gap-1.5 pointer-events-none">
              {detectedTags.map((tag, idx) => (
                <div
                  key={idx}
                  className="detected-tag-animate px-2.5 py-1 rounded-md bg-slate-900/90 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/50 shadow-glow-blue flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          )}

          {/* SVG Overlay for Bounding Boxes and Forensic Highlights */}
          {showAnnotations && !showHeatmap && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-auto"
              style={{ width: '100%', height: '100%' }}
            >
              {/* Extracted Fields Bounding Boxes */}
              {fields.map((field) => {
                if (
                  field.bbox_ymin == null ||
                  field.bbox_xmin == null ||
                  field.bbox_ymax == null ||
                  field.bbox_xmax == null
                ) {
                  return null;
                }

                const isSelected = selectedFieldKey === field.field_key;
                const isHovered = hoveredFieldKey === field.field_key;
                const top = `${field.bbox_ymin * 100}%`;
                const left = `${field.bbox_xmin * 100}%`;
                const width = `${(field.bbox_xmax - field.bbox_xmin) * 100}%`;
                const height = `${(field.bbox_ymax - field.bbox_ymin) * 100}%`;

                return (
                  <g
                    key={field.id}
                    onClick={() => onSelectField && onSelectField(field.field_key)}
                    className="cursor-pointer group"
                  >
                    <rect
                      x={left}
                      y={top}
                      width={width}
                      height={height}
                      fill={isSelected || isHovered ? 'rgba(59, 130, 246, 0.32)' : 'transparent'}
                      stroke={isSelected || isHovered ? '#3b82f6' : 'rgba(148, 163, 184, 0.45)'}
                      strokeWidth={isSelected || isHovered ? 2.5 : 1}
                      strokeDasharray={isSelected || isHovered ? 'none' : '3 3'}
                      className={`transition-all hover:fill-blue-500/25 hover:stroke-blue-400 ${
                        isSelected ? 'field-focused-glow' : ''
                      }`}
                    />
                  </g>
                );
              })}

              {/* Forensic Findings Bounding Boxes & Suspicious Region Markers */}
              {findings.map((finding, idx) => {
                if (
                  finding.bbox_ymin == null ||
                  finding.bbox_xmin == null ||
                  finding.bbox_ymax == null ||
                  finding.bbox_xmax == null
                ) {
                  return null;
                }

                const isSelected = selectedFindingId === finding.id;
                const isHigh = finding.severity === 'HIGH' || finding.severity === 'CRITICAL';
                const strokeColor = isHigh ? '#ef4444' : '#f59e0b';
                const fillColor = isSelected
                  ? isHigh
                    ? 'rgba(239, 68, 68, 0.35)'
                    : 'rgba(245, 158, 11, 0.35)'
                  : 'rgba(239, 68, 68, 0.12)';

                const top = `${finding.bbox_ymin * 100}%`;
                const left = `${finding.bbox_xmin * 100}%`;
                const width = `${(finding.bbox_xmax - finding.bbox_xmin) * 100}%`;
                const height = `${(finding.bbox_ymax - finding.bbox_ymin) * 100}%`;

                return (
                  <g
                    key={finding.id}
                    onClick={() => {
                      if (onSelectFinding) onSelectFinding(finding.id);
                      if (onOpenSuspiciousRegionModal) onOpenSuspiciousRegionModal(finding);
                    }}
                    className="cursor-pointer"
                  >
                    <rect
                      x={left}
                      y={top}
                      width={width}
                      height={height}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 3.5 : 2}
                      className={isSelected ? 'animate-pulse' : ''}
                    />

                    {/* Interactive Region Marker Badge (e.g. ⚠ Region 01) */}
                    <foreignObject
                      x={left}
                      y={`${Math.max(2, (finding.bbox_ymin * 100) - 5)}%`}
                      width="120"
                      height="30"
                    >
                      <div className="beacon-animate-danger inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-600 text-white font-mono text-[9px] font-bold shadow-md cursor-pointer hover:bg-rose-700">
                        <AlertTriangle className="w-2.5 h-2.5 text-white" />
                        <span>Region {String(idx + 1).padStart(2, '0')}</span>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>

      {/* Canvas Footer Status & Coordinate Inspector */}
      <div className="px-3.5 py-2 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 hidden sm:inline">PAN: DRAG &bull; ZOOM: BUTTONS / 2X LOUPE</span>
          {mouseCoords && (
            <span className="text-cyan-400 flex items-center gap-1 font-semibold">
              <Crosshair className="w-3 h-3" />
              <span>X: {mouseCoords.x} Y: {mouseCoords.y} ({mouseCoords.pctX}%, {mouseCoords.pctY}%)</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isScanning ? (
            <span className="text-cyan-400 font-bold animate-pulse">
              ANALYZING SUBSTRATE &bull; {activeScanStep || 'SCANNING IN PROGRESS...'}
            </span>
          ) : showHeatmap ? (
            <span className="text-purple-300">HEATMAP: PURPLE=AUTHENTIC &bull; RED=COMPRESSION ANOMALY</span>
          ) : (
            <span className="text-slate-400">CLICK ANY BOUNDING BOX OR ⚠ REGION TO INSPECT</span>
          )}
        </div>
      </div>

    </div>
  );
};
