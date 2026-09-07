import React, { useState, useEffect } from 'react';
import { ScreeningSessionSummary, RiskLevel, SessionStatus } from '../../types';
import { api } from '../../services/api';
import { RiskBadge } from '../../components/common/RiskBadge';
import { StatusPill } from '../../components/common/StatusPill';
import { Search, Filter, ArrowRight, RefreshCw, Plus } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Screening Cases Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active checkpoint cases, identity reviews, and completed screening decisions
          </p>
        </div>

        <button
          onClick={onNewScreening}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-brand-800 hover:bg-brand-900 text-white shadow-sm transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Screening</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'PENDING', 'IN_REVIEW', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-brand-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, passenger name..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
            title="Search"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-600' : ''}`} />
          </button>
        </form>

      </div>

      {/* Main Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Case ID</th>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Primary Concern</th>
                <th className="px-4 py-3">Risk Assessment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date / Time</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {screenings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No screening cases found matching the criteria.
                  </td>
                </tr>
              ) : (
                screenings.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3 font-mono font-bold text-slate-900">
                      {c.id}
                      {c.is_demo_scenario && (
                        <span className="ml-2 text-[9px] font-sans px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                          DEMO
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {c.document_type}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {c.primary_concern || 'No significant concerns'}
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge level={c.risk_level} score={c.total_score} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {new Date(c.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => onOpenCase(c.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-brand-800 hover:bg-brand-900 text-white transition active:scale-95"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
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
