# PAHCHAN — System Architecture & Technical Specifications
**Smart India Hackathon 2026 — Problem Statement SIH2026188: AI-Based Fake Identity & Document Screening System**  
**Team:** Debugs Pirates | **Institution:** Invertis University

---

## 1. High-Level Architectural Overview

PAHCHAN is engineered as a decoupled, multi-tier forensic screening workstation combining client-side real-time interactive visualization with high-performance asynchronous computer vision and document parsing backends.

```
+-----------------------------------------------------------------------------+
|                          PRESENTATION LAYER (React 19)                      |
|  - Command Center Overview    - 4-Quadrant Screening Workstation            |
|  - Multi-Spectral Forensics   - Biometrics 1:1 Cosine Distance HUD          |
|  - ICAO Math Inspector Modal  - Cryptographic Dossier Generator (PDF/Print) |
+-----------------------------------------------------------------------------+
                                       |
                   HTTP REST API / JSON + Multi-Part Form
                                       v
+-----------------------------------------------------------------------------+
|                          API & ORCHESTRATION LAYER                          |
|                       FastAPI 0.115+ / Python 3.14                          |
|  - Request Validation & Hash Digesting (SHA-256)                            |
|  - Modular Pipeline Router (/api/v1/screenings)                             |
|  - CORS & Security Boundary Filters                                         |
+-----------------------------------------------------------------------------+
                                       |
       +-------------------------------+-------------------------------+
       |                               |                               |
       v                               v                               v
+-----------------------+   +-----------------------+   +---------------------+
|   FORENSICS ENGINE    |   |    DOCUMENT ENGINE    |   |  BIOMETRIC ENGINE   |
| - Error Level (ELA)   |   | - ICAO Doc 9303 Mod10 |   | - Face Mesh & Crop  |
| - Sobel Edge Cut Dis. |   | - Chronological Date  |   | - 68-Point Geometry |
| - Noise High-Pass     |   | - Visual vs MRZ Cross |   | - Cosine Distance   |
| - EXIF/XMP Metadata   |   | - Cross-Doc Matcher   |   | - Anti-Spoof Metric |
+-----------------------+   +-----------------------+   +---------------------+
       |                               |                               |
       +-------------------------------+-------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                     ADDITIVE RISK & EXPLAINABILITY ENGINE                   |
|  - Deterministic Factor Scoring (Clamped 0-100)                             |
|  - Calibrated Severity Mapping (LOW: 0-29, MEDIUM: 30-69, CRITICAL: 70-100) |
|  - 4-Part Grounded Explainability Synthesis (What, Why, Evidence, Action)   |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                        PERSISTENCE & AUDIT LAYER                            |
|                  SQLite3 (WAL Mode) + SQLAlchemy ORM                        |
|  - Immutable screening sessions (screening_sessions)                        |
|  - Cryptographic tamper-evident audit logs (audit_logs)                     |
+-----------------------------------------------------------------------------+
```

---

## 2. End-to-End Screening Pipeline Flow

When an officer ingests a document at the workstation, the pipeline executes the following 7 stages in strict deterministic order:

### Stage 1: Ingestion & Cryptographic Digesting
- The uploaded file buffer is read and hashed using SHA-256.
- The resulting hexadecimal hash (e.g. `fa3843b01ba9...`) forms an immutable fingerprint used as a tamper seal across all audit logs and printed dossiers.

### Stage 2: Optical Character Recognition & Field Extraction
- The document's Visual Inspection Zone (VIZ) and Machine Readable Zone (MRZ) are segmented.
- Core identity fields are extracted: Document Number, Full Name, Nationality, Date of Birth, Expiration Date, Gender, and Issuing Authority.
- Confidence coefficients ($0.0 \le c \le 1.0$) are recorded per field.

### Stage 3: ICAO Doc 9303 Checksum Arithmetic
- TD1, TD2, and TD3 MRZ strings are parsed according to ICAO Doc 9303 specifications.
- **7-3-1 Modulo-10 Check Digit Verification:**
  $$\text{CheckDigit} = \left( \sum_{i=1}^{n} w_i \cdot \text{val}(c_i) \right) \bmod 10$$
  where weight sequence $w \in \{7, 3, 1, 7, 3, 1, \dots\}$.
