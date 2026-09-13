import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  ChevronRight,
  Layers,
  Fingerprint,
  FileCheck,
  Cpu,
  Building2,
  Info
} from 'lucide-react';
import { RiskLevel, RiskPillarBreakdown } from '../../types';

interface InteractiveRiskScoreProps {
  totalScore: number; // 0 - 100
  riskLevel: RiskLevel;
  confidenceScore: number; // 0 - 100
  breakdown: RiskPillarBreakdown;
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
  primaryConcern?: string;
  recommendation?: string;
}

export const InteractiveRiskScore: React.FC<InteractiveRiskScoreProps> = ({
  totalScore,
  riskLevel,
  confidenceScore,
  breakdown,
  selectedCategory,
  onSelectCategory,
  primaryConcern,
  recommendation
}) => {
  const [showConfidenceTooltip, setShowConfidenceTooltip] = useState(false);
  const [showRiskTooltip, setShowRiskTooltip] = useState(false);

  // Status configuration
  let badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  let gaugeColor = '#059669'; // Emerald
  let label = 'LOW RISK';

  if (riskLevel === 'REVIEW') {
    badgeBg = 'bg-amber-50 text-amber-900 border-amber-300';
    gaugeColor = '#d97706';
    label = 'SECONDARY REVIEW';
  } else if (riskLevel === 'HIGH') {
    badgeBg = 'bg-rose-50 text-rose-900 border-rose-300';
    gaugeColor = '#dc2626';
    label = 'HIGH RISK';
  } else if (riskLevel === 'CRITICAL') {
    badgeBg = 'bg-purple-50 text-purple-950 border-purple-300';
    gaugeColor = '#7e22ce';
    label = 'CRITICAL TAMPER';
  }

  const pillars = [
    {
      id: 'document_integrity',
      label: 'Document Integrity',
      value: breakdown.document_integrity,
      icon: Layers,
      description: 'Physical substrate, microprinting, ICAO 7-3-1 check digits'
    },
    {
      id: 'issuer_verification',
      label: 'Issuer Verification',
      value: breakdown.issuer_verification,
      icon: Building2,
      description: 'Authoritative registry match (DigiLocker, ITD, MEA, MoRTH)'
    },
    {
      id: 'field_consistency',
      label: 'Field Consistency',
      value: breakdown.field_consistency,
      icon: FileCheck,
      description: 'Cross-zone validation between VIZ, MRZ, and barcode'
    },
    {
      id: 'image_forensics',
      label: 'Image Forensics',
      value: breakdown.image_forensics,
      icon: Cpu,
      description: 'Error Level Analysis (ELA), edge discontinuity, splicing'
    },
    {
      id: 'identity_match',
      label: 'Identity Match',
      value: breakdown.identity_match,
      icon: Fingerprint,
      description: '512-D face cosine similarity & historical duplicate registry'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-5 space-y-4">
      
      {/* Header with Tooltip Explanations */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Operational Risk Assessment</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Click any category to filter evidence</p>
        </div>

        {/* Confidence vs Risk explanation badge */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowConfidenceTooltip(!showConfidenceTooltip)}
            onMouseEnter={() => setShowConfidenceTooltip(true)}
            onMouseLeave={() => setShowConfidenceTooltip(false)}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 transition-colors p-1"
            title="Understanding Confidence vs Risk"
          >
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Confidence vs Risk</span>
          </button>

          {showConfidenceTooltip && (
            <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-slate-900 text-white rounded-xl shadow-modal text-xs z-40 border border-slate-800 space-y-2">
              <div className="font-bold text-cyan-300 border-b border-slate-800 pb-1">
                Confidence Score ({confidenceScore}%)
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Represents model certainty based on image resolution, optical clarity, and successful OCR zone extraction.
              </p>
              <div className="font-bold text-amber-300 border-b border-slate-800 pb-1 pt-1">
                Risk Score ({totalScore} pts)
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Represents security concern based on ICAO checksum failure, ELA tampering anomalies, or identity mismatches.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hero Risk Score Dial & Dual Metric Display */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
        
        {/* Radial Score Gauge */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeWidth="3.5"
                strokeDasharray={`${totalScore}, 100`}
                strokeLinecap="round"
                stroke={gaugeColor}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-mono text-xl font-black text-slate-900 leading-none">{totalScore}</span>
              <span className="text-[9px] font-bold text-slate-400 mt-0.5">/100</span>
            </div>
          </div>

          <div>
            <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-black tracking-wider uppercase border inline-block ${badgeBg}`}>
              {label}
            </span>
            <p className="text-xs text-slate-600 font-medium mt-1">
              {primaryConcern || 'Document conforms to standard baseline'}
            </p>
          </div>
        </div>

        {/* Dual Confidence vs Risk readout */}
        <div className="flex items-center gap-4 text-center sm:text-right w-full sm:w-auto justify-around sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Confidence
            </span>
            <span className="font-mono text-lg font-black text-slate-900">{confidenceScore}%</span>
            <span className="text-[10px] text-emerald-600 font-semibold block">DPI &amp; Clarity High</span>
          </div>
          <div className="w-px h-8 bg-slate-200 hidden sm:block" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Risk Level
            </span>
            <span className="font-mono text-lg font-black text-slate-900">{totalScore} pts</span>
            <span className="text-[10px] text-slate-500 font-semibold block">
              {totalScore < 30 ? 'Minimal Exposure' : totalScore < 60 ? 'Inspection Req.' : 'Critical Alert'}
            </span>
          </div>
        </div>

      </div>

      {/* 5-Category Risk Pillar Breakdown */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
          <span>PILLAR INTEGRITY ANALYSIS</span>
          <span>SCORE</span>
        </div>

        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          const isSelected = selectedCategory === pillar.id;

          let barColor = 'bg-emerald-500';
          let textColor = 'text-emerald-700';
          if (pillar.value < 70) {
            barColor = 'bg-rose-500';
            textColor = 'text-rose-700';
          } else if (pillar.value < 88) {
            barColor = 'bg-amber-500';
            textColor = 'text-amber-700';
          }

          return (
            <button
              key={pillar.id}
              type="button"
              onClick={() => onSelectCategory?.(isSelected ? null : pillar.id)}
              className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-400 shadow-xs ring-1 ring-blue-400/50'
                  : 'bg-white border-slate-200/80 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-bold text-slate-900">{pillar.label}</span>
                </div>
                <span className={`font-mono text-xs font-black ${textColor}`}>
                  {pillar.value}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${pillar.value}%` }}
                />
              </div>

              <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                {pillar.description}
              </p>
            </button>
          );
        })}
      </div>

    </div>
  );
};
