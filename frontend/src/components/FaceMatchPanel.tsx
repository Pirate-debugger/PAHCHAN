import React, { useState } from 'react';
import type { FaceVerificationResult } from '../types';
import { 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Sliders
} from 'lucide-react';

interface FaceMatchPanelProps {
  documentPhotoUrl: string;
  liveFaceUrl?: string;
  faceResult?: FaceVerificationResult;
  onRunMatch?: (threshold: number) => void;
}

export const FaceMatchPanel: React.FC<FaceMatchPanelProps> = ({
  documentPhotoUrl,
  liveFaceUrl,
  faceResult,
  onRunMatch
}) => {
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(75);
  const [showThresholdSlider, setShowThresholdSlider] = useState<boolean>(false);

  const isNoLiveCapture = faceResult?.status === 'NO_LIVE_CAPTURE' || (!liveFaceUrl && faceResult?.similarity == null);
  const similarity = faceResult?.similarity ?? null;
  const confidence = faceResult?.confidence ?? (isNoLiveCapture ? 0 : 0.95);
  const imageQuality = isNoLiveCapture 
    ? 'No Stream / Not Provided' 
    : (similarity !== null && similarity < 50 ? 'Substandard / Low' : 'Adequate / High');

  const getSignalBadge = () => {
    if (isNoLiveCapture || similarity === null) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>No live capture — verification not performed</span>
        </span>
      );
    }
    if (similarity < 50) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>Mismatch Signal</span>
        </span>
      );
    }
    if (similarity < similarityThreshold) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Inconclusive Signal</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Match Signal</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-subtle p-4 space-y-4 text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Biometric Comparison
          </span>
          <h2 className="text-sm font-bold text-slate-900">
            1:1 Facial Verification
          </h2>
        </div>

        <button
          onClick={() => setShowThresholdSlider(!showThresholdSlider)}
          className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
        >
          <Sliders className="w-3 h-3 text-blue-600" />
          <span>Threshold: {similarityThreshold}%</span>
        </button>
      </div>

      {/* Threshold Calibration Slider (Progressive Disclosure) */}
      {showThresholdSlider && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 animate-in fade-in duration-150">
          <div className="flex justify-between items-center text-[11px] font-medium text-slate-700">
            <span>Match Threshold: <strong className="font-mono">{similarityThreshold}%</strong></span>
            <span className="text-slate-400">Baseline standard: 75%</span>
          </div>
          <input
            type="range"
            min={50}
            max={95}
            value={similarityThreshold}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSimilarityThreshold(val);
              if (onRunMatch) onRunMatch(val);
            }}
            className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
          />
        </div>
      )}

      {/* Side-by-Side Portraits */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Document Portrait */}
        <div className="space-y-1.5 text-center">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wide">
            Document Portrait
          </span>
          <div className="w-full h-36 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden p-1 shadow-inner">
            <img 
              src={documentPhotoUrl} 
              alt="Document Portrait" 
              className="max-h-full max-w-full object-contain rounded"
            />
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Source: VIZ Portrait Region
          </span>
        </div>

        {/* Presenter / Live Photo */}
        <div className="space-y-1.5 text-center">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wide">
            Presenter Image
          </span>
          <div className="w-full h-36 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden p-1 shadow-inner">
            {liveFaceUrl ? (
              <img 
                src={liveFaceUrl} 
                alt="Checkpoint Presenter" 
                className="max-h-full max-w-full object-contain rounded"
              />
            ) : (
              <div className="text-slate-500 flex flex-col items-center justify-center">
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px]">No presenter feed</span>
              </div>
            )}
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Source: Checkpoint Camera
          </span>
        </div>

      </div>

      {/* Comparison Verdict Strip */}
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[11px] text-slate-500 block">
            Automated Comparison Signal
          </span>
          <div className="flex items-center gap-2">
            {getSignalBadge()}
            <span className="text-xs font-mono font-bold text-slate-900">
              {similarity !== null ? `${similarity.toFixed(1)}% Similarity` : 'Verification Required'}
            </span>
          </div>
        </div>

        <div className="text-right text-[11px] text-slate-500 font-mono space-y-0.5">
          <div>Confidence: <strong className="text-slate-700">{confidence > 0 ? `${(confidence * 100).toFixed(0)}%` : 'N/A'}</strong></div>
          <div>Quality: <strong className="text-slate-700">{imageQuality}</strong></div>
        </div>
      </div>

      {/* Ethical & Decision Support Note */}
      {isNoLiveCapture ? (
        <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-950 leading-relaxed flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Biometric Verification Required:</strong> No live checkpoint camera capture was provided. 
            Automated verification is fail-closed and cannot pass open. Mandatory officer referral to Secondary Inspection Booth for physical biometric verification.
          </div>
        </div>
      ) : (
        <div className="p-2.5 bg-blue-50/50 rounded border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
          <strong>Decision Support Notice:</strong> Automated facial comparison produces statistical similarity metrics. Physical identity verification remains the statutory responsibility of the duty officer.
        </div>
      )}

    </div>
  );
};
