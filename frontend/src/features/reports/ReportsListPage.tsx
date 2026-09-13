import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { RiskBadge } from '../../components/common/RiskBadge';
import { Button } from '../../components/ui/Button';
import { FileText, Printer, RefreshCw } from 'lucide-react';

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
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Legal Screening Reports Archive</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Completed identity screenings, signed legal determinations, and official printable dossiers
          </p>
        </div>
        <button
          onClick={fetchReports}
          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
          title="Refresh Archive"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 font-mono">Report ID</th>
                <th className="px-4 py-3">Subject Name</th>
                <th className="px-4 py-3 font-mono">Document #</th>
                <th className="px-4 py-3">Risk Assessment</th>
                <th className="px-4 py-3">Officer Determination</th>
                <th className="px-4 py-3 font-mono">Screening Date</th>
                <th className="px-5 py-3 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-600 text-sm">No completed screening reports yet</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Complete a screening determination in the workstation to generate an official court-admissible dossier.
                    </p>
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.report_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {r.report_id}
                      {r.is_synthetic && (
                        <span className="ml-1.5 text-[9px] px-1 rounded bg-amber-50 text-amber-800 border border-amber-300 font-bold">
                          DEMO
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{r.subject_name}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{r.document_number}</td>
                    <td className="px-4 py-3.5">
                      <RiskBadge level={r.risk_level} score={r.risk_score} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-800">
                      {r.decision}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(r.screening_date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => onOpenReport(r.case_id)}
                        leftIcon={<Printer className="w-3.5 h-3.5" />}
                      >
                        View Dossier
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
