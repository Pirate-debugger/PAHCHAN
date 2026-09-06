# PAHCHAN — Enterprise & Security Operations UX Research Document
**Smart India Hackathon 2026 — Problem Statement SIH2026188**  
**Design Reference:** Enterprise Security Operations Center (SOC), Border Inspection Workstations, IBM Carbon, Material Design 3, WCAG 2.1 AA.

---

## 1. Executive Design Principles

1. **Evidence-First Decision Support:**
   Every visual element must support the officer in answering: *What is the evidence, why does it matter, and what operational action is warranted?* The system never acts as a black box.
2. **Cognitive Load Reduction:**
   Border screening officers inspect high volumes of travelers under time constraints. Crucial risk indicators must be digestible within **3 seconds**, while deeper forensic details remain accessible through progressive disclosure.
3. **Calibrated Trust & Non-Criminalization:**
   Visual terminology must maintain professional neutrality ("Anomaly Detected", "Integrity Discrepancy", "Biometric Mismatch") rather than accusatory or definitive declarations ("Criminal", "Fake Passport").
4. **Resilience & Determinism:**
   Offline capability, deterministic reproduction of evidence, and cryptographic traceability form the bedrock of officer trust.

---

## 2. Navigation Principles

- **Primary Navigation Structure:**
  - `Overview`: Command Center executive metrics, threat queue, today's screening throughput.
  - `Screening Workstation`: Core active document ingestion, live OCR, and immediate verdict.
  - `Evidence Viewer`: Deep-dive forensic microscope, multi-spectral filters, pixel anomaly inspection.
  - `Reports`: Official screening dossier generation, cryptographic SHA-256 fingerprint, print export.
  - `Audit Trail`: Cryptographic SQLite historical ledger with search, filtering, and detail inspection.
  - `Evaluation Lab`: 8 deterministic SIH competition evaluation scenarios.
  - `Settings`: Calibrated risk factor weights and border checkpoint selector.
- **Rules:**
  - Max 7 primary navigation items.
  - Clear active indicator with distinct color, background, and icon state.
  - Single-click transition between overview, workstation, and audit records.

---

## 3. Information Hierarchy (The 3-Second Rule)

An officer glancing at a screened document must process information in strict order:
1. **Tier 1 (Instant — 0 to 1 sec):** Overall Risk Severity Banner (LOW: Green, MEDIUM: Amber, CRITICAL: Red) and Score ($/100$).
2. **Tier 2 (Contextual — 1 to 3 sec):** Holder identity, Document Number, and Primary Finding ("Photo Splicing Detected in Portrait Area").
3. **Tier 3 (Operational — 3 to 5 sec):** Clear Directive ("Secondary Physical Inspection Advised").
4. **Tier 4 (Investigative — On-Demand):** ELA residual variance heatmap, Sobel edge cuts, ICAO modulo-10 arithmetic, and EXIF camera metadata.

---

## 4. Color System & Semantic Palette

All interface colors adhere to WCAG 2.1 AA minimum contrast ratios (4.5:1 for normal text, 3:1 for large text).

| Semantic Role | Hex Value | Application | Meaning |
|---|---|---|---|
| **Canvas Background** | `#070B14` | Main application background | Neutral, ultra-dark command center base |
| **Surface Level 1** | `#0F172A` | Primary container cards & cards | Elevation, high-contrast separation |
| **Surface Level 2** | `#090D16` | Nested data wells, input fields | Recessed contrast wells |
| **Border Normal** | `#1E293B` / `#334155` | Structural dividers | Subtle boundary definition |
| **Border Active** | `#06B6D4` (Cyan) | Focused / Selected elements | Active operator attention |
| **PASS / CLEAR** | `#10B981` (Emerald) | Authenticated documents | Document conforms to baseline standard |
| **REVIEW / WARN** | `#F59E0B` (Amber) | Minor discrepancy | Secondary physical inspection required |
| **CRITICAL / ALERT**| `#F43F5E` (Rose) | Tampering / Impersonation | Severe anomaly detected; immediate supervisory hold |
| **INFO / SYSTEM** | `#38BDF8` (Sky) | Telemetry, OCR labels, MRZ | System operational indicators |

> [!IMPORTANT]
> **No Color-Alone Rule:** Color is never used as the single signifier. Every state combines an icon (CheckCircle, AlertTriangle, UserX), a textual label (PASS, REVIEW, CRITICAL), and numerical metrics.

