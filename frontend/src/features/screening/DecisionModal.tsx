import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { OfficerDecisionType } from '../../types';
import {
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  HelpCircle,
  FileCheck,
  Lock,
  BadgeCheck
} from 'lucide-react';

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
      title: 'Standard Review (Clear Passenger)',
      description: 'Document and biometric checks are authentic. Clear traveler for standard border crossing.',
      icon: ShieldCheck,
      color: 'border-emerald-200 bg-emerald-50/20 text-emerald-800'
    },
    {
      id: 'SECONDARY_REVIEW' as OfficerDecisionType,
      title: 'Refer to Secondary Inspection',
      description: 'Refer traveler to secondary inspection booth for physical forensic & chip examination.',
      icon: AlertTriangle,
      color: 'border-amber-200 bg-amber-50/20 text-amber-800'
    },
    {
      id: 'ESCALATE' as OfficerDecisionType,
      title: 'Escalate to Duty Officer / Supervisor',
      description: 'Critical tampering, duplicate identity, or watchlist signal requires supervisory intervention.',
      icon: UserCheck,
      color: 'border-rose-200 bg-rose-50/20 text-rose-800'
    },
    {
      id: 'INCONCLUSIVE' as OfficerDecisionType,
      title: 'Inconclusive (Request Rescan)',
      description: 'Substrate glare, low resolution, or fold prevents reliable assessment. Request physical rescan.',
      icon: HelpCircle,
      color: 'border-slate-200 bg-slate-50 text-slate-800'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(selectedDecision, notes);
    onClose();
  };

  const quickObservationTags = [
    'Physical substrate intact',
    'Secondary UV examination passed',
    'MRZ check digit verified manually',
    'Impersonation suspected'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Frontline Screening Determination &bull; Case ${caseId}`}
      subtitle="Official officer screening action and immutable audit seal recording"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Decision Options Grid */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
            Select Legal Checkpoint Disposition
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {decisionOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedDecision === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedDecision(opt.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 shadow-sm ring-1 ring-blue-500'
                      : `${opt.color} hover:border-slate-300`
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-700 stroke-[2.4]' : ''}`} />
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

        {/* Officer Observation Notes & Justification */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Official Observation Notes &amp; Legal Justification
            </label>
            <span className="text-[10px] text-slate-400 font-mono">Stamped into Legal Dossier</span>
          </div>

          <div className="flex flex-wrap gap-1 mb-2">
            {quickObservationTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setNotes((prev) => (prev ? `${prev} • ${tag}` : tag))}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
              >
                +{tag}
              </button>
            ))}
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Record observations, physical inspection findings, or specific reasons for secondary referral..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-sans"
          />
        </div>

        {/* Chain-of-Custody Notice */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-[11px] text-slate-600">
          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
          <p className="leading-snug">
            This determination will be permanently signed and anchored to case <strong className="font-mono text-slate-900">{caseId}</strong> under officer credential <span className="font-mono text-slate-800 font-bold">SSB-4821 (Insp. S. Sharma)</span>.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="sovereign"
            size="md"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            leftIcon={<BadgeCheck className="w-4 h-4 stroke-[2.2]" />}
          >
            Sign &amp; Confirm Determination
          </Button>
        </div>

      </form>
    </Modal>
  );
};
