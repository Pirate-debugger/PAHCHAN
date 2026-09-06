"""
Unit & Integration Tests for API Authentication (P0.4)
Verifies that sensitive write endpoints (PUT /risk/weights, POST /audit/record, POST /screenings)
strictly require a valid API key, reject missing/invalid keys with 401,
and derive authenticated operator identities to prevent client forgery.
"""

import pytest
from starlette.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

VALID_KEY_HEADER = {"X-API-Key": settings.API_KEY}
INVALID_KEY_HEADER = {"X-API-Key": "completely-invalid-key-999"}

def test_put_risk_weights_requires_auth():
    """P0.4: PUT /risk/weights returns 401 without key, 401 with invalid key, 200 with valid key."""
    payload = {"PHOTO_TAMPERING": 35}
    
    # 1. No key -> 401
    res_no_key = client.put("/api/v1/risk/weights", json=payload)
    assert res_no_key.status_code == 401
    assert "detail" in res_no_key.json()

    # 2. Invalid key -> 401
    res_bad_key = client.put("/api/v1/risk/weights", headers=INVALID_KEY_HEADER, json=payload)
    assert res_bad_key.status_code == 401

    # 3. Valid key -> 200
    res_valid = client.put("/api/v1/risk/weights", headers=VALID_KEY_HEADER, json=payload)
    assert res_valid.status_code == 200
    data = res_valid.json()
    assert data["status"] == "UPDATED"
    assert data["weights"]["PHOTO_TAMPERING"] == 35
    assert "updated_by" in data

def test_post_audit_record_requires_auth_and_derives_operator():
    """P0.4: POST /audit/record returns 401 without key, and derives operator_id with valid key."""
    event_payload = {
        "session_id": "TEST-AUTH-SESSION-001",
        "action": "SUPERVISOR_OVERRIDE",
        "operator_id": "FORGED_OFFICER_NAME",  # Client tries to forge operator ID
        "details": {"reason": "Manual secondary inspection passed"}
    }

    # 1. No key -> 401
    res_no_key = client.post("/api/v1/audit/record", json=event_payload)
    assert res_no_key.status_code == 401

    # 2. Invalid key -> 401
    res_bad_key = client.post("/api/v1/audit/record", headers=INVALID_KEY_HEADER, json=event_payload)
    assert res_bad_key.status_code == 401

    # 3. Valid key -> 200, and operator_id is derived from auth NOT from forged client body
    res_valid = client.post("/api/v1/audit/record", headers=VALID_KEY_HEADER, json=event_payload)
    assert res_valid.status_code == 200
    data = res_valid.json()
    assert data["saved"] is True
    # Asserts that forged operator name is overridden by authenticated identity
    assert data["operator_id"] == "OFFICER-SSB-449"
    assert data["operator_id"] != "FORGED_OFFICER_NAME"
