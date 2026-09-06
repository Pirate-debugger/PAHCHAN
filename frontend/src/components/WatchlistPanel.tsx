import React, { useState } from 'react';
import type { WatchlistRecord } from '../types';
import { MOCK_WATCHLIST_RECORDS } from '../data/mockCases';
import { 
  Database, 
  Search, 
  Plus, 
  ShieldAlert, 
  CheckCircle,
  X
} from 'lucide-react';

interface WatchlistPanelProps {
  currentDocNumber?: string;
  currentHolderName?: string;
}

export const WatchlistPanel: React.FC<WatchlistPanelProps> = ({
  currentDocNumber,
  currentHolderName
}) => {
  const [records, setRecords] = useState<WatchlistRecord[]>(MOCK_WATCHLIST_RECORDS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New record form state
  const [newName, setNewName] = useState('');
  const [newDocNum, setNewDocNum] = useState('');
  const [newCategory, setNewCategory] = useState<'TERRORISM' | 'HUMAN_TRAFFICKING' | 'FINANCIAL_CRIME' | 'IMMIGRATION_VIOLATION' | 'INTERPOL_RED_NOTICE'>('HUMAN_TRAFFICKING');
  const [newNotes, setNewNotes] = useState('');

  const filteredRecords = records.filter(
    (r) =>
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDocNum) return;

    const newRecord: WatchlistRecord = {
      id: `W-SSB-${Date.now().toString().slice(-4)}`,
      fullName: newName.toUpperCase(),
      docNumber: newDocNum.toUpperCase(),
      nationality: 'IND',
      dob: '1990-01-01',
      riskCategory: newCategory,
      flaggedBy: 'SSB Intelligence',
      severity: 'CRITICAL',
      alertNotes: newNotes || 'Interception requested by Border Intelligence unit.',
      dateAdded: new Date().toISOString().split('T')[0]
    };

    setRecords([newRecord, ...records]);
    setShowAddModal(false);
    setNewName('');
    setNewDocNum('');
    setNewNotes('');
  };

  const isCurrentHolderFlagged = records.some(
    (r) =>
      r.docNumber.toUpperCase() === currentDocNumber?.toUpperCase() ||
      r.fullName.toUpperCase() === currentHolderName?.toUpperCase()
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0f172a] p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">
              <Database className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Intelligence Database
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Watchlist &amp; Flagged Records
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5 leading-relaxed">
            Central identity watchlist repository synced with Ministry of Home Affairs and INTERPOL notices.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Suspect</span>
        </button>
      </div>

      {/* Active Screening Context Match Indicator */}
      {currentDocNumber && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
            isCurrentHolderFlagged
              ? 'bg-rose-950/30 border-rose-800'
              : 'bg-emerald-950/30 border-emerald-800'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-full ${
                isCurrentHolderFlagged ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
              }`}
            >
              {isCurrentHolderFlagged ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-xs font-semibold text-white">
                Screening Subject: {currentHolderName} ({currentDocNumber})
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isCurrentHolderFlagged
                  ? 'Subject actively matches a flagged bulletin in the registry.'
                  : 'No active watchlist alerts registered for this document or holder.'}
              </p>
            </div>
          </div>

          <span
            className={`text-[11px] font-medium px-2.5 py-1 rounded ${
              isCurrentHolderFlagged ? 'bg-rose-900/80 text-rose-200' : 'bg-emerald-900/80 text-emerald-200'
            }`}
          >
            {isCurrentHolderFlagged ? 'Watchlist Hit' : 'Clear'}
          </span>
        </div>
      )}

      {/* Search & Records Table */}
      <div className="bg-[#0f172a] rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-3.5 bg-[#131d31] border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, document number, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090d16] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <span className="text-xs text-slate-400">
            Records: <strong className="text-slate-200">{records.length}</strong>
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredRecords.map((r) => (
            <div key={r.id} className="p-4 hover:bg-[#131d31]/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white text-xs">{r.fullName}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 font-medium">
                    {r.riskCategory.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded font-mono">
                    {r.id}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px] font-mono">
                  <span>Doc: <strong className="text-slate-300 font-sans">{r.docNumber}</strong></span>
                  <span>•</span>
                  <span>Nat: <strong className="text-slate-300 font-sans">{r.nationality}</strong></span>
                  <span>•</span>
                  <span>DOB: <strong className="text-slate-300 font-sans">{r.dob}</strong></span>
                  <span>•</span>
                  <span>Source: <strong className="text-blue-400 font-sans">{r.flaggedBy}</strong></span>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed pt-0.5">{r.alertNotes}</p>
              </div>

              <div className="flex md:flex-col items-end justify-between space-y-1.5 text-[11px] text-slate-400">
                <span>Added: {r.dateAdded}</span>
                <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded font-medium text-[10px]">
                  Intercept &amp; Detain
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white flex items-center">
                <Plus className="w-4 h-4 mr-1.5 text-blue-400" />
                Add Watchlist Bulletin
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-3">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Suspect Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MOHAMMED RAHMAN"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Passport / Doc Number:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. N9081245"
                  value={newDocNum}
                  onChange={(e) => setNewDocNum(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Risk Category:</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="HUMAN_TRAFFICKING">Human Trafficking Syndicate</option>
                  <option value="INTERPOL_RED_NOTICE">Interpol Red Notice</option>
                  <option value="IMMIGRATION_VIOLATION">Immigration / Visa Forgery</option>
                  <option value="TERRORISM">Counter-Terrorism</option>
                  <option value="FINANCIAL_CRIME">Financial Crime / Fugitive</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Notes &amp; Reason:</label>
                <textarea
                  rows={3}
                  placeholder="Enter reason for flag, suspect details, or warrant reference..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

