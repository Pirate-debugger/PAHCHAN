# PAHCHAN — Complete UI/UX & Product Redesign Audit
**Problem Statement:** SIH2026188 — AI-Based Fake Identity & Document Screening System  
**Agency:** Ministry of Home Affairs / SSB & Police II Division  
**Document Status:** Pre-Redesign Baseline Audit & Transformation Blueprint

---

## 1. Executive Summary

This audit evaluates the current implementation of PAHCHAN against the standard of an enterprise-grade, evidence-driven identity and travel document screening workstation.

While the underlying computer vision, MRZ arithmetic, biometric comparison, and risk scoring pipelines are technically sound and verified by automated tests, the current user experience suffers from several significant product and visual defects:
1. **The "Cyberpunk AI / Security HUD" Trap:** The interface is currently submerged in a deep dark theme (`#070b14`), glowing cyan borders, pulsing badges, and dark glass panels that resemble a gaming HUD or speculative sci-fi tool rather than a calm, trustworthy enterprise government workstation.
2. **Wrong Mental Model & Information Architecture:** "Evidence" was treated as a disconnected primary navigation tab rather than an intrinsic layer of an active screening case. There is no proper "Screenings" queue view where an officer can view, filter, and prioritize case files.
3. **Card-in-Card Clutter:** The UI is dominated by nested cards (`rounded-2xl`, `bg-[#0f172a]`), squashing the primary artifact—the document itself—into a secondary corner.
4. **Header Telemetry Noise:** The top bar is crowded with live clocks (IST/UTC), blinking API status tags, sound toggles, and shortcut indicators.
5. **Definitive / Non-Compliant Language:** Labels like *"PASSPORT AUTHENTICATED"*, *"CLEAR FOR ENTRY"*, and *"IMPERSONATION DETECTED"* make the AI appear to make autonomous legal declarations, violating the core principle that PAHCHAN is a human-in-the-loop decision-support system.

---

## 2. Component-by-Component Audit & Evaluation

| Existing Component | Current Status | Issues Identified | Transformation Plan |
|---|---|---|---|
| `Navbar.tsx` | Functional but Overloaded | Cluttered with clocks, API tags, sound toggle, badge pings; dark neon styling. | Replace with clean, restrained enterprise `Header.tsx`: Brand ("PAHCHAN", "Identity & Document Screening", "Prototype • SIH 2026"), search, user badge, minimal status. |
| Navigation Architecture | Disjointed Tabs (`Overview`, `Screening`, `Evidence`, `Reports`, `Audit`, `Demo Lab`, `Settings`) | "Evidence" should not be a top-level tab. No proper case list / queue (`Screenings`) exists. | Reorganize to 7 canonical workflows: `Overview`, `Screenings` (Case Queue), `New Screening` (Workstation), `Reports`, `Audit Log`, `Demo Lab`, `Settings`. Evidence lives inside Case Workstation. |
| Workstation Layout (`App.tsx`, `ForensicsViewer.tsx`, `DocumentDetailsCard.tsx`, `RiskBreakdownCard.tsx`, `FaceMatchPanel.tsx`) | 4-quadrant cramped layout | Document is buried in a 460px card. Excessive nested cards. Dark canvas clashes with text. | Redesign into **Document-First Case Review Workspace**: Left/Center large document canvas (dark inspection canvas on light enterprise shell), Right screening result & risk summary, Bottom findings & evidence inspector with click-to-zoom region focus. |
| `ForensicsViewer.tsx` | Technically rich, visually noisy | Sci-fi microscope look. Reticles and pins look like video game HUD. | Transform into clean forensic inspection canvas: High-resolution zoom/pan, clear Original / Annotated / Compare tabs, clean evidence markers with progressive disclosure. |
| `DocumentDetailsCard.tsx` | Good data, cramped cards | Dense monospace cards without clear field-to-document region jump. | Implement progressive disclosure: Extracted field table with confidence badges and "View source →" button that pans/zooms document to that field's bounding box. |
| `RiskBreakdownCard.tsx` | Score gauge good, copy non-compliant | Uses "Truth Score" / "Official Verdict" tone. Non-standard thresholds. | Standardize to **Screening Risk Score** (0–100), lock thresholds to LOW (0–29), REVIEW (30–59), HIGH (60–79), CRITICAL (80–100). Show additive factor contributions. Clearly label "Prototype scoring configuration". |
| `FaceMatchPanel.tsx` | Functional cosine distance | High-tech scanning sweep animation, claims "MATCH" / "MISMATCH" definitively. | Calibrated comparison panel: Document portrait vs Live presenter. Status: "Match Signal", "Mismatch Signal", "Inconclusive". Confidence & image quality indicators. |
| `ReportsView.tsx` & `AuditReportModal.tsx` | Complete print dossier | Labeled "Official Dossier" (inappropriate for prototype). Dark UI on screen. | Rename to **Screening Assessment Report**. Clean, white-paper enterprise layout with Ashoka emblem styling, verified SHA-256 seal, and one-click print/PDF export. |
| `AuditLogView.tsx` | Functional SQLite table | Sits on dark background with minimal filter controls. | Standardize into enterprise audit table: Timestamp, Case ID, Action, Operator, Result. Add right-side detail drawer on row click. |
| `SyntheticLab.tsx` | 8 scenarios functional | Switcher bar is attached directly to workstation header, cluttering normal duty workflow. | Relocate scenarios cleanly to **Demo Lab** tab. Add batch runner **"RUN ALL EVALUATION SCENARIOS"** showing 8/8 test pass across OCR, Validation, Forensics, Face, Risk, Report, Audit. |
| `SettingsPanel.tsx` | Functional risk sliders | Exposes risk weight sliders directly to normal officer view without safety guardrails. | Split into: General Preferences, Display/Accessibility, System Status, and an explicit **ADMIN / EVALUATION MODE** section for factor weights. |

