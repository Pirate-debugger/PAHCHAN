# PAHCHAN — Quality Assurance & Testing Framework
**Smart India Hackathon 2026 — Problem Statement SIH2026188: AI-Based Fake Identity & Document Screening System**  
**Team:** Debugs Pirates | **Institution:** Invertis University

---

## 1. Testing Strategy & Quality Philosophy

PAHCHAN enforces a multi-tiered testing protocol to ensure zero downtime, deterministic demonstration behavior, and foolproof reliability under high-stress border checkpoint conditions:

```
+-------------------------------------------------------------------------+
|                  END-TO-END SIH DEMONSTRATION WORKFLOWS                 |
|            8 Deterministic Synthetic Scenarios (100% Offline)           |
+-------------------------------------------------------------------------+
                                    |
+-------------------------------------------------------------------------+
|                 FRONTEND QUALITY GATES & BUNDLE INTEGRITY               |
|         TypeScript Strict (`tsc -b`) + Oxlint + Vite Production Build   |
+-------------------------------------------------------------------------+
                                    |
+-------------------------------------------------------------------------+
|                 BACKEND AUTOMATED REGRESSION SUITE                      |
|           18 Pytest Tests: Forensics, Checksums, Risk, & API            |
+-------------------------------------------------------------------------+
```

---

## 2. Backend Automated Test Suite (Pytest)

The backend automated test suite is located in `backend/app/tests/`. All 18 tests execute in under 1.2 seconds:

### 2.1 Test Module Breakdown
| Test File | Test Name | Purpose |
|---|---|---|
| `test_api_pipeline.py` | `test_health_check_endpoint` | Verifies `/api/health` and `/api/v1/health` status codes and payload |
| `test_api_pipeline.py` | `test_demo_scenarios_endpoint` | Validates availability of 8 synthetic scenarios via API |
| `test_api_pipeline.py` | `test_risk_weights_endpoints` | Confirms dynamic risk factor configuration and 0-100 clamping |
| `test_api_pipeline.py` | `test_full_screening_pipeline_endpoint` | Executes end-to-end multipart form upload and response validation |
| `test_crossdoc.py` | `test_normalize_name` | Tests unicode normalization and noise strip from names |
| `test_crossdoc.py` | `test_normalize_date` | Validates date format conversions (YYYY-MM-DD, DD/MM/YYYY) |
| `test_crossdoc.py` | `test_matching_documents` | Confirms cross-document pass when passport and visa match |
| `test_crossdoc.py` | `test_mismatched_documents` | Ensures risk trigger when passport and visa exhibit conflicting DOB/name |
| `test_forensics.py` | `test_ela_generation` | Verifies generation of Error Level Analysis differential image |
| `test_forensics.py` | `test_metadata_inspection_clean` | Tests EXIF tag parsing on clean camera images |
| `test_forensics.py` | `test_comprehensive_forensics_pipeline` | Validates end-to-end multi-spectral forensic assessment |
| `test_mrz_checksums.py` | `test_mrz_checksum_calculation` | Validates 7-3-1 modulo-10 mathematical algorithm |
| `test_mrz_checksums.py` | `test_td3_genuine_passport_parsing` | Verifies parsing of authentic Republic of India TD3 passport MRZ |
| `test_mrz_checksums.py` | `test_td3_checksum_mismatch` | Confirms detection of altered document numbers and invalid check digits |
| `test_mrz_checksums.py` | `test_expired_document_detection` | Tests date comparison logic detecting expired travel validity |
| `test_risk_engine.py` | `test_clean_document_risk` | Verifies authentic document produces score in `LOW` tier (0–29) |
| `test_risk_engine.py` | `test_critical_tampered_document_risk` | Verifies spliced portrait triggers `CRITICAL` tier (70–100) |
| `test_risk_engine.py` | `test_risk_score_clamping` | Confirms cumulative points are strictly clamped to range [0, 100] |

