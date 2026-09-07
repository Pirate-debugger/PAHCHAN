import React, { useState, useEffect } from 'react';
import { SystemSettings } from '../../types';
import { api } from '../../services/api';
import { Settings, Save, Shield, AlertCircle, Database, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    risk_threshold_low: 29,
    risk_threshold_review: 59,
    risk_threshold_high: 79,
    enable_demo_watchlist: true,
    demo_watchlist_name: 'Demonstration Verification Source',
    ocr_engine: 'EasyOCR + ICAO Doc 9303',
    face_quality_threshold: 35.0
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await api.getSettings();
        setSettings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">System Configuration &amp; Screening Parameters</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure prototype screening risk thresholds, verification data sources, and OCR engines
        </p>
      </div>

      {/* Threshold Disclaimer Alert */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-xs text-blue-900 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Mandatory Notice:</strong> These risk thresholds and evaluation bands are prototype screening rules designed for decision support. They do not constitute official government statutory decision thresholds unless formally approved by the Ministry of Home Affairs / SSB.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Risk Thresholds Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-700" />
            <span>Screening Risk Score Thresholds (0 &mdash; 100 Scale)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Low Risk Cutoff (Upper Bound)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="10"
                  max="40"
                  value={settings.risk_threshold_low}
                  onChange={(e) =>
                    setSettings({ ...settings, risk_threshold_low: parseInt(e.target.value) || 29 })
                  }
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <span className="text-xs text-slate-400 font-mono">pts</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Scores 0 &mdash; {settings.risk_threshold_low} classified as LOW</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Review Recommended Bound
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="41"
                  max="70"
                  value={settings.risk_threshold_review}
                  onChange={(e) =>
                    setSettings({ ...settings, risk_threshold_review: parseInt(e.target.value) || 59 })
                  }
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <span className="text-xs text-slate-400 font-mono">pts</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Scores {settings.risk_threshold_low + 1} &mdash; {settings.risk_threshold_review} classified as REVIEW</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                High Risk Cutoff
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="71"
                  max="90"
                  value={settings.risk_threshold_high}
                  onChange={(e) =>
                    setSettings({ ...settings, risk_threshold_high: parseInt(e.target.value) || 79 })
                  }
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <span className="text-xs text-slate-400 font-mono">pts</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Scores {settings.risk_threshold_review + 1} &mdash; {settings.risk_threshold_high} HIGH, 80+ CRITICAL</p>
            </div>
          </div>
        </div>

        {/* Verification Source Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-700" />
            <span>Verification Sources &amp; Watchlist Registry</span>
          </h2>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Demonstration Verification Source (SLTD &amp; Watchlist)
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Checks incoming documents against the configured demonstration lost/stolen document registry.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_demo_watchlist}
                onChange={(e) =>
                  setSettings({ ...settings, enable_demo_watchlist: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-700"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Active Registry Label
            </label>
            <input
              type="text"
              value={settings.demo_watchlist_name}
              onChange={(e) =>
                setSettings({ ...settings, demo_watchlist_name: e.target.value })
              }
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Explicit label displayed in reports and audit logs to clearly distinguish demonstration data from live databases.
            </p>
          </div>
        </div>

        {/* Quality Thresholds Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Biometric Quality Guard
          </h2>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Minimum Face Sharpness (Laplacian Variance Threshold)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.5"
                value={settings.face_quality_threshold}
                onChange={(e) =>
                  setSettings({ ...settings, face_quality_threshold: parseFloat(e.target.value) || 35.0 })
                }
                className="w-32 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <span className="text-xs text-slate-500">
                Below this score, the system displays <em>&ldquo;Face comparison could not be reliably assessed&rdquo;</em> and never forces a false match/mismatch.
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold">
              <Check className="w-4 h-4" />
              <span>Settings Saved Successfully</span>
            </span>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-brand-800 hover:bg-brand-900 text-white shadow transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>

      </form>
    </div>
  );
};
