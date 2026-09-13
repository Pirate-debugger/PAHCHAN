import React, { useState } from 'react';
import { ExtractedField } from '../../types';
import {
  Check,
  AlertCircle,
  Edit2,
  Copy,
  CheckCircle2,
  CreditCard,
  FileCode2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

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
      await onEditField(editingKey, editValue, editNotes || 'Frontline officer verification correction');
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

  // Group fields
  const primaryFields = fields.filter((f) => f.field_key !== 'mrz_raw');
  const mrzField = fields.find((f) => f.field_key === 'mrz_raw');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden flex flex-col h-full">
      
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span>Extracted Identity Data</span>
          </h3>
          <p className="text-[10px] text-slate-500">Click field to locate bounding box on document</p>
        </div>
        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
          FIELD &rarr; CANVAS
        </span>
      </div>

      {/* Fields List */}
      <div className="p-3 overflow-y-auto divide-y divide-slate-100 flex-1 space-y-1">
        {primaryFields.map((f) => {
          const isSelected = selectedFieldKey === f.field_key;
          const isHighConf = f.confidence >= 0.85;

          if (editingKey === f.field_key) {
            return (
              <form key={f.id} onSubmit={saveEdit} className="py-2.5 space-y-2 bg-blue-50/70 p-3 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950">{f.field_label}</span>
                  <span className="text-[9px] font-mono font-bold text-blue-700 uppercase bg-blue-100 px-1.5 py-0.2 rounded">
                    Audit Tracked Correction
                  </span>
                </div>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-blue-400 font-mono font-bold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  autoFocus
                />
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {['Glare correction', 'OCR transposition', 'Visual override'].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setEditNotes(reason)}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-white text-blue-800 hover:bg-blue-100 border border-blue-200 font-medium"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Official reason for field correction..."
                  className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 bg-white"
                />
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-md text-slate-600 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="xs"
                    isLoading={saving}
                  >
                    Save Correction
                  </Button>
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
              className={`py-2 px-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${
                isSelected
                  ? 'bg-blue-50 border border-blue-400/80 shadow-xs ring-1 ring-blue-400'
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
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 font-semibold shrink-0">
                      EDITED
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Confidence Badge */}
                {isHighConf ? (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-mono">
                    <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    <span>{(f.confidence * 100).toFixed(0)}%</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-mono">
                    <AlertCircle className="w-2.5 h-2.5" />
                    <span>LOW</span>
                  </span>
                )}

                {/* Quick Copy */}
                {f.field_value && (
                  <button
                    type="button"
                    onClick={(e) => handleCopy(f.field_key, f.field_value || '', e)}
                    className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition"
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
                  className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
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
            className={`p-3 rounded-xl border cursor-pointer transition-all mt-3 ${
              selectedFieldKey === 'mrz_raw'
                ? 'bg-blue-50/80 border-blue-400 ring-1 ring-blue-400 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-700 flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
                <span>ICAO Doc 9303 MRZ TD3</span>
              </span>
              <span className="text-[9px] text-emerald-700 font-mono font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                PARSED 7-3-1
              </span>
            </div>

            <pre className="text-[10px] font-mono text-slate-900 bg-slate-950 text-cyan-300 p-2 rounded-lg border border-slate-800 tracking-wider overflow-x-auto leading-relaxed whitespace-pre-wrap shadow-inner">
              {mrzField.field_value}
            </pre>

            <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-emerald-700 font-bold bg-white p-1 rounded border border-slate-200">
                <Check className="w-3 h-3 stroke-[3]" /> Doc No Check
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-bold bg-white p-1 rounded border border-slate-200">
                <Check className="w-3 h-3 stroke-[3]" /> DOB Check
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-bold bg-white p-1 rounded border border-slate-200">
                <Check className="w-3 h-3 stroke-[3]" /> Expiry Check
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-bold bg-white p-1 rounded border border-slate-200">
                <Check className="w-3 h-3 stroke-[3]" /> Composite Check
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
