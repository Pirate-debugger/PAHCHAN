# PAHCHAN — ARCHITECTURE & MASTER IMPLEMENTATION PLAN
**Smart India Hackathon 2026 — Problem Statement SIH2026188: AI-Based Fake Identity & Document Screening System**  
**Tagline:** *"Verify Identity. Detect Risk. Protect Trust."*  
**Core Principle:** *Evidence → Findings → Risk → Recommendation* (Never *AI → FAKE*)

---

## 1. Executive Summary & Product Architecture

PAHCHAN is an AI-assisted decision-support and forensic screening platform designed for authorized border, airport, and checkpoint screening officers (such as SSB / Bureau of Immigration / Ministry of Home Affairs). 

PAHCHAN is engineered to **empower officers with explainable forensic signals**, not to act as an autonomous black-box authority that criminalizes individuals or declares documents fake without proof.

### Core Pipeline
```
[Document Ingestion (Passport/Visa/ID)]
       │
       ▼
[Image Preprocessing & OCR Extraction] ──► Confidence per field & bounding boxes
       │
       ▼
[Rule-Based Validation Engine] ──────────► ICAO Doc 9303 MRZ 7-3-1 modulo-10, date logic, expiration
       │
       ▼
[Forensic Tampering Layer] ──────────────► ELA (Error Level Analysis), Sobel edge gradient, SSIM stamp, EXIF/XMP
       │
       ▼
[Cross-Document Consistency Engine] ─────► Passport vs Visa normalization & side-by-side conflict detection
       │
       ▼
[Biometric Face Verification] ───────────► Document photo vs Presenter live capture (Cosine similarity, landmarks)
       │
       ▼
[Deterministic Explainable Risk Engine] ─► Additive weighted scoring (0-100), severity, evidence references
       │
       ▼
[Explainability & Decision Support] ─────► "What happened? Why risky? What evidence? Officer recommendation"
       │
       ▼
[Screening Report & Immutable Audit Log] ► Official downloadable dossier & SQLite/PostgreSQL audit trail
```

---

## 2. Environment & System Assessment

| Dimension | Environment Finding | Strategic Decision |
| :--- | :--- | :--- |
| **OS & Host** | Windows 11 | Full native PowerShell compatibility |
| **Python** | Python 3.14.4 | Compatible with FastAPI 0.141, Pydantic 2.13, OpenCV, Pillow 12.3 |
| **Node.js & npm** | Node v25.9.0, npm 11.12.1 | Vite 8 + React 19 + TypeScript + Tailwind CSS |
| **GPU / CUDA** | Not available (CPU only) | Optimize CV/ML for sub-second CPU inference (NumPy vectorization, Pillow ELA, OpenCV Sobel, Scikit-Image SSIM, ONNX CPU) |
| **OCR Runtime** | `easyocr` (1.7.2) + `pypdf` installed | Multi-engine OCR with fallback to high-speed heuristic text extraction and MRZ parser |
| **Database** | SQLite3 + SQLAlchemy 2.0 | Clean relational schema with migration-ready abstractions for PostgreSQL |
| **Existing Code** | Flat scripts in `backend/`, basic UI in `frontend/` | Refactor into clean modular enterprise architecture: `backend/app/...` and `frontend/src/features/...` |

---