### 2.2 Running Backend Tests
From the `backend/` directory:
```bash
python -m pytest app/tests -v
```

**Expected Output:**
```
============================== test session starts ==============================
collected 18 items

app/tests/test_api_pipeline.py::test_health_check_endpoint PASSED        [  5%]
app/tests/test_api_pipeline.py::test_demo_scenarios_endpoint PASSED      [ 11%]
app/tests/test_api_pipeline.py::test_risk_weights_endpoints PASSED       [ 16%]
app/tests/test_api_pipeline.py::test_full_screening_pipeline_endpoint PASSED [ 22%]
app/tests/test_crossdoc.py::test_normalize_name PASSED                   [ 27%]
app/tests/test_crossdoc.py::test_normalize_date PASSED                   [ 33%]
app/tests/test_crossdoc.py::test_matching_documents PASSED               [ 38%]
app/tests/test_crossdoc.py::test_mismatched_documents PASSED             [ 44%]
app/tests/test_forensics.py::test_ela_generation PASSED                  [ 50%]
app/tests/test_forensics.py::test_metadata_inspection_clean PASSED       [ 55%]
app/tests/test_forensics.py::test_comprehensive_forensics_pipeline PASSED [ 61%]
app/tests/test_mrz_checksums.py::test_mrz_checksum_calculation PASSED    [ 66%]
app/tests/test_mrz_checksums.py::test_td3_genuine_passport_parsing PASSED [ 72%]
app/tests/test_mrz_checksums.py::test_td3_checksum_mismatch PASSED       [ 77%]
app/tests/test_mrz_checksums.py::test_expired_document_detection PASSED  [ 83%]
app/tests/test_risk_engine.py::test_clean_document_risk PASSED           [ 88%]
app/tests/test_risk_engine.py::test_critical_tampered_document_risk PASSED [ 94%]
app/tests/test_risk_engine.py::test_risk_score_clamping PASSED           [100%]

======================== 18 passed, 1 warning in 1.16s ========================
```

---

## 3. Frontend Quality Gates & Compilation

The frontend enforces strict linting and zero-error TypeScript builds:

### 3.1 Commands
```bash
# 1. Run Linter
npm run lint

# 2. Run TypeScript Type-Check & Production Bundle
npm run build
```

**Quality Standards:**
- Zero TypeScript compiler errors (`tsc -b`).
- Zero linter errors or warnings (`oxlint`).
- Minified production bundle under `400KB` gzipped.

---

## 4. The 8 Synthetic Evaluation Scenarios

| # | Scenario Title | Primary Anomaly | Expected Score | Expected Risk Tier |
|---|---|---|---|---|
| **1** | Genuine Republic of India Passport | None (Authentic baseline) | `8 / 100` | **LOW** (Clear Entry) |
| **2** | Spliced Facial Substrate | Error Level (ELA) + Sobel cut discontinuity | `78 / 100` | **CRITICAL** (Detain Alert) |
| **3** | Altered Date of Birth | Visual Zone DOB vs MRZ check digit mismatch | `55 / 100` | **MEDIUM** (Secondary Inspection) |
| **4** | Counterfeit Immigration Stamp | Low SSIM + ink spectrum discontinuity | `62 / 100` | **MEDIUM** (Secondary Inspection) |
| **5** | Biometric Impersonation | Cosine distance 42.1% (below 75% threshold) | `82 / 100` | **CRITICAL** (Detain Alert) |
| **6** | Expired Passport + Metadata Footprint | Past expiry date + Adobe Photoshop tag | `68 / 100` | **MEDIUM** (Secondary Inspection) |
| **7** | Passport-Visa Cross-Doc Conflict | Name & nationality mismatch between docs | `58 / 100` | **MEDIUM** (Secondary Inspection) |
| **8** | Multi-Vector Adversarial Attack | Spliced photo + fake stamp + face mismatch | `94 / 100` | **CRITICAL** (Detain Alert) |