---

## 5. Typography Scale

- **Display & Telemetry:** `JetBrains Mono`, monospace font for Document Numbers, MRZ lines, SHA-256 hashes, timestamps, and checksum math.
- **Headings & Body:** `Inter`, modern sans-serif optimized for crisp UI readability at 10px–16px.

| Style | Font Family | Size | Weight | Line Height |
|---|---|---|---|---|
| Header Title | Inter | 16px (1rem) | 800 (Extrabold) | 1.25 |
| Section Header| Inter | 12px (0.75rem) | 700 (Bold) | 1.3 |
| Body Normal | Inter | 12px (0.75rem) | 400 (Regular) | 1.5 |
| Micro Data | JetBrains Mono | 10px (0.625rem)| 600 (Semibold)| 1.4 |
| MRZ String | JetBrains Mono | 12px (0.75rem) | 700 (Bold) | 1.6 |

---

## 6. Spacing & Layout Architecture

- Strict 4px/8px modular spacing grid (`p-1` = 4px, `p-2` = 8px, `p-3` = 12px, `p-4` = 16px, `p-6` = 24px).
- Maximum container width constrained to `max-w-7xl` (1280px) for optimal eye-tracking on large command center displays.
- Responsive breakpoints:
  - Mobile (`<640px`): Single-column stacked workflow.
  - Tablet (`640px - 1024px`): 2-column workstation.
  - Desktop (`>1024px`): 12-column balanced split (Left: Document & OCR 7 cols; Right: Biometrics & Risk 5 cols).

---

## 7. Evidence Visualization (Forensic Microscope)

1. **Curtain Slider (Split Wipe):**
   Allows the officer to drag a physical divider horizontally across the document canvas. The left half displays the authentic document, while the right half reveals the ELA tampering heatmap, enabling undeniable comparative inspection.
2. **Anomaly Hotspot Pins:**
   Forensic anomaly regions (e.g. photo box, altered date, stamp) are bounded by calibrated rectangles with pulsing alert rings. Clicking any pin pans the view and loads the exact forensic explanation and mathematical contribution to the total risk score.
3. **Live Reticle HUD:**
   Hovering over the canvas displays localized coordinates `(X, Y)` and ELA residual variance under the cursor.

---

## 8. Multi-Stage Scanning Progress (Transparent Feedback)

Never display a vague "Loading..." spinner. The workstation implements progressive, transparent checklist states:
```
[✓] Step 1: Image Ingestion & SHA-256 Fingerprint Generated
[✓] Step 2: OCR Optical Character Recognition & Field Extraction
[✓] Step 3: ICAO Doc 9303 Check Digit Verification (7-3-1 Modulo 10)
[⟳] Step 4: Multi-Spectral Forensics (Error Level Analysis & Sobel Gradients)
[○] Step 5: Biometric Face Mesh Comparison & Cosine Embedding Distance
[○] Step 6: Multi-Signal Additive Risk Scoring & Decision Directive
```

---

## 9. Error States & Actionable Guidance

Generic error messages ("An error occurred") are prohibited. Every error must state:
1. **What happened:** e.g. "Facial verification could not be completed."
2. **Why it happened:** e.g. "No frontal human face was detected in the submitted image."
3. **Actionable remedy:** e.g. "Ensure proper lighting and upload an unoccluded passport-style portrait."
4. **Recovery button:** `[ Re-upload Photo ]`

---

## 10. Empty States

Every empty screen must explain its purpose, explain why it is currently empty, and provide a single clear primary CTA:
- *Example:* "No screening sessions logged yet. Ingest a travel document or launch an Evaluation Scenario to begin automated screening." `[ Start Screening ]`

---

## 11. What Must NEVER Be Used

- **Cyberpunk / Sci-Fi Fluff:** Meaningless decorative wireframes, floating 3D rotating cubes, or neon grid lines that distract from evidence inspection.
- **Fake AI Labels:** "Powered by Quantum Neural Super-AI" or arbitrary confidence numbers that have no mathematical basis.
- **Accusatory Language:** Branding documents as "COUNTERFEIT FORGERY" or individuals as "SUSPECTS" without judicial proof.
- **Dead Buttons / Placeholder Features:** Any button present in the UI must have a functional backend endpoint or interactive handler.
- **Excessive Animations:** Slow bouncy animations that impede rapid decision-making during high-traffic border processing.

---
*This document governs all interface decisions in PAHCHAN.*
