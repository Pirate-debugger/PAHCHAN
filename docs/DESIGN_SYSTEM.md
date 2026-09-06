# PAHCHAN — Enterprise Security Design System & UX Standards
**Smart India Hackathon 2026 — Problem Statement SIH2026188**  
**Team:** Debugs Pirates | **Agency Target:** Border & Immigration Checkpoints (SSB, BOI, MHA)

---

## 1. Core Philosophy: The Law Enforcement & SOC Standard

PAHCHAN is intentionally engineered to avoid the visual tropes of consumer SaaS or decorative "AI magic" apps (neon cyberpunk, gratuitous glassmorphism, floating particles, or arbitrary 3D models).

Instead, PAHCHAN communicates:
- **Trust & Authority:** Clear institutional identity and uncompromising precision.
- **Explainability Over Assertion:** Every risk indicator is grounded in physical, optical, or mathematical proof.
- **The 3-Second Rule:** An inspecting officer facing a passenger at a busy international checkpoint must grasp the security status within 3 seconds of scanning.
- **Cognitive Ease Under Stress:** High data density balanced by disciplined spacing, consistent contrast, and strict hierarchy.

---

## 2. Color Palette & Semantic Color Mapping

Colors in PAHCHAN carry unambiguous, non-negotiable operational meaning. **Color is never used in isolation**; it is always paired with a textual label, numerical score, and iconic glyph.

### 2.1 Dark Surface Foundations
| Token | Hex | Role | Usage |
|---|---|---|---|
| `bg-primary` | `#070b14` | Void Black / Deep Slate | Main application background |
| `surface-1` | `#0f172a` | Card / Panel Background | Primary container surface |
| `surface-2` | `#0b1220` | Recessed Background | Embedded cards, preview sheets |
| `surface-input` | `#080d19` | Well / Input Surface | Dropdowns, text inputs, code boxes |
| `border-subtle` | `#1e293b` | Divider | Inactive borders, row dividers |
| `border-active` | `#334155` | Elevated Border | Active cards, hover states |

### 2.2 Operational Status Tiers
| Tier | Score Range | Primary Hex | Background Tint | Border Tint | Operational Meaning |
|---|---|---|---|---|---|
| **LOW (Clear)** | 0 – 29 | `#34d399` (Emerald) | `rgba(6, 78, 59, 0.25)` | `rgba(6, 95, 70, 0.8)` | Document authentic, biometrics match. Clear for entry. |
| **MEDIUM (Review)**| 30 – 69 | `#fbbf24` (Amber) | `rgba(120, 53, 15, 0.25)` | `rgba(146, 64, 14, 0.8)` | Discrepancies detected. Secondary physical inspection required. |
| **CRITICAL (Alert)**| 70 – 100 | `#f43f5e` (Rose) | `rgba(136, 19, 55, 0.25)` | `rgba(159, 18, 57, 0.8)` | Tampering, forgery, or impersonation detected. Detain / supervisor review. |

### 2.3 Brand & Data Accents
- **Cyan Focus (`#22d3ee` / `#06b6d4`):** Active selections, camera reticle lines, highlighted OCR fields.
- **Cobalt Blue (`#2563eb` / `#1d4ed8`):** Primary action buttons, header emblem gradients.

---

## 3. Typography & Hierarchy

PAHCHAN employs a dual-typeface typographic system designed for data-heavy inspection:

### 3.1 Font Families
1. **Sans-Serif (`Inter` / System UI):** Used for navigation, explanations, instructions, and button labels. Optimized for legibility at small sizes (`11px` to `14px`).
2. **Monospace (`JetBrains Mono` / `Courier New`):** Used for all forensic data, document numbers, MRZ character strings, SHA-256 digests, timestamps, and numerical risk scores.

### 3.2 Scale & Weights
| Scale | Size | Line Height | Weight | Tracking | Usage |
|---|---|---|---|---|---|
| `display` | 24px | 32px | 900 (Black) | Wide | Key risk scores, critical status banners |
| `h1` | 18px | 24px | 800 (Extrabold) | Normal | Page titles, major section headers |
| `h2` | 14px | 20px | 700 (Bold) | Normal | Card titles, quadrant headers |
| `body` | 12px | 18px | 500 (Medium) | Normal | Explanations, findings descriptions |
| `caption` | 11px | 16px | 500 (Medium) | Normal | Field labels, secondary metadata |
| `mono-code` | 11px | 16px | 600 (Semibold) | Tight | MRZ lines, ICAO modulo-10 digits, hex dumps |

---

## 4. Layout Architecture: The 4-Quadrant Workstation

The Primary Workstation (`Screening`) uses an ergonomic 12-column split layout optimized for widescreen checkpoint monitors:

```
+-------------------------------------------------------------------------+
| [NAVBAR] PAHCHAN | Overview | Screening | Evidence | Reports | Audit ...|
+-------------------------------------------------------------------------+
| [SCENARIOS BAR] #1 Genuine | #2 Spliced | #3 DOB Mod | #4 Stamp ...     |
+-------------------------------------------------------------------------+
| [INSTANT VERDICT BANNER] Verdict + Score + 3-Second Summary             |
+------------------------------------+------------------------------------+
| LEFT COLUMN (7 Cols)               | RIGHT COLUMN (5 Cols)              |
| [Quadrant 1: Forensics Viewer]     | [Quadrant 3: Biometrics 1:1 Match] |
| - High-res image with zoom & pan   | - Document Photo vs Presenter      |
| - ELA Heatmap, Sobel Edge, Noise   | - Cosine Distance & Landmark Mesh  |
| - Curtain split mode & reticle     |                                    |
| [Quadrant 2: Extracted Fields]     | [Quadrant 4: Risk & Decision]      |
| - OCR table with confidences       | - Circular SVG Gauge (0-100)       |
| - ICAO MRZ 7-3-1 Math Inspector    | - Additive Factor Breakdown        |
| - Cross-document discrepancies     | - Action Buttons (Clear/2nd/Detain)|
+------------------------------------+------------------------------------+
```

---

## 5. Micro-Interactions & Audio-Tactile Feedback

To assist officers in fast-paced environments, PAHCHAN features subtle, optional Web Audio API sound effects:
- **Scan (`sound.scan()`):** Subtle radar sweep tone during analysis.
- **Success (`sound.success()`):** Gentle harmonic chime on low risk clearance.
- **Alert (`sound.alert()`):** Low double pulse on critical risk finding.
- **Click (`sound.click()`):** Crisp tactile tick on navigation and tab selection.
- **Audio Briefing (`sound.speak()`):** Text-to-speech synthesize briefing of findings for hands-free inspection.
*Note: A one-click mute button in the Navbar enables silent operation at any time.*

---

## 6. Accessibility (WCAG 2.1 Level AA) Compliance

1. **Color Contrast:** All body text meets minimum 4.5:1 contrast against dark surfaces. Monospace badges meet 7:1 against their backgrounds.
2. **Keyboard Navigation:**
   - Keys `1` through `8`: Instant load of synthetic test scenarios.
   - Key `R`: Trigger AI Rescan.
   - Key `D`: Open Official Audit Dossier.
   - Keys `C`, `S`, `A`: Clear Entry, Secondary Inspection, Detain Alert.
3. **Screen Readers:** ARIA live regions announce scan progress and verdict changes.
4. **Form Labels:** All inputs and file upload dropzones feature explicit labels and focus rings (`focus:ring-2 focus:ring-cyan-500`).
