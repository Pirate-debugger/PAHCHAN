# PAHCHAN — SIH JUDGING ALIGNMENT & COMPETITIVE DIFFERENTIATORS
**Smart India Hackathon 2026 — Problem Statement SIH2026188: AI-Based Fake Identity & Document Screening System**

---

## 1. Direct Alignment with SIH Evaluation Criteria

| Evaluation Dimension | Traditional Hackathon Approach | PAHCHAN Breakthrough Solution |
| :--- | :--- | :--- |
| **1. Explainability vs Black Box** | Returns a generic label like `"AI: FAKE"` without evidence | Follows **Evidence → Findings → Risk → Recommendation**. Every score is an additive sum of transparent factors. |
| **2. Multi-Signal Defense** | Only does basic OCR or simple face match | Synthesizes **5 forensic layers**: ELA compression, Sobel edge gradients, SSIM stamps, EXIF metadata, and ICAO 7-3-1 modulo-10 checksums. |
| **3. Decision Support vs Overreach** | Arrogantly claims to replace officers or declare individuals criminal | Strictly designed as **officer decision-support**, preserving human-in-the-loop authority with clear non-criminalizing language. |
| **4. Demonstrability & Offline Resiliency** | Relies on unstable internet or cloud APIs that fail during presentations | **100% self-contained local execution**. 8 deterministic competition test cases plus real live CPU forensic analysis. |
| **5. Cross-Document Verification** | Analyzes only one single document at a time | Normalizes and cross-validates **multi-document bundles** (e.g., Passport Bio-Page vs Accompanying Entry Visa). |
| **6. Audit & Accountability** | No tamper trail; state lost on reload | Generates **SHA-256 cryptographic document fingerprints**, downloadable dossiers, and relational database audit logs. |

---

## 2. The 5 Core Questions Answered Immediately

1. **What problem are we solving?**
   Border screening officers must detect sophisticated counterfeit documents and lookalike imposters in seconds without causing false detention of genuine travelers.
2. **How does PAHCHAN solve it?**
   By combining sub-second image forensics (ELA & Sobel), cryptographic ICAO Doc 9303 checksums, biometric face comparison, and cross-document validation into a unified 4-quadrant workstation.
3. **What makes it different from basic OCR?**
   Basic OCR only reads text; PAHCHAN verifies the physical and digital substrate of the document itself — checking compression quantization deltas, font baseline offsets, stamp SSIM templates, and check digit mathematics.
4. **Can we demonstrate it reliably?**
   Yes. Through our Synthetic Document Forensics Lab featuring all 8 competition scenarios with deterministic expected outcomes, plus live upload capabilities.
5. **Can it realistically evolve into a deployable system?**
   Yes. Built on modular Python FastAPI, SQLAlchemy relational models, strict TypeScript contracts, and sub-second CPU inference suitable for low-power edge checkpoints.
