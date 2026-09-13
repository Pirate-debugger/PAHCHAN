import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../../types';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { History, Search, RefreshCw, ShieldCheck, Lock } from 'lucide-react';

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
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Immutable Audit Trail</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Traceable cryptographic chain-of-custody logging all screening actions, OCR events, officer corrections, and determinations
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
              placeholder="Filter by Case ID..."
              className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
          </div>
          <button
            type="submit"
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
            title="Refresh Audit Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 font-mono">Timestamp (UTC)</th>
                <th className="px-4 py-3 font-mono">Case ID</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Actor / Officer</th>
                <th className="px-5 py-3">Audit Details &amp; Legal Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-600 text-sm">No audit records found</p>
                    <p className="text-xs text-slate-400 mt-1">Actions taken across all terminals will appear here in cryptographic sequence</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                      {log.session_id || 'SYSTEM'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-800 font-medium">
                      {log.actor}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-[11px] max-w-md">
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
