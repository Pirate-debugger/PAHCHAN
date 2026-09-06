# PAHCHAN — Frontend Application

React 19 + TypeScript + Vite + Tailwind CSS interface for the PAHCHAN AI-Assisted Identity and Document Screening Decision Support System.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the `.env.example` template to `.env.local`:
```bash
cp .env.example .env.local
```

Configurable variables:
| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | Base URL for FastAPI screening & forensics backend |
| `VITE_API_KEY` | `pahchan-secret-api-key-2026` | API authentication key for sensitive endpoints (`/risk/weights`, `/audit/record`, `/screenings`) |

### 3. Run Development Server
```bash
npm run dev
```

### 4. Production Build & Linting
```bash
npm run build
npm run lint
```

## Features & Workflows
- **Screening Workstation:** Document bio-page inspection, ELA / Sobel edge anomaly heatmaps, VIZ text variance, SSIM stamp matching, and face verification.
- **Intelligence Watchlist:** Real-time database query and suspect bulletin management with fuzzy name and document matching.
- **Cryptographic Audit Trail:** Chronological ledger verifying SHA-256 hash chaining to guarantee immutable inspection history.
- **Offline Resilience:** Visual alert banners indicate when offline demo or fallback data is active versus live backend verification.
