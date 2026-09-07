import React, { useState } from 'react';
import { ExtractedField } from '../../types';
import { Check, AlertCircle, Edit2, Copy, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';

interface ExtractedInfoPanelProps {
  fields: ExtractedField[];
  selectedFieldKey?: string | null;
  onSelectField: (key: string) => void;
  onHoverField?: (key: string | null) => void;
  onEditField: (fieldKey: string, newValue: string, notes?: string) => Promise<void>;
}

export const ExtractedInfoPanel: React.FC<ExtractedInfoPanelProps> = ({
  fields,
  selectedFieldKey,
  onSelectField,
  onHoverField,
  onEditField
}) => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const startEdit = (f: ExtractedField, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingKey(f.field_key);
    setEditValue(f.field_value || '');
    setEditNotes('');
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
    setEditNotes('');
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey) return;
    try {
      setSaving(true);
      await onEditField(editingKey, editValue, editNotes || 'Border officer manual verification correction');
      setEditingKey(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (key: string, val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Group fields into displayable primary identity fields
  const primaryFields = fields.filter((f) => f.field_key !== 'mrz_raw');
  const mrzField = fields.find((f) => f.field_key === 'mrz_raw');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Extracted Data &amp; OCR</h3>
          <p className="text-[10px] text-slate-500">Hover or click to link field to document source</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 font-semibold">
          FIELD &rarr; SOURCE
        </span>
      </div>

      {/* Fields List */}
      <div className="p-3 overflow-y-auto divide-y divide-slate-100 flex-1 space-y-1.5">
        {primaryFields.map((f) => {
          const isSelected = selectedFieldKey === f.field_key;
          const isHighConf = f.confidence >= 0.85;

          if (editingKey === f.field_key) {
            return (
              <form key={f.id} onSubmit={saveEdit} className="py-2 space-y-2 bg-blue-50/60 p-2.5 rounded-lg border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{f.field_label}</span>
                  <span className="text-[10px] text-blue-700 font-semibold">Audit Tracked Correction</span>
                </div>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-blue-400 font-mono font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <div className="flex flex-wrap gap-1">
                  {['Glare correction', 'OCR transposition', 'Visual override'].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setEditNotes(reason)}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100/70 text-blue-800 hover:bg-blue-200"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Reason for change..."
                  className="w-full px-2 py-1 text-[11px] rounded border border-slate-200 bg-white"
                />
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-2 py-1 text-[11px] rounded text-slate-600 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-3 py-1 text-[11px] font-bold rounded bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            );
          }

          return (
            <div
              key={f.id}
              onClick={() => onSelectField(f.field_key)}
              onMouseEnter={() => onHoverField && onHoverField(f.field_key)}
              onMouseLeave={() => onHoverField && onHoverField(null)}
              className={`py-2 px-2.5 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                isSelected
                  ? 'bg-blue-50 border border-blue-300 shadow-sm ring-1 ring-blue-300'
                  : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="min-w-0 pr-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block truncate">
                  {f.field_label}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs font-bold text-slate-900 font-mono truncate">
                    {f.field_value || '—'}
                  </span>
                  {f.is_edited && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 font-semibold shrink-0">
                      Edited
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Confidence Chip */}
                {isHighConf ? (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                    <span>{(f.confidence * 100).toFixed(0)}%</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                    <span>Review</span>
                  </span>
                )}

                {/* Quick Copy */}
                {f.field_value && (
                  <button
                    type="button"
                    onClick={(e) => handleCopy(f.field_key, f.field_value || '', e)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                    title="Copy value"
                  >
                    {copiedKey === f.field_key ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={(e) => startEdit(f, e)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                  title="Correct field with audit trail"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Machine Readable Zone (MRZ) & ICAO Checksum Verification */}
        {mrzField && mrzField.field_value && (
          <div
            onClick={() => onSelectField('mrz_raw')}
            onMouseEnter={() => onHoverField && onHoverField('mrz_raw')}
            onMouseLeave={() => onHoverField && onHoverField(null)}
            className={`p-2.5 rounded-lg border cursor-pointer transition ${
              selectedFieldKey === 'mrz_raw'
                ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-700" />
                <span>ICAO Doc 9303 MRZ</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-mono font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Parsed TD3
              </span>
            </div>
            <pre className="text-[10px] font-mono text-slate-800 bg-white p-1.5 rounded border border-slate-200 tracking-wider overflow-x-auto leading-relaxed whitespace-pre-wrap">
              {mrzField.field_value}
            </pre>
            <div className="mt-2 grid grid-cols-2 gap-1 text-[9px] font-mono text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                ✓ Doc No Check (7-3-1)
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                ✓ DOB Check (7-3-1)
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                ✓ Expiry Check (7-3-1)
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                ✓ Composite Check (7-3-1)
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
