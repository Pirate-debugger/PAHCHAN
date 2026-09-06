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
  { id: 1, label: 'Document Ingestion & SHA-256 Fingerprint', detail: 'Computing cryptographic hash and validating file integrity' },
  { id: 2, label: 'OCR Optical Character Recognition', detail: 'Parsing document fields and character bounding coordinates' },
  { id: 3, label: 'ICAO Doc 9303 Checksum Validation', detail: 'Executing 7-3-1 modulo-10 check digit arithmetic on MRZ strings' },
  { id: 4, label: 'Multi-Spectral Forensics (ELA & Gradients)', detail: 'Analyzing JPEG quantization error delta and Sobel boundary cuts' },
  { id: 5, label: 'Biometric Face Verification', detail: 'Extracting 68 facial landmarks and calculating embedding similarity' },
  { id: 6, label: 'Multi-Signal Additive Risk Scoring', detail: 'Evaluating evidence factors and assigning operational directive' }
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Autonomous Screening Pipeline Active
            </h2>
            <p className="text-xs text-slate-400">
              Multi-signal deterministic verification in progress
            </p>
          </div>
        </div>

        {/* Step-by-Step Progress List */}
        <div className="space-y-3 font-mono text-xs">
          {STEPS.map((step) => {
            const isFinished = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div 
                key={step.id} 
                className={`p-2.5 rounded-xl border transition-all flex items-start space-x-3 ${
                  isFinished
                    ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200'
                    : isCurrent
                    ? 'bg-cyan-950/30 border-cyan-500/80 text-cyan-300 shadow-md shadow-cyan-500/10'
                    : 'bg-[#090d16] border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isFinished ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500">
                      {step.id}
                    </span>
                  )}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <span className="font-bold block text-xs tracking-wide">
                    {step.label}
                  </span>
                  <span className={`text-[10.5px] block truncate ${isCurrent ? 'text-slate-300' : 'text-slate-500'}`}>
                    {step.detail}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Status Message */}
        <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>PIPELINE ENGINE: <span className="text-cyan-400 font-bold">PAHCHAN v3.0</span></span>
          <span>STEP {Math.min(currentStep, 6)} OF 6</span>
        </div>
      </div>
    </div>
  );
};
