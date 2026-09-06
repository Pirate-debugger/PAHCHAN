# PAHCHAN — Comprehensive Project Audit & Architectural Assessment
**Smart India Hackathon 2026 — Problem Statement SIH2026188: AI-Based Fake Identity & Document Screening System**  
**Team:** Debugs Pirates | **Institution:** Invertis University  
**Audit Date:** 2026-09-07 | **Audit Status:** Rigorous Pre-Refinement Baseline Completed  

---

## 1. Executive Summary & Core Philosophy

PAHCHAN is engineered as an **AI-assisted forensic screening and decision-support workstation** for authorized checkpoint and border personnel (e.g., SSB, Bureau of Immigration, Ministry of Home Affairs). 

The platform operates under the strict doctrine of:
$$\text{Evidence} \longrightarrow \text{Findings} \longrightarrow \text{Calibrated Risk} \longrightarrow \text{Actionable Recommendation}$$

The system **never** functions as an opaque, autonomous authority that declares an individual a "criminal" or stamps "AI: FAKE" on a document. It equips trained screening officers with clear, reproducible, and explainable multi-signal evidence.

This audit report provides an unsparing, line-by-line inspection of the codebase across frontend, backend, database, APIs, security, accessibility, and user experience.

---

## 2. Working Features (Verified via Automated Tests & Runtime)

1. **Enterprise Modular Backend Architecture (`backend/app/`):**
   - Clean separation of concerns across `api/v1`, `core`, `models`, `schemas`, `services`, and `tests`.
   - Async lifespan handler initializing SQLite schema on startup.
   - Permissive yet configurable CORS middleware for development and deployment.
2. **ICAO Doc 9303 MRZ Checksum Verification (`validation_service.py`):**
   - Accurate TD1, TD2, and TD3 parsing with 7-3-1 modulo-10 check digit math across Document Number, Date of Birth, Expiration Date, and Composite Checksum.
   - Comprehensive date validation (expired document detection, impossible future issue dates, chronological contradictions).
3. **Multi-Signal Image Forensics Pipeline (`forensics_service.py`):**
   - Real-time Error Level Analysis (ELA) with high-frequency compression differential highlighting.
   - 3×3 Sobel convolution edge gradient discontinuity analysis for detecting cut-and-paste boundary artifacts.
   - EXIF/XMP metadata parsing identifying digital image editing software footprints (e.g., Photoshop, GIMP, Canva).
4. **Biometric Face Verification Engine (`face_service.py`):**
   - Cosine similarity calculation between travel document portrait and live presenter capture.
   - Dynamic thresholding (default 75.0%) with non-criminalizing operational guidance ("Possible identity mismatch — manual verification required").
   - OpenCV headless resilience (no crashes on headless Python 3.14 environments).
5. **Cross-Document Identity Consistency Checking (`crossdoc_service.py`):**
   - Name and date normalization with side-by-side mismatch highlighting between primary Passport and secondary Visa/Permit documents.
6. **Deterministic Additive Risk Scoring Engine (`risk_service.py`):**
   - Transparent scoring (0–100) combining weighted findings across photo tampering (+30), face mismatch (+45), text manipulation (+25), stamp forgery (+25), expired document (+35), and watchlist hit (+50).
   - Strict score clamping ($0 \le \text{Score} \le 100$) and calibrated risk tier assignment:
     - **LOW (0–29):** Clear entry.
     - **MEDIUM (30–69):** Secondary inspection recommended.
     - **CRITICAL (70–100):** Detain / immediate supervisory review.
7. **4-Part Structured Explainability Matrix (`explainability_service.py`):**
   - Deterministic, grounded intelligence briefing answering:
     1. *What happened?* (Summary of screening findings)
     2. *Why is it risky?* (Specific security and legal implications)
     3. *What evidence supports it?* (Document coordinates, ELA variance, MRZ checksums)
     4. *What should the officer do?* (Operational next steps: clear, secondary physical forensics, verify source)
8. **Interactive Forensic Microscope Viewer (`ForensicsViewer.tsx`):**
   - Multi-layer canvas filters: Normal View, Curtain Split Slider, ELA Heatmap, Edge Cuts, Noise Texture, and Ink Spectrum.
   - Interactive zoom, pan, hotspot pins with radar pulsing, and floating pixel reticle readout.
9. **Official Printable Screening Dossier (`AuditReportModal.tsx`):**
   - Cryptographic SHA-256 fingerprint, Ashoka emblem styling, forensic thumbnail attachments, officer sign-off, and print-ready CSS (`@media print`).
10. **8 Deterministic SIH Competition Scenarios (`SYNTHETIC_TEST_CASES`):**
    - Genuine Passport, Photo Splicing, DOB Alteration, Counterfeit Stamp, Face Imposter, Expired Document + Photoshop Metadata, Passport-Visa Conflict, and Multi-Signal Attack.
11. **18 Automated Backend Tests:**
    - All 18 tests passing in `0.92s` via `pytest app/tests`.
12. **Clean Frontend Production Compilation:**
    - Zero TypeScript compilation errors (`tsc -b`), zero linter errors (`oxlint`).

