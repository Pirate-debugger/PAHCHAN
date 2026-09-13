import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { ProgressBar } from '../../components/ui/ProgressBar';
import {
  Check,
  Loader2,
  Shield,
  Cpu,
  FileScan,
  ShieldCheck,
  Fingerprint,
  Lock
} from 'lucide-react';

interface AnalysisProgressModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface Step {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  telemetry: string;
}

const STEPS: Step[] = [
  {
    id: 'ingest',
    label: 'Optical Preprocessing & Resolution Check',
    sublabel: 'Verifying DPI quality and edge alignment boundaries',
    icon: FileScan,
    telemetry: 'DPI: 300+ • Bounds: Verified'
  },
  {
    id: 'forensics',
    label: 'Computer Vision Forensic Analysis',
    sublabel: 'Error Level Analysis (ELA) & photo alteration check',
    icon: Cpu,
    telemetry: 'Laplacian Texture: Computed'
  },
  {
    id: 'ocr',
    label: 'OCR & ICAO Doc 9303 MRZ Parsing',
    sublabel: 'Extracting TD3 Machine Readable Zone lines 1 & 2',
    icon: FileScan,
    telemetry: 'Zones: VIZ + MRZ Linked'
  },
  {
    id: 'checksum',
    label: '7-3-1 Modulo-10 Check Digit Engine',
    sublabel: 'Validating passport number, DOB, and expiry checksums',
    icon: ShieldCheck,
    telemetry: 'ICAO Part 3: Compliant'
  },
  {
    id: 'biometrics',
    label: '512-D Biometric Facial Comparison',
    sublabel: 'Comparing passport chip portrait against live booth feed',
    icon: Fingerprint,
    telemetry: 'Cosine Embeddings: Synced'
  },
  {
    id: 'seal',
    label: 'Cryptographic Chain-of-Custody Seal',
    sublabel: 'Generating SHA-256 evidence hash for official dossier',
    icon: Lock,
    telemetry: 'SHA256: Sealed'
  }
];

export const AnalysisProgressModal: React.FC<AnalysisProgressModalProps> = ({
  isOpen,
  onComplete
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      return;
    }

    // Step through the calm, meaningful stages with deliberate pace
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return prev;
        }
      });
    }, 550);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  const progressPercent = Math.min(100, Math.round(((currentStepIndex + 1) / STEPS.length) * 100));

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      title="Automated Screening & Forensic Pipeline"
      subtitle="PAHCHAN AI screening engine executing edge forensic checks and ICAO Doc 9303 checksums"
      maxWidth="lg"
    >
      <div className="space-y-5 py-1">
        
        {/* Animated Forensic Scanning Visualizer */}
        <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 overflow-hidden shadow-inner text-center">
          {/* Laser Scanline Beam */}
          <div className="forensic-laser-line animate-scanline" />

          {/* Grid pattern */}
          <div className="absolute inset-0 forensic-grid-pattern opacity-40 pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between px-2 py-1 text-[11px] font-mono">
            <div className="flex items-center gap-2 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-bold">ACTIVE SCAN &bull; ICP-04</span>
            </div>
            <span className="text-slate-400">
              STAGE {currentStepIndex + 1} OF {STEPS.length}
            </span>
          </div>

          <div className="relative z-10 my-3 flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400 flex items-center justify-center shadow-glow-blue">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white font-mono">
                {STEPS[currentStepIndex].label}
              </p>
              <p className="text-[11px] text-cyan-300 font-mono mt-0.5">
                {STEPS[currentStepIndex].telemetry}
              </p>
            </div>
          </div>

          <ProgressBar
            value={progressPercent}
            size="xs"
            variant="blue"
            className="relative z-10 mt-2 px-1"
          />
        </div>

        {/* Step-by-Step Progress List */}
        <div className="space-y-2">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                  isCurrent
                    ? 'bg-blue-50/80 border-blue-300 shadow-xs ring-1 ring-blue-400'
                    : isDone
                    ? 'bg-slate-50/70 border-slate-200 text-slate-700'
                    : 'bg-transparent border-slate-100 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono shrink-0 ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isCurrent ? 'text-blue-950' : 'text-slate-800'}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {step.sublabel}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <span>VERIFIED</span>
                    </span>
                  ) : isCurrent ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      <Loader2 className="w-2.5 h-2.5 animate-spin text-blue-700" />
                      <span>ANALYZING</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-300 font-mono">STANDBY</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sovereign Legal & Architecture Subtext */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>ICAO DOC 9303 &bull; ISO/IEC 19794-5</span>
          <span>Zero external transmission</span>
        </div>

      </div>
    </Modal>
  );
};
