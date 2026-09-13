import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  Lock,
  Camera,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ArrowRight,
  Info
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface DocumentUploaderProps {
  onFileSelected: (file: File, docType: string) => void;
  isProcessing?: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onFileSelected,
  isProcessing = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('PASSPORT');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndDispatch = (file: File) => {
    setErrorMsg(null);
    const validExtensions = /\.(pdf|jpg|jpeg|png|webp)$/i;
    const validMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

    if (!validMimes.includes(file.type) && !file.name.match(validExtensions)) {
      setErrorMsg('Unsupported format. Please upload a PDF, JPG, PNG, or WebP document.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File size exceeds maximum 15MB limit.');
      return;
    }

    onFileSelected(file, selectedType);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndDispatch(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndDispatch(e.target.files[0]);
    }
  };

  const loadSampleDocument = async (sampleUrl: string, fileName: string, docType: string) => {
    try {
      setSelectedType(docType);
      const response = await fetch(sampleUrl);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: blob.type || 'image/png' });
      onFileSelected(file, docType);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load sample test file.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Sovereign Title & Trust Subtitle */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>SSB BORDER CHECKPOINT IDENTITY SCREENING ENGINE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          PAHCHAN Document Verification Workspace
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Automated multi-layered forensic inspection, optical document classification, format syntax checking, and authoritative registry verification in sub-second time.
        </p>
      </div>

      {/* Document Type Selector Segmented Controls */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs max-w-xl mx-auto">
          {[
            { id: 'PASSPORT', label: 'Passport (ICAO TD3)' },
            { id: 'PAN', label: 'PAN Card' },
            { id: 'DRIVING_LICENSE', label: 'Driving Licence' },
            { id: 'VOTER_ID', label: 'Voter ID (EPIC)' },
            { id: 'VISA', label: 'Visa Endorsement' }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedType(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === t.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Dropzone Hero Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 select-none ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 scale-[1.01] shadow-glow-blue'
            : 'border-slate-300/90 bg-white hover:border-blue-400 hover:bg-slate-50/70 shadow-subtle'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Animated Cloud Icon */}
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${
            isDragging
              ? 'bg-blue-600 text-white scale-110 shadow-glow-blue'
              : 'bg-blue-50 text-blue-700 border border-blue-100 group-hover:scale-105'
          }`}>
            <UploadCloud className="w-10 h-10 stroke-[2.2]" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {isDragging ? 'Release to verify document' : `Drop ${selectedType === 'PAN' ? 'PAN Card' : selectedType === 'DRIVING_LICENSE' ? 'Driving Licence' : selectedType === 'VOTER_ID' ? 'Voter ID' : selectedType === 'PASSPORT' ? 'Passport' : 'Document'} here`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              or browse from your terminal storage &bull; PDF, JPG, JPEG, PNG, or WebP
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="sovereign"
              size="md"
              leftIcon={<FileCheck className="w-4 h-4 stroke-[2.4]" />}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Select {selectedType} File
            </Button>
          </div>

          {/* Validation Error Alert */}
          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 text-left max-w-md">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Metadata & Spec Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Maximum 15MB
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Optical Document Classifier Active
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Income Tax & MoRTH Gateways Ready
            </span>
          </div>

        </div>
      </div>

      {/* Interactive Quick-Test Document Bar */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            Quick Test Bench for {selectedType}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">One-click live verification</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedType === 'PAN' && (
            <>
              <button
                type="button"
                onClick={() => loadSampleDocument('/uploads/sample_pan_card.png', 'sample_pan_genuine.png', 'PAN')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Genuine PAN Card (Suraj Prakash Gupta)
              </button>
              <button
                type="button"
                onClick={() => loadSampleDocument('/uploads/sample_passport.jpeg', 'sample_passport_as_pan.jpeg', 'PAN')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-rose-300 text-rose-800 hover:bg-rose-50 transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Fault Test: Upload Passport as PAN (Detect Mismatch)
              </button>
            </>
          )}

          {selectedType === 'DRIVING_LICENSE' && (
            <>
              <button
                type="button"
                onClick={() => loadSampleDocument('/uploads/sample_driving_licence.png', 'sample_dl_genuine.png', 'DRIVING_LICENSE')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Genuine Driving Licence (Amit Kumar Sharma)
              </button>
              <button
                type="button"
                onClick={() => loadSampleDocument('/uploads/sample_passport.jpeg', 'sample_passport_as_dl.jpeg', 'DRIVING_LICENSE')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-rose-300 text-rose-800 hover:bg-rose-50 transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Fault Test: Upload Passport as DL (Detect Mismatch)
              </button>
            </>
          )}

          {selectedType === 'PASSPORT' && (
            <>
              <button
                type="button"
                onClick={() => loadSampleDocument('/uploads/demo_doc_scenario_1_genuine.jpg', 'demo_passport_genuine.jpg', 'PASSPORT')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Genuine ICAO Passport
              </button>
              <button
                type="button"
                onClick={() => loadSampleDocument('/uploads/demo_doc_scenario_2_altered_photo.jpg', 'demo_passport_photo_tamper.jpg', 'PASSPORT')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-rose-300 text-rose-800 hover:bg-rose-50 transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Fault Test: Altered Photo Passport
              </button>
              <button
                type="button"
                onClick={() => loadSampleDocument('/uploads/sample_pan_card.png', 'sample_pan_as_passport.png', 'PASSPORT')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-amber-300 text-amber-800 hover:bg-amber-50 transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Fault Test: Upload PAN as Passport (Missing MRZ)
              </button>
            </>
          )}

          {(selectedType === 'VOTER_ID' || selectedType === 'VISA') && (
            <>
              <button
                type="button"
                onClick={() => loadSampleDocument('/uploads/sample_passport.jpeg', 'sample_passport_as_voter.jpeg', selectedType)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-rose-300 text-rose-800 hover:bg-rose-50 transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Fault Test: Upload Passport as {selectedType} (Type Mismatch)
              </button>
            </>
          )}
        </div>
      </div>

      {/* Security & Privacy Guarantee Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Ephemeral In-Memory</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Documents are analyzed in volatile memory and encrypted at rest.</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">ICAO 9303 Compliant</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Automated 7-3-1 check digit validation on passport MRZ zones.</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Legal Audit Trail</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Every verification generates a cryptographically sealed SHA-256 case dossier.</p>
          </div>
        </div>

      </div>

    </div>
  );
};
