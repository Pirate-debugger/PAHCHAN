# PAHCHAN (पहचान) — QA Fixes & Engineering Changelog
**Project:** AI-Based Fake Identity & Document Screening System (SIH2026188)  
**Beneficiary:** Ministry of Home Affairs / Sashastra Seema Bal (SSB)  
**Date:** September 11, 2026  

---

### FIX 1: MRZ Validation Failure on Pre-Evaluated MRZ Data (P1)
- **Problem:** `tests/test_validation.py::test_valid_document_validation` failed with status `FAIL` on rule `VAL_MRZ_CHECKSUM` ("Mandatory ICAO 9303 MRZ missing or unreadable").
- **Root Cause:** In `backend/app/services/validation_service.py` (line 273), the condition `if not mrz_data or not mrz_data.get("raw_mrz_lines"):` rejected valid MRZ data dictionaries that contained check-digit flags (`doc_number_valid`, `composite_valid`) but lacked the raw line text.
- **Fix:** Updated the check to `has_mrz = bool(mrz_data and (mrz_data.get("raw_mrz_lines") or "doc_number_valid" in mrz_data or "composite_valid" in mrz_data))`.
- **Files Changed:** `backend/app/services/validation_service.py`
- **Tests Performed:** `python -m pytest tests/test_validation.py`
- **Result:** **PASS** (All 3 validation tests passed).

---

### FIX 2: Database Duplicate Rows Violating 1-to-1 Model Contracts (P1)
- **Problem:** SQLAlchemy logged `SAWarning: Multiple rows returned with uselist=False for lazily-loaded attribute 'ScreeningSession.risk_assessment'` and `'ScreeningSession.face_verification'`.
- **Root Cause:** In `backend/app/models/screening.py`, `FaceVerification.session_id` and `RiskAssessment.session_id` were not declared with `unique=True`. Re-running seeds or tests inserted duplicate rows for sessions `PH-1132`, `PH-3606`, `PH-8894`, `PH-9016`, `PH-9803`.
- **Fix:**
  1. Added `unique=True` on `session_id` in `RiskAssessment` and `FaceVerification` in `backend/app/models/screening.py`.
  2. Executed a cleanup script to deduplicate existing rows in `backend/pahchan.db` and created unique SQLite indexes (`uq_risk_assessments_session`, `uq_face_verifications_session`).
- **Files Changed:** `backend/app/models/screening.py`, `backend/pahchan.db`
- **Tests Performed:** Ran duplicate detection SQL query and `test_screenings_api.py`.
- **Result:** **PASS** (Zero duplicates, no SQLAlchemy warnings).

---

### FIX 3: Relative SQLite Database Path Disjoint Across CWDs (P0)
- **Problem:** Starting the application from root or via startup scripts caused SQLite to create a second, empty `pahchan.db` in root rather than connecting to `backend/pahchan.db`.
- **Root Cause:** `DATABASE_URL` was configured as `sqlite:///./pahchan.db` in `backend/app/core/config.py`, making it relative to the current working directory of whichever process launched Python.
- **Fix:**
  1. Added `RESOLVED_DATABASE_URL` property in `Settings` class that dynamically anchors default SQLite paths to `BASE_DIR / 'pahchan.db'`.
  2. Updated `backend/app/core/database.py` to use `settings.RESOLVED_DATABASE_URL`.
  3. Removed the redundant database file from the root directory.
- **Files Changed:** `backend/app/core/config.py`, `backend/app/core/database.py`
- **Tests Performed:** Ran pytest and uvicorn from both root and backend directories.
- **Result:** **PASS** (Single authoritative database resolved everywhere).

---

### FIX 4: Insecure Document Upload Vulnerabilities (P0)
- **Problem:** Upload endpoint accepted any arbitrary file extension, allowed oversized payloads, and did not verify file content signatures.
- **Root Cause:** `create_screening` in `backend/app/api/screenings.py` directly wrote uploaded files to disk without validating file size, whitelist extensions, or magic bytes.
- **Fix:**
  1. Implemented `secure_validate_upload(filename, contents)`:
     - Rejects empty uploads (HTTP 400).
     - Enforces 15MB maximum file size limit (HTTP 413).
     - Enforces extension whitelist: `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf` (HTTP 400).
     - Inspects binary magic bytes for JPEG, PNG, WebP, and PDF signatures (HTTP 400).
     - Strips path traversal attempts via `os.path.basename`.
  2. Applied validation to both `document_file` and `presented_file`.
- **Files Changed:** `backend/app/api/screenings.py`, `backend/app/core/config.py`
- **Tests Performed:** Added `backend/tests/test_security_uploads.py` with 5 automated test cases.
- **Result:** **PASS** (All 5 security upload tests passed).

---

### FIX 5: Invalid CORS Configuration with Credentials (P0)
- **Problem:** Browser console logged CORS rejection warnings when requests included credentials.
- **Root Cause:** `backend/app/main.py` had `allow_origins=["*"]` combined with `allow_credentials=True`, which is forbidden by W3C CORS specifications.
- **Fix:** Updated `backend/app/main.py` to use explicit `settings.CORS_ORIGINS` whitelist and regex matching `localhost` and `127.0.0.1` ports.
- **Files Changed:** `backend/app/main.py`, `backend/app/core/config.py`
- **Tests Performed:** Browser subagent API fetch and health check tests.
- **Result:** **PASS** (Zero CORS errors).