## 3. Modular Backend Architecture (`backend/app/`)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI application factory & routers
│   ├── core/
│   │   ├── config.py               # Config, environment variables, risk thresholds
│   │   ├── security.py             # File validation, sanitization, size limits
│   │   └── logging.py              # Structured logging
│   ├── models/
│   │   ├── __init__.py
│   │   ├── document.py             # SQLAlchemy models: Document, Field, Region
│   │   ├── screening.py            # ScreeningSession, Decision, Finding
│   │   ├── audit.py                # AuditLog, SessionEvent
│   │   └── watchlist.py            # WatchlistRecord
│   ├── schemas/
│   │   ├── document.py             # Pydantic schemas for upload & OCR
│   │   ├── validation.py           # MRZ and field validation schemas
│   │   ├── forensics.py            # ELA, metadata, and region tampering schemas
│   │   ├── face.py                 # Biometric verification schemas
│   │   ├── risk.py                 # Risk assessment & factor breakdown schemas
│   │   └── report.py               # Screening dossier & export schemas
│   ├── services/
│   │   ├── ocr_service.py          # EasyOCR + MRZ line extraction + field confidence
│   │   ├── validation_service.py   # ICAO Doc 9303 TD1/TD2/TD3 checksums + date logic
│   │   ├── forensics_service.py    # ELA generation, Sobel gradients, SSIM stamp, metadata
│   │   ├── crossdoc_service.py     # Cross-document normalizer & conflict resolver
│   │   ├── face_service.py         # Biometric face detection, landmark HUD & embedding match
│   │   ├── risk_service.py         # Deterministic configurable multi-signal risk engine
│   │   ├── explainability_service.py # "What happened? Why risky? Evidence? Recommendation"
│   │   ├── report_service.py       # Comprehensive screening dossier generation
│   │   └── audit_service.py        # SHA-256 document hashing & immutable audit trail
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── router.py           # Master API v1 router
│   │       ├── screenings.py       # POST /screenings, GET /screenings/{id}
│   │       ├── documents.py        # POST /documents/upload, POST /ocr, POST /forensics
│   │       ├── face.py             # POST /face/verify
│   │       ├── risk.py             # POST /risk/assess, GET /risk/weights
│   │       ├── audit.py            # GET /audit/{session_id}, GET /audit/logs
│   │       └── demo.py             # GET /demo/scenarios, POST /demo/run/{scenario_id}
│   ├── database.py                 # Engine, sessionmaker, Base
│   └── tests/
│       ├── test_mrz_checksums.py   # Unit tests for ICAO MRZ
│       ├── test_forensics.py       # Unit tests for ELA & metadata
│       ├── test_risk_engine.py     # Unit tests for deterministic weights
│       ├── test_crossdoc.py        # Unit tests for cross-document normalizer
│       └── test_api_pipeline.py    # Integration tests for end-to-end screening
├── requirements.txt
└── idshield_audit.db -> pahchan_audit.db
```

---

## 4. Frontend Architecture (`frontend/src/`)

```
frontend/src/
├── components/
│   ├── ui/                         # Base primitives (Card, Badge, Button, Tabs, Modal)
│   ├── Navbar.tsx                  # PAHCHAN command header, checkpoint selector, status
│   ├── InstantVerdictBanner.tsx    # 3-Second rule verdict banner with clear actionable alert
│   └── StatCards.tsx               # Analytics metric cards for dashboard
├── features/
│   ├── workstation/                # Screening Workstation (Module 9)
│   │   ├── WorkstationView.tsx     # 4-quadrant layout: preview, extraction, risk, findings
│   │   └── ActionRecommendation.tsx# Primary/Secondary inspection & clearance actions
│   ├── ingestion/                  # Document Ingestion (Module 1)
│   │   ├── DocumentUploadModal.tsx # Drag-and-drop, PDF/image validation, passport/visa selection
│   │   └── DualDocIngestor.tsx     # Multi-document upload (Passport + Visa bundle)
│   ├── ocr/                        # OCR & Field Extraction (Module 2)
│   │   └── DocumentDetailsCard.tsx # Fields with visual confidence % badges & bounding boxes
│   ├── validation/                 # Rule-Based & Cross-Doc Validation (Modules 3 & 4)
│   │   ├── MRZValidationBadge.tsx  # Interactive checksum breakdown (Doc, DOB, Expiry, Comp)
│   │   └── CrossDocCompareModal.tsx# Side-by-side conflict comparison (Passport vs Visa)
│   ├── forensics/                  # Forensic Evidence Viewer (Modules 5 & 9)
│   │   ├── ForensicsViewer.tsx     # Zoom/pan viewer with Original, Heatmap, and Bounding Box modes
│   │   └── FindingDetailCard.tsx   # Detailed finding card: ID, category, severity, evidence
│   ├── face/                       # Face Verification Studio (Module 6)
│   │   └── FaceMatchPanel.tsx      # Doc photo vs Live photo/webcam, threshold slider, HUD landmarks
│   ├── risk/                       # Risk Engine & Explainability (Modules 7 & 8)
│   │   ├── RiskBreakdownCard.tsx   # Additive risk factor ledger, configurable weights
│   │   └── ExplainabilityMatrix.tsx# "What happened? Why risky? Evidence? Recommendation"
│   ├── lab/                        # Synthetic Document Lab (Module 15)
│   │   └── SyntheticLab.tsx        # 8 repeatable SIH scenarios with deterministic findings
│   ├── reports/                    # Screening Report (Module 16)
│   │   └── AuditReportModal.tsx    # Official downloadable & printable dossier
│   ├── dashboard/                  # Command Center Dashboard (Module 14)
│   │   └── DashboardView.tsx       # Recharts: risk distribution, category pie, daily throughput
│   └── audit/                      # Audit Trail (Module 17)
│       └── AuditLogView.tsx        # Searchable, immutable event stream with SHA-256 hashes
├── data/
│   └── mockCases.ts                # Complete 8 SIH test cases with rich deterministic data
├── services/
│   └── api.ts                      # Axios/fetch client connecting to FastAPI backend
├── types/
│   └── index.ts                    # Full TypeScript domain contracts
└── utils/
    ├── formatters.ts
    └── mrz.ts
