import React, { useState, useEffect } from 'react';
import { DemoScenario } from '../../types';
import { api } from '../../services/api';
import { RiskBadge } from '../../components/common/RiskBadge';
import { Button } from '../../components/ui/Button';
import {
  FlaskConical,
  Play,
  AlertOctagon
} from 'lucide-react';

interface DemoLabPageProps {
  onLoadScenario: (scenarioId: string) => Promise<void>;
  loadingScenarioId?: string | null;
}

export const DemoLabPage: React.FC<DemoLabPageProps> = ({
  onLoadScenario,
  loadingScenarioId
}) => {
  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);
  const [_loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

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

  const categories = [
    { id: 'ALL', label: `All Scenarios (${scenarios.length || 10})` },
    { id: 'GENUINE', label: 'Genuine & Authentic' },
    { id: 'PHOTO', label: 'Photo & Image Alteration' },
    { id: 'MRZ', label: 'MRZ & Checksum Discrepancy' },
    { id: 'BIOMETRIC', label: 'Biometric Face Mismatch' },
    { id: 'REGISTRY', label: 'Registry, Watchlist & Outage' }
  ];

  const filteredScenarios = scenarios.filter((s) => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'GENUINE') return s.expected_risk_level === 'LOW';
    if (activeCategory === 'PHOTO') return s.primary_anomaly.toLowerCase().includes('photo') || s.primary_anomaly.toLowerCase().includes('stamp') || s.primary_anomaly.toLowerCase().includes('fabricated');
    if (activeCategory === 'MRZ') return s.primary_anomaly.toLowerCase().includes('mrz') || s.primary_anomaly.toLowerCase().includes('dob') || s.primary_anomaly.toLowerCase().includes('expiry');
    if (activeCategory === 'BIOMETRIC') return s.primary_anomaly.toLowerCase().includes('face') || s.primary_anomaly.toLowerCase().includes('impersonation');
    if (activeCategory === 'REGISTRY') return s.primary_anomaly.toLowerCase().includes('visa') || s.primary_anomaly.toLowerCase().includes('watchlist') || s.primary_anomaly.toLowerCase().includes('duplicate') || s.primary_anomaly.toLowerCase().includes('unverifiable') || s.primary_anomaly.toLowerCase().includes('outage');
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Synthetic Disclaimer Banner */}
      <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4.5 shadow-subtle">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300 shadow-xs">
            <AlertOctagon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
              <span>SYNTHETIC DEMONSTRATION ARTIFACTS &bull; NOT REAL IDENTITY DATA</span>
              <span className="text-[10px] font-mono bg-amber-200/80 px-1.5 py-0.2 rounded text-amber-900 font-bold">
                BENCHMARK LAB
              </span>
            </h2>
            <p className="text-xs text-amber-900 mt-1 leading-relaxed">
              All documents, passport numbers, biographical records, and portraits in this demonstration lab are deterministically generated synthetic artifacts created specifically for evaluating the document screening and forensic verification modules. No real personal identifiable information (PII) is stored or processed.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Header & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <FlaskConical className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Deterministic Demonstration Laboratory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pre-packaged test scenarios demonstrating all core forensic models with 1-click execution for evaluators and officers
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold self-start md:self-auto">
          {scenarios.length || 10} Evaluation Scenarios Ready
        </span>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeCategory === c.id
                ? 'bg-blue-900 text-white font-bold shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 4. Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredScenarios.map((s, idx) => {
          const isLoading = loadingScenarioId === s.id;
          const isGenuine = s.expected_risk_level === 'LOW';

          return (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle hover:shadow-elevated transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Top Row: Index + Expected Risk */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    SCENARIO #{idx + 1}
                  </span>
                  <RiskBadge level={s.expected_risk_level} showScore={false} size="sm" />
                </div>

                {/* Title */}
                <h3 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                  {s.title}
                </h3>

                {/* Primary Anomaly Tag */}
                <div className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 text-slate-800 border border-slate-200 font-semibold">
                  <span>{s.primary_anomaly}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  {s.description}
                </p>
              </div>

              {/* Bottom Action */}
              <div className="mt-6 pt-3.5 border-t border-slate-100">
                <Button
                  variant={isGenuine ? 'success' : 'sovereign'}
                  size="sm"
                  className="w-full"
                  onClick={() => onLoadScenario(s.id)}
                  disabled={isLoading}
                  isLoading={isLoading}
                  leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                >
                  {isLoading ? 'Running Pipeline...' : 'Test Scenario'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
