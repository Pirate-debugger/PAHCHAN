import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { RiskBadge } from '../../components/common/RiskBadge';
import { FileText, Printer, ArrowRight, RefreshCw } from 'lucide-react';

interface ReportsListPageProps {
  onOpenReport: (caseId: string) => void;
}

export const ReportsListPage: React.FC<ReportsListPageProps> = ({ onOpenReport }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await api.listReports();
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Screening Reports Archive</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Completed identity screenings, signed determinations, and official printable dossiers
          </p>
        </div>
        <button
          onClick={fetchReports}
          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-600' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Report ID</th>
                <th className="px-4 py-3">Subject Name</th>
                <th className="px-4 py-3">Document #</th>
                <th className="px-4 py-3">Risk Assessment</th>
                <th className="px-4 py-3">Officer Determination</th>
                <th className="px-4 py-3">Screening Date</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No completed screening reports yet. Complete a screening decision to generate an official report.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.report_id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3 font-mono font-bold text-slate-900">
                      {r.report_id}
                      {r.is_synthetic && (
                        <span className="ml-1.5 text-[9px] px-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          DEMO
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{r.subject_name}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{r.document_number}</td>
                    <td className="px-4 py-3">
                      <RiskBadge level={r.risk_level} score={r.risk_score} size="sm" />
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                      {r.decision}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {new Date(r.screening_date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => onOpenReport(r.case_id)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-brand-800 hover:bg-brand-900 text-white transition active:scale-95"
                      >
                        <Printer className="w-3 h-3" />
                        <span>View Dossier</span>
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
