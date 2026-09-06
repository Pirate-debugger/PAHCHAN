"""
Negative & Security Integration Tests (P2.1, P2.3, P2.4)
Covers:
1. Oversized file upload rejection (HTTP 413)
2. Malformed and short MRZ strings handling
3. Unauthenticated write endpoint rejection (HTTP 401)
4. Dynamic stamp_forged and text_manipulated input sensitivity tests
5. Decompression-bomb protection (HTTP 413)
"""

import io
import pytest
import numpy as np
import cv2
from PIL import Image
from starlette.testclient import TestClient

from app.main import app
from app.core.config import settings
from app.services.validation_service import parse_and_validate_mrz, parse_and_validate_td3
from app.services.forensics_service import analyze_stamp_tampering_ssim, analyze_text_tampering
from app.tests.test_stamp_and_text_forensics import (
    create_document_with_authentic_stamp,
    create_document_with_counterfeit_stamp,
    create_document_with_clean_text,
    create_document_with_tampered_text
)

client = TestClient(app)
VALID_KEY_HEADER = {"X-API-Key": settings.API_KEY}

def test_oversized_file_upload_rejected():
    """P2.1: Uploads exceeding MAX_UPLOAD_SIZE_BYTES are rejected with HTTP 413."""
    # Create mock buffer exceeding 15MB ceiling
    oversized_bytes = b"X" * (settings.MAX_UPLOAD_SIZE_BYTES + 1024)
    res = client.post(
        "/api/v1/screenings",
        headers=VALID_KEY_HEADER,
        files={"doc_file": ("huge_passport.jpg", oversized_bytes, "image/jpeg")}
    )
    assert res.status_code == 413
    assert "exceeds maximum allowed size" in res.json()["detail"].lower()

def test_unsupported_file_format_rejected():
    """P2.1: Uploads with unsupported file formats/magic headers rejected with HTTP 415."""
    fake_executable = b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00"
    res = client.post(
        "/api/v1/screenings",
        headers=VALID_KEY_HEADER,
        files={"doc_file": ("exploit.exe", fake_executable, "application/x-dosexec")}
    )
    assert res.status_code == 415
    assert "unsupported file format" in res.json()["detail"].lower()

def test_unauthenticated_write_endpoints_rejected():
    """P0.4 & P2.1: All sensitive write endpoints strictly reject missing or invalid API keys with 401."""
    # 1. POST /screenings
    doc_buf = io.BytesIO(b"\xff\xd8\xff\xe0" + b"\x00" * 100)
    res_scr = client.post("/api/v1/screenings", files={"doc_file": ("test.jpg", doc_buf, "image/jpeg")})
    assert res_scr.status_code == 401

    # 2. PUT /risk/weights
    res_rsk = client.put("/api/v1/risk/weights", json={"PHOTO_TAMPERING": 50})
    assert res_rsk.status_code == 401

    # 3. POST /audit/record
    res_aud = client.post("/api/v1/audit/record", json={"action": "OVERRIDE"})
    assert res_aud.status_code == 401

    # 4. POST /watchlist
    res_wat = client.post("/api/v1/watchlist", json={"full_name": "SUSPECT", "doc_number": "W999"})
    assert res_wat.status_code == 401

def test_malformed_and_short_mrz_handled_gracefully():
    """P2.1: Truncated, malformed, and nonsense MRZ strings fail validation without server exception."""
    # Short single line
    res_short = parse_and_validate_mrz(["P<IND"])
    assert res_short["is_valid"] is False
    assert res_short["mrz_checksum_pass"] is False

    # Corrupted characters in check digit positions
    l1 = "P<INDKUMAR<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<"
    l2 = "Z4819203<?IND0008154M3008155<<<<<<<<<<<<<<00"
    res_corrupt = parse_and_validate_td3(l1, l2)
    assert res_corrupt["mrz_checksum_pass"] is False
    assert res_corrupt["mrz_details"]["doc_number_valid"] is False
    assert any("Checksum Mismatch" in issue for issue in res_corrupt["issues"])

def test_forensics_stamp_and_text_dynamically_change_on_input():
    """
    P2.1: Regression test guaranteeing stamp_forged and text_manipulated are NOT hardcoded constants.
    Authentic and counterfeit stamps produce opposing boolean results.
    Clean and tampered text produce opposing boolean results.
    """
    auth_stamp_bytes = create_document_with_authentic_stamp()
    fake_stamp_bytes = create_document_with_counterfeit_stamp()

    auth_stamp_res = analyze_stamp_tampering_ssim(auth_stamp_bytes)
    fake_stamp_res = analyze_stamp_tampering_ssim(fake_stamp_bytes)

    # Must change based on input!
    assert auth_stamp_res["stamp_forged"] != fake_stamp_res["stamp_forged"]
    assert auth_stamp_res["stamp_forged"] is False
    assert fake_stamp_res["stamp_forged"] is True

    clean_text_bytes = create_document_with_clean_text()
    tampered_text_bytes = create_document_with_tampered_text()

    clean_text_res = analyze_text_tampering(clean_text_bytes)
    tampered_text_res = analyze_text_tampering(tampered_text_bytes)

    # Must change based on input!
    assert clean_text_res["text_manipulated"] != tampered_text_res["text_manipulated"]
    assert clean_text_res["text_manipulated"] is False
    assert tampered_text_res["text_manipulated"] is True

def test_decompression_bomb_protection():
    """P2.3: Decompression bomb image exceeding 25M pixels is caught and rejected gracefully with 413."""
    from app.core.security import validate_upload_file
    from fastapi import UploadFile

    # Create a minimal JPEG header that declares 6000 x 5000 = 30,000,000 pixels (>25M)
    # Using PIL to generate an in-memory image with dimensions > Image.MAX_IMAGE_PIXELS
    bomb_img = Image.new("RGB", (6000, 5000), color=(255, 255, 255))
    bomb_buf = io.BytesIO()
    bomb_img.save(bomb_buf, format="JPEG")
    bomb_bytes = bomb_buf.getvalue()

    upload_file = UploadFile(
        file=io.BytesIO(bomb_bytes),
        filename="decompression_bomb.jpg",
        headers={"content-type": "image/jpeg"}
    )

    import asyncio
    from fastapi import HTTPException

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(validate_upload_file(upload_file))

    assert exc_info.value.status_code == 413
    assert "exceed maximum allowed pixels" in exc_info.value.detail.lower()
