import React from 'react';
import {
  UploadCloud,
  Cpu,
  FileScan,
  ShieldCheck,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  XCircle
} from 'lucide-react';

export type StageId = 'upload' | 'analyze' | 'extract' | 'validate' | 'verify' | 'result';
export type StageStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'warning';

export interface StageConfig {
  id: StageId;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: StageStatus;
  meta?: string;
}

export interface VerificationStepperProps {
  currentStage: StageId;
  stages?: StageConfig[];
  onStageClick?: (stageId: StageId) => void;
  className?: string;
  variant?: 'horizontal' | 'compact' | 'vertical';
}

export const DEFAULT_STAGES: Omit<StageConfig, 'status'>[] = [
  {
    id: 'upload',
    label: 'Upload',
    description: 'Document ingestion & scan',
    icon: UploadCloud
  },
  {
    id: 'analyze',
    label: 'Analyze',
    description: 'Optical forensics & ELA',
    icon: Cpu
  },
  {
    id: 'extract',
    label: 'Extract',
    description: 'OCR & ICAO MRZ fields',
    icon: FileScan
  },
  {
    id: 'validate',
    label: 'Validate',
    description: '7-3-1 Modulo-10 checks',
    icon: ShieldCheck
  },
  {
    id: 'verify',
    label: 'Verify',
    description: 'Biometrics & registry',
    icon: Fingerprint
  },
  {
    id: 'result',
    label: 'Result',
    description: 'Cryptographic dossier',
    icon: CheckCircle2
  }
];

export const VerificationStepper: React.FC<VerificationStepperProps> = ({
  currentStage,
  stages,
  onStageClick,
  className = '',
  variant = 'horizontal'
}) => {
  const stageOrder: StageId[] = ['upload', 'analyze', 'extract', 'validate', 'verify', 'result'];
  const currentIndex = stageOrder.indexOf(currentStage);

  // Compute stage list with statuses if not explicitly passed
  const resolvedStages: StageConfig[] = (stages || DEFAULT_STAGES.map((s, idx) => {
    let status: StageStatus = 'pending';
    if (idx < currentIndex) status = 'completed';
    else if (idx === currentIndex) status = 'processing';
    return { ...s, status };
  }));

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 bg-slate-900/90 text-white px-3 py-1.5 rounded-lg border border-slate-800 ${className}`}>
        {resolvedStages.map((stage, idx) => {
          const Icon = stage.icon;
          const isCurrent = stage.id === currentStage;
          const isCompleted = stage.status === 'completed';

          return (
            <React.Fragment key={stage.id}>
              <div
                onClick={() => onStageClick && onStageClick(stage.id)}
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded cursor-pointer transition ${
                  isCurrent
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : isCompleted
                    ? 'text-emerald-400 hover:text-emerald-300'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
                title={`${stage.label}: ${stage.description}`}
              >
                {stage.status === 'processing' ? (
                  <Loader2 className="w-3 h-3 animate-spin text-blue-300" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Icon className="w-3 h-3" />
                )}
                <span>{stage.label}</span>
              </div>
              {idx < resolvedStages.length - 1 && (
                <span className="text-slate-600 text-xs select-none">&rarr;</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`w-full bg-white rounded-xl border border-slate-200 p-4 shadow-subtle ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative">
        {resolvedStages.map((stage, idx) => {
          const Icon = stage.icon;
          const isCurrent = stage.id === currentStage;
          const isCompleted = stage.status === 'completed';
          const isFailed = stage.status === 'failed';
          const isWarning = stage.status === 'warning';
          const isProcessing = stage.status === 'processing';

          return (
            <div
              key={stage.id}
              onClick={() => onStageClick && onStageClick(stage.id)}
              className={`relative p-3 rounded-xl border transition-all ${
                onStageClick ? 'cursor-pointer' : ''
              } ${
                isCurrent
                  ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500'
                  : isCompleted
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : isFailed
                  ? 'border-rose-300 bg-rose-50/40'
                  : isWarning
                  ? 'border-amber-300 bg-amber-50/40'
                  : 'border-slate-200 bg-slate-50/50 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold text-slate-400">
                  0{idx + 1}
                </span>

                {/* State Marker */}
                {isProcessing ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-full">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    <span>Active</span>
                  </span>
                ) : isCompleted ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                    <CheckCircle2 className="w-2.5 h-2.5 stroke-[2.5]" />
                    <span>Done</span>
                  </span>
                ) : isFailed ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded-full">
                    <XCircle className="w-2.5 h-2.5" />
                    <span>Alert</span>
                  </span>
                ) : isWarning ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-full">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>Review</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">Queue</span>
                )}
              </div>

              {/* Icon & Label */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isFailed
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{stage.label}</h4>
                  <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                    {stage.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
