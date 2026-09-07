import React, { useState, useRef } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Upload, Camera, FileCheck, X, Image as ImageIcon, Video, RefreshCw } from 'lucide-react';

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
  
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [notes, setNotes] = useState('');

  const docInputRef = useRef<HTMLInputElement>(null);
  const personInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocFile(file);
      setDocPreview(URL.createObjectURL(file));
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
      console.warn('Camera not available or permission denied:', err);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Start New Screening"
      subtitle="Upload or scan passenger travel document for automated AI screening"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Document Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Document Category
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[
              { id: 'PASSPORT', label: 'Passport' },
              { id: 'VISA', label: 'Visa' },
              { id: 'NATIONAL_ID', label: 'National ID' },
              { id: 'DRIVING_LICENSE', label: 'Driver License' },
              { id: 'PERMIT', label: 'Permit' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setDocType(t.id)}
                className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition ${
                  docType === t.id
                    ? 'bg-brand-900 text-white border-brand-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Document Upload Dropzone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Travel Document (Mandatory)
          </label>
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
              className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-xl p-6 text-center cursor-pointer transition bg-slate-50/50 hover:bg-brand-50/20"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-800">
                Click to upload or drag & drop document
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Supports JPG, PNG, WebP (Passport MRZ page, Visa endorsement, National ID)
              </p>
            </div>
          ) : (
            <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900 flex items-center justify-center max-h-48">
              <img
                src={docPreview}
                alt="Document preview"
                className="max-h-48 object-contain w-full"
              />
              <button
                type="button"
                onClick={() => {
                  setDocFile(null);
                  setDocPreview(null);
                }}
                className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition"
                title="Remove document"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-slate-900/80 text-white text-[10px] font-mono">
                {docFile?.name} ({(docFile!.size / 1024).toFixed(0)} KB)
              </div>
            </div>
          )}
        </div>

        {/* Optional Presented Person Image (Face Verification) */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Presented Person Photograph (Optional)
            </label>
            <span className="text-[11px] text-slate-400">For live face comparison</span>
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
                className="flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
              >
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <span>Upload Selfie / Photo</span>
              </button>
              <button
                type="button"
                onClick={startCamera}
                className="flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
              >
                <Camera className="w-4 h-4 text-brand-600" />
                <span>Capture via Camera</span>
              </button>
            </div>
          )}

          {/* Live Camera View */}
          {isCameraActive && (
            <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-black text-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-48 object-cover" />
              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={captureCameraPhoto}
                  className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition"
                >
                  Capture Photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Captured / Uploaded Photo Preview */}
          {personPreview && !isCameraActive && (
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <img
                  src={personPreview}
                  alt="Presented subject"
                  className="w-12 h-12 rounded object-cover border border-slate-200"
                />
                <div>
                  <p className="text-xs font-medium text-slate-800">Person Image Attached</p>
                  <p className="text-[11px] text-slate-500">Ready for facial comparison</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPersonFile(null);
                  setPersonPreview(null);
                }}
                className="p-1 text-slate-400 hover:text-rose-600 transition"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Screening Notes (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Officer Screening Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Passenger presented at Gate 3 transit desk"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!docFile || isSubmitting}
            className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg text-white transition ${
              !docFile || isSubmitting
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-brand-900 hover:bg-brand-950 shadow active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                <span>Analyze Document</span>
              </>
            )}
          </button>
        </div>

      </form>
    </Modal>
  );
};