---

## 3. Linguistic & Copywriting Audit

| Current Problematic Copy | Replacement Professional Copy | Principle |
|---|---|---|
| *"PASSPORT AUTHENTICATED"* | *"Document integrity: No anomaly detected"* | Decision-support neutrality; no absolute claims. |
| *"CLEAR FOR ENTRY"* | *"Recommendation: Standard review"* | The officer makes the final entry decision. |
| *"TAMPERING DETECTED"* | *"Potential document alteration signal"* | Algorithmic signal, not a courtroom declaration. |
| *"VERIFIED MATCH"* | *"Face comparison: Match signal"* | Statistical similarity, not biological certainty. |
| *"IMPERSONATION DETECTED"* | *"Potential identity mismatch signal"* | Avoids criminal accusations against presenter. |
| *"Official Dossier"* | *"Screening Assessment Report"* | Appropriate prototype terminology. |
| *"SSB-MHA Official Deployment"* | *"Prototype • SIH 2026 / Demonstration Environment"* | Accurate institutional context. |

---

## 4. Visual System & Thematic Redirection

### 4.1 The Light Enterprise Shell + Dark Forensic Canvas Dual-Surface Model
To achieve an authoritative, calm, and credible government enterprise product:
- **Application Shell (Global UI):**
  - Background: Soft neutral warm gray (`#f8fafc` / `#f1f5f9`).
  - Cards & Surfaces: Pure white (`#ffffff`) with subtle 1px slate borders (`#e2e8f0`) and restrained elevation (`box-shadow: 0 1px 3px rgba(0,0,0,0.05)`).
  - Text: Deep charcoal (`#0f172a`) for primary headers, slate gray (`#475569`) for body text, high-contrast `#1e293b` for data.
  - Primary Action Accent: Professional deep cobalt blue (`#1d4ed8` / `#2563eb`).
- **Forensic Inspection Canvas (Document Viewer Only):**
  - Dark neutral studio backdrop (`#0f172a` / `#090d16`).
  - This creates intentional optical separation: the officer inspects the photographic physical evidence on a calibrated dark stage, while navigating and reading case data on a high-contrast, comfortable light interface.

### 4.2 Standardized Risk Tiers
A single, centralized definition across all components:
- **LOW:** `0 – 29` (Emerald Green `#059669`)
- **REVIEW:** `30 – 59` (Amber `#d97706`)
- **HIGH:** `60 – 79` (Orange-Red `#ea580c`)
- **CRITICAL:** `80 – 100` (Crimson Red `#dc2626`)

---

## 5. Information Architecture & Navigation Blueprint

```
+-------------------------------------------------------------------------------+
| [HEADER] PAHCHAN  Identity & Document Screening  [Prototype • SIH 2026]       |
|          [Search Case / Doc ID]    [Duty Post: Raxaul]   [Officer SSB-449]    |
+-------------------------------------------------------------------------------+
| [PRIMARY NAV]                                                                 |
| Overview  |  Screenings (Queue)  |  New Screening (Workstation)  |  Reports   |
| Audit Log |  Demo Lab            |  Settings                                  |
+-------------------------------------------------------------------------------+
|                                                                               |
|                             ACTIVE PAGE WORKSPACE                             |
|                                                                               |
+-------------------------------------------------------------------------------+
```

---

## 6. Phase-by-Phase Transformation Plan

1. **Phase 1: Audit & UX Research** -> Finalize `docs/UI_UX_REDESIGN_AUDIT.md` and `docs/UX_RESEARCH.md`.
2. **Phase 2: Design Tokens & CSS** -> Update `tailwind.config.js` and `index.css` with light enterprise tokens, restrained radius, and clean borders.
3. **Phase 3: Clean Header & Navigation** -> Implement new `Header.tsx` and `App.tsx` navigation shell.
4. **Phase 4: Overview Dashboard** -> Modernize to light enterprise style with KPI tiles, Attention Queue, and Recent Activity.
5. **Phase 5: Screenings Queue View** -> Build real searchable, sortable, filterable case list (`ScreeningsQueue.tsx`) with status badges and detail drawer.
6. **Phase 6: Case Screening Workstation** -> Redesign into Document-First layout (left document canvas, right screening result, bottom findings/evidence with region jump).
7. **Phase 7: Face Comparison & Extracted Fields** -> Clean, defensible progressive disclosure panels with field-to-document source highlighting.
8. **Phase 8: Reports, Audit Log & Demo Lab** -> Modernize Reports into light paper layout, Audit Log with detail drawer, and Demo Lab with 8/8 batch evaluation runner.
9. **Phase 9: Settings & Admin Guardrails** -> Reorganize settings with explicit Admin/Evaluation disclaimer.
10. **Phase 10: Verification, Build & Testing** -> Run linter, production build, backend pytest, and browser QA.
