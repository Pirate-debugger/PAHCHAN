# PAHCHAN — Internal Hackathon Pitch & Judge Demo Guide
### SIH 2026 Problem Statement SIH2026188
**Ministry of Home Affairs &bull; Sashastra Seema Bal (SSB), Police II Division**

---

## 1. Quick Startup Guide (For Tomorrow Morning)

If you turn on your laptop or restart your PC tomorrow, you do **not** need to type manual commands:
1. Open the folder: `E:\ANTIGRVITY\SIH188`
2. **Double-click `run_pahchan.bat`** (or right-click `run_pahchan.ps1` -> Run with PowerShell).
3. Two terminal windows will open (Backend on port 8000, Frontend on port 5173).
4. Your browser will automatically open to `http://127.0.0.1:5173/`.
5. **Do not close the two black terminal windows** while presenting.

> [!TIP]
> **Pre-demo check:** Press `Ctrl + Shift + R` (hard refresh) in the browser before presenting to ensure all cached styles and images are fresh.

---

## 2. The 5-Minute Winning Pitch Structure

### **Minute 0:00 – 0:45: The Problem & The SSB Context (The Hook)**
> *"Good morning, respected judges. In high-pressure border checkpoints operated by the Sashastra Seema Bal (SSB) along India's open borders with Nepal and Bhutan, officers screen thousands of travelers daily with only 15 to 30 seconds per document.*
>
> *Transnational syndicates exploit this bottleneck with sophisticated identity fraud: photo substitution, altered dates of birth, forged visa stamps, and impersonation.*
>
> *Existing automated tools fail because they are either slow cloud-dependent black boxes or overly complex cybersecurity dashboards that frontline officers cannot use in real time.*
>
> *We built **PAHCHAN** — an AI-based fake identity and travel document screening system engineered specifically for SSB border personnel. It combines sub-second optical and computer-vision forensics, ICAO Doc 9303 checksum math, and biometric face verification into a calm, court-admissible workflow."*

---

### **Minute 0:45 – 3:00: The Live Demo (3 Killer Scenarios)**

#### **Act 1: The Command Center (30 seconds)**
- **What to do:** Start on the **Overview** dashboard (`http://127.0.0.1:5173/`).
- **What to say:**
  > *"This is the PAHCHAN operational checkpoint terminal. Notice the calm, enterprise design — no distracting neon hacker aesthetics. It shows live metrics: total border clearances, high-priority fraud alerts, and queue latency. Let’s jump into our Demo Lab to test real-world border scenarios."*
- **Click:** Top navigation bar &rarr; **Demo Lab**.

---

#### **Act 2: Scenario 2 — Photo Splicing & Tampering (90 seconds)**
- **What to do:** In Demo Lab, find **Scenario 2: Altered Photograph (Photo Replacement)**.
- **Click:** **Test Scenario** / **Launch Scenario in Workstation**.
- **What to say:**
  > *"Here, a passport has been presented where a fraudster digitally spliced a new portrait onto an authentic passport substrate. Watch what PAHCHAN does in less than one second:"*
- **Walk through the 3-6-3 Layout:**
  1. **Left Column (Extracted Data):**
     > *"On the left, our OCR and ICAO engine parses the document with per-field confidence scores (98%-99%). Notice the ICAO 9303 Machine Readable Zone (MRZ) parsed at the bottom."*
  2. **Center Column (Document Forensic Canvas):**
     > *"In the center is our forensic canvas. If an officer suspects tampering, they can click **Contrast** [Click it!] to inspect microprinting and watermark guilloche patterns.*
     > *Even more powerful: click **ELA Heatmap** [Click it!]. This runs Error Level Analysis. Notice the high-frequency color variance over the portrait compared to the uniform compression of the passport paper. The algorithm mathematically catches the digital cut-and-paste!"*
  3. **Right Column (Findings & Evidence):**
     > *"On the right, PAHCHAN computes a composite risk score of **HIGH (80/100)**. It flags 'Possible Photo Alteration Signal'. Notice our transparent AI: clicking **Algorithms** [Click it!] discloses the exact mathematical proof — Laplacian texture ratio of 0.81 and perimeter gradient edge discontinuity of -23.32."*
  4. **Biometric Face Verification:**
     > *"Below the findings, our biometric engine compared the passport photo with the live checkpoint booth camera, yielding a facial similarity gauge with visual feature matching."*

---

#### **Act 3: Officer Determination & Court-Admissible Dossier (60 seconds)**
- **What to do:** 
  1. Click **Record Determination** at the top right.
  2. Select **Escalate to Supervisor** or **Confirm Counterfeit & Detain**.
  3. Notes: Type *"Photo substitution confirmed via ELA disparity"*.
  4. Click **Confirm Determination**.
  5. Click **Official Report** in the workstation header.
- **What to say:**
  > *"In immigration and border security, AI does not make the final legal arrest — the sworn officer does. PAHCHAN empowers the officer with 4 legal dispositions.*
  > *Once determined, PAHCHAN generates this official legal dossier. Notice the Government of India / SSB Police II Division header, the cryptographic SHA-256 chain-of-custody seal, the embedded QR verification code, and the officer signature block.*
  > *This document can be printed directly as an A4 legal exhibit admissible in court."*

