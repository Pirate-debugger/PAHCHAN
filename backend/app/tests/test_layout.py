"""
Unit & Integration Tests for Document Layout Generalization & Orientation (P1.6)
Verifies aspect ratio / orientation detection, layout-specific coordinate sets,
and explicit layout_unrecognized flagging for anomalous/unrecognized dimensions.
"""

import pytest
import io
import numpy as np
import cv2
from PIL import Image
from app.services.forensics_service import detect_document_layout, run_comprehensive_forensics
from app.services.ocr_service import extract_fields_from_document

def create_image_with_aspect_ratio(width: int, height: int) -> bytes:
    """Helper creating a test image with given width and height."""
    img = np.ones((height, width, 3), dtype=np.uint8) * 230
    # Add subtle pattern
    cv2.putText(img, "PASSPORT TEST", (int(width * 0.2), int(height * 0.4)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (50, 50, 50), 2)
    _, buf = cv2.imencode(".jpg", img)
    return buf.tobytes()

def test_landscape_passport_layout_detected():
    """Standard horizontal passport bio-page (aspect ratio ~1.4) identified properly."""
    img_bytes = create_image_with_aspect_ratio(700, 500)  # aspect ratio 1.40
    layout = detect_document_layout(img_bytes)
    assert layout["layout_unrecognized"] is False
    assert layout["layout_type"] == "PASSPORT_TD3_LANDSCAPE"
    assert layout["orientation"] == "LANDSCAPE"
    assert layout["portrait_box"] is not None
    assert layout["mrz_box"] is not None

def test_portrait_orientation_layout_detected():
    """Vertical scan (aspect ratio ~0.71) branches to portrait layout coordinates."""
    img_bytes = create_image_with_aspect_ratio(500, 700)  # aspect ratio 0.71
    layout = detect_document_layout(img_bytes)
    assert layout["layout_unrecognized"] is False
    assert layout["layout_type"] == "PASSPORT_PORTRAIT_ORIENTATION"
    assert layout["orientation"] == "PORTRAIT"
    # Portrait coordinates differ from landscape coordinates
    assert layout["portrait_box"][1] < 0.20  # y coordinate higher up in portrait scan

def test_anomalous_extreme_aspect_ratio_flags_unrecognized():
    """Extreme aspect ratio image (e.g. panoramic banner 1000x200) explicitly flags layout_unrecognized."""
    img_bytes = create_image_with_aspect_ratio(1000, 200)  # aspect ratio 5.0
    layout = detect_document_layout(img_bytes)
    assert layout["layout_unrecognized"] is True
    assert layout["layout_type"] == "ANOMALOUS_ASPECT_RATIO"
    assert layout["portrait_box"] is None

def test_forensics_and_ocr_surface_layout_flag():
    """Forensics and OCR services surface layout_unrecognized flag."""
    # 1. Normal image
    normal_bytes = create_image_with_aspect_ratio(700, 500)
    forensic_norm = run_comprehensive_forensics(normal_bytes)
    assert forensic_norm["layout_unrecognized"] is False

    ocr_norm = extract_fields_from_document(normal_bytes, filename="passport.jpg")
    assert ocr_norm["layout_unrecognized"] is False

    # 2. Anomalous banner image
    banner_bytes = create_image_with_aspect_ratio(1200, 200)
    forensic_anom = run_comprehensive_forensics(banner_bytes)
    assert forensic_anom["layout_unrecognized"] is True
    assert any("Layout Forensics" in note for note in forensic_anom["summary_notes"])

    ocr_anom = extract_fields_from_document(banner_bytes, filename="banner.jpg")
    assert ocr_anom["layout_unrecognized"] is True
    assert ocr_anom["fields"]["layout_unrecognized"] is True
