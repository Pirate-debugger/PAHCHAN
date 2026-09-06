# PAHCHAN — Official Design System & UI Specifications (Light Enterprise + Dark Canvas)
**Smart India Hackathon 2026 — Problem Statement SIH2026188: AI-Based Fake Identity & Document Screening System**  
**Version:** 4.0.0 (Enterprise Case Review Standard)

---

## 1. Core Visual Principles & The Dual-Surface Paradigm

PAHCHAN is engineered to feel like a high-precision, trustworthy case management workstation for document verification and forensic analysis:

1. **Light / Neutral Enterprise Application Shell:**
   - Soft off-white / light slate background (`#f8fafc` to `#f1f5f9`).
   - Clean white surfaces (`#ffffff`) with subtle 1px border lines (`#e2e8f0`).
   - Dark, legible typography (`#0f172a` headers, `#334155` body text) maximizing scanning speed.
   - Restrained deep cobalt primary accent (`#2563eb` / `#1d4ed8`).
2. **Dark Neutral Forensic Inspection Canvas:**
   - The document viewing area and Error Level Analysis (ELA) viewer use a dedicated dark stage (`#0f172a` / `#020617`).
   - This creates an intentional, ergonomic optical separation: physical document fibers, security threads, and micro-compression artifacts are inspected on a high-contrast dark stage without visual glare, while surrounding data, tables, and notes are read on a comfortable light surface.
3. **No Cyberpunk or SaaS Tropes:**
   - No neon glowing borders, no floating 3D graphics, no continuous scanner sweep animations, no decorative AI magic particles.
   - Animations are restricted to functional micro-transitions (< 150ms) and drawer slides.

---

## 2. Design Tokens

### 2.1 Color Tokens
```css
:root {
  /* Application Shell Surfaces */
  --bg-app: #f8fafc;          /* slate-50: Main application background */
  --bg-surface: #ffffff;      /* white: Primary card & panel surfaces */
  --bg-subtle: #f1f5f9;       /* slate-100: Table headers, inactive wells */
  --bg-canvas-dark: #0f172a;   /* slate-900: Dedicated forensic document stage */
  --bg-canvas-deep: #020617;   /* slate-950: Document viewport backdrop */

  /* Borders & Dividers */
  --border-subtle: #e2e8f0;    /* slate-200: Standard container borders */
  --border-medium: #cbd5e1;    /* slate-300: Input & active borders */
  --border-dark: #1e293b;      /* slate-800: Forensic stage borders */

  /* Text & Typography */
  --text-primary: #0f172a;     /* slate-900: High-contrast headings */
  --text-secondary: #334155;   /* slate-700: Readable body copy */
  --text-muted: #64748b;       /* slate-500: Metadata & field labels */
  --text-on-dark: #f8fafc;     /* slate-50: Text on forensic canvas */

  /* Brand / Primary Action */
  --brand-primary: #2563eb;    /* blue-600: Primary action buttons */
  --brand-hover: #1d4ed8;      /* blue-700: Hover state */
  --brand-light: #eff6ff;      /* blue-50: Active navigation background */

  /* Semantic Status & Risk Tiers */
  --status-low-bg: #ecfdf5;    /* emerald-50 */
  --status-low-text: #047857;  /* emerald-700 */
  --status-low-border: #a7f3d0;/* emerald-200 */

  --status-review-bg: #fffbeb; /* amber-50 */
  --status-review-text: #b45309;/* amber-700 */
  --status-review-border: #fde68a;/* amber-200 */

  --status-high-bg: #fff7ed;   /* orange-50 */
  --status-high-text: #c2410c; /* orange-700 */
  --status-high-border: #fed7aa;/* orange-200 */

  --status-critical-bg: #fef2f2;/* rose-50 */
  --status-critical-text: #b91c1c;/* rose-700 */
  --status-critical-border: #fecdd3;/* rose-200 */
}
```

### 2.2 Typography Scale
- **Page Title:** `24px` (`font-bold text-slate-900`)
- **Section Title:** `16px` (`font-semibold text-slate-900`)
- **Card Heading:** `14px` (`font-semibold text-slate-800`)
- **Body Text:** `14px` (`font-normal text-slate-700`, line-height: `20px`)
- **Secondary / Captions:** `13px` (`font-medium text-slate-500`)
- **Technical Metadata / Badges:** `12px` (`font-mono text-slate-600`)
- **Document / MRZ Codes:** `12px` (`font-mono font-bold tracking-wider`)

