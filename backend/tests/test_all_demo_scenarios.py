import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_all_ten_demo_scenarios():
    response = client.get("/api/demo/scenarios")
    assert response.status_code == 200
    scenarios = response.json()
    assert len(scenarios) == 10, f"Expected 10 demo scenarios, found {len(scenarios)}"
    scenario_ids = {s["id"] for s in scenarios}
    expected_ids = {
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
    }
    assert expected_ids.issubset(scenario_ids)

@pytest.mark.parametrize("scenario_id", [
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
])
def test_execute_demo_scenario(scenario_id):
    response = client.post(f"/api/demo/scenarios/{scenario_id}/load")
    assert response.status_code == 200
    data = response.json()
    assert data["is_demo_scenario"] is True
    assert data["demo_scenario_id"] == scenario_id
    assert "risk_assessment" in data
    assert data["risk_assessment"] is not None

    risk = data["risk_assessment"]
    score = risk["total_score"]
    level = risk["risk_level"]

    # Scenario-specific invariants:
    if scenario_id == "scenario_1_genuine":
        assert level == "LOW"
        assert score <= 10
    elif scenario_id == "scenario_2_altered_photo":
        assert level in ("HIGH", "CRITICAL")
        assert score >= 40
        assert any(f["category"] == "PHOTO_ALTERATION" for f in data["forensic_findings"])
    elif scenario_id == "scenario_3_modified_dob":
        assert level in ("HIGH", "CRITICAL")
        assert score >= 40
    elif scenario_id == "scenario_4_face_mismatch":
        assert level in ("HIGH", "CRITICAL")
        assert data["face_verification"]["outcome"] in ("MISMATCH_SIGNAL", "REVIEW")
    elif scenario_id == "scenario_5_expired_document":
        assert level == "REVIEW"
        # Expired documents must not receive arbitrary 40 fraud points
        assert score == 15
        assert any(v["category"] == "EXPIRY" and v["status"] == "WARNING" for v in data["validations"])
    elif scenario_id == "scenario_6_passport_visa_mismatch":
        assert level in ("REVIEW", "HIGH")
        assert any(v["rule_id"] == "VAL_VISA_CROSS_MATCH" and v["status"] == "FAIL" for v in data["validations"])
    elif scenario_id == "scenario_7_stamp_anomaly":
        assert level in ("REVIEW", "HIGH")
        assert any(f["category"] == "STAMP_FORGERY" for f in data["forensic_findings"])
    elif scenario_id == "scenario_8_multi_identity":
        assert level in ("HIGH", "CRITICAL")
    elif scenario_id == "scenario_9_fabricated_document":
        assert level in ("HIGH", "CRITICAL")
        assert score >= 70
    elif scenario_id == "scenario_10_external_unverifiable":
        # External gateway outage must be non-punitive: 0 gateway fraud points
        ext_verifs = data.get("external_verifications", [])
        assert len(ext_verifs) > 0
        gateway_verif = ext_verifs[0]
        assert gateway_verif["status"] in ("SERVICE_UNAVAILABLE", "UNVERIFIABLE", "NOT_CONFIGURED")
        # Check that no gateway failure added fake risk points
        assert not any(v["category"] == "GATEWAY" and v["status"] == "FAIL" and v["risk_points"] > 0 for v in data["validations"])
