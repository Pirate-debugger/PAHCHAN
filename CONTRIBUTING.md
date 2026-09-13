# Contributing to PAHCHAN (SIH2026188)

Thank you for contributing to **PAHCHAN: AI-Based Fake Identity & Document Screening System**. This project is maintained by **Team Debugs Pirates** under problem statement **SIH2026188** for the **Ministry of Home Affairs / Sashastra Seema Bal (SSB), Police II Division**.

Please read these guidelines before proposing changes or submitting pull requests.

---

## 1. Global Development Rules

### A. Branch Naming Pattern
All new work must be submitted from a dedicated feature branch using the strict format:
```bash
improv/<area>/<short-description>
```
*Examples:*
- `improv/security/uploads-sandbox`
- `improv/ci/baseline-workflows`
- `improv/docs/foundational-governance`
- `improv/frontend/accessibility-pass`

### B. Pull Request Requirements
Every PR must include:
- **Title:** `chore/improv: <short description>` or `feat/improv: <short description>` or `fix/improv: <short description>`
- **Description:** 
  1. High-level summary of changes
  2. List of modified/created files
  3. Step-by-step local testing instructions
  4. Acceptance criteria checklist
- **Labels:** `security`, `infra`, `docs`, `frontend`, `backend`, `tests`
- **Issue Reference:** Linked GitHub issue tracking the deliverable

### C. Sensitive & Cryptographic Code Safeguards
- **Never modify** cryptographic sealing logic, audit log chain computation, or ground-truth judge demo scenarios without:
  1. Pre-existing unit tests demonstrating current behavior
  2. Documented justification
  3. Approval from repository codeowners

---

## 2. Local Setup & Reproduction

### Prerequisites
- Python 3.11+ (Python 3.11 or 3.14 tested)
- Node.js 18+ & npm 9+
- Git

### Backend Setup (FastAPI)
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend test suite (MUST be 100% green)
python -m pytest tests -v

# Run backend development server
python run_backend.py
# Backend runs at http://localhost:8000 (Health: http://localhost:8000/api/health)
```

### Frontend Setup (React + Vite)
```bash
cd frontend

# Install dependencies
npm ci # or npm install

# Type-check and production build
npm run build

# Start local Vite development server
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 3. Secrets & Environment Handling
- **Never commit credentials, API keys, or private tokens** to Git.
- `backend/.env.example` contains only non-sensitive defaults and placeholder variable names.
- In CI and production deployments, use a Secret Manager (e.g. GitHub Actions Encrypted Secrets, Google Secret Manager).

---

## 4. Frontend Lockfile Policy (`package-lock.json`)
- **Policy Decision:** We retain and commit `package-lock.json` in source control to ensure deterministic, reproducible builds across developer machines and GitHub Actions CI runners.
- When updating or adding npm packages, run `npm install <package> --save-exact` and commit both `package.json` and `package-lock.json`.
- Do not run `npm update` without prior issue discussion and testing.

---

## 5. Pre-Commit Checklist for Contributors
Before requesting review on your PR:
- [ ] Backend tests pass: `python -m pytest tests -q` (all 35+ tests green).
- [ ] Frontend builds cleanly: `npm run build` exits with code 0.
- [ ] No unhandled exceptions or 500 errors in backend logs.
- [ ] No personal names or hardcoded developer shortcuts introduced.
- [ ] Disclaimers preserved:
  - *"These prototype thresholds are not official government standards."*
  - *"Face comparison is a screening signal and requires human review."*
  - *"SYNTHETIC DEMONSTRATION DOCUMENT — NOT A REAL IDENTITY DOCUMENT."*
