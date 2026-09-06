# PAHCHAN — Official REST API Reference Manual
**Smart India Hackathon 2026 — Problem Statement SIH2026188**  
**Version:** 3.0.0 | **Framework:** FastAPI (Python 3.14 / Async ASGI)  
**Base URL:** `http://localhost:8000/api/v1` | **Interactive OpenAPI UI:** `http://localhost:8000/docs`

---

## 1. System Architecture & Standards

All PAHCHAN endpoints adhere to the following design standards:
- **Stateless RESTful Design:** All verification data is transmitted via explicit payloads.
- **Cryptographic Audit Binding:** Successful screenings generate a SHA-256 digest of input documents, binding physical evidence to audit logs.
- **Decision-Support Guarantees:** Endpoints emit quantitative risk factors, calibrated confidence intervals, and explainability narratives; they never issue autonomous legal decrees.

---

## 2. API Endpoints

### 2.1 System Health & Telemetry

#### `GET /api/health` or `GET /api/v1/health`
Verifies backend service availability, active deployment checkpoint, and engine version.

**Response `200 OK`:**
```json
{
  "status": "ONLINE",
  "system": "PAHCHAN",
  "tagline": "Verify Identity. Detect Risk. Protect Trust.",
  "version": "3.0.0",
  "mode": "DECISION_SUPPORT_ACTIVE",
  "checkpoint": "Raxaul Land Border Checkpoint (Indo-Nepal)",
  "agency": "Special Service Bureau (SSB) / MHA"
}
```

---

### 2.2 Core Screening Pipeline

#### `POST /api/v1/screenings`
Executes the comprehensive, multi-stage document and biometric screening pipeline.

**Request (`multipart/form-data`):**
| Field | Type | Required | Description |
|---|---|---|---|
| `doc_file` | Binary File | **Yes** | Identity document (JPEG, PNG, WEBP, or PDF) |
| `live_file` | Binary File | Optional | Live presenter facial photograph captured at post |
| `secondary_doc_file` | Binary File | Optional | Accompanying visa or secondary ID for cross-validation |
| `mrz_line1` | string | Optional | Manual MRZ line 1 fallback |
| `mrz_line2` | string | Optional | Manual MRZ line 2 fallback |
| `doc_type` | string | Optional | `PASSPORT` (default), `VISA`, `NATIONAL_ID` |
| `checkpoint` | string | Optional | Current checkpoint location name |
| `operator_id` | string | Optional | Badge ID of inspecting officer (default: `OFFICER-SSB-449`) |
| `face_threshold` | float | Optional | Face match threshold (default: `75.0`) |

**Sample cURL Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/screenings" \
  -F "doc_file=@passport_sample.jpg" \
  -F "live_file=@webcam_presenter.jpg" \
  -F "doc_type=PASSPORT" \
  -F "face_threshold=75.0"
