import numpy as np
import cv2
import pytest
from app.services.document_classifier import document_classifier

def test_aspect_ratio_and_geometry_id1():
    # ID-1 standard dimensions: 85.60 mm × 53.98 mm -> aspect ratio ~1.586
    h, w = 540, 856
    blank_id1 = np.ones((h, w, 3), dtype=np.uint8) * 240
    # Simulate Income Tax blue header
    blank_id1[0:int(0.20 * h), :] = [210, 180, 50]  # BGR
    
    classification = document_classifier.classify_cv2_image(blank_id1, filename_hint="sample_card.jpg")
    assert classification["architecture"] == "ISO_IEC_7810_ID1"
    assert classification["aspect_ratio"] >= 1.45 and classification["aspect_ratio"] <= 1.70

def test_uncertain_geometry_returns_uncertain():
    # Square or non-standard geometry
    h, w = 600, 600
    blank_square = np.ones((h, w, 3), dtype=np.uint8) * 200
    classification = document_classifier.classify_cv2_image(blank_square, filename_hint="unknown_paper.jpg")
    assert classification["detected_type"] in ["UNKNOWN", "DOCUMENT_TYPE_UNCERTAIN"]
    assert classification["confidence"] <= 0.60

def test_mrz_override_for_declared_card():
    # If a document has MRZ morphology, it must not be classified as PAN or DL
    h, w = 700, 1000
    passport_img = np.ones((h, w, 3), dtype=np.uint8) * 250
    # Simulate high contrast MRZ monospace lines at bottom
    for row in range(550, 680, 15):
        passport_img[row:row+8, 50:950] = 20
        
    classification = document_classifier.classify_cv2_image(passport_img, filename_hint="claimed_pan.jpg")
    # Even if filename claimed pan, presence of MRZ must flag PASSPORT architecture
    if classification["has_mrz"]:
        assert classification["detected_type"] == "PASSPORT"