---

### FIX 6: Provider Gateway Exception & Status Mapping (P1)
- **Problem:** External provider timeouts or missing credentials could trigger unhandled exceptions or convert failures to false passes.
- **Root Cause:** `screenings.py` did not differentiate `UNVERIFIABLE` and `NOT_CONFIGURED` provider statuses from fatal errors.
- **Fix:**
  1. Updated provider execution to cleanly map `UNVERIFIABLE` and `NOT_CONFIGURED` into `WARNING` status with explicit explanation notes.
  2. Wrapped external queries in exception handlers that allow local physical and optical checks to complete even if an external gateway is unreachable.
  3. Ensured `response_metadata` is populated on unverifiable outcomes in `pan_provider.py`.
- **Files Changed:** `backend/app/api/screenings.py`, `backend/app/services/providers/pan_provider.py`
- **Tests Performed:** `tests/test_provider_gateway.py`
- **Result:** **PASS** (Provider resolution, stolen passport alerts, and unverifiable fallbacks verified).

---

### FIX 7: Sensitive PII Exposure in Reports and Summaries (P2)
- **Problem:** Raw national identification numbers (PAN, Passport, Aadhaar) were displayed unmasked in report tables and summary payloads.
- **Root Cause:** No masking layer existed prior to serializing extracted identity fields into reports.
- **Fix:**
  1. Created `backend/app/core/security_privacy.py` with `mask_document_number(number, doc_type)`.
  2. Applied masking to `backend/app/api/reports.py` and `backend/app/services/report_service.py`.
- **Files Changed:** `backend/app/core/security_privacy.py`, `backend/app/api/reports.py`, `backend/app/services/report_service.py`
- **Tests Performed:** Created `backend/tests/test_privacy_masking.py` with 6 automated tests.
- **Result:** **PASS** (All 6 privacy tests passed; reports display `P829****`, `ABCDE****F`, etc.).

---

### FIX 8: Reports Filter Restricted to Completed Cases (P2)
- **Problem:** The legal reports archive only returned cases with `status == "COMPLETED"`, omitting active reviews.
- **Root Cause:** Hardcoded SQL filter in `list_reports` endpoint.
- **Fix:** Added optional `status` query parameter and updated the default filter to include both `COMPLETED` and `IN_REVIEW` dossiers.
- **Files Changed:** `backend/app/api/reports.py`
- **Tests Performed:** Tested `GET /api/reports` with and without status filters via HTTPX.
- **Result:** **PASS** (Reports archive now accessible across all active and completed screening stages).

---

### FIX 9: Low-Confidence Classifier Defaulting to PAN (P2)
- **Problem:** Ambiguous cards with non-standard geometry and no discernible color motifs were defaulted to PAN.
- **Root Cause:** In `document_classifier.py`, the fallback branch set `detected_type = "PAN"` with 0.70 confidence.
- **Fix:** Changed fallback to return `DOCUMENT_TYPE_UNCERTAIN` with 0.50 confidence. Also added `classify_cv2_image` method for in-memory array classification.
- **Files Changed:** `backend/app/services/document_classifier.py`
- **Tests Performed:** Created `backend/tests/test_document_classifier.py` with 3 automated tests.
- **Result:** **PASS** (Ambiguous cards return `DOCUMENT_TYPE_UNCERTAIN` without false assumptions).

---

### FIX 10: Missing Dependency winocr in requirements.txt (P2)
- **Problem:** `winocr` was used in `ocr_service.py` but absent from `requirements.txt`.
- **Root Cause:** Environment was installed interactively without recording `winocr`.
- **Fix:** Added `winocr>=1.0.0; sys_platform == "win32"` to `backend/requirements.txt`.
- **Files Changed:** `backend/requirements.txt`
- **Tests Performed:** Verified package installation and Windows native OCR execution.
- **Result:** **PASS** (Native Windows OCR operational).

---

### FIX 11: Frontend Lint Warnings & Unused Assets (P3)
- **Problem:** 118 lint warnings (unused imports, unused parameters, unused variables) in frontend codebase.
- **Root Cause:** Accumulated legacy imports in `DocumentViewer.tsx` and `DocumentVerificationWorkspace.tsx`.
- **Fix:** Cleaned up unused Lucide icons, removed unused types, prefixed unused props with `_`, and properly utilized `isCounterfeit` in the outcome banner.
- **Files Changed:** `frontend/src/features/document/DocumentViewer.tsx`, `frontend/src/features/workspace/DocumentVerificationWorkspace.tsx`
- **Tests Performed:** `npm run lint` and `npm run build`
- **Result:** **PASS** (Production bundle built successfully with 0 errors).

---

### FIX 12: Missing Environment Documentation (P3)
- **Problem:** Absence of `.env.example` templates created ambiguity for deployment and testing.
- **Root Cause:** Environment variables were scattered in `config.py` without sample files.
- **Fix:** Created `backend/.env.example` and `frontend/.env.example` with documented keys and placeholders.
- **Files Changed:** `backend/.env.example`, `frontend/.env.example`
- **Tests Performed:** Clean environment configuration validation.
- **Result:** **PASS** (Complete configuration templates present).