---

## 3. Partially Working Features

1. **Standalone Forensics and Biometrics Tabs:**
   - Currently, navigating to the dedicated "Forensics Microscope" or "Face Biometrics" tab renders an isolated view of the *currently active workstation session*, rather than allowing the officer to upload an independent image file directly into that specific tool.
2. **Custom Document Upload Pipeline:**
   - The UI supports drag-and-drop of a single primary document, but the secondary document upload (e.g. Visa attachment) is not yet exposed via an explicit multi-file dropzone in the workstation header.
3. **Audit Trail Persistence UI Synchronization:**
   - The backend `/api/v1/audit/logs` endpoint persists and queries SQLite records accurately, but the frontend `AuditLogView` was primarily displaying in-memory past sessions rather than automatically fetching from `/api/v1/audit/logs` on mount.

---

## 4. Broken Features & Discrepancies

1. **Missing Backend Dependencies in `requirements.txt`:**
   - `SQLAlchemy` is required by `app/database.py` and `app/models/` but was omitted from `backend/requirements.txt`.
   - `pytest` was omitted from `requirements.txt`.
2. **Root-Level Legacy Python Files:**
   - Flat files in `backend/` (`database.py`, `face_engine.py`, `mrz_parser.py`, `risk_engine.py`, `tampering_detector.py`, `test_pipeline.py`) are pre-refactoring artifacts that still reference an old database name (`idshield_audit.db`). These create confusion and must be cleanly archived/removed.

---

## 5. Fake / Simulated / Demo-Only Elements

1. **Integrated Local Watchlist Database:**
   - The watchlist matching utilizes local mock records (INTERPOL Red Notice, NIA Bulletin, UN Sanctions). While mandatory for an offline hackathon demo, this must be explicitly labeled as an **"Integrated Local Watchlist Sandbox"** to prevent misleading judges into thinking live law enforcement databases are tapped without clearance.
2. **In-Memory Risk Weights Customization:**
   - Updating risk weights via `PUT /api/v1/risk/weights` updates the in-memory configuration; server restart resets weights to defaults.

---

## 6. Unnecessary & Dead Packages / Files

1. **Unused Frontend npm Packages:**
   - `recharts` is installed in `package.json` but never imported or rendered.
   - `clsx` and `tailwind-merge` are installed but unused.
2. **Unused Template Files:**
   - `frontend/src/App.css` contains leftover Vite starter CSS (185 lines) never imported by `App.tsx` or `main.tsx`.
   - `frontend/src/assets/{hero.png, react.svg, vite.svg}` are leftover template assets.
3. **Dead Backend Files:**
   - `backend/database.py` (legacy SQLite code pointing to `idshield_audit.db`).
   - `backend/test_pipeline.py`, `backend/face_engine.py`, `backend/mrz_parser.py`, `backend/risk_engine.py`, `backend/tampering_detector.py`.

---

## 7. Duplicate Code & Redundancies

1. **Duplicate MRZ Logic:**
   - `frontend/src/utils/mrz.ts` contains client-side MRZ calculation logic that duplicates the authoritative backend logic in `backend/app/services/validation_service.py`.
2. **Duplicate Backend Engines:**
   - Pre-refactoring root files duplicate `backend/app/services/`.

---

## 8. UI/UX Problems & Deficiencies

1. **Lack of an Initial Executive Overview / Command Center Dashboard:**
   - The application immediately dumps the user into the active screening workstation. An enterprise border checkpoint system requires an **Overview Dashboard** answering:
     1. *What is happening today?* (Screening volume, threat counts)
     2. *What requires immediate attention?* (High-risk queue)
     3. *Which screenings are flagged?* (Recent alerts)
     4. *What should the officer do next?* (Start New Screening CTA)
2. **No Multi-Stage Progress Scanner Modal:**
   - When the officer clicks "Rescan AI" or uploads a file, a simple spinner was displayed rather than an informative, step-by-step progress checklist:
     - `[✓] Document Ingestion & SHA-256 Hashing`
     - `[✓] OCR Structured Field Extraction`
     - `[✓] ICAO Doc 9303 Checksum Validation`
     - `[✓] ELA & Edge Gradient Forensics`
     - `[✓] Biometric Face Mesh Matching`
     - `[✓] Additive Risk Score Calculation`
3. **Navigation Complexity:**
   - Navigation tabs can be simplified into a focused workflow:
     - **Overview** (Command Center Dashboard)
     - **Screening Workstation** (Active Document Ingestion & Analysis)
     - **Evidence Viewer** (Deep-dive Forensic Microscope & Anomaly Reticle)
     - **Reports** (Official Dossier Export & Sign-Off)
     - **Audit Trail** (Cryptographic SQLite History)
     - **Evaluation Lab** (8 SIH Competition Test Scenarios)
     - **Settings** (Scoring Weights & Checkpoint Configuration)

---

## 9. Backend & Architecture Issues

1. **Lack of File Cleanup Daemon:**
   - Uploaded files in `backend/uploads/` should be cleaned up automatically or stored temporarily in memory to ensure data privacy and prevent disk exhaustion.
