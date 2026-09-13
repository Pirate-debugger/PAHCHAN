import React, { useState, useEffect } from 'react';
import { ScreeningSessionSummary } from '../../types';
import { api } from '../../services/api';
import { RiskBadge } from '../../components/common/RiskBadge';
import { StatusPill } from '../../components/common/StatusPill';
import { Button } from '../../components/ui/Button';
import { Search, ArrowRight, RefreshCw, Plus, ShieldAlert } from 'lucide-react';

interface ScreeningListPageProps {
  onOpenCase: (caseId: string) => void;
  onNewScreening: () => void;
}

export const ScreeningListPage: React.FC<ScreeningListPageProps> = ({
  onOpenCase,
  onNewScreening
}) => {
  const [screenings, setScreenings] = useState<ScreeningSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchScreenings = async () => {
    try {
      setLoading(true);
      const data = await api.listScreenings(statusFilter, searchQuery);
      setScreenings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreenings();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchScreenings();
  };

  return (
    <div className="space-y-5">
      
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Screening Cases Queue</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active checkpoint dossiers, secondary inspection referrals, and certified legal determinations
          </p>
        </div>

        <Button
          variant="sovereign"
          size="md"
          onClick={onNewScreening}
          leftIcon={<Plus className="w-4 h-4 stroke-[2.4]" />}
        >
          New Screening
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {['ALL', 'PENDING', 'IN_REVIEW', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {status === 'ALL' ? 'All Records' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case ID, passenger name..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
          </div>
          <button
            type="submit"
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
            title="Search"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </form>

      </div>

      {/* Main Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 font-mono">Case ID</th>
                <th className="px-4 py-3">Document Category</th>
                <th className="px-4 py-3">Forensic Finding</th>
                <th className="px-4 py-3">Risk Assessment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 font-mono">Date / Time</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {screenings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-600 text-sm">No screening cases found</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting your filter or search query</p>
                  </td>
                </tr>
              ) : (
                screenings.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {c.id}
                      {c.is_demo_scenario && (
                        <span className="ml-2 text-[9px] font-sans px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-300 font-bold">
                          DEMO
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      {c.document_type}
                    </td>
                    <td className="px-4 py-3.5 text-slate-800 font-semibold max-w-xs truncate">
                      {c.primary_concern || 'No significant concerns'}
                    </td>
                    <td className="px-4 py-3.5">
                      <RiskBadge level={c.risk_level} score={c.total_score} size="sm" />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill status={c.status} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(c.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="sovereign"
                        size="xs"
                        onClick={() => onOpenCase(c.id)}
                        rightIcon={<ArrowRight className="w-3 h-3" />}
                      >
                        Examine
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
