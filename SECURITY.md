# Security Policy — PAHCHAN (SIH2026188)

## 1. Overview & Security Mandate
**PAHCHAN** is an AI-assisted fake identity and document screening platform developed under the aegis of the **Ministry of Home Affairs / Sashastra Seema Bal (SSB), Police II Division**. Because this software operates in sensitive border checkpoint and identity verification domains, maintaining the confidentiality, integrity, and non-repudiation of screening data and cryptographic audit trails is of paramount importance.

---

## 2. Supported Versions
Only the latest major version and current development branch receive security patches and vulnerability triage.

| Version | Supported          | Security Maintenance Level |
| ------- | ------------------ | -------------------------- |
| 1.0.x   | :white_check_mark: | Active Security Patches    |
| < 1.0   | :x:                | Deprecated (Pre-SIH Alpha) |

---

## 3. Reporting a Vulnerability

We request that all security researchers, evaluators, and contributors practice **Coordinated Vulnerability Disclosure (CVD)**. 

### How to Report
> [!CAUTION]
> **DO NOT** file public GitHub issues for suspected security vulnerabilities or credential disclosures.

Please send an encrypted report to our Security Response Team:
- **Email:** `security@debugspirates.org`
- **Subject Line:** `[VULNERABILITY] PAHCHAN Security Report - <Component>`
- **Response SLA:** Within 24 hours acknowledging receipt, initial severity triage within 72 hours.

### Report Contents
To help us quickly reproduce and remediate the issue, please include:
1. **Component Affected:** (e.g., `backend/app/api/screenings.py`, Upload Handler, MRZ parser, Cryptographic audit seal)
2. **Type of Vulnerability:** (e.g., Remote Code Execution, Denial of Service, SSRF, Information Disclosure, PII leak, Magic Byte bypass)
3. **Proof of Concept:** Step-by-step reproduction instructions, scripts, or sample payloads.
4. **Impact Assessment:** Plausible operational risk at border outpost checkpoints.

---

## 4. Remediation & Disclosure Process
1. **Intake & Confirmation:** The security team confirms reproducibility and evaluates severity using CVSS v3.1.
2. **Private Patching:** A fix is developed on a private security advisory branch and tested against regression suites.
3. **Advisory Release:** Once verified and deployed, a GitHub Security Advisory (GHSA) is published with credit to the reporter.
4. **Turnaround Window:** Critical severity issues are patched within 7 business days.

---

## 5. Security Principles in PAHCHAN
- **Zero Raw PII Storage:** Identity documents and personal numbers are masked (`mask_document_number`) in audit logs and public responses.
- **Strict File Type Verification:** Uploads are checked against both file extension whitelists and file header magic bytes (e.g., JPEG `FF D8 FF`, PNG `89 50 4E 47`, PDF `%PDF`).
- **Zero Fraud Penalty on Provider Downtime:** In accordance with sovereign fairness rules, external network downtime or unconfigured state resolves as `UNVERIFIABLE` and contributes 0 risk points.
- **Immutable Cryptographic Audit Seal:** Every screening dossier is sealed with SHA-256 signatures over all primary evidence and officer determinations.
