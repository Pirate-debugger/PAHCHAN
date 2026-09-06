# PAHCHAN — Comprehensive Security & Compliance Architecture
**Smart India Hackathon 2026 — Problem Statement SIH2026188: AI-Based Fake Identity & Document Screening System**  
**Team:** Debugs Pirates | **Agency Target:** Border Checkpoints & Immigration (SSB, BOI, MHA)

---

## 1. Security Philosophy & Threat Model

PAHCHAN protects national borders, immigration checkpoints, and sensitive document intake facilities against sophisticated identity fraud vectors:

| Threat Vector | Real-World Attack Scenario | PAHCHAN Countermeasure |
|---|---|---|
| **Facial Impersonation** | Presenter carries genuine passport of a lookalike or sibling | 1:1 Cosine Distance matching with 68-point facial geometry and landmark alignment |
| **Photo Splicing** | Original photograph replaced with imposter's photo | Error Level Analysis (ELA) + Sobel boundary cut discontinuity detection |
| **MRZ Number Forgery** | Altered passport number or birthdate in visual zone | ICAO Doc 9303 7-3-1 modulo-10 check digit math validation |
| **Counterfeit Stamp** | Fake immigration entry/exit stamp applied to passport page | Structural Similarity Index (SSIM) + Ink spectrum distribution analysis |
| **Expired Travel Document** | Expired validity presented with modified visual year | Chronological consistency checks comparing current date to MRZ expiry |
| **Watchlist Evader** | Flagged individual on INTERPOL or NIA alert bulletin | Integrated local intelligence watchlist matching with instant alert |

---

## 2. Ingestion & File Upload Security

All document uploads are processed through a hardened security boundary:
1. **MIME-Type & Header Verification:**
   - Files are validated against magic byte headers, preventing executable injection masquerading as images.
   - Allowed formats: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
2. **File Size Clamping:**
   - Strict 10MB payload ceiling prevents denial-of-service (DoS) via memory exhaustion.
3. **Path Traversal Prevention:**
   - File paths are not read directly from client input. Uploaded buffers are held in memory or given synthetic UUID identifiers before processing.
4. **Memory Safety:**
   - Images are decoded via Pillow/OpenCV with decompression bomb protection enabled (`Image.MAX_IMAGE_PIXELS = 25000000`).

---

## 3. Cryptographic Binding & Tamper Evidence

Every screening event produces an immutable cryptographic fingerprint:
- **SHA-256 Digesting:** The raw document binary is hashed upon entry.
- **Audit Signature:** The generated audit signature binds the document SHA-256 hash, the screening session ID, and the officer badge ID:
  $$\text{Signature} = \text{SHA256}(\text{DocBytes}) \parallel \text{SessionID} \parallel \text{OperatorID}$$
- Any post-screening alteration of document images or logs invalidates this cryptographic seal immediately.

---

## 4. Privacy & Data Protection (DPDPA 2023 Compliance)

In accordance with India's **Digital Personal Data Protection Act (DPDPA 2023)** and international standards:
1. **Purpose Limitation:** Identity data ingested into PAHCHAN is utilized exclusively for screening and checkpoint clearance verification.
2. **No External Cloud Leakage:** All OCR, facial comparison, and forensic processing runs 100% locally on-premise or edge edge-compute hardware. No sensitive identity documents are transmitted to third-party public cloud APIs.
3. **Data Minimization:** Raw biometric embeddings are evaluated in volatile RAM and are not persisted as raw vectors in the database.
4. **Role-Based Access Control (RBAC):** Only authenticated operators with assigned checkpoint badge IDs can initiate screenings or sign off on dossiers.

---

## 5. Decision-Support & AI Safety Guarantees

1. **Human-in-the-Loop Mandate:** The system never autonomously rejects a passenger or prints "CRIMINAL". It provides objective, quantifiable evidence to support the authorized screening officer's decision.
2. **Deterministic Explanations:** The system's explainability engine strictly references observed physical and mathematical signals (e.g. "ELA variance: 24.8 | MRZ checksum mismatch: calculated 4, expected 0"); it never generates hallucinated or speculative narratives.
3. **No 100% Claims:** System documentation, UI tooltips, and report headers explicitly state that confidence scores are statistical and forensic indicators, not absolute guarantees.
