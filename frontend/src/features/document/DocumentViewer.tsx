import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Layers, Eye, EyeOff, Sparkles, Sliders } from 'lucide-react';
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
  onSelectField
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Layer & filter toggles
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showHighContrast, setShowHighContrast] = useState(false);

  // Mouse coordinate tracker
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset zoom & pan
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.6));

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click
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
      setMouseCoords({ x: Math.round(normX * 860), y: Math.round(normY * 580) });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Center on selected finding when clicked from list
  useEffect(() => {
    if (selectedFindingId) {
      const finding = findings.find((f) => f.id === selectedFindingId);
      if (finding && finding.bbox_ymin !== null && finding.bbox_xmin !== null) {
        setZoom(1.35);
      }
    }
  }, [selectedFindingId, findings]);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm select-none">
      
      {/* Canvas Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/90 border-b border-slate-800 text-xs text-slate-300">
        
        {/* Left Indicator Badges */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-semibold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            HERO DOCUMENT CANVAS
          </span>
          {showHeatmap && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-700 animate-pulse">
              ELA HEATMAP ACTIVE
            </span>
          )}
          {showHighContrast && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
              HIGH CONTRAST
            </span>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          <button
            onClick={handleZoomOut}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-10 text-center font-mono text-[11px] text-slate-300">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Toggle Annotations */}
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition ${
              showAnnotations ? 'bg-brand-800 text-brand-100 border border-brand-700' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Bounding Boxes"
          >
            {showAnnotations ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>Boxes</span>
          </button>

          {/* Toggle High Contrast Forensic Filter */}
          <button
            onClick={() => setShowHighContrast(!showHighContrast)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition ${
              showHighContrast ? 'bg-cyan-900 text-cyan-200 border border-cyan-700' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle High-Contrast Forensic Filter for Microprint & Watermark Inspection"
          >
            <Sliders className="w-3 h-3" />
            <span>Contrast</span>
          </button>

          {/* Toggle ELA Heatmap Overlay */}
          {heatmapUrl && (
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                showHeatmap
                  ? 'bg-purple-700 text-white shadow-sm ring-1 ring-purple-400'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title="Toggle Error Level Analysis Heatmap"
            >
              <Layers className="w-3 h-3" />
              <span>ELA Heatmap</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex-1 relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing p-4 bg-slate-950"
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          className="relative max-w-full max-h-full inline-block"
        >
          {/* Base Document Image */}
          <img
            ref={imgRef}
            src={showHeatmap && heatmapUrl ? heatmapUrl : documentUrl}
            alt="Travel document under inspection"
            style={{
              filter: showHighContrast ? 'contrast(220%) grayscale(100%) brightness(90%)' : 'none'
            }}
            className="max-h-[580px] w-auto max-w-full object-contain rounded border border-slate-800 shadow-2xl pointer-events-none transition-all duration-200"
          />

          {/* SVG Overlay for Bounding Boxes and Evidence Pins */}
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
                      fill={isSelected || isHovered ? 'rgba(59, 130, 246, 0.25)' : 'transparent'}
                      stroke={isSelected || isHovered ? '#3b82f6' : 'rgba(148, 163, 184, 0.45)'}
                      strokeWidth={isSelected || isHovered ? 2.5 : 1}
                      strokeDasharray={isSelected || isHovered ? 'none' : '3 3'}
                      className="transition-all hover:fill-blue-500/20 hover:stroke-blue-400"
                    />
                  </g>
                );
              })}

              {/* Forensic Findings Bounding Boxes (Red/Amber Highlight) */}
              {findings.map((finding) => {
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
                    ? 'rgba(239, 68, 68, 0.3)'
                    : 'rgba(245, 158, 11, 0.3)'
                  : 'rgba(239, 68, 68, 0.09)';

                const top = `${finding.bbox_ymin * 100}%`;
                const left = `${finding.bbox_xmin * 100}%`;
                const width = `${(finding.bbox_xmax - finding.bbox_xmin) * 100}%`;
                const height = `${(finding.bbox_ymax - finding.bbox_ymin) * 100}%`;

                return (
                  <g
                    key={finding.id}
                    onClick={() => onSelectFinding && onSelectFinding(finding.id)}
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
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>

      {/* Canvas Footer Status */}
      <div className="px-3 py-1.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span>PAN: DRAG &bull; ZOOM: SCROLL</span>
          {mouseCoords && (
            <span className="text-slate-500">
              COORD: ({mouseCoords.x}, {mouseCoords.y})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showHeatmap ? (
            <span className="text-purple-300">HEATMAP: RED=DISCREPANCY, PURPLE=BASELINE</span>
          ) : (
            <span>CLICK HIGHLIGHTS TO CROSS-EXAMINE</span>
          )}
        </div>
      </div>

    </div>
  );
};
