import React, { useState, useRef } from 'react';
import type { FaceVerificationResult } from '../types';
import { 
  UserCheck, 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  Sliders,
  Scan
} from 'lucide-react';
import { sound } from '../utils/sound';

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
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(liveFaceUrl || null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Derive similarity from prop or local default
  const similarity = faceResult?.similarity ?? 88.5;
  const isMatch = similarity >= similarityThreshold;

  const startCamera = async () => {
    sound.click();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 400, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch {
      setCameraError('Webcam unavailable. Using simulated live presenter capture.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    sound.click();
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 300;
      canvas.height = videoRef.current.videoHeight || 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }
    stopCamera();
    if (onRunMatch) {
      onRunMatch(similarityThreshold);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSimilarityThreshold(val);
    if (onRunMatch) {
      onRunMatch(val);
    }
  };

  return (
    <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-sm p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-500/10 text-cyan-400 rounded-xl border border-blue-500/20">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Biometric Face Verification
              </h3>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700">
                1:1 Matching
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Passport Portrait ↔ Presenter Facial Mesh</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              sound.click();
              setShowLandmarks(!showLandmarks);
            }}
            className={`px-2 py-1 rounded-lg text-[10.5px] font-mono font-semibold border flex items-center space-x-1 transition-colors ${
              showLandmarks 
                ? 'bg-cyan-950/60 border-cyan-800 text-cyan-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Scan className="w-3 h-3" />
            <span className="hidden sm:inline">Landmarks</span>
          </button>

          <span
            className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full ${
              isMatch
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                : 'bg-rose-950/80 text-rose-300 border border-rose-800'
            }`}
          >
            {isMatch ? '✓ VERIFIED MATCH' : '⚠️ MISMATCH ALERT'}
          </span>
        </div>
      </div>

      {/* Side-by-Side Portraits */}
      <div className="grid grid-cols-2 gap-3">
        {/* Document Photo */}
        <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800 flex flex-col items-center">
          <span className="text-[10px] font-mono font-bold text-slate-400 mb-2 uppercase tracking-wider">
            1. PASSPORT PORTRAIT
          </span>
          <div className="relative w-28 h-32 sm:w-32 sm:h-36 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center group shadow-md">
            {documentPhotoUrl ? (
              <img
                src={documentPhotoUrl}
                alt="Document Subject"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCheck className="w-8 h-8 text-slate-600" />
            )}

            {/* Landmark Dots Overlay */}
            {showLandmarks && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Left eye anchor */}
                <div className="absolute top-[38%] left-[34%] w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-300 animate-pulse" />
                {/* Right eye anchor */}
                <div className="absolute top-[38%] left-[64%] w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-300 animate-pulse" />
                {/* Nose bridge */}
                <div className="absolute top-[50%] left-[49%] w-1.5 h-1.5 rounded-full bg-cyan-300" />
                {/* Mouth left */}
                <div className="absolute top-[68%] left-[38%] w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {/* Mouth right */}
                <div className="absolute top-[68%] left-[60%] w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {/* Jaw center */}
                <div className="absolute top-[82%] left-[49%] w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>
            )}

            <span className="absolute bottom-1 right-1 bg-black/75 text-[9px] font-mono font-bold text-cyan-300 px-1.5 py-0.5 rounded border border-white/10">
              DOC ID
            </span>
          </div>
        </div>

        {/* Live Presenter Photo / Webcam */}
        <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800 flex flex-col items-center">
          <span className="text-[10px] font-mono font-bold text-slate-400 mb-2 uppercase tracking-wider">
            2. LIVE PRESENTER
          </span>
          <div className="relative w-28 h-32 sm:w-32 sm:h-36 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center group shadow-md">
            {isCameraActive ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover transform -scale-x-100"
                autoPlay
                playsInline
                muted
              />
            ) : capturedImage ? (
              <img
                src={capturedImage}
                alt="Live Subject"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-8 h-8 text-slate-600" />
            )}

            {/* Landmark Dots Overlay for Presenter */}
            {showLandmarks && !isCameraActive && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[38%] left-[34%] w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-300 animate-pulse" />
                <div className="absolute top-[38%] left-[64%] w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-300 animate-pulse" />
                <div className="absolute top-[50%] left-[49%] w-1.5 h-1.5 rounded-full bg-cyan-300" />
                <div className="absolute top-[68%] left-[38%] w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <div className="absolute top-[68%] left-[60%] w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <div className="absolute top-[82%] left-[49%] w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>
            )}

            {isCameraActive && (
              <span className="absolute top-1 left-1 flex items-center space-x-1 bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded-md animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span>LIVE</span>
              </span>
            )}

            <span className="absolute bottom-1 right-1 bg-black/75 text-[9px] font-mono font-bold text-cyan-300 px-1.5 py-0.5 rounded border border-white/10">
              PRESENTER
            </span>
          </div>

          <div className="mt-2 w-full flex justify-center">
            {isCameraActive ? (
              <button
                onClick={capturePhoto}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
              >
                Snap Photo
              </button>
            ) : (
              <button
                onClick={startCamera}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg border border-slate-700 flex items-center space-x-1.5 transition-colors"
              >
                <Camera className="w-3 h-3 text-cyan-400" />
                <span>Live Cam</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {cameraError && (
        <p className="text-[11px] text-amber-400 bg-amber-950/40 p-2 rounded-lg border border-amber-900 font-mono">
          {cameraError}
        </p>
      )}

      {/* Match Result Banner */}
      <div
        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
          isMatch
            ? 'bg-emerald-950/25 border-emerald-800 text-emerald-300'
            : 'bg-rose-950/25 border-rose-800 text-rose-300'
        }`}
      >
        <div className="flex items-center space-x-2.5">
          {isMatch ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          <div>
            <span className="text-xs font-bold block font-mono">
              {similarity.toFixed(1)}% Cosine Similarity
            </span>
            <span className="text-[11px] opacity-90 block leading-tight">
              {isMatch
                ? 'Facial geometry confirms presenter matches passport portrait.'
                : 'Facial mismatch alert! Presenter does not match passport portrait.'}
            </span>
          </div>
        </div>

        <span
          className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
            isMatch ? 'bg-emerald-900/80 text-white border border-emerald-700' : 'bg-rose-900/80 text-white border border-rose-700'
          }`}
        >
          {isMatch ? 'PASS' : 'FAIL'}
        </span>
      </div>

      {/* Sensitivity Settings */}
      <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-300 font-mono">
          <span className="text-[11px] font-semibold flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Verification Threshold:
          </span>
          <span className="text-cyan-400 font-bold">{similarityThreshold}%</span>
        </div>
        <input
          type="range"
          min="50"
          max="95"
          step="1"
          value={similarityThreshold}
          onChange={handleSliderChange}
          className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>50% (Lenient)</span>
          <span className="text-cyan-400">75% (Standard)</span>
          <span>95% (Strict)</span>
        </div>
      </div>
    </div>
  );
};
