import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["system"] == "PAHCHAN"
    assert data["sih_problem_id"] == "SIH2026188"

def test_list_demo_scenarios():
    response = client.get("/api/demo/scenarios")
    assert response.status_code == 200
    scenarios = response.json()
    assert len(scenarios) == 8
    ids = [s["id"] for s in scenarios]
    assert "scenario_1_genuine" in ids
    assert "scenario_2_altered_photo" in ids
    assert "scenario_4_face_mismatch" in ids

def test_load_genuine_scenario_e2e():
    response = client.post("/api/demo/scenarios/scenario_1_genuine/load")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["IN_REVIEW", "COMPLETED"]
    assert len(data["extracted_fields"]) >= 4
    assert data["risk_assessment"] is not None
    assert data["risk_assessment"]["risk_level"] == "LOW"

def test_load_altered_photo_scenario_e2e():
    response = client.post("/api/demo/scenarios/scenario_2_altered_photo/load")
    assert response.status_code == 200
    data = response.json()
    assert data["risk_assessment"]["total_score"] >= 30
    assert any(f["category"] == "PHOTO_ALTERATION" for f in data["forensic_findings"])

def test_record_decision_and_get_report():
    # 1. Load a scenario
    load_resp = client.post("/api/demo/scenarios/scenario_1_genuine/load")
    session_id = load_resp.json()["id"]

    # 2. Record decision
    dec_resp = client.post(f"/api/screenings/{session_id}/decision", json={
        "decision": "STANDARD_REVIEW",
        "officer_name": "S. Sharma (Inspector/GD)",
        "notes": "Verified genuine features and valid MRZ."
    })
    assert dec_resp.status_code == 200
    assert dec_resp.json()["status"] == "SUCCESS"

    # 3. Retrieve report
    rep_resp = client.get(f"/api/reports/{session_id}")
    assert rep_resp.status_code == 200
    rep_data = rep_resp.json()
    assert rep_data["case_id"] == session_id
    assert rep_data["officer_decision"]["decision"] == "STANDARD_REVIEW"
    assert "security_seal" in rep_data
    assert "SHA256:" in rep_data["security_seal"]["audit_hash"]
