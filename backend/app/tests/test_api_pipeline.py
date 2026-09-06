"""
Integration Tests for FastAPI Endpoints using Starlette TestClient
"""

import io
from PIL import Image
import pytest
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)

def create_test_image() -> io.BytesIO:
    img = Image.new("RGB", (300, 200), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf

def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"
    assert data["system"] == "PAHCHAN"

def test_demo_scenarios_endpoint():
    response = client.get("/api/v1/demo/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 8
    assert len(data["scenarios"]) == 8

def test_risk_weights_endpoints():
    response = client.get("/api/v1/risk/weights")
    assert response.status_code == 200
    data = response.json()
    assert "weights" in data
    assert "thresholds" in data

def test_full_screening_pipeline_endpoint():
    doc_buf = create_test_image()
    response = client.post(
        "/api/v1/screenings",
        files={"doc_file": ("test_passport.jpg", doc_buf, "image/jpeg")},
        data={
            "mrz_line1": "P<INDKUMAR<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<",
            "mrz_line2": "Z4819203<0IND0008154M3008155<<<<<<<<<<<<<<00",
            "doc_type": "PASSPORT"
        }
    )
    assert response.status_code == 200
    res_data = response.json()
    assert "session_id" in res_data
    assert res_data["session_id"].startswith("PAHCHAN-")
    assert "validation" in res_data
    assert "forensics" in res_data
    assert "risk" in res_data
    assert res_data["risk"]["decision"] == "CLEAR_ENTRY"
    assert res_data["validation"]["mrz_checksum_pass"] is True
