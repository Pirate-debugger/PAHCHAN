import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
  Zap,
  Lock,
  ExternalLink,
  Activity
} from 'lucide-react';
import { ProviderStatusInfo } from '../../types';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';

export const ProviderCenterPage: React.FC = () => {
  const [providers, setProviders] = useState<ProviderStatusInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<Record<string, { latency_ms: number; status: string }>>({});

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await api.getProviders();
      setProviders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handlePing = async (providerId: string) => {
    try {
      setPingingId(providerId);
      const res = await api.pingProvider(providerId);
      setPingResult((prev) => ({
        ...prev,
        [providerId]: { latency_ms: res.latency_ms, status: res.status }
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setPingingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <Server className="w-3.5 h-3.5 text-emerald-600" />
            <span>SOVEREIGN IDENTITY PROVIDER REGISTRY</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Authoritative Provider Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Real-time status, cryptographic capabilities, and sandbox verification gateways connecting PAHCHAN to national registries.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadProviders}
          isLoading={loading}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh Gateways
        </Button>
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((p) => {
          const isConnected = p.status === 'CONNECTED';
          const isSandbox = p.status === 'SANDBOX' || p.status === 'DEMO_SANDBOX';
          const isNotConfigured = p.status === 'NOT_CONFIGURED';
          const pingData = pingResult[p.provider_id];

          return (
            <div
              key={p.provider_id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-3">
                
                {/* Provider Title & Status Pill */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-snug">
                      {p.provider_name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      ID: {p.provider_id}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 shrink-0 ${
                    isConnected
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : isSandbox
                      ? 'bg-amber-50 text-amber-800 border border-amber-300'
                      : 'bg-slate-100 text-slate-600 border border-slate-300'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      isConnected ? 'bg-emerald-500' : isSandbox ? 'bg-amber-500' : 'bg-slate-400'
                    }`} />
                    {isConnected ? '● Connected' : isSandbox ? '● Sandbox' : '○ Not Configured'}
                  </span>
                </div>

                {/* Environment & Configuration State */}
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    ENV: {p.environment}
                  </span>
                  <span className="text-slate-400">&bull;</span>
                  <span className={p.is_configured ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                    {p.is_configured ? 'Credentials Configured' : 'Evaluation Mode'}
                  </span>
                </div>

                {/* Provider Capabilities List */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Capabilities:
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {p.capabilities.map((cap, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />
                        <span className="leading-tight">{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Details Note */}
                {p.details && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-snug">
                    {p.details}
                  </p>
                )}

              </div>

              {/* Card Footer: Last Checked & Ping Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                <div>
                  {pingData ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Latency: {pingData.latency_ms}ms
                    </span>
                  ) : (
                    <span>Last: {new Date(p.last_checked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePing(p.provider_id)}
                  isLoading={pingingId === p.provider_id}
                  leftIcon={<Zap className="w-3 h-3 text-amber-500" />}
                >
                  Test Ping
                </Button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
