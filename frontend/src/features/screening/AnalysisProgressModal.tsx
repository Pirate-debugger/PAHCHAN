import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Check, Loader2, Shield } from 'lucide-react';

interface AnalysisProgressModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface Step {
  id: string;
  label: string;
}

const STEPS: Step[] = [
  { id: 'read', label: 'Reading document' },
  { id: 'extract', label: 'Extracting information' },
  { id: 'validity', label: 'Checking document validity' },
  { id: 'integrity', label: 'Analyzing document integrity' },
  { id: 'face', label: 'Comparing face biometrics' },
  { id: 'result', label: 'Preparing screening result' }
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

    // Step through the calm meaningful stages
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      title="Automated Screening in Progress"
      subtitle="PAHCHAN AI Pipeline analyzing document structure and security signals"
      maxWidth="md"
    >
      <div className="space-y-6 py-2">
        
        {/* Calm Central Emblem */}
        <div className="flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 shadow-sm">
            <Shield className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        {/* Step-by-Step Progress List */}
        <div className="space-y-3 px-2">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={step.id}
                className={`flex items-center justify-between py-1.5 px-3 rounded-lg text-xs transition-colors ${
                  isCurrent
                    ? 'bg-brand-50/80 text-brand-950 font-semibold border border-brand-200/60'
                    : isDone
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-brand-800 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                  </div>
                  <span>{step.label}</span>
                </div>

                <div>
                  {isDone ? (
                    <span className="text-emerald-700 font-medium">✓ Done</span>
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-700" />
                  ) : (
                    <span className="text-slate-300">&bull;&bull;&bull;</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Informational Subtext */}
        <p className="text-center text-[11px] text-slate-400">
          Running local forensic models and ICAO Doc 9303 checksum verification...
        </p>

      </div>
    </Modal>
  );
};
