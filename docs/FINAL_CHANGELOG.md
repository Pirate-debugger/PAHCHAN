# PAHCHAN — Final Engineering & UX Audit Changelog
**Smart India Hackathon 2026 — Problem Statement SIH2026188: AI-Based Fake Identity & Document Screening System**  
**Team:** Debugs Pirates | **Institution:** Invertis University  
**Audit Status:** Complete & Verified | **Build Status:** 0 Errors, 0 Warnings

---

## 1. What Was Removed (Dead Code & Bloat Purge)

- **6 Flat Legacy Python Files:** Deleted pre-refactoring backend files that referenced deprecated `idshield_audit.db`:
  - `backend/database.py`
  - `backend/face_engine.py`
  - `backend/mrz_parser.py`
  - `backend/risk_engine.py`
  - `backend/tampering_detector.py`
  - `backend/test_pipeline.py`
- **Unused Frontend Starter Files:**
  - `frontend/src/App.css` (185 lines of boilerplate Vite template CSS)
  - `frontend/src/assets/hero.png`
  - `frontend/src/assets/react.svg`
  - `frontend/src/assets/vite.svg`
- **Unused Frontend Dependencies:**
  - Removed `recharts` from `package.json` (replaced with custom performant SVG charts and gauges).
  - Removed `clsx` and `tailwind-merge` (eliminated bundle overhead; standard template strings used).
- **Unused Imports:**
  - Purged unused Lucide icon imports across `Navbar.tsx`, `AuditLogView.tsx`, `OverviewDashboard.tsx`, `ReportsView.tsx`, `ScreeningProgressModal.tsx`, and `SettingsPanel.tsx`.

---

## 2. What Was Fixed

- **Missing Backend Dependencies:**
  - Added `sqlalchemy>=2.0.0` and `pytest>=8.0.0` to `backend/requirements.txt`.
- **Database Concurrency & Table Locking:**
  - Enabled SQLite Write-Ahead Logging (`PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;`) in `backend/app/database.py`. Eliminates table lock contention during simultaneous background audit logging and live screening reads.
- **Audit Trail Database Fetch:**
  - Updated `AuditLogView.tsx` to automatically fetch live records from FastAPI `GET /api/v1/audit/logs` on component mount and display live database synchronization count (`SQLITE SYNC: N`).
- **Oxlint Warning in `ScreeningProgressModal.tsx`:**
  - Resolved `set-state-in-effect` lint warning; progress timer now initializes cleanly without cascading renders.
- **Strict TypeScript Property Mismatch:**
  - Fixed `expectedRiskScore` property reference in `OverviewDashboard.tsx` to correctly target `c.sessionData.totalRiskScore`.

---

## 3. What Was Added

- **Command Center Overview (`OverviewDashboard.tsx`):**
  - High-level mission control dashboard answering: *What is happening? What requires attention? Which screenings are high risk? What should the officer do next?*
  - 4 Key Metric Tiles: Total Screenings, Clear Passes, Secondary Reviews, Critical Alerts.
  - Active Priority Review Queue with click-to-load direct into workstation.
  - Anomaly Signal Distribution breakdown.
- **Transparent 6-Stage Scanning Progress Modal (`ScreeningProgressModal.tsx`):**
  - Multi-stage step-by-step radar checklist demonstrating cryptographic hashing, OCR extraction, ICAO 7-3-1 check digits, multi-spectral forensics, face mesh, and additive risk scoring.
- **Dedicated Reports Hub (`ReportsView.tsx`):**
  - Full-screen view for official intelligence dossiers with print formatting, JSON audit package export, and case selector archive.
- **System & Checkpoint Settings Panel (`SettingsPanel.tsx`):**
  - Interactive risk factor weights configuration matrix (0–100 clamped) with reset to defaults, prototype disclaimer, and active checkpoint duty post switcher.

---

## 4. What Was Redesigned

- **Streamlined 7-Tab Navigation (`Navbar.tsx` & `App.tsx`):**
  - Reorganized all platform capabilities into 7 clear, purposeful workflows:
    1. `Overview`: Mission Control Command Center
    2. `Screening`: Primary 4-Quadrant Workstation
    3. `Evidence`: Multi-Spectral Forensics Viewer & Microscope
    4. `Reports`: Official Intelligence & Audit Dossiers
    5. `Audit`: Immutable Cryptographic Audit Trail
    6. `Demo Lab`: 8 Synthetic Evaluation Scenarios
    7. `Settings`: Checkpoint Configuration & Factor Weights Calibration
- **Workstation Forensics Viewer (`ForensicsViewer.tsx`):**
  - Added Curtain Split mode (side-by-side comparative wipe), interactive pixel reticle readout, and pulsating hotspot pins.
- **Extracted Fields Card (`DocumentDetailsCard.tsx`):**
  - Bidirectional character highlighting on MRZ hover and ICAO Doc 9303 Modulo-10 7-3-1 Math Inspector modal.
- **Risk Breakdown Card (`RiskBreakdownCard.tsx`):**
  - Custom SVG circular score gauge, audio briefing text-to-speech button, and copy-dispatch action.

---

## 5. What Was Tested

- **Backend Regression Suite:**
  - Executed `python -m pytest app/tests -v` (18 tests).
- **Frontend Type Safety & Lint:**
  - Executed `npm run lint` (`oxlint`).
  - Executed `npm run build` (`tsc -b && vite build`).
- **End-to-End User Journeys:**
  - Login/Overview $\rightarrow$ Primary Workstation $\rightarrow$ Synthetic Scenarios 1 through 8 $\rightarrow$ Forensics Curtain Wipe $\rightarrow$ MRZ 7-3-1 Math Inspector $\rightarrow$ Report Modal Print $\rightarrow$ SQLite Audit Log Verification.

---

## 6. Test Results

| Test Category | Command | Result | Duration / Artifacts |
|---|---|---|---|
| **Backend Unit & API Tests** | `pytest app/tests -v` | **18 / 18 PASSED** | 1.16s |
| **Frontend Linter** | `npm run lint` | **0 Errors, 0 Warnings** | 27ms (24 files checked) |
| **Frontend Production Build** | `npm run build` | **SUCCESS** | 972ms (`dist/` created, zero type errors) |
| **Database Concurrency** | SQLite WAL verification | **PASSED** | Concurrent write/read verified |

---

## 7. Remaining Limitations

1. **Synthetic Data for Hackathon Demonstration:**
   - All demo scenarios use standardized synthetic vectors clearly stamped `"SYNTHETIC DEMONSTRATION DOCUMENT — NOT A REAL IDENTITY DOCUMENT"` to guarantee 100% offline resilience during jury evaluation.
2. **Prototype Risk Factor Weights:**
   - Default point values are calibrated heuristics. Checkpoint supervisors can adjust weights via the Settings panel or `/api/v1/risk/weights` API to match jurisdictional directives.
3. **Sub-150 DPI Scans:**
   - Extremely low-resolution images degrade ELA sensitivity. The system flags such cases with an "OCR Uncertainty" indicator and instructs the officer to perform a physical loupe inspection.

---

## 8. Recommended Next Steps for Field Deployment

1. **Hardware Integration:** Connect hardware passport document readers (e.g. 3M / Thales AT9000 MK2) via standard TWAIN/WIA device drivers.
2. **Live PKI Verification:** Connect to the ICAO Public Key Directory (PKD) for electronic e-Passport chip cryptographic signature verification.
3. **Hardware Acceleration:** Compile OpenCV edge detection and face embedding pipelines with OpenVINO or TensorRT for sub-50ms inference on border checkpoint mini-PCs.
