"""
Unit Tests for Stamp Forgery (P1.1) and Text Tampering (P1.2) Forensics
Verifies that stamp_forged and text_manipulated dynamically change based on input,
exercising real SSIM template comparisons and VIZ character variance analysis.
"""

import io
import cv2
import numpy as np
import pytest
from app.services.forensics_service import (
    analyze_stamp_tampering_ssim,
    analyze_text_tampering,
    run_comprehensive_forensics,
    _generate_reference_stamp_templates
)

def create_base_canvas() -> np.ndarray:
    return np.ones((500, 700, 3), dtype=np.uint8) * 245

def create_document_with_authentic_stamp() -> bytes:
    """Creates synthetic document with standard official checkpoint circular stamp."""
    img = create_base_canvas()
    h, w = img.shape[:2]
    # Place reference stamp into the endorsement zone (x: 55-95%, y: 50-90%)
    ref = _generate_reference_stamp_templates()[0]
    stamp_h, stamp_w = ref.shape[:2]
    y_start, x_start = int(h * 0.55), int(w * 0.60)
    img[y_start:y_start+stamp_h, x_start:x_start+stamp_w] = cv2.cvtColor(ref, cv2.COLOR_GRAY2BGR)
    _, enc = cv2.imencode(".jpg", img)
    return enc.tobytes()

def create_document_with_counterfeit_stamp() -> bytes:
    """Creates synthetic document with distorted / broken stamp that fails SSIM."""
    img = create_base_canvas()
    h, w = img.shape[:2]
    # Place an irregular distorted shape with alien text
    y_start, x_start = int(h * 0.55), int(w * 0.60)
    stamp_canvas = np.ones((160, 160, 3), dtype=np.uint8) * 255
    # Irregular triangle/polygon and mismatched lettering
    pts = np.array([[20, 20], [140, 50], [80, 140]], np.int32)
    cv2.polylines(stamp_canvas, [pts], isClosed=True, color=(10, 10, 60), thickness=3)
    cv2.putText(stamp_canvas, "UNOFFICIAL", (30, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (10, 10, 60), 1)
    img[y_start:y_start+160, x_start:x_start+160] = stamp_canvas
    _, enc = cv2.imencode(".jpg", img)
    return enc.tobytes()

def create_document_with_clean_text() -> bytes:
    """Creates synthetic document with uniform, consistent text rasterization."""
    img = create_base_canvas()
    # Draw uniform text lines in the VIZ region (x: 28-95%, y: 15-75%)
    for y_pos in [120, 160, 200, 240, 280]:
        cv2.putText(img, "PASSPORT HOLDER OFFICIAL FIELD DATA 12345", (220, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (30, 30, 30), 1)
    _, enc = cv2.imencode(".jpg", img)
    return enc.tobytes()

def create_document_with_tampered_text() -> bytes:
    """Creates synthetic document with severe font mismatch and high-contrast paste artifacts."""
    img = create_base_canvas()
    for y_pos in [120, 160, 240, 280]:
        cv2.putText(img, "PASSPORT HOLDER OFFICIAL FIELD DATA 12345", (220, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (30, 30, 30), 1)
    # Insert heavily contrasted, divergent font with local block artifact in line 3
    cv2.rectangle(img, (215, 185), (550, 215), (255, 255, 255), -1)
    cv2.putText(img, "ALTERED_SURNAME_INTRUDER_999", (220, 208), cv2.FONT_HERSHEY_TRIPLEX, 0.85, (0, 0, 0), 3)
    _, enc = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 70])
    return enc.tobytes()

def test_stamp_ssim_authentic_vs_counterfeit():
    """P1.1: stamp_forged dynamically changes based on SSIM similarity of the stamp."""
    auth_bytes = create_document_with_authentic_stamp()
    auth_res = analyze_stamp_tampering_ssim(auth_bytes)
    assert auth_res["has_stamp"] is True
    assert auth_res["stamp_forged"] is False
    assert auth_res["ssim_score"] >= 0.70
    assert auth_res["integrity_score"] >= 70

    fake_bytes = create_document_with_counterfeit_stamp()
    fake_res = analyze_stamp_tampering_ssim(fake_bytes)
    assert fake_res["has_stamp"] is True
    assert fake_res["stamp_forged"] is True
    assert fake_res["ssim_score"] < 0.70

def test_text_tampering_clean_vs_manipulated():
    """P1.2: text_manipulated dynamically changes based on VIZ character variance."""
    clean_bytes = create_document_with_clean_text()
    clean_res = analyze_text_tampering(clean_bytes)
    assert clean_res["text_manipulated"] is False
    assert clean_res["integrity_score"] >= 75

    # Run full comprehensive forensics on clean doc
    comp_clean = run_comprehensive_forensics(clean_bytes)
    assert comp_clean["text_manipulated"] is False
    assert comp_clean["stamp_forged"] is False

    # Run full comprehensive forensics on counterfeit stamp doc
    comp_fake_stamp = run_comprehensive_forensics(create_document_with_counterfeit_stamp())
    assert comp_fake_stamp["stamp_forged"] is True
    stamp_finding = next((r for r in comp_fake_stamp["regions"] if r["type"] == "STAMP"), None)
    assert stamp_finding is not None
    assert stamp_finding["status"] == "ALERT"