### 2.3 Spacing & Border Radius
- **Inputs:** `border-radius: 6px;` (`rounded-md`)
- **Buttons:** `border-radius: 6px;` (`rounded-md`)
- **Cards & Panels:** `border-radius: 8px;` (`rounded-lg`)
- **Dialogs & Drawers:** `border-radius: 10px;`
- **Badges:** `border-radius: 4px;` (`rounded`)

---

## 3. Component Design Specifications

### 3.1 Header & Top Navigation
- **Height:** `56px` (`h-14`), sticky top with white background and subtle bottom border (`border-b border-slate-200`).
- **Brand Element:** "PAHCHAN" (`font-bold text-slate-900 tracking-wide`), Subtitle: "Identity & Document Screening", and subtle badge: `Prototype • SIH 2026`.
- **Center / Quick Actions:** Compact search box (`Search case ID or document number...`), duty post label (e.g. *Raxaul Land Border*), officer profile badge (*Officer SSB-449*).
- **Eliminated Header Noise:** Clocks, audio toggles, blinking API pings, and scenario switchers are removed from the global header.

### 3.2 Primary Workflow Navigation
- Integrated 7-tab bar or sub-header:
  1. `Overview`
  2. `Screenings` (Case Queue)
  3. `New Screening` (Case Workstation)
  4. `Reports`
  5. `Audit Log`
  6. `Demo Lab`
  7. `Settings`
- Active indicator: `text-blue-700 bg-blue-50 border-b-2 border-blue-600 font-semibold`. Inactive: `text-slate-600 hover:text-slate-900 hover:bg-slate-50`.

### 3.3 The Screening Workstation Layout
- **Container:** Clean flex/grid layout maximizing screen real estate.
- **Left / Center (Document Inspection Area):**
  - Dark studio frame (`bg-slate-900 rounded-lg border border-slate-800 p-2`) with zoom, pan, fit controls, and view toggles (`Original | Annotated | Compare`).
  - Interactive bounding boxes that highlight upon selecting an extracted field or forensic finding.
- **Right (Screening Verdict & Decision Panel):**
  - Clean screening risk score tile (`72 / 100 HIGH RISK`).
  - Key finding indicators with severity badges.
  - Operational recommendation (*Secondary Review Required*).
  - Human-in-the-Loop decision recording buttons: `[Confirm Clear]` `[Request Secondary]` `[Escalate / Hold]`.
- **Bottom / Drawer (Findings & Traceability Inspector):**
  - Table of itemized findings: Title, Severity, Confidence, Evidence Summary, Risk Contribution, and "View in Document →" action.

### 3.4 Tables (Screening Queue & Audit Log)
- White table background with crisp headers (`bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200`).
- Alternating row hover: `hover:bg-slate-50/80 cursor-pointer transition-colors`.
- Rows contain: Case ID, Document, Submitted Time, Risk Pill, Status, Key Finding, Assigned Officer, Action.
- Clicking any row opens a right-side sliding **Case Detail Drawer** (`max-w-md bg-white border-l border-slate-200 shadow-xl`).

### 3.5 Status Badges & Alerts
Every badge includes an explicit SVG icon, label, and accessible contrast:
- `LOW / PASS`: Emerald badge with CheckCircle icon (`bg-emerald-50 text-emerald-700 border border-emerald-200`).
- `REVIEW / CAUTION`: Amber badge with AlertTriangle icon (`bg-amber-50 text-amber-700 border border-amber-200`).
- `HIGH / WARNING`: Orange badge with AlertCircle icon (`bg-orange-50 text-orange-700 border border-orange-200`).
- `CRITICAL / ALERT`: Crimson badge with ShieldAlert icon (`bg-rose-50 text-rose-700 border border-rose-200`).

---

## 4. Accessibility & Human Factors (WCAG 2.2 AA)

1. **Contrast Guarantee:** All body text achieves $\ge 4.5:1$ against white or light gray surfaces; headers achieve $\ge 7:1$.
2. **Focus Visibility:** All interactive buttons and inputs utilize a high-visibility focus ring: `focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`.
3. **Motion Sensitivity:** All transitions respect `@media (prefers-reduced-motion: reduce)`.
4. **Empty & Error States:** Explicit, helpful language explaining *What this area is*, *Why it is empty/failing*, and *What specific action the officer should take*.
