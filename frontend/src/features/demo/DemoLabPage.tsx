import React, { useState, useEffect } from 'react';
import { DemoScenario } from '../../types';
import { api } from '../../services/api';
import { RiskBadge } from '../../components/common/RiskBadge';
import { FlaskConical, Play, Sparkles, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

interface DemoLabPageProps {
  onLoadScenario: (scenarioId: string) => Promise<void>;
  loadingScenarioId?: string | null;
}

export const DemoLabPage: React.FC<DemoLabPageProps> = ({
  onLoadScenario,
  loadingScenarioId
}) => {
  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setLoading(true);
        const data = await api.listDemoScenarios();
        setScenarios(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchScenarios();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Prominent Ethical & Synthetic Disclaimer Banner */}
      <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              SYNTHETIC DEMONSTRATION DOCUMENTS &bull; NOT REAL IDENTITY DOCUMENTS
            </h2>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              All documents, passport numbers, identity records, and photographs in this demonstration laboratory are deterministically generated synthetic artifacts created specifically for evaluating the Smart India Hackathon (SIH 2026 Problem Statement SIH2026188) screening modules.
            </p>
          </div>
        </div>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-brand-700" />
            <h1 className="text-xl font-bold text-slate-900">Deterministic Demonstration Lab</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            1-Click evaluation test cases for judges and officers &mdash; click any scenario to launch the automated AI pipeline
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold self-start md:self-auto">
          8 Evaluation Scenarios Ready
        </span>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.map((s, idx) => {
          const isLoading = loadingScenarioId === s.id;
          return (
            <div
              key={s.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Index + Expected Risk */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    #{idx + 1}
                  </span>
                  <RiskBadge level={s.expected_risk_level} showScore={false} size="sm" />
                </div>

                {/* Title */}
                <h3 className="text-xs font-bold text-slate-900 leading-snug">
                  {s.title}
                </h3>

                {/* Primary Anomaly Tag */}
                <div className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                  {s.primary_anomaly}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  {s.description}
                </p>
              </div>

              {/* Bottom Action */}
              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onLoadScenario(s.id)}
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-brand-800 hover:bg-brand-900 text-white transition active:scale-95 disabled:bg-slate-300"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Running Pipeline...' : 'Test Scenario'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