```

---

## 5. The 8 Synthetic Demonstration Scenarios

| # | Scenario Name | Primary Risk Signal | Expected Score | Expected Decision |
| :- | :--- | :--- | :--- | :--- |
| **1** | **Genuine Republic of India Passport** | Pristine ELA, valid ICAO 7-3-1 checksums, 96.4% face match | 6 / 100 (LOW) | `CLEAR_ENTRY` |
| **2** | **Altered Photograph / Spliced Photo** | ELA compression variance divergence > 24.8, Sobel boundary jump | 78 / 100 (CRITICAL) | `DETAIN_ALERT` |
| **3** | **Modified Date of Birth (VIZ vs MRZ)** | Font baseline jitter, halo artifacts, VIZ 1995 vs MRZ 2002 | 82 / 100 (CRITICAL) | `DETAIN_ALERT` |
| **4** | **Counterfeit / Altered Visa Stamp** | Template SSIM match 38.4% (< 80%), synthetic digital font | 72 / 100 (CRITICAL) | `DETAIN_ALERT` |
| **5** | **Identity Impersonation / Face Mismatch** | Biometric embedding similarity 34.8% (< 75%), landmark divergence | 88 / 100 (CRITICAL) | `DETAIN_ALERT` |
| **6** | **Expired Document + Photoshop Metadata** | Expired 2023, Adobe Photoshop 2024 history tags in EXIF | 85 / 100 (CRITICAL) | `DETAIN_ALERT` |
| **7** | **Cross-Document Mismatch (Passport vs Visa)** | Passport name "RAHUL KUMAR" vs Visa sticker "RAHUL SHARMA" | 75 / 100 (CRITICAL) | `SECONDARY_INSPECTION` |
| **8** | **Multiple Risk Signals (Combined Threat)** | Spliced photo + modified expiry + biometric mismatch + watchlist hit | 95 / 100 (CRITICAL) | `DETAIN_ALERT` |

---

## 6. Implementation Phases

- **Phase 1: Project Foundation & Architecture Refactor**  
  Restructure backend into `app/` package, rename brand to PAHCHAN, unify TypeScript types, setup API client.
- **Phase 2: Document Ingestion & Enhanced OCR**  
  Implement robust file upload (images + PDF), EasyOCR / heuristic extraction with per-field confidence and bounding boxes.
- **Phase 3: Validation Engine & Cross-Document Checker**  
  ICAO Doc 9303 TD1/TD2/TD3 checksum validator + multi-document normalizer (Passport vs Visa).
- **Phase 4: Forensic Tampering Engine**  
  Error Level Analysis (ELA), edge discontinuity, SSIM stamp comparison, and EXIF/XMP metadata risk analysis.
- **Phase 5: Biometric Face Verification**  
  Face alignment, embedding cosine similarity, landmark HUD, and dynamic thresholding.
- **Phase 6: Deterministic Risk & Explainability Engine**  
  Additive weighted scoring, structured 4-part explainability breakdown ("What happened? Why risky? Evidence? Recommendation").
- **Phase 7: Interactive Forensic Evidence Viewer & Workstation UI**  
  Microscope viewer with zoom/pan, ELA heatmap toggle, bounding boxes, and instant 3-second verdict banner.
- **Phase 8: Official Screening Report & Audit Trail**  
  Downloadable printable PDF/HTML screening dossier, SHA-256 document hashing, and audit log.
- **Phase 9: Synthetic Document Lab & 8 Test Cases**  
  Full interactive lab with all 8 competition scenarios and custom document upload.
- **Phase 10: Testing, Quality Assurance & Verification**  
  Backend pytest suite, frontend TypeScript build check, API integration tests.
- **Phase 11: Documentation & SIH Presentation Materials**  
  Comprehensive `README.md`, `docs/architecture.md`, `docs/demo-script.md`, `docs/judging-points.md`, `docs/api.md`, `docs/security.md`, `docs/limitations.md`.
