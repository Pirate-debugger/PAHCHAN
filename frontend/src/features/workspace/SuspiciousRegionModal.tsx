import React from 'react';
import {
  AlertTriangle,
  X,
  Cpu,
  Layers,
  ShieldAlert,
  Info
} from 'lucide-react';
import { ForensicFinding } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

interface SuspiciousRegionModalProps {
  finding: ForensicFinding | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SuspiciousRegionModal: React.FC<SuspiciousRegionModalProps> = ({
  finding,
  isOpen,
  onClose
}) => {
  if (!finding) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Forensic Suspicious Region Details" maxWidth="md">
      <div className="space-y-4">
        
        {/* Banner */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
              {finding.title}
            </h4>
            <p className="text-xs text-amber-900 leading-relaxed">
              {finding.explanation}
            </p>
          </div>
        </div>

        {/* Structured Spec Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Anomaly Type</span>
            <span className="text-slate-900 font-bold mt-0.5 block">{finding.category}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Detection Severity</span>
            <span className={`font-bold mt-0.5 block ${
              finding.severity === 'CRITICAL' || finding.severity === 'HIGH' ? 'text-rose-600' : 'text-amber-600'
            }`}>
              {finding.severity}
            </span>
          </div>
        </div>

        {/* Technical Explanation */}
        {finding.technical_details && (
          <div className="p-3.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] space-y-2 border border-slate-800">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800 pb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>Computer Vision Diagnostic Parameters</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {finding.technical_details}
            </p>
          </div>
        )}

        {/* Legal Advisory / Cautious Language Note */}
        <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-900 text-[11px] flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p>
            <strong>Frontline Advisory:</strong> Optical compression anomalies indicate non-uniform digital artifacts. Cross-examine physical document watermarks and substrate fibers before taking enforcement action.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Inspector
          </Button>
        </div>

      </div>
    </Modal>
  );
};
