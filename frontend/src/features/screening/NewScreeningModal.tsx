import React, { useState, useRef } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  UploadCloud,
  Camera,
  FileCheck,
  X,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Shield,
  ScanLine
} from 'lucide-react';

interface NewScreeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  isSubmitting?: boolean;
}

export const NewScreeningModal: React.FC<NewScreeningModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false
}) => {
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docPreview, setDocPreview] = useState<string | null>(null);
  const [docType, setDocType] = useState('PASSPORT');
  const [isDragging, setIsDragging] = useState(false);
  const [fileValidation, setFileValidation] = useState<{ valid: boolean; message?: string } | null>(null);

  const [personFile, setPersonFile] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [notes, setNotes] = useState('');

  const docInputRef = useRef<HTMLInputElement>(null);
  const personInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const validateAndSetDoc = (file: File) => {
    // Check file size (max 15MB) and type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|pdf)$/i)) {
      setFileValidation({ valid: false, message: 'Supported formats: JPG, PNG, WebP, PDF' });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setFileValidation({ valid: false, message: 'File size exceeds maximum 15MB limit' });
      return;
    }

    setFileValidation({ valid: true });
    setDocFile(file);
    setDocPreview(URL.createObjectURL(file));
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetDoc(e.target.files[0]);
    }
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
      validateAndSetDoc(e.dataTransfer.files[0]);
    }
  };

  const handlePersonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPersonFile(file);
      setPersonPreview(URL.createObjectURL(file));
      stopCamera();
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access unavailable:', err);
      setIsCameraActive(false);
      alert('Camera access unavailable. Please upload a photo file instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'webcam_capture.jpg', { type: 'image/jpeg' });
          setPersonFile(file);
          setPersonPreview(URL.createObjectURL(file));
          stopCamera();
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) return;

    const formData = new FormData();
    formData.append('document_file', docFile);
    if (personFile) formData.append('presented_file', personFile);
    formData.append('document_type', docType);
    if (notes) formData.append('notes', notes);

    onSubmit(formData);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const quickTagNotes = (tag: string) => {
    setNotes((prev) => (prev ? `${prev} • ${tag}` : tag));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Frontline Document Ingestion & Screening Studio"
      subtitle="Upload or capture passenger travel document for automated AI forensic analysis & checksum verification"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Document Category Selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              Document Category Standard
            </label>
            <span className="text-[10px] font-mono text-slate-400">ICAO Doc 9303 Compatible</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'PASSPORT', label: 'Passport', spec: 'TD3 MRZ' },
              { id: 'VISA', label: 'Visa Stamp', spec: 'MRV-A/B' },
              { id: 'NATIONAL_ID', label: 'National ID', spec: 'TD1/TD2' },
              { id: 'DRIVING_LICENSE', label: 'Driver License', spec: 'State Card' },
              { id: 'PERMIT', label: 'Border Permit', spec: 'Special Pass' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setDocType(t.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  docType === t.id
                    ? 'bg-blue-50 border-blue-600 shadow-xs ring-1 ring-blue-500'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className={`block text-xs font-bold ${docType === t.id ? 'text-blue-900' : 'text-slate-800'}`}>
                  {t.label}
                </span>
                <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                  {t.spec}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Document Upload Dropzone & Reticle Preview */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <span>Primary Travel Document</span>
              <span className="text-rose-500">*</span>
            </label>
            {fileValidation?.valid && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Format Verified</span>
              </span>
            )}
          </div>

          <input
            type="file"
            ref={docInputRef}
            onChange={handleDocChange}
            accept="image/*,.pdf"
            className="hidden"
          />

          {!docPreview ? (
            <div
              onClick={() => docInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-600 bg-blue-50/70 shadow-glow-blue scale-[1.01]'
                  : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100 shadow-xs">
                <UploadCloud className="w-6 h-6 stroke-[2]" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Drop travel document here or click to browse
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                Supports high-resolution optical scans (JPG, PNG, WebP, PDF up to 15MB). Inspects passport biographical pages, visa endorsements, and ID cards.
              </p>
              {fileValidation?.valid === false && (
                <p className="text-xs text-rose-600 font-semibold mt-2 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{fileValidation.message}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="relative rounded-2xl border border-slate-700 overflow-hidden bg-slate-950 flex items-center justify-center max-h-56 group shadow-elevated">
              {/* Inspection Reticle Accents */}
              <div className="reticle-corner-tl text-blue-400 m-2" />
              <div className="reticle-corner-tr text-blue-400 m-2" />
              <div className="reticle-corner-bl text-blue-400 m-2" />
              <div className="reticle-corner-br text-blue-400 m-2" />

              <img
                src={docPreview}
                alt="Document preview"
                className="max-h-56 object-contain w-full py-2"
              />

              {/* Laser Scan Guide Watermark */}
              <div className="absolute inset-0 pointer-events-none border border-blue-500/20" />

              {/* Remove / Replace Overlay Actions */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-[11px] font-semibold border border-slate-700 transition"
                >
                  Replace File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDocFile(null);
                    setDocPreview(null);
                    setFileValidation(null);
                  }}
                  className="p-1 rounded-lg bg-slate-900/90 text-slate-300 hover:text-white hover:bg-rose-600 transition border border-slate-700"
                  title="Remove document"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* File details banner */}
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-mono border border-slate-700/80 flex items-center gap-2">
                <span className="text-emerald-400 font-bold">READY FOR PIPELINE</span>
                <span className="text-slate-400">&bull;</span>
                <span className="truncate max-w-[200px]">{docFile?.name}</span>
                <span className="text-slate-400">({(docFile!.size / 1024).toFixed(0)} KB)</span>
              </div>
            </div>
          )}
        </div>

        {/* Biometric Comparison Photograph (Live Camera or Selfie Upload) */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Presented Passenger Photograph (Biometrics)
              </label>
              <p className="text-[10px] text-slate-500">Live booth camera feed or reference passport photo for 512-D comparison</p>
            </div>
            <Badge variant="brand" size="xs">Optional</Badge>
          </div>

          <input
            type="file"
            ref={personInputRef}
            onChange={handlePersonChange}
            accept="image/*"
            className="hidden"
          />

          {!personPreview && !isCameraActive && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => personInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
              >
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <span>Upload Reference Photo</span>
              </button>

              <button
                type="button"
                onClick={startCamera}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-xs font-semibold text-blue-900 transition"
              >
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Activate Checkpoint Booth Camera</span>
              </button>
            </div>
          )}

          {/* Live Camera View with Oval Face Reticle */}
          {isCameraActive && (
            <div className="relative rounded-2xl border border-slate-800 overflow-hidden bg-black text-center shadow-elevated">
              <video ref={videoRef} autoPlay playsInline className="w-full h-48 object-cover" />

              {/* Oval Face Alignment Reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-40 rounded-full border-2 border-dashed border-cyan-400/70" />
              </div>

              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={captureCameraPhoto}
                >
                  Capture Facial Snapshot
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-slate-900/80 text-white border-slate-700 hover:bg-slate-800"
                  onClick={stopCamera}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Attached Photo Preview */}
          {personPreview && !isCameraActive && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <img
                  src={personPreview}
                  alt="Presented subject"
                  className="w-12 h-12 rounded-lg object-cover border border-slate-300"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">Live Booth Image Attached</p>
                  <p className="text-[11px] text-slate-500">Ready for Cosine Embedding Similarity match</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPersonFile(null);
                  setPersonPreview(null);
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Screening Notes & Context Quick Tags */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Officer Screening Context &amp; Notes
            </label>
            <div className="flex items-center gap-1">
              {['Gate 3 Desk', 'Routine Scan', 'Flagged Anomaly'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => quickTagNotes(tag)}
                  className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
                >
                  +{tag}
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Passenger presented at Nepal Transit Outpost Gate 3"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="sovereign"
            size="md"
            disabled={!docFile || isSubmitting}
            isLoading={isSubmitting}
            leftIcon={<ScanLine className="w-4 h-4" />}
          >
            Launch Forensic Pipeline
          </Button>
        </div>

      </form>
    </Modal>
  );
};
