import React, { useState } from 'react';
import type { DocumentFields, ValidationResult, CrossFieldResult } from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Calculator, 
  X, 
  ArrowUpRight
} from 'lucide-react';

interface DocumentDetailsCardProps {
  fields: DocumentFields;
  validation: ValidationResult;
  crossField?: CrossFieldResult;
  onSelectFieldRegion?: (regionId: string) => void;
}

export const DocumentDetailsCard: React.FC<DocumentDetailsCardProps> = ({
  fields,
  validation,
  crossField,
  onSelectFieldRegion
}) => {
  const [showMathModal, setShowMathModal] = useState<boolean>(false);

  const conf = fields.fieldConfidences || {
    name: 0.987,
    docNumber: 0.992,
    nationality: 0.995,
    dob: 0.991,
    expiryDate: 0.994,
    gender: 0.989
  };

  const fieldItems = [
    { label: 'Full Name', value: fields.name, confidence: conf.name, regionId: 'reg-name' },
    { label: 'Document Number', value: fields.docNumber, confidence: conf.docNumber, regionId: 'reg-doc-num', isMono: true },
    { label: 'Nationality', value: fields.nationality, confidence: conf.nationality, regionId: 'reg-nationality' },
    { label: 'Date of Birth', value: fields.dob, confidence: conf.dob, regionId: 'reg-dob', isExpiredWarning: false },
    { 
      label: 'Expiration Date', 
      value: fields.expiryDate, 
      confidence: conf.expiryDate, 
      regionId: 'reg-expiry',
      isExpiredWarning: validation.isExpired 
    },
    { label: 'Gender', value: fields.gender, confidence: conf.gender, regionId: 'reg-gender' },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-subtle p-4 space-y-4 text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Optical Extraction
          </span>
          <h2 className="text-sm font-bold text-slate-900">
            Extracted Fields &amp; Validation
          </h2>
        </div>

        <button
          onClick={() => setShowMathModal(true)}
          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors"
        >
          <Calculator className="w-3.5 h-3.5 text-blue-600" />
          <span>ICAO 7-3-1 Math</span>
        </button>
      </div>

      {/* Extracted Fields Table with Traceability */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-2 px-3">Field</th>
              <th className="py-2 px-3">Extracted Value</th>
              <th className="py-2 px-3">Confidence</th>
              <th className="py-2 px-3 text-right">Source Trace</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fieldItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-3 font-medium text-slate-500">
                  {item.label}
                </td>
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  <span className={item.isMono ? 'font-mono' : ''}>
                    {item.value}
                  </span>
                  {item.isExpiredWarning && (
                    <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                      EXPIRED
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-600">
                    {item.confidence ? `${(item.confidence * 100).toFixed(1)}%` : '98.5%'}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => onSelectFieldRegion && onSelectFieldRegion(item.regionId)}
                    className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <span>View source</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ICAO Doc 9303 MRZ Verification Card */}
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-600 uppercase tracking-wide">
            ICAO Doc 9303 MRZ Optical Zone
          </span>
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
            validation.mrzChecksumPass 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {validation.mrzChecksumPass ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Modulo-10 Passed</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span>Checksum Mismatch</span>
              </>
            )}
          </span>
        </div>

        {/* Algorithm Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="p-2 rounded bg-white border border-slate-200">
            <div className="text-[10px] text-slate-500">Doc Number</div>
            <div className="flex items-center gap-1 mt-0.5">
              {validation.mrzDetails?.docNumberValid ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-rose-600" />
              )}
              <span className="text-xs font-semibold text-slate-800">
                {validation.mrzDetails?.docNumberValid ? 'Valid' : 'Mismatch'}
              </span>
            </div>
          </div>

          <div className="p-2 rounded bg-white border border-slate-200">
            <div className="text-[10px] text-slate-500">DOB Digit</div>
            <div className="flex items-center gap-1 mt-0.5">
              {validation.mrzDetails?.dobValid ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-rose-600" />
              )}
              <span className="text-xs font-semibold text-slate-800">
                {validation.mrzDetails?.dobValid ? 'Valid' : 'Mismatch'}
              </span>
            </div>
          </div>

          <div className="p-2 rounded bg-white border border-slate-200">
            <div className="text-[10px] text-slate-500">Expiry Digit</div>
            <div className="flex items-center gap-1 mt-0.5">
              {validation.mrzDetails?.expiryValid ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-rose-600" />
              )}
              <span className="text-xs font-semibold text-slate-800">
                {validation.mrzDetails?.expiryValid ? 'Valid' : 'Mismatch'}
              </span>
            </div>
          </div>

          <div className="p-2 rounded bg-white border border-slate-200">
            <div className="text-[10px] text-slate-500">Composite</div>
            <div className="flex items-center gap-1 mt-0.5">
              {validation.mrzDetails?.compositeValid ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-rose-600" />
              )}
              <span className="text-xs font-semibold text-slate-800">
                {validation.mrzDetails?.compositeValid ? 'Valid' : 'Mismatch'}
              </span>
            </div>
          </div>
        </div>

        {/* Monospaced MRZ snippet */}
        <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-emerald-400 tracking-widest overflow-x-auto select-all">
          <div>{fields.mrzLine1 || 'P<INDKUMAR<<ARAVIND<<<<<<<<<<<<<<<<<<<<<<<<<'}</div>
          <div>{fields.mrzLine2 || 'Z4819203<0IND0008154M3008155<<<<<<<<<<<<<<00'}</div>
        </div>
      </div>

      {/* Cross-Document Consistency Warning (Section 28) */}
      {crossField && !crossField.match && crossField.mismatches.length > 0 && (
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Cross-Document Inconsistency Detected</span>
          </div>
          <ul className="text-xs text-amber-900 space-y-0.5 pl-5 list-disc">
            {crossField.mismatches.map((m, i) => (
              <li key={i}>
                <span className="font-semibold">{m.field}:</span> {m.description || `${m.source1} (${m.value1}) vs ${m.source2} (${m.value2})`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ICAO Modulo-10 7-3-1 Math Inspector Modal */}
      {showMathModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-lg w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  ICAO Doc 9303 Check Digit Inspector
                </h3>
              </div>
              <button 
                onClick={() => setShowMathModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p className="leading-relaxed">
                ICAO standard TD3 travel documents use a repeating weight sequence <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">[7, 3, 1, 7, 3, 1...]</code> modulo 10 across key fields:
              </p>

              <div className="space-y-2 border border-slate-200 rounded-md p-3 bg-slate-50 font-mono text-[11px]">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="font-semibold text-slate-700">Document Number:</span>
                  <span className={validation.mrzDetails?.docNumberValid ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    {validation.mrzDetails?.docNumberValid ? 'Pass (Modulo 10 Valid)' : 'FAIL (Calculated ≠ Expected)'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="font-semibold text-slate-700">Date of Birth:</span>
                  <span className={validation.mrzDetails?.dobValid ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    {validation.mrzDetails?.dobValid ? 'Pass (Modulo 10 Valid)' : 'FAIL (Calculated ≠ Expected)'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="font-semibold text-slate-700">Expiration Date:</span>
                  <span className={validation.mrzDetails?.expiryValid ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    {validation.mrzDetails?.expiryValid ? 'Pass (Modulo 10 Valid)' : 'FAIL (Calculated ≠ Expected)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Composite Checksum:</span>
                  <span className={validation.mrzDetails?.compositeValid ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    {validation.mrzDetails?.compositeValid ? 'Pass (Modulo 10 Valid)' : 'FAIL (Calculated ≠ Expected)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowMathModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
