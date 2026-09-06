# PAHCHAN — SIH 2026 LIVE DEMONSTRATION SCRIPT
**Smart India Hackathon 2026 — Problem Statement SIH2026188**  
**Role:** Presenting Lead Architect & Team Lead  
**Audience:** Technical Evaluators, Cybersecurity Experts, and Border Security Domain Judges

---

## 1. Opening Pitch (30 Seconds)

> *"Good morning, respected judges. Today, border and checkpoint screening officers at land borders like Raxaul or international airports must inspect hundreds of travel documents per hour. Most solutions today simply run basic OCR or rely on black-box AI that blindly shouts 'FAKE' without evidence.*
> 
> *Introducing **PAHCHAN** — an AI-powered forensic screening and decision-support workstation built around the principle: **Evidence → Findings → Risk → Recommendation**. It never replaces the officer's legal authority; it empowers them with transparent, explainable forensic signals in under 3 seconds."*

---

## 2. Walkthrough of the 8 Competition Scenarios

Navigate to the **Synthetic Lab** tab or use the top scenario dropdown on the main workstation.

### Scenario 1: Genuine Republic of India Passport (Clean Baseline)
- **Goal:** Demonstrate genuine travel document authentication with zero false positives.
- **Action:** Select `Case 1: Genuine Indian Passport`.
- **Observations:**
  - **Verdict Banner:** Green (`AUTHENTICATED — CLEAR FOR ENTRY`, Score: 6/100).
  - **Forensic Microscope:** Substrate ELA error variance is uniform (4.2), Sobel border continuous.
  - **OCR Details:** Checksums for Document Number, DOB, Expiry, and Composite show green `PASS ✓`.
  - **Biometrics:** Presenter matches portrait photo with 96.4% embedding similarity.
- **Officer Action:** Click `Clear Entry`.

---

### Scenario 2: Altered Photograph / Spliced Photo
- **Goal:** Demonstrate digital and physical photo cut-and-paste detection using Error Level Analysis.
- **Action:** Select `Case 2: Altered Photograph`.
- **Observations:**
  - **Verdict Banner:** Red Alert (`CRITICAL FRAUD DETECTED — DO NOT ADMIT`, Score: 78/100).
  - **Forensic Microscope:** Switch to **Tamper Heatmap (ELA)**. The portrait box glows bright magenta/pink, revealing that the photo was recompressed under a different quantization matrix than the document paper.
  - **Sobel Gradient:** Sharp boundary discontinuity ratio spikes to 24.8.
  - **Evidence Viewer:** Click the highlighted portrait box. Notice the detailed explanation: *"Quantization matrix divergence > 4.2x | Splicing edge discontinuity."*
- **Officer Action:** Click `Detain / Flag`.

---

### Scenario 3: Modified Date of Birth (VIZ vs MRZ Cross-Field Conflict)
- **Goal:** Demonstrate detection of text manipulation and visual-to-machine checksum divergence.
- **Action:** Select `Case 3: Altered Date of Birth`.
- **Observations:**
  - **VIZ vs MRZ:** Printed text displays `12/04/1995`, but the underlying ICAO MRZ line 2 encodes `0204128` (`12/04/2002`).
  - **Verdict Banner:** Red Alert (Score: 82/100).
  - **Findings Ledger:** Shows `VIZ vs MRZ Identity Conflict` (+40 pts) and `Text Manipulation in DOB Field` (+35 pts).
  - **Explainability Matrix:** Notes: *"VIZ DOB manipulated to disguise true age (2002 -> 1995) to bypass work permit restrictions."*

---

### Scenario 4: Counterfeit Immigration Entry Stamp
- **Goal:** Demonstrate structural similarity (SSIM) template matching on checkpoint stamps.
- **Action:** Select `Case 4: Counterfeit Stamp`.
- **Observations:**
  - **Findings:** SSIM template similarity vs official Raxaul SSB stamp template is only 38.4% (Threshold: 80%).
  - **Forensics Microscope:** Border circularity fails (0.61 vs 0.98), and ink spectrum indicates digital inkjet printer replication rather than an official mechanical relief stamp.
  - **Verdict:** Score 72/100, `DETAIN_ALERT`.

---

### Scenario 5: Biometric Face Impersonation Mismatch
- **Goal:** Demonstrate facial embedding distance failure with an imposter presenter.
- **Action:** Select `Case 5: Identity Impersonation`.
- **Observations:**
  - **Document Check:** Document paper, text, and MRZ are completely genuine.
  - **Biometrics Panel:** Live checkpoint webcam presenter embedding distance fails required 75.0% threshold (Similarity: 34.8%).
  - **HUD Overlay:** Facial landmark geometry variance exceeds 42%.
  - **Decision Guidance:** Safe wording: *"Possible identity mismatch (34.8% vs 75.0% threshold) — manual verification required."* (Score: 88/100).

---

### Scenario 6: Expired Document + Photoshop Metadata Anomaly
- **Goal:** Demonstrate date expiration logic combined with digital image editing signatures.
- **Action:** Select `Case 6: Expired Document & Photoshop Metadata`.
- **Observations:**
  - **Validation Card:** Expiry Date `10/01/2023` flagged as `EXPIRED (Over 3 years expired)`.
  - **Metadata Container:** EXIF/XMP history tags contain `Adobe Photoshop 2024 (Windows)` modification footprint.
  - **Important Principle:** The system highlights Photoshop as an *additional risk signal*, not conclusive proof of forgery on its own.

---

### Scenario 7: Cross-Document Mismatch (Passport vs Visa)
- **Goal:** Demonstrate multi-document package normalization and side-by-side credential verification.
- **Action:** Select `Case 7: Cross-Field Identity Conflict`.
- **Observations:**
  - **Document Bundle:** Primary passport issued to `RAHUL KUMAR` attached with entry visa sticker issued to `RAHUL SHARMA`.
  - **System Action:** Identifies surname conflict, flags incompatible credentials, and advises officer to refer for `SECONDARY_INSPECTION` (Score: 75/100).

---

### Scenario 8: Multiple Risk Signals (Combined Threat)
- **Goal:** Demonstrate response to a high-threat multi-vector attack.
- **Action:** Select `Case 8: Multiple Risk Signals`.
- **Observations:**
  - Combines photo splicing (ELA variance 28.4), counterfeit immigration stamp (SSIM 34.2%), biometric face mismatch (31.5%), expired validity, and an active INTERPOL Red Notice intelligence bulletin.
  - **Total Score:** 95/100 (CRITICAL).
  - **Directive:** Escalate immediately to Shift Commander and Anti-Terrorism Unit.

---

## 3. Demonstrating Official Screening Dossier & Audit Trail

1. On the Workstation screen, click **"View Official Dossier →"**.
2. Show judges the printable government-grade dossier:
   - Header with Ministry of Home Affairs / Bureau of Immigration branding.
   - Document SHA-256 fingerprint hash.
   - 4-Part Grounded Explainability (`What happened?`, `Why is it risky?`, `Evidence?`, `Officer directive`).
   - Click **"Print Dossier"** to trigger formatted print preview.
   - Click **"Export Audit JSON"** to download the structured machine-readable payload.
3. Switch to the **Audit Trail** tab to show the immutable chronological ledger of all screening events.
