# PAHCHAN — Database Architecture & Schema Specification
**Smart India Hackathon 2026 — Problem Statement SIH2026188: AI-Based Fake Identity & Document Screening System**  
**Database:** SQLite3 / SQLAlchemy 2.0+ | **Target DB File:** `backend/app/pahchan_audit.db`

---

## 1. Design Principles & Storage Philosophy

The PAHCHAN database is architected for:
1. **Zero-Configuration Portability:** Runs self-contained on edge border posts without requiring an external PostgreSQL or MySQL server cluster.
2. **Concurrency & Resilience (WAL Mode):** Operates under Write-Ahead Logging (`WAL`), allowing concurrent non-blocking reads while active screenings write audit logs.
3. **Cryptographic Traceability:** Every stored screening session includes the SHA-256 hash of the ingested document and the inspecting officer's badge ID.
4. **Data Integrity:** Strict schema typing, foreign key enforcement, and UTC ISO-8601 timestamp indexing.

---

## 2. SQLite Pragma Configuration

On application initialization (`app/database.py`), the following pragma directives are executed:
```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;
PRAGMA cache_size = -64000; -- 64MB memory cache
```

---

## 3. Entity Relationship & Schema Definition

```
+------------------------------------+        +------------------------------------+
|        screening_sessions          |        |             audit_logs             |
+------------------------------------+        +------------------------------------+
| PK  session_id     VARCHAR(64)     |<-------| FK  session_id     VARCHAR(64)     |
|     timestamp      VARCHAR(32)     |   1:N  | PK  id             INTEGER AUTOINC |
|     operator_id    VARCHAR(64)     |        |     event_type     VARCHAR(64)     |
|     checkpoint     VARCHAR(128)    |        |     operator_id    VARCHAR(64)     |
|     document_type  VARCHAR(32)     |        |     details        TEXT            |
|     document_sha256 VARCHAR(64)    |        |     timestamp      VARCHAR(32)     |
|     passenger_name VARCHAR(128)    |        |     created_at     DATETIME        |
|     doc_number     VARCHAR(32)     |        +------------------------------------+
|     nationality    VARCHAR(8)      |
|     dob            VARCHAR(16)     |
|     expiry_date    VARCHAR(16)     |
|     total_risk_score INTEGER       |
|     risk_level     VARCHAR(16)     |
|     decision       VARCHAR(32)     |
|     payload_json   TEXT            |
|     created_at     DATETIME        |
+------------------------------------+
```

---

## 4. Table DDL Specifications

### 4.1 Table: `screening_sessions`
Stores completed identity screening records, extracted document fields, calculated risk scores, and full session JSON.

```sql
CREATE TABLE IF NOT EXISTS screening_sessions (
    session_id VARCHAR(64) PRIMARY KEY,
    timestamp VARCHAR(32) NOT NULL,
    operator_id VARCHAR(64) NOT NULL,
    checkpoint VARCHAR(128) NOT NULL,
    document_type VARCHAR(32) NOT NULL,
    document_sha256 VARCHAR(64) NOT NULL,
    passenger_name VARCHAR(128) NOT NULL,
    doc_number VARCHAR(32) NOT NULL,
    nationality VARCHAR(8) NOT NULL,
    dob VARCHAR(16) NOT NULL,
    expiry_date VARCHAR(16) NOT NULL,
    total_risk_score INTEGER NOT NULL,
    risk_level VARCHAR(16) NOT NULL,
    decision VARCHAR(32) NOT NULL,
    payload_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_doc_number ON screening_sessions(doc_number);
CREATE INDEX IF NOT EXISTS idx_sessions_sha256 ON screening_sessions(document_sha256);
CREATE INDEX IF NOT EXISTS idx_sessions_risk_level ON screening_sessions(risk_level);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON screening_sessions(created_at);
```

### 4.2 Table: `audit_logs`
Stores immutable events, supervisor overrides, manual decision modifications, and system configuration updates.

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(64),
    event_type VARCHAR(64) NOT NULL,
    operator_id VARCHAR(64) NOT NULL,
    details TEXT NOT NULL,
    timestamp VARCHAR(32) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES screening_sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_audit_session_id ON audit_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_event_type ON audit_logs(event_type);
```

---

## 5. Security & Data Retention Policies

1. **Tamper-Evident Immutability:** Records in `screening_sessions` cannot be updated without creating a corresponding entry in `audit_logs`.
2. **Data Minimization:** No raw passwords, biometric vectors, or biometric templates are stored in plain text.
3. **Backup & Replication:** The database can be safely snapshotted using SQLite's online backup API (`sqlite3.Connection.backup`) or automated filesystem snapshots without interrupting ongoing border checkpoints.
