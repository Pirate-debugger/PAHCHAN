"""
Unit Tests for Digital Forensics & Tampering Engine (ELA, Sobel, EXIF)
"""

import io
from PIL import Image
import pytest
from app.services.forensics_service import generate_ela_analysis, inspect_image_metadata, run_comprehensive_forensics

def create_dummy_jpeg() -> bytes:
    img = Image.new("RGB", (200, 200), color=(240, 240, 240))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()

def test_ela_generation():
    dummy_bytes = create_dummy_jpeg()
    ela_res = generate_ela_analysis(dummy_bytes)
    
    assert "ela_base64" in ela_res
    assert ela_res["ela_base64"].startswith("data:image/jpeg;base64,")
    assert isinstance(ela_res["variance"], float)
    assert ela_res["status"] in ["NORMAL", "SUSPICIOUS"]

def test_metadata_inspection_clean():
    dummy_bytes = create_dummy_jpeg()
    meta_res = inspect_image_metadata(dummy_bytes)
    
    assert meta_res["metadata_anomalous"] is False
    assert meta_res["software_detected"] is None

def test_comprehensive_forensics_pipeline():
    dummy_bytes = create_dummy_jpeg()
    forensics = run_comprehensive_forensics(dummy_bytes)
    
    assert "photo_integrity_score" in forensics
    assert "text_integrity_score" in forensics
    assert "regions" in forensics
    assert isinstance(forensics["regions"], list)
    assert len(forensics["regions"]) >= 1
