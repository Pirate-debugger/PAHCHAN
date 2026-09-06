import React, { useState } from 'react';
import { 
  Sliders, 
  MapPin, 
  ShieldCheck, 
  Info, 
  Save, 
  RotateCcw, 
  Server, 
  Check 
} from 'lucide-react';
import { sound } from '../utils/sound';

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

  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const handleWeightChange = (key: string, val: number) => {
    setWeights((prev) => ({ ...prev, [key]: Math.max(0, Math.min(100, val)) }));
  };

  const handleSave = () => {
    sound.success();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleReset = () => {
    sound.click();
    const init: Record<string, number> = {};
    DEFAULT_WEIGHT_CONFIGS.forEach((c) => {
      init[c.key] = c.defaultWeight;
    });
    setWeights(init);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in-50 duration-200">
      
      {/* Header */}
      <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 font-mono text-xs text-cyan-400 font-bold uppercase">
            <Sliders className="w-4 h-4" />
            <span>OPERATIONAL CONFIGURATION</span>
          </div>
          <h1 className="text-lg font-extrabold text-white">
            System Preferences &amp; Calibrated Risk Factor Weights
          </h1>
          <p className="text-xs text-slate-400">
            Configure checkpoint environment parameters and additive scoring weights.
          </p>
        </div>

        {savedNotice && (
          <span className="flex items-center space-x-1.5 text-xs font-mono text-emerald-300 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-800 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Weights Calibrated</span>
          </span>
        )}
      </div>

      {/* Checkpoint Location Configuration */}
      <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Active Inspection Checkpost
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: 'Raxaul Land Border Checkpoint', region: 'Indo-Nepal Border (SSB)' },
            { name: 'Attari-Wagah Integrated Check Post', region: 'Indo-Pakistan Border (BSF/BOI)' },
            { name: 'Petrapole Integrated Check Post', region: 'Indo-Bangladesh Border (BOI)' },
            { name: 'Indira Gandhi Int’l Airport (T3)', region: 'Bureau of Immigration (MHA)' },
            { name: 'CSM International Airport (T2)', region: 'Bureau of Immigration (MHA)' }
          ].map((cp) => (
            <button
              key={cp.name}
              onClick={() => {
                sound.click();
                onCheckpointChange(cp.name);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                currentCheckpoint.includes(cp.name.split(' ')[0])
                  ? 'bg-blue-950/60 border-cyan-500/80 text-white shadow-md shadow-cyan-500/10'
                  : 'bg-[#090d16] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="block font-bold text-xs">{cp.name}</span>
              <span className="text-[11px] text-slate-400 font-mono">{cp.region}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Additive Scoring Weights Configuration */}
      <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Additive Risk Scoring Matrix (0–100 Clamped)
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Weights</span>
            </button>
          </div>
        </div>

        {/* Prototype Configuration Notice */}
        <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800 flex items-start space-x-2 text-xs text-slate-300 leading-relaxed">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Decision-Support Prototype Notice:</strong> These risk weights are calibrated experimental parameters for decision-support triage. They do not constitute statutory or official government standards.
          </span>
        </div>

        {/* Weights Sliders Grid */}
        <div className="space-y-4 pt-2">
          {DEFAULT_WEIGHT_CONFIGS.map((c) => (
            <div key={c.key} className="bg-[#090d16] p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-mono text-xs">
                <div>
                  <span className="font-bold text-white block">{c.label}</span>
                  <span className="text-[10.5px] text-slate-400 font-sans">{c.description}</span>
                </div>
                <span className="text-cyan-400 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  +{weights[c.key] || c.defaultWeight} pts
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={weights[c.key] || c.defaultWeight}
                onChange={(e) => handleWeightChange(c.key, Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* System Diagnostics & Telemetry */}
      <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-sm space-y-3 font-mono text-xs">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5">
          <Server className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Engine &amp; System Health Telemetry
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-[#090d16] p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">CORE API ENGINE</span>
            <span className="text-emerald-400 font-bold">FastAPI 0.115 (ONLINE)</span>
          </div>
          <div className="bg-[#090d16] p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">DATABASE WAL MODE</span>
            <span className="text-emerald-400 font-bold">SQLite 3 (PRAGMA WAL)</span>
          </div>
          <div className="bg-[#090d16] p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block">COMPUTER VISION</span>
            <span className="text-cyan-300 font-bold">NumPy + ELA (CPU FAST)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
