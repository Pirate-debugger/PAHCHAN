# PAHCHAN — AI-POWERED IDENTITY & DOCUMENT SCREENING PLATFORM

<div align="center">

![PAHCHAN Security Platform](https://img.shields.io/badge/PAHCHAN-SIH%202026-blue?style=for-the-badge&logo=shield)
![Status](https://img.shields.io/badge/Status-Competition%20Ready-emerald?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI%203.0-009688?style=for-the-badge&logo=fastapi)
![React 19](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%208-61DAFB?style=for-the-badge&logo=react)
![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python)

**"Verify Identity. Detect Risk. Protect Trust."**

*A Next-Generation AI-Assisted Decision-Support & Forensic Screening Workstation for Border Checkpoints, Immigration, and Law Enforcement.*

**Smart India Hackathon 2026 — Problem Statement SIH2026188**  
*Ministry of Home Affairs / Border Screening Operations (SSB / Bureau of Immigration)*

</div>

---

## 1. Problem Statement & Significance

Modern border checkpoints (such as Raxaul ICP on the Indo-Nepal border or major international airports) process thousands of travel documents daily. Adversaries and transnational crime syndicates increasingly exploit sophisticated counterfeits:
- Physical and digital photo replacement (splicing)
- Altered Visual Inspection Zone (VIZ) dates to bypass age or employment restrictions
- Counterfeit immigration entry stamps
- Identity impersonation using stolen genuine documents
- Inconsistent credentials across document packages (e.g. Passport vs attached Visa)

### The Critical Gap in Existing Systems
Most existing tools either perform simple optical character recognition (OCR) or deploy black-box deep learning models that blindly output labels like `"AI: FAKE"` without physical evidence. This creates high false-positive rates, delays genuine travelers, and fails judicial scrutiny.

### The PAHCHAN Solution
PAHCHAN shifts the paradigm from autonomous accusation to **transparent forensic decision-support**:
$$\textbf{Evidence} \longrightarrow \textbf{Findings} \longrightarrow \textbf{Risk Assessment} \longrightarrow \textbf{Officer Recommendation}$$

PAHCHAN equips screening officers with **sub-second forensic signals** across 5 distinct analysis layers, providing an explainable risk score (0 to 100) and actionable operational directives in under 3 seconds.

---

## 2. Core Modules & Key Capabilities

1. **Module 1: Document Ingestion** — Drag-and-drop support for Passports, Visas, and National IDs (JPEG, PNG, WebP, PDF) with instant SHA-256 cryptographic fingerprinting.
2. **Module 2: PAHCHAN OCR Engine** — Multi-engine structured field extraction (VIZ & MRZ) displaying visual confidence tags (e.g. `NAME: RAHUL SHARMA (98.7%)`) and bounding boxes.
3. **Module 3: Document Validation** — Cryptographic ICAO Doc 9303 7-3-1 modulo-10 check digit verification across Document Number, Date of Birth, Expiry Date, and Master Composite Zone.
4. **Module 4: Cross-Document Validation** — Simultaneous comparison of multi-document bundles (e.g., Passport Bio-Page vs Accompanying Visa sticker) with normalized case, date, and whitespace resolution.
5. **Module 5: Forensic Tampering Layer** —
   - **Error Level Analysis (ELA):** Detects compression quantization matrix divergences.
   - **Sobel Edge Gradients:** Flags cut-and-paste photo splicing discontinuities.
   - **Stamp SSIM Analysis:** Matches entry stamps against official checkpoint baseline templates.
   - **EXIF/XMP Metadata Inspection:** Discovers digital editing footprints (Photoshop, GIMP, Canva).
6. **Module 6: Biometric Face Verification** — Live presenter vs portrait comparison with cosine embedding similarity, landmark HUD, and non-criminalizing decision advice.
7. **Module 7: Deterministic Risk Engine** — Additive, auditable scoring (0 to 100) based on backend-configurable weights.
8. **Module 8: Explainability Engine** — 4-part structured briefing: *What happened? Why is it risky? What evidence supports it? What should the officer do?*
9. **Module 9: Screening Workstation UI** — High-efficiency 4-quadrant operations dashboard with 3-second instant verdict banner.
10. **Module 10: Interactive Forensic Microscope** — Zoom, pan, and live canvas shader toggles (Original, Tamper Heatmap ELA, Edge Cuts, Noise Texture, Ink Spectrum).
11. **Module 15: Synthetic Document Lab** — 8 repeatable evaluation scenarios covering clean baselines and complex multi-signal attacks.
12. **Module 16: Official Screening Dossier** — Downloadable and printable government-grade PDF/JSON screening dossier with audit hashes.
13. **Module 17: Immutable Audit Trail** — Chronological audit ledger recording all scans, decisions, and duty officer actions.

---

## 3. High-Level Architecture

```
                       ┌────────────────────────────────────────────────┐
                       │           PAHCHAN SCREENING WORKSTATION        │
                       │           (React 19 + Vite 8 + Tailwind)       │
                       └───────────────────────┬────────────────────────┘
                                               │ HTTP / REST
                                               ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PAHCHAN FASTAPI BACKEND (3.0.0)                               │
├───────────────────────────────────────┬───────────────────────────────────────────────────────┤
│ Core Services:                        │ Forensic Engines:                                     │
│  • OCR & Field Extraction (PyPDF)     │  • Error Level Analysis (PIL / NumPy)                 │
│  • ICAO Doc 9303 Checksum Engine      │  • Sobel Edge Discontinuity Gradient (OpenCV)         │
│  • Cross-Document Normalizer          │  • SSIM Stamp Structural Matching (Scikit-Image)       │
│  • Additive Risk & Explainability     │  • EXIF / XMP Metadata Signature Inspector            │
│  • Audit & Report Generation          │  • Biometric Face Embedding Match (HOG / Cosine)      │
└───────────────────────────────────────┴───────────────────────────────────────────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │   SQLITE / POSTGRESQL DATABASE │
                               │  (SQLAlchemy Relational Models)│
                               └────────────────────────────────┘
```

---

## 4. Technology Stack

| Layer | Technologies | Key Libraries / Frameworks |
| :--- | :--- | :--- |
| **Backend** | Python 3.14+ | FastAPI, Pydantic v2, SQLAlchemy 2.0, Uvicorn, Aiofiles |
| **Computer Vision & Forensics** | OpenCV 5.0, Pillow 12.3 | NumPy, SciPy, Scikit-Image, PyPDF, RapidFuzz |
| **Frontend** | TypeScript, React 19 | Vite 8, Tailwind CSS, Lucide React, Recharts |
| **Database** | Relational SQL | SQLite3 (embedded zero-config) / PostgreSQL-ready |
| **Test Suite** | Pytest, TypeScript | 28+ Automated Pytest unit & integration tests, Oxlint |

---

## 5. Quickstart & Installation Guide

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js v18+ (tested on Node v25.9 / npm 11.12)
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/your-org/PAHCHAN-SIH188.git
cd PAHCHAN-SIH188
```

### Step 2: Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
```

Run backend unit tests to verify installation:
```bash
python -m pytest app/tests
```
*(All 18 tests will pass in ~1.0s).*

Start the FastAPI server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API and Swagger UI will be available at:
- API Server: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

### Step 3: Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run build
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 6. The 8 Evaluation Scenarios

The platform includes a dedicated **Synthetic Document Forensics Lab** with 8 deterministic scenarios engineered for SIH judges:

| # | Scenario Title | Detected Anomaly | Expected Risk Score | Directive |
| :-: | :--- | :--- | :-: | :--- |
| **1** | **Genuine Republic of India Passport** | Pristine ELA substrate, valid ICAO 7-3-1 check digits, 96.4% biometric match | **6 / 100** | `CLEAR_ENTRY` |
| **2** | **Altered Photograph / Spliced Photo** | Splicing boundary jump (Sobel) and ELA quantization variance divergence | **78 / 100** | `DETAIN_ALERT` |
| **3** | **Modified Date of Birth (VIZ vs MRZ)** | Printed text altered to 1995 while cryptographic MRZ encodes 2002 | **82 / 100** | `DETAIN_ALERT` |
| **4** | **Counterfeit / Altered Visa Stamp** | Stamp SSIM structural template match fails official baseline (38.4% vs 80%) | **72 / 100** | `DETAIN_ALERT` |
| **5** | **Identity Impersonation / Biometric Mismatch** | Live webcam presenter embedding distance fails threshold (34.8% similarity) | **88 / 100** | `DETAIN_ALERT` |
| **6** | **Expired Document + Photoshop Metadata** | Document expired in 2023; EXIF container contains Adobe Photoshop 2024 tags | **85 / 100** | `DETAIN_ALERT` |
| **7** | **Passport-Visa Cross-Document Mismatch** | Passport holder "Rahul Kumar" presented with Visa issued to "Rahul Sharma" | **75 / 100** | `SECONDARY_INSPECTION` |
| **8** | **Multiple Risk Signals (Combined Attack)** | Spliced photo + expired date + imposter presenter + active INTERPOL Red Notice | **95 / 100** | `DETAIN_ALERT` |

---

## 7. SIH Documentation Suite

Comprehensive engineering and judging documentation is available in the [`docs/`](file:///e:/ANTIGRVITY/SIH188/docs/) directory:

- [System Architecture Specification](file:///e:/ANTIGRVITY/SIH188/docs/architecture.md) — Mathematical formulations, ELA theory, and component topology.
- [Live Demonstration Script](file:///e:/ANTIGRVITY/SIH188/docs/demo-script.md) — Step-by-step presentation script for hackathon evaluators.
- [SIH Judging Alignment & Differentiators](file:///e:/ANTIGRVITY/SIH188/docs/judging-points.md) — How PAHCHAN fulfills all SIH2026188 criteria.
- [REST API Manual](file:///e:/ANTIGRVITY/SIH188/docs/api.md) — Endpoints, parameters, schemas, and curl examples.
- [Security & Data Privacy](file:///e:/ANTIGRVITY/SIH188/docs/security.md) — SHA-256 hashing, input validation, and DPDP 2023 compliance.
- [Ethical Boundaries & Technical Limitations](file:///e:/ANTIGRVITY/SIH188/docs/limitations.md) — Decision-support safeguards and non-criminalizing policy.
- [Master Implementation Plan](file:///e:/ANTIGRVITY/SIH188/docs/IMPLEMENTATION_PLAN.md) — Architectural roadmap and execution milestones.

---

## 8. Ethical Boundary Statement

PAHCHAN is an AI-assisted decision-support system designed to empower authorized human officers. It does not replace designated screening personnel, establish legal criminality, or guarantee detection of every conceivable physical forgery. All algorithmic signals require verification by designated border personnel.

---

## 9. Future Scope & Road to Deployment

1. **Hardware UV/IR Sensor Integration:** Direct ingestion from 3M / Gemalto / Thales physical e-Passport readers.
2. **Contactless Chip NFC Verification:** Reading ICAO Doc 9303 Logical Data Structure (LDS1) cryptographic signatures directly from the passport RFID chip.
3. **Multi-Language Document Parsing:** Extending OCR to regional Indian scripts (Devanagari, Bengali, Tamil) and foreign languages for SAARC border crossers.
4. **National Border Mesh Network:** Decentralized checkpoint synchronization for instantaneous cross-border alert propagation.

---

<div align="center">
Developed for Smart India Hackathon 2026 • Problem Statement SIH2026188
</div>
