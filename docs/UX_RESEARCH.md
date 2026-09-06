# PAHCHAN — Enterprise UI/UX Research & Case Review Architecture
**Smart India Hackathon 2026 — Problem Statement SIH2026188**  
**Document:** Official Research-Backed Design Standards & Case Review Architecture  
**Target Agency:** Ministry of Home Affairs / SSB & Police II Division

---

## 1. Executive Research Summary

PAHCHAN is an **AI-assisted identity and travel document screening decision-support workstation**. It serves authorized border checkpoint, immigration, and law-enforcement screening officers.

To ensure the platform meets the highest standards of professional credibility, operational speed, and defensibility, our design architecture synthesizes research from world-class enterprise, government, and investigative interface standards:
- **GOV.UK Design System:** Clear government digital services, calm visual authority, accessible high-contrast typography, elimination of unnecessary visual noise.
- **IBM Carbon Design System:** High-density data applications, progressive disclosure, split drawers, semantic status tokens, keyboard navigation.
- **Nielsen Norman Group (NN/g):** Human-in-the-loop decision-support, the 3-second operational glance rule, explainable AI (XAI) interaction patterns, and cognitive load management under stress.
- **W3C WCAG 2.2 Level AA:** Multi-modal status communication (never color alone), 4.5:1 text contrast ratios, visible keyboard focus indicators, and reduced-motion compliance.
- **Modern Forensic Document Review Standards:** Optical separation between a high-contrast neutral application shell and a calibrated dark inspection stage for physical/optical artifacts.

---

## 2. Research Principles Matrix

| Source | Core Principle | Why It Matters | PAHCHAN Implementation |
|---|---|---|---|
| **GOV.UK Design System** | Calm, Trustworthy Authority Over Decorative Fluff | Government officers make high-consequence legal and security decisions. Fluorescent neon, pulsing borders, and "AI magic" graphics erode trust and distract from evidence. | Light neutral enterprise UI (`#f8fafc` / `#f1f5f9`) with crisp white surfaces (`#ffffff`), restrained deep cobalt accents (`#1d4ed8`), and clean typography. No glowing cyberpunk effects. |
| **IBM Carbon Design System** | Progressive Disclosure & High-Density Data | Officers need immediate summary verdicts first, but must be able to drill down into technical evidence without leaving the case workspace. | 3-Level Progressive Disclosure: Level 1 (Summary Verdict & Severity), Level 2 (Plain-language finding explanation & confidence), Level 3 (Technical forensics, ELA variance, MRZ math in expandable panels/drawers). |
| **Nielsen Norman Group (NN/g)** | The 3-Second Rule in High-Stress Screening | A border officer inspecting a traveler in a physical queue has ~3 seconds to determine if the document can be quickly cleared or requires secondary investigation. | Instant Screening Verdict Banner prominently positioned atop the case workspace: Score (0–100), Status Tier (LOW, REVIEW, HIGH, CRITICAL), and actionable recommendation within 1 glance. |
| **Nielsen Norman Group (NN/g)** | Traceability & Grounded Explainability | Trust in AI decision-support collapses if the user cannot verify *why* an anomaly was flagged or *where* the evidence is located. | Bidirectional Traceability: Clicking any finding or extracted field automatically zooms/pans the document canvas to highlight the exact visual region. |
| **W3C WCAG 2.2 AA** | Multi-Modal Semantic Status | Color-blind users or officers viewing screens under variable checkpoint lighting cannot reliably differentiate red and green badges alone. | Every status tier pairs color with an explicit text label, numerical score, and distinct SVG icon (e.g. Shield Check, Alert Triangle, Alert Circle). |
| **Forensic Document Inspection Standards** | The Dual-Surface Optical Model | High-resolution document images, Error Level Analysis (ELA) heatmaps, and substrate fibers require a dark, glare-free canvas, while tabular data and reports require a clean, high-contrast light reading surface. | Dual-Surface Architecture: The overall application shell is a crisp light enterprise theme, while the Document Inspection Canvas is hosted on a dark neutral inspection stage (`#0f172a` / `#090d16`). |

---

## 3. The New Case Review Mental Model

The previous iteration treated the product like an "AI Telemetry Center". The transformed mental model structures everything around a **Screening Case**:

```
SCREENING CASE (e.g. PCH-20260907-882A)
│
├── 1. Document Canvas (Original, Annotated Overlays, Zoom/Pan)
├── 2. Extracted Visual Information (OCR fields with confidence & source jump)
├── 3. Document Validation (ICAO Doc 9303 Modulo-10 7-3-1 Checksum Math)
├── 4. Forensic Signals (Error Level Analysis, Sobel Edge Gradient, Metadata)
├── 5. 1:1 Facial Comparison (Document Portrait vs Presenter Image)
├── 6. Cross-Document Consistency (Passport vs Visa/Permit correlation)
├── 7. Calibrated Risk Score (0–100 Additive Factor Breakdown)
├── 8. Operational Recommendation (Standard Review, Secondary, Detain)
├── 9. Screening Assessment Report (Printable & Exportable Dossier)
└── 10. Immutable Audit Ledger (SQLite WAL Cryptographic Trail)
```

---

## 4. Information Architecture & Navigation

The primary navigation is streamlined to 7 dedicated workflows:
1. **Overview:** Command center answering: *What is happening? What needs attention? What should I do next?*
2. **Screenings (Queue):** Searchable, sortable, filterable table of past and incoming cases with quick-action drawers.
3. **New Screening (Workstation):** The primary case review workspace (Document + Findings + Risk + Decision).
4. **Reports:** Printable, cryptographically sealed Screening Assessment Reports.
5. **Audit Log:** Enterprise event ledger tracking officer actions, automated analyses, and supervisory overrides.
6. **Demo Lab:** Dedicated evaluation laboratory housing the 8 deterministic SIH competition scenarios with an automated batch runner.
7. **Settings:** Profile, display, accessibility, and an isolated **Admin / Evaluation Mode** for risk factor weights.

*Note: "Evidence" is no longer a primary navigation tab; evidence is accessed directly within each screening case where it belongs.*

---

## 5. Standardized Risk Scoring & Thresholds

To eliminate ambiguity across components, PAHCHAN enforces a single, centralized risk model:

$$\text{Screening Risk Score} = \min\left(100, \sum_{i=1}^{n} \text{Weight}_i \cdot \text{AnomalySignal}_i \right)$$

### Uniform Tiers:
- **LOW (`0 – 29`):** No anomaly detected across signals. Recommendation: *Standard Review / Clearance*.
- **REVIEW (`30 – 59`):** Minor visual, metadata, or expiration discrepancy. Recommendation: *Secondary Inspection*.
- **HIGH (`60 – 79`):** Substantial tampering signal or face mismatch. Recommendation: *Secondary Forensic Review*.
- **CRITICAL (`80 – 100`):** Multiple severe anomalies (e.g. spliced photo + biometric impersonation). Recommendation: *Supervisor Escalation / Hold*.

---

## 6. Language & Copywriting Guidelines

| Prohibited Autonomous Claim | Mandated Decision-Support Term |
|---|---|
| "PASSPORT AUTHENTICATED" | "Document integrity: No anomaly detected" |
| "CLEAR FOR ENTRY" | "Recommendation: Standard review" |
| "TAMPERING DETECTED" | "Potential document alteration signal" |
| "VERIFIED MATCH" | "Face comparison: Match signal" |
| "IMPERSONATION DETECTED" | "Potential identity mismatch signal" |
| "AI TRUTH SCORE" | "Screening Risk Score" |
| "Official Government Dossier" | "Screening Assessment Report" |
