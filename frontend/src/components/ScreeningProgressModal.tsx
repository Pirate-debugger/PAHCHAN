import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Cpu 
} from 'lucide-react';

interface ScreeningProgressModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface StepItem {
  id: number;
  label: string;
  detail: string;
}

const STEPS: StepItem[] = [
  { id: 1, label: 'Document Ingestion & SHA-256 Digest', detail: 'Computing cryptographic hash and checking file boundary' },
  { id: 2, label: 'Optical Character Extraction (OCR)', detail: 'Extracting visual fields and bounding coordinates' },
  { id: 3, label: 'ICAO Doc 9303 Checksums', detail: 'Executing 7-3-1 modulo-10 check digit verification on MRZ' },
  { id: 4, label: 'Multi-Spectral Image Forensics', detail: 'Evaluating Error Level Analysis (ELA) and edge gradient cuts' },
  { id: 5, label: 'Biometric Face Comparison', detail: 'Comparing passport portrait against presenter capture' },
  { id: 6, label: 'Calibrated Risk Scoring', detail: 'Evaluating additive factors and operational recommendation' }
];

export const ScreeningProgressModal: React.FC<ScreeningProgressModalProps> = ({ isOpen, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= STEPS.length) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return prev;
        }
        return prev + 1;
      });
    }, 280);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-5 space-y-4 shadow-xl animate-in zoom-in-95 duration-150 text-xs">
        
        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
          <div className="p-2 rounded bg-blue-50 text-blue-600">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Screening Pipeline Active
            </h2>
            <p className="text-slate-500 text-xs">
              Automated multi-signal verification in progress
            </p>
          </div>
        </div>

        {/* Step-by-Step Progress List */}
        <div className="space-y-2 font-sans">
          {STEPS.map((step) => {
            const isFinished = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div 
                key={step.id} 
                className={`p-2.5 rounded border transition-colors flex items-start space-x-3 ${
                  isFinished
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : isCurrent
                    ? 'bg-blue-50/80 border-blue-200 text-blue-950 shadow-2xs'
                    : 'bg-slate-50/50 border-slate-100 text-slate-400'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isFinished ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                      {step.id}
                    </span>
                  )}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <span className={`font-semibold block text-xs ${isCurrent ? 'text-blue-900 font-bold' : ''}`}>
                    {step.label}
                  </span>
                  <span className={`text-[11px] block truncate ${isCurrent ? 'text-blue-800' : isFinished ? 'text-slate-600' : 'text-slate-400'}`}>
                    {step.detail}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Status */}
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>PIPELINE ENGINE: <strong className="text-slate-800">PAHCHAN v4.0</strong></span>
          <span>STEP {Math.min(currentStep, 6)} OF 6</span>
        </div>
      </div>
    </div>
  );
};