```

**Response `200 OK`:**
```json
{
  "session_id": "PAHCHAN-20260907-882A",
  "timestamp": "2026-09-07 01:30:00 IST",
  "operator_id": "OFFICER-SSB-449",
  "checkpoint": "Raxaul Land Border Checkpoint (Indo-Nepal)",
  "document_type": "PASSPORT",
  "document_sha256": "fa3843b01ba9518d27600d16954aaa5c724eb635a7dec5616e7421416755acdb",
  "fields": {
    "name": "RAHUL KUMAR",
    "docNumber": "Z4819203",
    "nationality": "IND",
    "dob": "1998-08-15",
    "expiryDate": "2030-08-15",
    "gender": "MALE",
    "mrzLine1": "P<INDKUMAR<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<",
    "mrzLine2": "Z4819203<0IND9808154M3008155<<<<<<<<<<<<<<00",
    "fieldConfidences": {
      "name": 0.982,
      "docNumber": 0.991,
      "nationality": 0.995,
      "dob": 0.988,
      "expiryDate": 0.994,
      "gender": 0.990
    }
  },
  "validation": {
    "isValid": true,
    "isExpired": false,
    "isDobValid": true,
    "isFormatValid": true,
    "mrzChecksumPass": true,
    "mrzDetails": {
      "docNumberValid": true,
      "dobValid": true,
      "expiryValid": true,
      "compositeValid": true,
      "calculatedChecksums": { "doc": 0, "dob": 4, "expiry": 5, "composite": 0 },
      "expectedChecksums": { "doc": 0, "dob": 4, "expiry": 5, "composite": 0 }
    },
    "issues": []
  },
  "tampering": {
    "photoIntegrityScore": 95,
    "textIntegrityScore": 98,
    "stampIntegrityScore": 96,
    "metadataIntegrityScore": 99,
    "photoReplaced": false,
    "textManipulated": false,
    "stampForged": false,
    "metadataAnomalous": false,
    "summaryNotes": ["Substrate fiber pattern continuous."],
    "elaVariance": 5.4,
    "regions": []
  },
  "faceVerification": {
    "match": true,
    "similarity": 92.4,
    "confidence": 0.96,
    "threshold": 75.0,
    "status": "MATCH",
    "liveDetected": true,
    "landmarksDetected": true,
    "notes": "Facial landmark geometry consistent."
  },
  "crossField": {
    "match": true,
    "mismatches": []
  },
  "totalRiskScore": 8,
  "riskLevel": "LOW",
  "decision": "CLEAR_ENTRY",
  "explainability": {
    "whatHappened": "Document successfully ingested and validated.",
    "whyIsItRisky": ["Document conforms to baseline security expectations."],
    "supportingEvidence": ["ELA variance 5.4 | MRZ 7-3-1 check digits match"],
    "officerRecommendation": "Clear passenger for standard entry."
  }
}
```

---

### 2.3 Synthetic Demo Scenarios

#### `GET /api/v1/screenings/scenarios`
Returns the 8 deterministic SIH competition scenarios for offline and live evaluation.

**Response `200 OK`:**
```json
[
  {
    "id": "case-1-genuine",
    "case_number": 1,
    "title": "Genuine Republic of India Passport",
    "tagline": "P-IND-991823 | Authentic Document Baseline",
    "category": "GENUINE",
    "expected_risk_level": "LOW",
    "expected_score_range": [0, 15],
    "description": "Baseline authentic Republic of India 36-page standard passport."
  },
  {
    "id": "case-2-photo-spliced",
    "case_number": 2,
    "title": "Photo Tampering & Boundary Cut Discontinuity",
    "tagline": "P-IND-441029 | Spliced Facial Substrate",
    "category": "PHOTO_TAMPER",
    "expected_risk_level": "CRITICAL",
    "expected_score_range": [70, 85],
    "description": "Passport portrait replaced via physical cut-and-paste."
  }
]
```

#### `GET /api/v1/screenings/scenarios/{scenario_id}`
Fetches full session payload, mock imagery, and forensic annotations for a specific scenario.

---

### 2.4 Immutable Audit Logging

#### `GET /api/v1/audit/logs`
Retrieves cryptographically indexed screening history from SQLite database.

**Query Parameters:**
- `limit` (integer, default: 50): Maximum number of log records.
- `offset` (integer, default: 0): Pagination offset.
- `decision` (string, optional): Filter by decision (`CLEAR_ENTRY`, `SECONDARY_INSPECTION`, `DETAIN_ALERT`).

**Response `200 OK`:**
```json
{
  "total": 1,
  "limit": 50,
  "offset": 0,
  "logs": [
    {
      "id": 1,
      "session_id": "PAHCHAN-20260907-882A",
      "timestamp": "2026-09-07T01:30:00",
      "operator_id": "OFFICER-SSB-449",
      "checkpoint": "Raxaul Land Border Checkpoint (Indo-Nepal)",
      "document_type": "PASSPORT",
      "document_sha256": "fa3843b01ba9518d27600d16954aaa5c724eb635a7dec5616e7421416755acdb",
      "passenger_name": "RAHUL KUMAR",
      "doc_number": "Z4819203",
      "total_risk_score": 8,
      "risk_level": "LOW",
      "decision": "CLEAR_ENTRY",
      "created_at": "2026-09-07T01:30:00"
    }
  ]
}
```

#### `POST /api/v1/audit/logs`
Registers a manual officer screening action or supervisory override into the immutable audit database.

---

### 2.5 Risk Engine Weights Calibration

#### `GET /api/v1/risk/weights`
Retrieves current risk engine factor weights.

**Response `200 OK`:**
```json
{
  "weights": {
    "face_mismatch": 40,
    "photo_tampering": 25,
    "expired_doc": 30,
    "dob_mismatch": 20,
    "stamp_anomaly": 20,
    "mrz_inconsistency": 20,
    "watchlist_hit": 50,
    "metadata_warning": 5
  },
  "is_default": true,
  "prototype_disclaimer": "Calibrated prototype configuration. Not an official government standard."
}
```

#### `PUT /api/v1/risk/weights`
Adjusts factor weights dynamically. Input values are clamped between 0 and 100.

---

## 3. Error Codes & Handling

| HTTP Status | Reason | Payload Format |
|---|---|---|
| `400 Bad Request` | Unsupported file format or malformed request | `{"detail": "Unsupported file format. Please upload JPEG, PNG, WEBP, or PDF."}` |
| `422 Unprocessable` | Missing mandatory form fields | Standard FastAPI validation error array |
| `500 Server Error` | Pipeline processing exception | `{"detail": "Internal pipeline processing failed: <sanitized error>"}` |
