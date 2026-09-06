# PAHCHAN — Official SIH 2026 Live Demonstration Guide & Script
**Problem Statement:** SIH2026188 — AI-Based Fake Identity & Document Screening System  
**Team:** Debugs Pirates | **Target Role:** Checkpoint Officer (SSB / Bureau of Immigration)  
**Target Audience:** SIH Jury, Technical Evaluators, Ministry Representatives

---

## 1. Executive Pitch (30 Seconds)

> *"Good afternoon, respected evaluators.  
> In modern border security and immigration management, officers process thousands of travel documents daily under immense time pressure. Sophisticated fraudsters exploit this by physically splicing photographs, using siblings as imposters, or altering birthdates.  
>  
> Existing tools either fail silently or act as autonomous black boxes shouting 'FAKE' without explainability.  
>  
> Today, we present **PAHCHAN** — an AI-assisted forensic screening and decision-support workstation built for the Special Service Bureau and Bureau of Immigration. PAHCHAN does not replace the officer; it equips the officer with cryptographic proof, mathematical check digit verification, and multi-spectral computer vision."*

---

## 2. Minute-by-Minute Demonstration Runbook

### Minute 1: The Command Center Overview
1. **Navigate to:** `Overview` tab.
2. **Key Talking Points:**
   - *"Notice the Mission Command Center. It answers four operational questions in one glance: What is happening? What requires immediate attention? Which screenings are high risk? What should the officer do next?"*
   - Point to the **Active Duty Checkpoint selector** (e.g. *Raxaul Land Border Checkpoint, Indo-Nepal*).
   - Point to **Signal Anomaly Distribution**: Photo splicing (38%), Face Imposter (25%), Expired validity (20%).
   - Click **"Launch Screening Workstation"** or press **Key 1**.

---

### Minute 2: The 3-Second Rule & ICAO Math Inspector
1. **Load:** Scenario #1 (Genuine Republic of India Passport).
2. **Key Talking Points:**
   - *"Observe the top green banner. Within 3 seconds, the officer knows: Score 8/100, Authentic Document, 92.4% Biometric match. This satisfies our 3-second operational clearance requirement."*
   - Scroll to the **Extracted Document Fields Card**.
   - Hover over the MRZ string to show **bidirectional visual character highlighting**.
   - Click **"Inspect ICAO Modulo-10 7-3-1 Math"**:
     - *"Here we show the exact ICAO Doc 9303 algorithm in action. Each character is multiplied by weights 7, 3, 1 modulo 10. Every checksum passes with zero discrepancies."*

---

### Minute 3: Multi-Spectral Forensics & Spliced Photo Detection
1. **Switch to:** Scenario #2 (Case 2: Spliced Facial Substrate / Photo Tampering) by clicking **#2** in the top bar.
2. **Key Talking Points:**
   - *"Instantly, the banner turns Red: Critical Alert (Score 78/100) — Photo Splicing Detected."*
   - In the **Forensics Viewer**, toggle **"Curtain Split"** mode:
     - Drag the split slider across the portrait: *"On the left, the raw visual passport; on the right, our real-time Error Level Analysis (ELA) heatmap."*
   - Toggle **"Reticle Inspector"**:
     - Hover over the photograph boundary: *"Notice how the reticle reports a severe edge discontinuity and quantization variance. The substrate fiber pattern was physically cut and pasted."*

---

### Minute 4: Biometric Impersonation & Additive Risk Engine
1. **Switch to:** Scenario #5 (Case 5: Biometric Impersonation / Sibling Lookalike).
2. **Key Talking Points:**
   - *"In this scenario, the physical passport is 100% genuine! An officer relying solely on document scanning would clear this passenger. But look at our 1:1 Biometric Verification HUD."*
   - Click **"Toggle Facial Landmarks HUD"**:
     - *"The system extracts localized facial structure and HOG gradient feature embeddings between the passport photo and the live checkpoint webcam. Cosine similarity drops to 42.1%, well below our 75.0% threshold."*
   - Point to the **Risk Breakdown Card**:
     - *"Notice that the score of 82/100 is not a magical guess. The officer sees exactly: Face Impersonation (+40) + Baseline Confidence (+12) + Travel Alert (+30)."*
   - Click the **"Speaker / Audio Briefing"** icon to demonstrate hands-free text-to-speech briefing.

---

### Minute 5: Official Cryptographic Dossier & Immutable Audit Trail
1. **Navigate to:** `Reports` tab.
2. **Key Talking Points:**
   - *"When an officer takes an operational decision — whether Clear, Secondary Inspection, or Detain — PAHCHAN generates a cryptographically sealed dossier."*
   - Point to the **SHA-256 fingerprint**: *"Every ingested document is hashed on arrival. This hash is permanently bound to the session ID, officer badge ID, and forensic findings."*
   - Click **"Print Dossier"** to show print-ready layout.
3. **Navigate to:** `Audit` tab.
   - Point to the **SQLite Sync Badge**: *"All screening events are immutably logged into our local SQLite database running in WAL mode, ensuring zero data loss even during network blackout."*

---

## 3. Judge Questions & Defensible Answers

### Q1: *"Why not send the images to a cloud model like GPT-4 Vision or Gemini?"*
> **Answer:** *"Border checkpoints deal with sensitive sovereign identity documents. Transmitting live citizen passports to third-party public cloud APIs violates the **Digital Personal Data Protection Act (DPDPA 2023)** and creates catastrophic latency in remote border posts (e.g. Raxaul or Attari) where internet connectivity is unstable. PAHCHAN runs 100% on-premise and edge-resilient."*

### Q2: *"What happens if the uploaded passport image is low-quality or blurry?"*
> **Answer:** *"PAHCHAN calculates per-field OCR confidence metrics and ELA variance baselines. When confidence falls below 70%, the system flags 'OCR Uncertainty' (+10 points) and instructs the officer to perform a physical loupe inspection, rather than guessing."*

### Q3: *"Can an attacker bypass the face verification with a photograph of the real passport holder?"*
> **Answer:** *"Our biometric pipeline includes liveness and landmark alignment detection that verifies 3D face structure and texture depth rather than flat 2D pixel matching."*

### Q4: *"Can checkpoint administrators configure risk weights?"*
> **Answer:** *"Yes. In our Settings panel, authorized supervisors can adjust individual factor weights (e.g. elevating watchlist alert to 50 points or lowering metadata warning to 5 points) based on local border intelligence bulletins."*
