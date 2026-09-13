import React, { useState, useEffect } from 'react';
import { SystemSettings } from '../../types';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Settings, Save, Shield, AlertCircle, Database, Check, Sliders, Lock } from 'lucide-react';

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
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-subtle">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            System Configuration &amp; Screening Parameters
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure prototype screening risk thresholds, verification data sources, and biometric guardrails
        </p>
      </div>

      {/* Statutory Notice Alert */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4.5 text-xs text-blue-950 flex items-start gap-3 shadow-subtle">
        <AlertCircle className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="block font-bold mb-0.5">Mandatory Statutory Notice:</strong>
          These risk thresholds and scoring bands are decision-support guidelines configured for operational evaluation demonstration. Statutory operational thresholds are governed by the Ministry of Home Affairs and SSB border command regulations.
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Risk Thresholds Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Screening Risk Score Thresholds (0 &mdash; 100 Scale)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-1">
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
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <span className="text-xs text-slate-400 font-mono">pts</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 font-medium">Scores 0 &mdash; {settings.risk_threshold_low}: Certified LOW</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-1">
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
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <span className="text-xs text-slate-400 font-mono">pts</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 font-medium">Scores {settings.risk_threshold_low + 1} &mdash; {settings.risk_threshold_review}: REVIEW</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-1">
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
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <span className="text-xs text-slate-400 font-mono">pts</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 font-medium">Scores 80+: CRITICAL ANOMALY</p>
            </div>
          </div>
        </div>

        {/* Verification Source Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Verification Sources &amp; Watchlist Registry</span>
          </h2>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Demonstration Verification Source (SLTD &amp; Watchlist)
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-md">
                Cross-references incoming documents against the pre-seeded lost/stolen document registry.
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
              <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Active Registry Label
            </label>
            <input
              type="text"
              value={settings.demo_watchlist_name}
              onChange={(e) =>
                setSettings({ ...settings, demo_watchlist_name: e.target.value })
              }
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Label displayed in legal dossiers and audit logs to clearly distinguish demonstration databases.
            </p>
          </div>
        </div>

        {/* Biometric Quality Threshold */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Biometric Quality Guardrails</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
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
                className="w-32 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <span className="text-xs text-slate-500">
                Prevents false matches when images are blurry, obscured, or low resolution.
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold">
              <Check className="w-4 h-4" />
              <span>Configuration Saved Successfully</span>
            </span>
          )}
          <Button
            type="submit"
            variant="sovereign"
            size="md"
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Configuration
          </Button>
        </div>

      </form>
    </div>
  );
};