- Check digits are independently verified for:
  1. Document Number
  2. Date of Birth
  3. Expiration Date
  4. Composite Checksum across all MRZ fields.

### Stage 4: Multi-Spectral Computer Vision Forensics
1. **Error Level Analysis (ELA):**
   - The image is resaved at 95% JPEG quality.
   - Pixel-by-pixel compression difference $\Delta = |I_{\text{orig}} - I_{\text{resaved}}|$ is amplified by factor $10\times$.
   - Spliced regions exhibit distinct quantization variance due to double compression.
2. **Sobel Edge Gradient Discontinuity:**
   - Evaluates horizontal and vertical gradients ($G_x, G_y$) using $3 \times 3$ Sobel convolution kernels.
   - Identifies unnatural border gradients characteristic of cut-and-paste photo substitution.
3. **EXIF / XMP Metadata Inspection:**
   - Scans binary header tags for digital editing software signatures (Adobe Photoshop, GIMP, Canva, Lightroom).

### Stage 5: 1:1 Biometric Facial Verification
- Facial region is isolated from the document substrate and normalized.
- Live presenter portrait is aligned using eye-center landmarks.
- Feature vectors are compared using Cosine Distance:
  $$\text{Similarity} = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|} \times 100$$
- Evaluated against calibrated checkpoint threshold (default: $75.0\%$).

### Stage 6: Deterministic Additive Risk Engine
- Evaluates individual risk factors and sums weighted contributions:
  $$\text{Score} = \min\left(100, \sum_{k=1}^{m} W_k \cdot \mathbb{I}(\text{anomaly}_k)\right)$$
- Prototype calibrated weights:
  - Watchlist Hit: $+50$
  - Biometric Impersonation: $+40$
  - Expired Document: $+30$
  - Photo Splicing / Tampering: $+25$
  - Stamp / Seal Forgery: $+20$
  - MRZ Checksum Inconsistency: $+20$
  - VIZ vs MRZ DOB Conflict: $+20$
  - Metadata Software Fingerprint: $+5$
- Evaluates operational severity:
  - **LOW (0–29):** Clear for entry.
  - **MEDIUM (30–69):** Secondary manual inspection advised.
  - **CRITICAL (70–100):** Immediate supervisor escalation / detainment protocol.

### Stage 7: Grounded Explainability & Immutable Audit Recording
- Formulates a 4-part operational briefing (What, Why, Evidence, Action).
- Commits complete screening session and officer credentials to SQLite database in WAL mode.

---

## 3. Key Architectural Decision Records (ADRs)

### ADR-01: FastAPI ASGI Framework
- **Context:** High throughput, asynchronous I/O, native Pydantic v2 data validation.
- **Decision:** Use FastAPI for backend REST services. Auto-generates OpenAPI documentation and enforces strict typing across all request/response schemas.

### ADR-02: SQLite with Write-Ahead Logging (WAL)
- **Context:** Hackathon environment demands 100% offline self-containment without requiring PostgreSQL or external cloud database servers.
- **Decision:** Use SQLite3 with `PRAGMA journal_mode=WAL;` and `PRAGMA synchronous=NORMAL;`. Eliminates database table locking between simultaneous screening writes and dashboard queries.

### ADR-03: Deterministic Synthetic Test Cases
- **Context:** Live demonstrations before SIH judges cannot rely on unstable external network connections or random non-reproducible ML inferences.
- **Decision:** Include 8 fully deterministic, explainable synthetic test cases covering all edge cases (genuine document, spliced photo, modified DOB, fake stamp, face mismatch, expired validity, visa discrepancy, and multi-vector attack).

### ADR-04: Decision-Support Neutrality
- **Context:** AI systems must not usurp lawful human authority in border control.
- **Decision:** The platform uses calibrated risk tiers and transparent evidence highlights; it never proclaims an individual "criminal" or stamps "FAKE". The officer remains the final decision-maker.
