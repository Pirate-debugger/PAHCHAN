import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../../types';
import { api } from '../../services/api';
import { History, Search, RefreshCw, ShieldCheck } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSession, setFilterSession] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs(filterSession || undefined);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Immutable Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Traceable chain-of-custody logging all screening actions, OCR events, officer corrections, and decisions
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
              placeholder="Filter by Case ID..."
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-600' : ''}`} />
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Timestamp (UTC)</th>
                <th className="px-4 py-3">Case ID</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Actor / Officer</th>
                <th className="px-5 py-3">Audit Details &amp; Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                      {log.session_id || 'SYSTEM'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {log.actor}
                    </td>
                    <td className="px-5 py-3 text-slate-600 text-[11px]">
                      {log.details || '—'}
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
