import React, { useState } from 'react';
import { 
  MapPin, 
  Save, 
  RotateCcw, 
  Server, 
  Check, 
  Lock, 
  AlertTriangle
} from 'lucide-react';

interface SettingsPanelProps {
  currentCheckpoint: string;
  onCheckpointChange: (cp: string) => void;
}

interface RiskWeightConfig {
  key: string;
  label: string;
  description: string;
  defaultWeight: number;
}

const DEFAULT_WEIGHT_CONFIGS: RiskWeightConfig[] = [
  { key: 'face_mismatch', label: 'Biometric Face Impersonation', description: 'Cosine distance exceeding threshold between passport portrait & presenter', defaultWeight: 40 },
  { key: 'photo_tampering', label: 'Photo Splicing / Substitution', description: 'Quantization error level anomaly and Sobel boundary cuts', defaultWeight: 25 },
  { key: 'expired_doc', label: 'Expired Travel Validity', description: 'Document expiration date preceding current inspection date', defaultWeight: 30 },
  { key: 'dob_mismatch', label: 'Modified Date of Birth / VIZ', description: 'Discrepancy between printed visual zone and MRZ check digits', defaultWeight: 20 },
  { key: 'stamp_anomaly', label: 'Counterfeit Immigration Stamp', description: 'Low structural similarity (SSIM) or non-standard ink spectrum', defaultWeight: 20 },
  { key: 'mrz_inconsistency', label: 'MRZ Checksum Failure', description: 'ICAO Doc 9303 7-3-1 modulo-10 mathematical mismatch', defaultWeight: 20 },
  { key: 'watchlist_hit', label: 'Intelligence Watchlist Alert', description: 'Subject match against local law enforcement bulletin database', defaultWeight: 50 },
  { key: 'metadata_warning', label: 'Software Editing Metadata Footprint', description: 'Presence of digital editing software tags (Photoshop, GIMP)', defaultWeight: 5 }
];

const CHECKPOINTS = [
  { id: 'raxaul', name: 'Raxaul Land Border Checkpoint (Indo-Nepal)', region: 'Indo-Nepal Border (SSB)' },
  { id: 'attari', name: 'Attari-Wagah Integrated Check Post', region: 'Indo-Pakistan Border (BSF/BOI)' },
  { id: 'petrapole', name: 'Petrapole Integrated Check Post', region: 'Indo-Bangladesh Border (BOI)' },
  { id: 'delhi', name: 'Indira Gandhi Int’l Airport (T3)', region: 'Bureau of Immigration (MHA)' },
  { id: 'mumbai', name: 'CSM International Airport (T2)', region: 'Bureau of Immigration (MHA)' }
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  currentCheckpoint,
  onCheckpointChange
}) => {
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    DEFAULT_WEIGHT_CONFIGS.forEach((c) => {
      init[c.key] = c.defaultWeight;
    });
    return init;
  });

  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const handleWeightChange = (key: string, val: number) => {
    setWeights((prev) => ({ ...prev, [key]: Math.max(0, Math.min(100, val)) }));
  };

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleResetDefaults = () => {
    const init: Record<string, number> = {};
    DEFAULT_WEIGHT_CONFIGS.forEach((c) => {
      init[c.key] = c.defaultWeight;
    });
    setWeights(init);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-xs">
      
      {/* Top Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle">
        <h1 className="text-base font-bold text-slate-900 tracking-tight">
          System &amp; Workstation Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Checkpoint duty post configuration, officer profile, accessibility preferences, and administrator calibration.
        </p>
      </div>

      {/* 1. Checkpoint Duty Post & Operator Profile */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-subtle p-5 space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>Active Checkpoint Duty Post</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-slate-600 font-medium block">Select Checkpoint Location</label>
            <select
              value={currentCheckpoint}
              onChange={(e) => onCheckpointChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs text-slate-900 focus:ring-1 focus:ring-blue-600 focus:bg-white transition-colors"
            >
              {CHECKPOINTS.map((cp) => (
                <option key={cp.id} value={cp.name}>
                  {cp.name} — {cp.region}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-600 font-medium block">Active Officer Badge</label>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 font-mono font-semibold flex items-center justify-between">
              <span>OFFICER-SSB-449</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-sans font-medium border border-emerald-200">
                Authenticated
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. System Status & Engine Telemetry */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-subtle p-5 space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
          <Server className="w-4 h-4 text-blue-600" />
          <span>Engine Telemetry &amp; System Health</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
            <span className="text-[10px] text-slate-400 block">CORE PIPELINE</span>
            <span className="font-bold text-slate-900">FastAPI 0.115</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
            <span className="text-[10px] text-slate-400 block">IMAGE FORENSICS</span>
            <span className="font-bold text-slate-900">OpenCV 4.11</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
            <span className="text-[10px] text-slate-400 block">DATABASE LEDGER</span>
            <span className="font-bold text-slate-900">SQLite (WAL)</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
            <span className="text-[10px] text-slate-400 block">OCR VALIDATION</span>
            <span className="font-bold text-slate-900">ICAO Doc 9303</span>
          </div>
        </div>
      </div>

      {/* 3. Advanced Admin / Evaluation Mode (Section 35) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-subtle p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Risk Model Configuration</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
              ADMIN / EVALUATION MODE
            </span>
          </div>

          <button
            onClick={() => setIsAdminUnlocked(!isAdminUnlocked)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              isAdminUnlocked 
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isAdminUnlocked ? 'Lock Controls' : 'Unlock Controls'}
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Risk factor weights determine additive penalty points (0–100) assigned to detected visual, cryptographic, or biometric anomalies. Standard screening officers cannot alter these parameters in operational duty.
        </p>

        {isAdminUnlocked ? (
          <div className="space-y-4 pt-2 animate-in fade-in duration-150">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span className="text-[11px] leading-relaxed">
                <strong>Administrative Mode Active:</strong> Point weights are calibrated heuristics for prototype evaluation. Altering weights directly affects screening severity thresholds.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEFAULT_WEIGHT_CONFIGS.map((cfg) => {
                const currentVal = weights[cfg.key] ?? cfg.defaultWeight;
                return (
                  <div key={cfg.key} className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900">{cfg.label}</span>
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        +{currentVal} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{cfg.description}</p>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={currentVal}
                      onChange={(e) => handleWeightChange(cfg.key, Number(e.target.value))}
                      className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={handleResetDefaults}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Factory Defaults</span>
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                {savedNotice ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
                <span>{savedNotice ? 'Saved Successfully' : 'Apply Configuration'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <Lock className="w-6 h-6 mx-auto mb-1 text-slate-400" />
            <p className="font-medium text-slate-600">Model tuning parameters are locked.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click "Unlock Controls" to access evaluation risk sliders.</p>
          </div>
        )}

      </div>

    </div>
  );
};
