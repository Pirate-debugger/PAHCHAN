"""
Unit & Integration Tests for Cryptographic Tamper-Evident Audit Trail (P1.5)
Verifies hash-chaining across audit log entries, cryptographic chain verification,
detection of tampered rows and broken chain links, and the /audit/verify endpoint.
"""

import pytest
from starlette.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.database import SessionLocal, init_database
from app.models.audit import AuditLogModel
from app.services.audit_service import record_audit_event, verify_audit_chain

client = TestClient(app)
VALID_KEY_HEADER = {"X-API-Key": settings.API_KEY}

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    init_database()

def test_audit_records_are_hash_chained():
    """Consecutive audit records form a cryptographic SHA-256 hash chain."""
    db = SessionLocal()
    try:
        # Create record 1
        rec1 = record_audit_event(
            db=db,
            session_id="CHAIN-TEST-001",
            action="SCREENING_COMPLETED",
            document_sha256="abc12345",
            operator_id="OFFICER_1",
            checkpoint="Raxaul",
            total_risk_score=15,
            risk_level="LOW",
            decision="CLEAR_ENTRY",
            event_details={"doc": "test1"}
        )
        assert rec1.record_hash != ""
        assert len(rec1.record_hash) == 64

        # Create record 2
        rec2 = record_audit_event(
            db=db,
            session_id="CHAIN-TEST-002",
            action="SECONDARY_INSPECTION_PASSED",
            document_sha256="def67890",
            operator_id="OFFICER_2",
            checkpoint="Raxaul",
            total_risk_score=45,
            risk_level="MEDIUM",
            decision="CLEAR_ENTRY",
            event_details={"doc": "test2"}
        )
        # Record 2's previous_hash MUST equal Record 1's record_hash
        assert rec2.previous_hash == rec1.record_hash
        assert rec2.record_hash != ""

        # Verify chain integrity
        status = verify_audit_chain(db)
        assert status["valid"] is True
        assert status["tampered"] is False
        assert status["total_records"] >= 2
    finally:
        db.close()

def test_audit_chain_detects_data_tampering():
    """Modifying a record's contents without updating the hash chain is detected."""
    db = SessionLocal()
    try:
        # Add a record to tamper with
        target = record_audit_event(
            db=db,
            session_id="CHAIN-TEST-TAMPER",
            action="ORIGINAL_ACTION",
            document_sha256="orig12345",
            operator_id="OFFICER_TAMPER",
            checkpoint="Raxaul",
            total_risk_score=10,
            risk_level="LOW",
            decision="CLEAR_ENTRY",
            event_details={"note": "clean"}
        )
        target_id = target.id

        # Tamper with the decision directly in the database
        db_target = db.query(AuditLogModel).filter(AuditLogModel.id == target_id).first()
        db_target.decision = "DETAIN_ALERT"  # Tampered field
        db.commit()

        # Verification must now fail with tampered: True
        status = verify_audit_chain(db)
        assert status["valid"] is False
        assert status["tampered"] is True
        assert status["tampered_id"] == target_id
        assert "tampering" in status["reason"].lower() or "mismatch" in status["reason"].lower()

        # Revert change to keep database clean
        db_target.decision = "CLEAR_ENTRY"
        db.commit()
    finally:
        db.close()

def test_audit_verify_api_endpoint():
    """GET /api/v1/audit/verify returns ledger verification status."""
    res = client.get("/api/v1/audit/verify")
    assert res.status_code == 200
    data = res.json()
    assert "valid" in data
    assert "tampered" in data
    assert "total_records" in data
    assert data["valid"] is True
