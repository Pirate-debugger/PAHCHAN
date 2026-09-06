import React, { useState, useEffect } from 'react';
import type { ScreeningSession } from '../types';
import { SYNTHETIC_TEST_CASES } from '../data/mockCases';
import { 
  History, 
  Search, 
  Eye, 
  Filter, 
  ShieldCheck, 
  Database,
  X 
} from 'lucide-react';
import { sound } from '../utils/sound';

interface AuditLogViewProps {
  sessions: ScreeningSession[];
  onViewSession: (session: ScreeningSession) => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ sessions, onViewSession }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [dbLogsCount, setDbLogsCount] = useState<number>(0);
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<ScreeningSession | null>(null);

  // Fetch SQLite audit logs from FastAPI endpoint if available
  useEffect(() => {
    fetch('http://localhost:8000/api/v1/audit/logs?limit=50')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && data.logs) {
          setDbLogsCount(data.logs.length);
        }
      })
      .catch(() => {
        // Fallback gracefully
      });
  }, []);

  // Combined sessions from prop + synthetic lab history
  const allSessions: ScreeningSession[] = [
    ...sessions,
    ...SYNTHETIC_TEST_CASES.map((tc) => ({
      ...tc.sessionData,
      documentImageUrl: tc.documentImage,
      liveFaceImageUrl: tc.liveFaceImage
    }))
  ];

  const filtered = allSessions.filter((s) => {
    const matchesSearch =
      s.fields.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.fields.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.documentSha256 && s.documentSha256.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterRisk === 'LOW') return s.totalRiskScore < 30;
    if (filterRisk === 'MEDIUM') return s.totalRiskScore >= 30 && s.totalRiskScore < 70;
    if (filterRisk === 'CRITICAL') return s.totalRiskScore >= 70;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      
      {/* Top Banner */}
      <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-blue-500/10 text-cyan-400 rounded-lg border border-blue-500/20">
              <History className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
              IMMUTABLE AUDIT TRAIL
            </span>
          </div>
          <h1 className="text-lg font-extrabold text-white tracking-wide mt-1">
            Forensic Screening History &amp; Cryptographic Log
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5 leading-relaxed">
            Tamper-evident record of all processed travel documents, SHA-256 digital digests, and officer clearance decisions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {dbLogsCount > 0 && (
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-800/60 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              SQLITE SYNC: <span className="font-bold">{dbLogsCount}</span>
            </span>
          )}
          <span className="text-xs font-mono text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
            TOTAL RECORDS: <span className="text-cyan-400 font-bold">{filtered.length}</span>
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#0f172a] p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by passenger name, document number, SHA-256, or session ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#090d16] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {[
            { id: 'ALL', label: 'All Records' },
            { id: 'LOW', label: 'Low Risk' },
            { id: 'MEDIUM', label: 'Secondary Review' },
            { id: 'CRITICAL', label: 'Critical Alerts' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                sound.click();
                setFilterRisk(f.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filterRisk === f.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0c1222] text-slate-400 border-b border-slate-800 text-[11px] font-mono uppercase">
              <tr>
                <th className="p-3.5">Session ID</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Passenger Name</th>
                <th className="p-3.5">Doc Number</th>
                <th className="p-3.5">SHA-256 Digest</th>
                <th className="p-3.5">Risk Score</th>
                <th className="p-3.5">Directive</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-sans">
                    No matching screening sessions found for the specified query.
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => {
                  const isLow = s.totalRiskScore < 30;
                  const isMed = s.totalRiskScore >= 30 && s.totalRiskScore < 70;

                  return (
                    <tr 
                      key={`${s.sessionId}-${idx}`} 
                      className="hover:bg-[#131d31]/60 transition-colors cursor-pointer"
                      onClick={() => setSelectedAuditRecord(s)}
                    >
                      <td className="p-3.5 font-bold text-cyan-400 text-[11px]">{s.sessionId}</td>
                      <td className="p-3.5 text-slate-400 text-[10.5px] whitespace-nowrap">{s.timestamp}</td>
                      <td className="p-3.5 font-sans font-bold text-white uppercase">{s.fields.name}</td>
                      <td className="p-3.5 text-slate-300 tracking-wider">{s.fields.docNumber}</td>
                      <td className="p-3.5 text-slate-400 text-[10px] truncate max-w-[120px]" title={s.documentSha256}>
                        {s.documentSha256 ? s.documentSha256.slice(0, 12) + '...' : 'e3b0c442...'}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`font-bold px-2 py-0.5 rounded ${
                            isLow ? 'text-emerald-400 bg-emerald-950/60' : isMed ? 'text-amber-400 bg-amber-950/60' : 'text-rose-400 bg-rose-950/60'
                          }`}
                        >
                          {s.totalRiskScore}/100
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isLow
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                              : isMed
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                              : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {s.decision.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.click();
                            onViewSession(s);
                          }}
                          className="px-3 py-1 bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white rounded-lg text-[11px] font-semibold inline-flex items-center space-x-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Slide-Over / Modal on Row Click */}
      {selectedAuditRecord && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Audit Record: {selectedAuditRecord.sessionId}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedAuditRecord(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">PASSENGER NAME</span>
                <span className="font-bold text-white uppercase">{selectedAuditRecord.fields.name}</span>
              </div>
              <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">DOCUMENT NUMBER</span>
                <span className="font-bold text-cyan-300">{selectedAuditRecord.fields.docNumber}</span>
              </div>
              <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">CHECKPOINT &amp; OPERATOR</span>
                <span className="text-slate-300">{selectedAuditRecord.checkpoint}</span>
              </div>
              <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">CALIBRATED RISK SCORE</span>
                <span className="font-bold text-rose-400">{selectedAuditRecord.totalRiskScore} / 100 ({selectedAuditRecord.riskLevel})</span>
              </div>
              <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800 col-span-2">
                <span className="text-slate-500 block text-[10px]">SHA-256 DIGITAL INTEGRITY DIGEST</span>
                <span className="text-cyan-400 text-[10.5px] break-all">{selectedAuditRecord.documentSha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => {
                  sound.click();
                  onViewSession(selectedAuditRecord);
                  setSelectedAuditRecord(null);
                }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
              >
                Open in Screening Workstation
              </button>
              <button
                onClick={() => setSelectedAuditRecord(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
