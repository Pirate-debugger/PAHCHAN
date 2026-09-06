# PAHCHAN — Technical Limitations, Ethical Boundaries & AI Safety
**Smart India Hackathon 2026 — Problem Statement SIH2026188: AI-Based Fake Identity & Document Screening System**  
**Team:** Debugs Pirates | **Institution:** Invertis University

---

## 1. Ethical Boundaries & Decision-Support Mandate

PAHCHAN is strictly engineered as an **AI-assisted forensic screening and decision-support workstation** for authorized checkpoint and border screening personnel (SSB, BOI, MHA).

### What PAHCHAN Does NOT Do:
1. **Does NOT Declare Guilt or Criminality:**
   - Technical anomalies (e.g. quantization differences in ELA, edge discontinuities, or MRZ checksum mismatches) describe physical characteristics of the presented credential. They do not constitute accusations of criminal intent against the document presenter.
2. **Does NOT Replace Human Statutory Authority:**
   - The statutory power to admit, conduct secondary physical inspection, or detain an individual rests exclusively with the authorized human officer.
3. **Does NOT Claim 100% Detection or Absolute Authenticity:**
   - Forensic and biometric outputs represent calibrated statistical signals and confidence bounds, not metaphysical certainties. No screening system can guarantee 100% detection against previously unseen physical attacks.
4. **Does NOT Usurp Official Government Databases:**
   - The platform utilizes an offline sandbox for mock watchlist evaluation and does not claim unauthorized live hooks into classified sovereign databases.

---

## 2. Technical Limitations & Operational Mitigations

| Technical Dimension | Current Constraint | Operational Mitigation in PAHCHAN |
|---|---|---|
| **Ultra-Low Image Resolution** | Uploads below 150 DPI degrade Error Level Analysis (ELA) and Sobel edge detection reliability. | The system flags low-resolution inputs with an `OCR Uncertainty (+10)` risk factor and advises physical magnifier loupe review. |
| **Physical Creases & Wear** | Severely folded, laundered, or water-damaged genuine passports may exhibit natural edge discontinuities. | The officer is presented with the raw visual image alongside the ELA heatmap to distinguish structural creases from cut-and-paste boundaries. |
| **Environmental Lighting & Pose** | Extreme checkpoint shadows, high ambient glare, or oblique face angles affect live biometric landmark extraction. | Biometric HUD alerts officer if facial alignment is suboptimal and suggests adjusting checkpoint lighting before final decision. |
| **Synthetic Demonstration Data** | Demonstrations utilize standardized synthetic SVG/PNG vectors to ensure 100% deterministic, offline evaluation for SIH judges. | All synthetic documents are clearly labeled: `"SYNTHETIC DEMONSTRATION DOCUMENT — NOT A REAL IDENTITY DOCUMENT"`. |
| **Calibrated Risk Factor Weights** | Prototype default weights (e.g. Expired doc: 30, Face mismatch: 40) are calibrated prototype heuristics. | Weights are exposed in the Settings panel and `/api/v1/risk/weights` API, allowing checkpoint administrators to align them with official Ministry directives. |

---

## 3. Human-in-the-Loop Safeguards & Regulatory Compliance

- **Supervisory Overrides:** Duty officers can override any automated risk recommendation; every override requires an operational rationale and is permanently logged in the SQLite audit ledger.
- **DPDPA 2023 Compliance:** Biometric feature vectors are calculated in volatile memory and never persisted in raw form to external public storage.
- **Explainability Requirement:** No risk score is presented to the officer without an itemized breakdown of the physical, optical, or mathematical findings that contributed to it.
