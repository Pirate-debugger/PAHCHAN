import os
import io
import pytest
from datetime import datetime, date
from fastapi.testclient import TestClient
from app.main import app
from app.services.risk_service import risk_service
from app.services.validation_service import validation_service
from app.services.providers.pan_provider import pan_provider
from app.services.providers.digilocker_provider import digilocker_provider

client = TestClient(app)

def test_dob_plausibility_validation():
    """Verify VAL_DOB_PLAUSIBILITY catches future dates and impossible ages."""
    # Future birth date
    res_future = validation_service.validate_document({"date_of_birth": "2099-01-01"}, {})
    dob_val_future = next((r for r in res_future if r["rule_id"] == "VAL_DOB_PLAUSIBILITY"), None)
    assert dob_val_future is not None
    assert dob_val_future["status"] == "FAIL"
    assert dob_val_future["risk_points"] == 40
    assert "future" in dob_val_future["message"].lower()

    # Implausible age (> 130 years)
    res_old = validation_service.validate_document({"date_of_birth": "1880-05-10"}, {})
    dob_val_old = next((r for r in res_old if r["rule_id"] == "VAL_DOB_PLAUSIBILITY"), None)
    assert dob_val_old is not None
    assert dob_val_old["status"] == "FAIL"
    assert "implausible" in dob_val_old["message"].lower()

    # Plausible valid date
    res_valid = validation_service.validate_document({"date_of_birth": "1995-04-12"}, {})
    dob_val_valid = next((r for r in res_valid if r["rule_id"] == "VAL_DOB_PLAUSIBILITY"), None)
    assert dob_val_valid is not None
    assert dob_val_valid["status"] == "PASS"
    assert dob_val_valid["risk_points"] == 0

def test_factor_deduplication_in_risk_service():
    """Verify that duplicate findings or validations do not artificially inflate risk score."""
    finding1 = {
        "id": "f1",
        "category": "PHOTO_ALTERATION",
        "title": "Spliced Photo Edge",
        "explanation": "First detection",
        "severity": "HIGH",
        "risk_contribution": 35
    }
    finding2 = {
        "id": "f2",
        "category": "PHOTO_ALTERATION",
        "title": "Spliced Photo Edge",
        "explanation": "Duplicate detection of identical factor",
        "severity": "HIGH",
        "risk_contribution": 35
    }
    
    assessment = risk_service.calculate_risk(
        validations=[],
        forensics=[finding1, finding2],
        face_result=None,
        identity_result=None
    )
    
    # Spliced Photo Edge should only be counted once (35 pts), not twice (70 pts)
    matching_factors = [f for f in assessment["contributing_factors"] if f["title"] == "Spliced Photo Edge"]
    assert len(matching_factors) == 1
    assert assessment["total_score"] == 35

def test_provider_outage_zero_risk_points():
    """Verify that external provider network outage or unconfigured state adds ZERO risk points."""
    # Test pan_provider fallback when PAN is syntactically valid (Individual 'P' + surname initial 'S') but provider unconfigured
    res = pan_provider.verify_document("PAN", "ABCPS1234F", {"full_name": "RAHUL SHARMA"})
    assert res.status == "UNVERIFIABLE"
    assert "NOT A LIVE GOVERNMENT VERIFICATION" in res.evidence_notes

    # Test that GATEWAY warnings contribute 0 risk points in risk_service
    gateway_warning = {
        "rule_id": "VAL_GATEWAY_OUTAGE",
        "rule_name": "PAN Registry Gateway Timeout",
        "category": "GATEWAY",
        "status": "WARNING",
        "message": "Gateway network unreachable (temporary outage)",
        "risk_points": 25
    }
    assessment = risk_service.calculate_risk(
        validations=[gateway_warning],
        forensics=[],
        face_result=None,
        identity_result=None
    )
    assert assessment["total_score"] == 0

def test_delete_screening_session():
    """Verify DELETE /api/screenings/{session_id} successfully deletes and returns 404 subsequently."""
    # 1. Load a demo scenario to create a session
    load_resp = client.post("/api/demo/scenarios/scenario_1_genuine/load")
    assert load_resp.status_code == 200
    session_id = load_resp.json()["id"]

    # 2. Confirm it exists
    get_resp = client.get(f"/api/screenings/{session_id}")
    assert get_resp.status_code == 200

    # 3. Delete it
    del_resp = client.delete(f"/api/screenings/{session_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["status"] == "SUCCESS"

    # 4. Confirm it returns 404
    post_del_resp = client.get(f"/api/screenings/{session_id}")
    assert post_del_resp.status_code == 404

def test_retry_failed_analysis():
    """Verify /api/screenings/{session_id}/retry and retry-analysis endpoint functionality."""
    # 1. Load a demo session
    load_resp = client.post("/api/demo/scenarios/scenario_1_genuine/load")
    assert load_resp.status_code == 200
    session_id = load_resp.json()["id"]

    # 2. Call retry endpoint
    retry_resp = client.post(f"/api/screenings/{session_id}/retry")
    assert retry_resp.status_code == 200
    data = retry_resp.json()
    assert data["id"] == session_id
    assert data["status"] in ["IN_REVIEW", "COMPLETED"]

    # 3. Also verify retry-analysis alias
    retry_alias_resp = client.post(f"/api/screenings/{session_id}/retry-analysis")
    assert retry_alias_resp.status_code == 200

def test_all_10_demo_scenarios_execute():
    """Verify that all 10 scenarios can be loaded, analyzed, and produce valid risk outcomes."""
    scenario_ids = [
        "scenario_1_genuine",
        "scenario_2_altered_photo",
        "scenario_3_modified_dob",
        "scenario_4_face_mismatch",
        "scenario_5_expired_document",
        "scenario_6_passport_visa_mismatch",
        "scenario_7_stamp_anomaly",
        "scenario_8_multi_identity",
        "scenario_9_fabricated_document",
        "scenario_10_external_unverifiable",
    ]

    for sc_id in scenario_ids:
        resp = client.post(f"/api/demo/scenarios/{sc_id}/load")
        assert resp.status_code == 200, f"Failed to load {sc_id}: {resp.text}"
        data = resp.json()
        assert data["risk_assessment"] is not None, f"Missing risk assessment for {sc_id}"
        risk_lvl = data["risk_assessment"]["risk_level"]
        score = data["risk_assessment"]["total_score"]
        assert risk_lvl in ["LOW", "REVIEW", "HIGH", "CRITICAL"]
        if sc_id in ["scenario_1_genuine", "scenario_10_external_unverifiable"]:
            assert risk_lvl == "LOW", f"{sc_id} expected LOW risk, got {risk_lvl} ({score} pts)"
        elif sc_id in ["scenario_9_fabricated_document"]:
            assert risk_lvl in ["HIGH", "CRITICAL"], f"{sc_id} expected elevated risk, got {risk_lvl} ({score} pts)"
        elif sc_id == "scenario_8_multi_identity":
            assert score >= 40, f"Scenario 8 expected significant multi-identity risk, got {score} pts"

def test_report_includes_primary_document_hash():
    """Verify that generated official report contains SHA-256 primary document hash."""
    load_resp = client.post("/api/demo/scenarios/scenario_1_genuine/load")
    assert load_resp.status_code == 200
    session_id = load_resp.json()["id"]

    rep_resp = client.get(f"/api/reports/{session_id}")
    assert rep_resp.status_code == 200
    report_data = rep_resp.json()
    assert "primary_document_hash" in report_data
    if report_data["primary_document_hash"]:
        assert report_data["primary_document_hash"].startswith("SHA256:")