2. **Centralized Error Responses:**
   - Ensure all HTTP 400/422/500 errors return a consistent, user-friendly JSON schema with `detail`, `error_code`, and `remedy_action`.

---

## 10. Database Problems

1. **Single SQLite File:**
   - `pahchan_audit.db` works reliably for single-process evaluation and hackathon demonstrations, but SQLite write-locks can occur under high concurrent multi-threading.
   - For demo purposes, SQLite is ideal (zero configuration, easily inspectable, completely portable). WAL mode (`PRAGMA journal_mode=WAL;`) should be enabled for improved concurrent read/write throughput.

---

## 11. Security Issues & Vulnerabilities

1. **File Upload Hardening:**
   - Already implements magic-byte / MIME validation and 15MB size caps in `app/core/security.py`.
   - File extensions and names must be aggressively sanitized to prevent any possibility of path traversal.
2. **No Hardcoded Secrets:**
   - Confirmed: no API keys, private tokens, or hardcoded passwords exist in frontend or backend code.
3. **Non-Criminalizing Terminology:**
   - The platform strictly enforces non-accusatory language. All findings are labeled as "Anomaly Detected", "Risk Signal", or "Possible Identity Mismatch", never "Criminal" or "Fraudster".

---

## 12. Performance Issues

1. **Frontend Bundle Size:**
   - Removing unused dependencies (`recharts`) will save bundle size.
2. **CPU-Only Computer Vision:**
   - Fast heuristic OCR and NumPy-based ELA run in under 200ms on CPU, which is suitable for standard laptop demonstration without requiring an NVIDIA GPU.

---

## 13. Accessibility (a11y) Issues

1. **Color-Only Cues:**
   - Must ensure that every risk badge (Green, Amber, Red) always includes a distinct semantic icon (CheckCircle, AlertTriangle, AlertOctagon) and a text label (PASS, REVIEW, ALERT).
2. **Keyboard Focus & Navigation:**
   - All interactive modal triggers and form inputs must have visible focus rings (`focus:ring-2 focus:ring-cyan-500`) and keyboard traps inside modals with ESC key closing.

---

## 14. Technical Debt

1. Legacy pre-refactoring files in `backend/*.py`.
2. Leftover unused Vite CSS in `frontend/src/App.css`.
3. Inconsistent prop names between older components.

---

## 15. Recommended Removals

1. **DELETE** `backend/database.py` (legacy).
2. **DELETE** `backend/face_engine.py` (legacy).
3. **DELETE** `backend/mrz_parser.py` (legacy).
4. **DELETE** `backend/risk_engine.py` (legacy).
5. **DELETE** `backend/tampering_detector.py` (legacy).
6. **DELETE** `backend/test_pipeline.py` (legacy).
7. **DELETE** `frontend/src/App.css` (unused starter file).
8. **REMOVE** `recharts`, `clsx`, `tailwind-merge` from `frontend/package.json`.

---

## 16. Recommended Improvements

1. **Add Command Center Dashboard (`OverviewDashboard.tsx`):**
   - High-level threat intelligence, today's screening throughput metrics, high-risk intercept queue, and quick-launch screening actions.
2. **Add Multi-Stage Scanning Progress Modal (`ScreeningProgressModal.tsx`):**
   - Transparent step-by-step progress checklist showing image preprocessing, OCR extraction, ICAO validation, forensics, face verification, and risk scoring.
3. **Add Dedicated Settings / Risk Weights Panel (`SettingsPanel.tsx`):**
   - Allow officers to view and adjust risk factor weights and active checkpoint post with live feedback.
4. **Integrate Real-Time Backend Audit Querying:**
   - Wire `AuditLogView` directly to `GET /api/v1/audit/logs`.
5. **Update Backend Requirements:**
   - Add `SQLAlchemy>=2.0.0` and `pytest>=8.0.0` to `backend/requirements.txt`.

---

## 17. Priority Matrix

| Priority | Category | Item | Action |
|---|---|---|---|
| **CRITICAL** | Code Cleanliness | Remove dead legacy backend files | Delete 6 legacy files in `backend/` |
| **CRITICAL** | Dependencies | Add missing `SQLAlchemy` & `pytest` to `backend/requirements.txt` | Update `backend/requirements.txt` |
| **HIGH** | UX Architecture | Add Overview Dashboard & simplified navigation | Implement `OverviewDashboard.tsx` and streamline tabs |
| **HIGH** | User Experience | Multi-stage transparent scanning progress modal | Implement `ScreeningProgressModal.tsx` |
| **HIGH** | Dependencies | Purge unused `recharts` from `frontend/package.json` | Clean package dependencies |
| **MEDIUM** | Evidence Viewer | Deep-dive anomaly inspection UX | Enhance region autofocus and return button |
| **MEDIUM** | Audit Trail | Query live SQLite audit logs from FastAPI endpoint | Connect frontend to `/api/v1/audit/logs` |
| **LOW** | Polish | Clean up unused `App.css` and template icons | Delete dead assets |

---

*This audit document serves as the foundational contract for Phase 1 through Phase 32.*
