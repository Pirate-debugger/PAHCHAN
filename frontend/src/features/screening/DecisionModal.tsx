import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { OfficerDecisionType } from '../../types';
import { ShieldCheck, UserCheck, AlertTriangle, HelpCircle, FileCheck } from 'lucide-react';

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  onConfirm: (decision: OfficerDecisionType, notes?: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  isOpen,
  onClose,
  caseId,
  onConfirm,
  isSubmitting = false
}) => {
  const [selectedDecision, setSelectedDecision] = useState<OfficerDecisionType>('STANDARD_REVIEW');
  const [notes, setNotes] = useState('');

  const decisionOptions = [
    {
      id: 'STANDARD_REVIEW' as OfficerDecisionType,
      title: 'Standard Review',
      description: 'Document and identity checks are satisfactory. Proceed with standard checkpoint protocol.',
      icon: ShieldCheck,
      color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/20'
    },
    {
      id: 'SECONDARY_REVIEW' as OfficerDecisionType,
      title: 'Secondary Review',
      description: 'Refer passenger and document to secondary inspection booth for physical verification.',
      icon: AlertTriangle,
      color: 'border-amber-200 hover:border-amber-400 bg-amber-50/20'
    },
    {
      id: 'ESCALATE' as OfficerDecisionType,
      title: 'Escalate to Supervisor',
      description: 'Significant tampering, duplicate identity, or watchlist signal requires supervisory intervention.',
      icon: UserCheck,
      color: 'border-rose-200 hover:border-rose-400 bg-rose-50/20'
    },
    {
      id: 'INCONCLUSIVE' as OfficerDecisionType,
      title: 'Inconclusive (Request Rescan)',
      description: 'Image quality or physical condition prevents reliable assessment. Request physical document rescan.',
      icon: HelpCircle,
      color: 'border-slate-200 hover:border-slate-400 bg-slate-50'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(selectedDecision, notes);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Screening Determination &mdash; Case ${caseId}`}
      subtitle="Authorized Officer Screening Action & Audit Log Recording"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Decision Options Grid */}
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold text-slate-700">
            Select Screening Determination
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {decisionOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedDecision === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedDecision(opt.id)}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-800 bg-brand-50/40 shadow-sm ring-1 ring-brand-700'
                      : opt.color
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-800' : 'text-slate-600'}`} />
                    <span className="text-xs font-bold text-slate-900">{opt.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Officer Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Officer Notes / Justification
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Record observations, physical inspection findings, or specific reasons for referral..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Audit Warning */}
        <p className="text-[11px] text-slate-400">
          This determination will be permanently stamped in the immutable audit log with officer credential <span className="font-mono text-slate-600">SSB-4821</span>.
        </p>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-brand-800 hover:bg-brand-900 text-white shadow transition active:scale-95"
          >
            <FileCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Recording...' : 'Confirm Determination'}</span>
          </button>
        </div>

      </form>
    </Modal>
  );
};