---

#### **Act 4 (Optional If Asked): Scenario 3 — Modified DOB & MRZ Math (45 seconds)**
- **What to do:** Go back to **Demo Lab** and click **Scenario 3: Modified Date of Birth**.
- **What to say:**
  > *"In Scenario 3, a criminal altered their date of birth in the printed text to look younger. While the human eye might miss this, PAHCHAN executes the ICAO 9303 7-3-1 weighting algorithm on the MRZ check digit. The checksum math fails instantly, flagging a High-Risk Tampering signal."*

---

## 3. Deep Technical Architecture ("Under the Hood")

Keep these 5 technical pillars ready for when judges ask: *"How does it actually work?"*

| Feature | Technical Implementation | Why It Wins |
| :--- | :--- | :--- |
| **Error Level Analysis (ELA)** | Resaves the image at a known JPEG quality (90-95%) and computes pixel-wise absolute difference against the original. Compressed areas have uniform error; newly spliced uncompressed photos display sharp error peaks. | Catches photo substitution even if Photoshop edges were blended. |
| **Laplacian Texture Ratio** | Applies discrete second-derivative Laplacian kernel $\nabla^2 f = \frac{\partial^2 f}{\partial x^2} + \frac{\partial^2 f}{\partial y^2}$ to measure high-frequency noise variance on the portrait vs. the document substrate. | Compares physical paper grain against photo paper grain mathematically. |
| **ICAO Doc 9303 Checksum** | Implements the official international standard 7-3-1 weight cycle modulo 10: $\sum (c_i \times w_i) \pmod{10}$. Validates Document Number, Birth Date, Expiry Date, and Composite Check Digit. | Cannot be faked without matching the exact mathematical check digits. |
| **Biometric Face Verification** | Deep convolutional neural network feature extraction generating 512-dimensional normalized embeddings; computes Cosine Similarity $\cos(\theta) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|}$. | Works across age variations, lighting differences, and glasses. |
| **Chain-of-Custody Cryptography** | Canonical JSON representation of all fields, timestamps, and findings hashed with SHA-256: `SHA256(case_id + doc_hash + timestamp + officer_id)`. | Ensures evidence cannot be altered after the fact; court-admissible. |

---

## 4. Anticipated Tough Judge Questions & Winning Answers

### Q1: "Is this model running in the cloud or on-premise at remote border outposts?"
> **Your Answer:** 
> *"PAHCHAN is designed **edge-first and on-premise**. At remote SSB checkpoints (such as Raxaul, Panitanki, or Jogbani) where internet connectivity is unstable or restricted for defense security, the entire backend runs on local checkpoint hardware with zero external cloud dependencies. When network connectivity is available, audit logs synchronize securely to central MHA databases."*

### Q2: "What if the document is crumpled, dirty, or scanned at an angle?"
> **Your Answer:** 
> *"Our computer vision pipeline includes automatic pre-processing: perspective rectification via contour detection, adaptive thresholding for uneven lighting, and dual OCR cross-referencing between the visual inspection zone (VIZ) and the MRZ. Furthermore, if OCR misreads a character on a damaged document, our workstation allows audited officer corrections that are permanently logged."*

### Q3: "How do you prevent false positives that delay innocent travelers?"
> **Your Answer:** 
> *"We use a tiered risk-scoring model rather than a binary pass/fail. Low-risk cases (e.g., minor lighting reflection) receive a 'LOW' score and sub-second clearance. Serious flags (like MRZ checksum failure or photo texture disparity) escalate to 'REVIEW' or 'HIGH'. This keeps normal traveler clearance under 2 seconds while focusing officer attention where anomalies exist."*

### Q4: "How does this comply with ICAO international travel standards?"
> **Your Answer:** 
> *"PAHCHAN strictly implements **ICAO Doc 9303** specifications for Machine Readable Travel Documents (MRTD). We parse both TD1 (ID cards), TD2, and TD3 (Passports, 2 lines of 44 characters), strictly validating field formats, nationality country codes (ISO 3166-1 alpha-3), and 7-3-1 modulus-10 check digits."*

### Q5: "What makes your solution better than existing commercial e-Gates?"
> **Your Answer:** 
> *"Commercial e-Gates cost upwards of ₹30-50 Lakhs each, require expensive proprietary hardware, and only read RFID chips. Millions of travelers at SSB border crossings carry non-biometric documents, regional passes, and visas with physical stamps. PAHCHAN runs on standard commodity scanners and webcams, providing deep forensic and stamp analysis that traditional e-Gates cannot do."*

---

## 5. Pre-Presentation Checklist (Tomorrow Morning)

- [ ] Laptop plugged into power (don't run on battery saver to prevent lag).
- [ ] Screen resolution set to standard 1080p (1920x1080) for projection.
- [ ] Run `run_pahchan.bat` &mdash; verify both backend and frontend consoles show no errors.
- [ ] Open `http://127.0.0.1:5173/` &mdash; press `Ctrl + F5` once.
- [ ] Click through **Scenario 1** (Genuine) and **Scenario 2** (Altered Photo) once beforehand.
- [ ] Have this guide open on your phone or printed for reference.
- [ ] Speak calmly, clearly, and with confidence. You have a complete, production-ready system!
