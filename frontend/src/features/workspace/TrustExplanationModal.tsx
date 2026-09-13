import React from 'react';
import {
  ShieldCheck,
  Lock,
  Cpu,
  FileCheck,
  CheckCircle2,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

interface TrustExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType?: string;
  providerUsed?: string;
}

export const TrustExplanationModal: React.FC<TrustExplanationModalProps> = ({
  isOpen,
  onClose,
  documentType = 'Travel Document',
  providerUsed = 'Income Tax Department / NSDL & ICAO Registry'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Why Should You Trust This Result?" maxWidth="lg">
      <div className="space-y-4 text-slate-700 text-xs">
        
        {/* Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-glow-blue">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">
              Explainable, Evidence-Backed Identity Forensics
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              PAHCHAN evaluates documents through 6 deterministic sovereign security pillars rather than opaque black-box assertions.
            </p>
          </div>
        </div>

        {/* 6 Verification Pillars */}
        <div className="space-y-2">
          <h5 className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            How PAHCHAN Evaluates This {documentType}
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            
            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>1. Document Structure &amp; Layout</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Detects official security substrate, microprinting, government emblem typography, and perimeter margins.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>2. Machine-Readable Data (MRZ/QR)</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Parses ICAO Doc 9303 TD1/TD2/TD3 zones and computes 7-3-1 weight modulus-10 check digits.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Cpu className="w-4 h-4 text-rose-600" />
                <span>3. Optical Tampering Indicators</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Applies Error Level Analysis (ELA) and Laplacian gradient variance to reveal photo splicing and font re-compression.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>4. Authoritative Trusted Sources</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Cross-validates document numbers against active sovereign gateways: {providerUsed}.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>5. Multi-Zone Consistency</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Ensures Visual Inspection Zone (VIZ) matches MRZ text, dates of birth, and identity codes without conflict.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>6. Cryptographic Chain-of-Custody</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Generates a SHA-256 digital evidence seal for legal admissibility in compliance with MHA regulations.
              </p>
            </div>

          </div>
        </div>

        {/* Operational Limitations */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Operational Limitations &amp; Boundary Conditions</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Forensic optical analysis relies on resolution above 200 DPI. In cases where external authority connectivity is temporarily degraded, the system gracefully marks results as <strong>UNVERIFIABLE</strong> rather than falsely classifying documents as counterfeit.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="sovereign" size="sm" onClick={onClose}>
            Understood
          </Button>
        </div>

      </div>
    </Modal>
  );
};
