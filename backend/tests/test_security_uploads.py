import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_empty_upload_rejected():
    # Empty byte file
    response = client.post(
        "/api/screenings",
        files={"document_file": ("empty.jpg", b"", "image/jpeg")},
        data={"document_type": "PASSPORT"}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()

def test_unsupported_extension_rejected():
    # .exe or .sh extension
    response = client.post(
        "/api/screenings",
        files={"document_file": ("malicious.exe", b"\xFF\xD8\xFFdummy", "application/x-msdownload")},
        data={"document_type": "PASSPORT"}
    )
    assert response.status_code == 400
    assert "unsupported file extension" in response.json()["detail"].lower()

def test_corrupted_magic_bytes_rejected():
    # .jpg extension but text content (not JPEG magic header)
    response = client.post(
        "/api/screenings",
        files={"document_file": ("fake.jpg", b"PLAIN TEXT CONTENT NOT AN IMAGE", "image/jpeg")},
        data={"document_type": "PASSPORT"}
    )
    assert response.status_code == 400
    assert "invalid file signature" in response.json()["detail"].lower() or "corrupted" in response.json()["detail"].lower()

def test_oversized_upload_rejected():
    # 16 MB dummy payload
    oversized_bytes = b"\xFF\xD8\xFF" + b"0" * (16 * 1024 * 1024)
    response = client.post(
        "/api/screenings",
        files={"document_file": ("large.jpg", oversized_bytes, "image/jpeg")},
        data={"document_type": "PASSPORT"}
    )
    assert response.status_code == 413
    assert "maximum" in response.json()["detail"].lower()

def test_valid_image_upload_accepted():
    # Minimal 1x1 valid PNG image
    # Valid PNG signature + IHDR chunk
    png_bytes = (
        b"\x89PNG\r\n\x1a\n"
        b"\x00\x00\x00\rIHDR"
        b"\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
        b"\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4"
        b"\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    response = client.post(
        "/api/screenings",
        files={"document_file": ("valid.png", png_bytes, "image/png")},
        data={"document_type": "PAN"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["status"] == "PENDING"
    assert data["document_type"] == "PAN"
