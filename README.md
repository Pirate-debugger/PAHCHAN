# PAHCHAN (पहचान)
### AI-Based Fake Identity & Travel Document Screening System
**Smart India Hackathon (SIH 2026) &bull; Problem Statement SIH2026188**
**Ministry of Home Affairs &bull; Sashastra Seema Bal (SSB), Police II Division**

---

## 📌 Executive Overview

**PAHCHAN** is an edge-first, AI-driven forensic screening workstation engineered specifically for **border checkpoints, immigration counters, and law enforcement terminals**.

Frontline officers of the **Sashastra Seema Bal (SSB)** along India's open borders with Nepal and Bhutan must inspect thousands of travelers daily with only 15 to 30 seconds per document. PAHCHAN replaces slow manual inspection and brittle commercial e-Gates with sub-second optical forensics, international **ICAO Doc 9303** checksum validation, and biometric face verification.

---

## 🚀 Key Capabilities

1. **Enterprise 3-6-3 Screening Workstation**
   - **6-Column Hero Document Canvas**: High-resolution forensic inspection area with real-time coordinate crosshairs.
   - **Interactive High-Contrast Filter**: Highlights microprinting, watermarks, and security substrate threads.
   - **Error Level Analysis (ELA) Heatmap**: Exposes digital photo substitution and compression anomalies.

2. **ICAO Doc 9303 Checksum Engine**
   - Parses Machine Readable Travel Documents (MRTD): TD1, TD2, TD3 (Passports).
   - Validates official 7-3-1 weight modulus-10 check digits on document number, date of birth, and expiry date.
   - Automatic cross-referencing between Visual Inspection Zone (VIZ) OCR and MRZ.

3. **Biometric Face Verification**
   - 512-dimensional facial embedding comparison using Cosine Similarity.
   - Cross-matches physical passport chip portraits against live checkpoint booth cameras.
   - Visual similarity gauge and operational match signals.

4. **Synthetic Demo Lab (8 Real-World Scenarios)**
   - Pre-configured border cases demonstrating genuine passes, altered photos, MRZ check digit fails, impersonation, visa stamp anomalies, and duplicate registry conflicts.

5. **Chain-of-Custody & Court-Admissible Dossier**
   - SHA-256 cryptographic audit seal on all cases.
   - Embedded QR verification glyph.
   - Official Ministry of Home Affairs / SSB legal layout with signature blocks and print-ready A4 export (`@media print`).

---

## 🏗️ Architecture

```
                               ┌────────────────────────────────┐
                               │     BORDER SCREENING TERMINAL  │
                               │      React + TypeScript + Vite │
                               └───────────────┬────────────────┘
                                               │ HTTP / REST
                               ┌───────────────▼────────────────┐
                               │      PAHCHAN FASTAPI ENGINE    │
                               │   Edge-First / Local Outpost   │
                               └───────────────┬────────────────┘
                                               │
       ┌───────────────────────────────┼───────────────────────────────┐
       ▼                               ▼                               ▼
[COMPUTER VISION FORENSICS]    [ICAO DOC 9303 ENGINE]         [BIOMETRIC FACE MATCH]
- Error Level Analysis (ELA)   - 7-3-1 Modulus-10 Checks      - 512-D Face Embeddings
- Laplacian Texture Ratio      - VIZ vs MRZ Cross-Check       - Cosine Similarity
- Perimeter Edge Gradients     - ISO 3166-1 Alpha-3           - Liveness & Alignment
```

---

## ⚡ Quick Start

### Windows One-Click Launch
Double-click `run_pahchan.bat` (or right-click `run_pahchan.ps1` &rarr; *Run with PowerShell*).

### Manual Launch

#### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run_backend.py
```
*Backend runs on `http://127.0.0.1:8000` (Swagger UI at `/docs`).*

#### 2. Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://127.0.0.1:5173`.*

---

## 🧪 Automated Testing

### Backend Unit & Integration Tests
```bash
cd backend
python -m pytest tests
```
*Includes tests for ICAO MRZ checksums, screening endpoints, and validation rules.*

### Frontend Production Build
```bash
cd frontend
npm run build
```

---

## 📖 Presentation & Demo Resources

- **[Judge Presentation & Live Demo Guide](JUDGES_PRESENTATION_GUIDE.md)**: 5-minute pitch script, live demo sequence, and answers to tough technical questions.

---

## ⚖️ Compliance & Standards

- **ICAO Doc 9303**: Machine Readable Travel Documents (Part 1 to 12).
- **ISO/IEC 19794-5**: Biometric data interchange formats (Face Image Data).
- **Information Technology Act, 2000 (India)**: Digital evidence chain-of-custody hash compliance.
