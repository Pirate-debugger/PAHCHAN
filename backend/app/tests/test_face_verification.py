"""
Unit Tests for Biometric Face Verification (P0.1 and P0.2)
Verifies fail-closed behavior on missing live capture,
HOG feature embedding discriminability, and landmark validation.
"""

import io
import cv2
import numpy as np
from PIL import Image
from app.services.face_service import (
    verify_biometric_face,
    compute_face_similarity,
    detect_face_in_image
)

def create_synthetic_face(variant: str = "A") -> bytes:
    """Creates synthetic face-like portrait image with distinct patterns."""
    img = np.ones((240, 200, 3), dtype=np.uint8) * 220
    
    if variant == "A":
        # Face oval
        cv2.ellipse(img, (100, 110), (55, 75), 0, 0, 360, (180, 170, 160), -1)
        # Eye region features (high contrast)
        cv2.circle(img, (80, 95), 8, (40, 30, 20), -1)
        cv2.circle(img, (120, 95), 8, (40, 30, 20), -1)
        # Mouth
        cv2.rectangle(img, (85, 145), (115, 155), (60, 40, 40), -1)
    elif variant == "B":
        # Completely different pattern: strong vertical bars across the canvas
        img[:] = 30
        for x in range(0, 200, 20):
            cv2.line(img, (x, 0), (x, 240), (240, 240, 240), 6)
    elif variant == "FLAT":
        # Uniform solid canvas with no features
        img[:] = 128

    _, enc = cv2.imencode(".jpg", img)
    return enc.tobytes()

def test_missing_live_photo_fails_closed():
    """P0.1: verify_biometric_face with empty live bytes must NOT return match=True."""
    doc_bytes = create_synthetic_face("A")
    
    # Test with empty bytes
    res_empty = verify_biometric_face(doc_bytes, b"")
    assert res_empty["status"] == "NO_LIVE_CAPTURE"
    assert res_empty["match"] is None
    assert res_empty["similarity"] is None
    assert res_empty["live_detected"] is False
    assert res_empty["landmarks_detected"] is False
    assert "skipped" in res_empty["notes"].lower()
    
    # Test with None-like / 0 length
    res_none = verify_biometric_face(doc_bytes, bytes())
    assert res_none["match"] is not True
    assert res_none["similarity"] is None

def test_same_face_similarity_high():
    """P0.2: Comparing identical face images must yield high similarity (>90%)."""
    face_a = create_synthetic_face("A")
    res = verify_biometric_face(face_a, face_a)
    
    assert res["status"] == "MATCH"
    assert res["match"] is True
    assert res["similarity"] is not None
    assert res["similarity"] >= 90.0
    assert res["confidence"] >= 0.85

def test_distinct_faces_similarity_discriminates():
    """P0.2: Comparing clearly different images must NOT produce high similarity."""
    face_a = create_synthetic_face("A")
    face_b = create_synthetic_face("B")
    
    res = verify_biometric_face(face_a, face_b)
    assert res["status"] == "MISMATCH"
    assert res["match"] is False
    assert res["similarity"] is not None
    # Similarity for completely different structural features must be low
    assert res["similarity"] < 50.0

def test_landmark_variance_detection():
    """P0.2: Flat featureless image must not falsely report landmarks detected."""
    flat_bytes = create_synthetic_face("FLAT")
    detected_flat = detect_face_in_image(flat_bytes)
    # Zero variance in feature regions
    assert detected_flat["landmarks_detected"] is False
    
    structured_bytes = create_synthetic_face("A")
    detected_structured = detect_face_in_image(structured_bytes)
    # Feature regions have texture
    assert detected_structured["landmarks_detected"] is True
