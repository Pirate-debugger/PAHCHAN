import React from 'react';
import {
  FileText,
  Scan,
  FileScan,
  QrCode,
  CreditCard,
  Layers,
  Cpu,
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Loader2,
  MinusCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { TimelineStep, StepState, TimelineStepId } from '../../types';

interface VerificationTimelineProps {
  steps: TimelineStep[];
  currentStepId?: TimelineStepId;
  overallProgress?: number;
  className?: string;
}

export const STAGE_ICONS: Record<TimelineStepId, React.ComponentType<{ className?: string }>> = {
  received: FileText,
  classify: Scan,
  ocr: FileScan,
  qr: QrCode,
  mrz: CreditCard,
  structure: Layers,
  tamper: Cpu,
  authority: ShieldCheck,
  identity: Users,
  risk: CheckCircle2
};

export const VerificationTimeline: React.FC<VerificationTimelineProps> = ({
  steps,
  currentStepId,
  overallProgress = 0,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-5 flex flex-col h-full ${className}`}>
      
      {/* Timeline Header */}
      <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>10-Stage Verification Pipeline</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Multi-stage automated forensic &amp; authority checks
          </p>
        </div>

        <div className="text-right">
          <span className="font-mono text-sm font-black text-slate-900">{Math.round(overallProgress)}%</span>
          <span className="text-[10px] text-slate-400 block font-sans font-medium">Pipeline Progress</span>
        </div>
      </div>

      {/* Progress Track Bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden my-3">
        <div
          className="bg-blue-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, overallProgress))}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
        {steps.map((step, index) => {
          const Icon = STAGE_ICONS[step.id] || FileText;
          const isCurrent = currentStepId === step.id || step.state === 'PROCESSING';

          // Status icon & badge color
          let statusColor = 'text-slate-400 bg-slate-100 border-slate-200';
          let StatusIcon = Clock;

          if (step.state === 'PASSED') {
            statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-300';
            StatusIcon = CheckCircle2;
          } else if (step.state === 'WARNING') {
            statusColor = 'text-amber-700 bg-amber-50 border-amber-300';
            StatusIcon = AlertTriangle;
          } else if (step.state === 'FAILED') {
            statusColor = 'text-rose-700 bg-rose-50 border-rose-300';
            StatusIcon = XCircle;
          } else if (step.state === 'PROCESSING') {
            statusColor = 'text-blue-700 bg-blue-50 border-blue-400 shadow-glow-blue';
            StatusIcon = Loader2;
          } else if (step.state === 'UNAVAILABLE') {
            statusColor = 'text-slate-500 bg-slate-100 border-slate-300';
            StatusIcon = MinusCircle;
          }

          return (
            <div
              key={step.id}
              className={`p-2.5 rounded-xl border transition-all duration-200 flex items-start gap-3 ${
                isCurrent
                  ? 'bg-blue-50/70 border-blue-300/80 shadow-xs ring-1 ring-blue-400/50'
                  : step.state === 'PASSED'
                  ? 'bg-white border-slate-200/70 hover:bg-slate-50/50'
                  : step.state === 'WARNING'
                  ? 'bg-amber-50/40 border-amber-200/80'
                  : step.state === 'FAILED'
                  ? 'bg-rose-50/40 border-rose-200/80'
                  : 'bg-slate-50/40 border-slate-200/40 opacity-70'
              }`}
            >
              {/* Step Icon Badge */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${statusColor}`}>
                {step.state === 'PROCESSING' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <StatusIcon className="w-3.5 h-3.5 stroke-[2.4]" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={`text-xs font-bold leading-tight truncate ${
                      isCurrent ? 'text-blue-950 font-extrabold' : 'text-slate-900'
                    }`}>
                      {step.label}
                    </span>
                  </div>

                  {/* State Pill */}
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                    step.state === 'PASSED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : step.state === 'WARNING'
                      ? 'bg-amber-100 text-amber-900'
                      : step.state === 'FAILED'
                      ? 'bg-rose-100 text-rose-800'
                      : step.state === 'PROCESSING'
                      ? 'bg-blue-100 text-blue-800 animate-pulse'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {step.state}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  {step.sublabel}
                </p>

                {/* Telemetry output */}
                {step.telemetry && (
                  <div className="mt-1 font-mono text-[10px] text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-slate-200/60 inline-block">
                    {step.telemetry}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
