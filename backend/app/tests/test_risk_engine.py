"""
Unit Tests for Multi-Signal Explainable Risk Engine
"""

import pytest
from app.services.risk_service import calculate_screening_risk

def test_clean_document_risk():
    res = calculate_screening_risk(
        photo_replaced=False,
        text_manipulated=False,
        stamp_forged=False,
        face_mismatch=False,
        is_expired=False,
        crossfield_mismatch=False,
        watchlist_hit=False,
        metadata_tampered=False,
        mrz_pass=True
    )
    assert res["total_risk_score"] == 0
    assert res["risk_level"] == "LOW"
    assert res["decision"] == "CLEAR_ENTRY"
    assert len(res["risk_factors"]) == 0

def test_critical_tampered_document_risk():
    res = calculate_screening_risk(
        photo_replaced=True,
        text_manipulated=False,
        stamp_forged=False,
        face_mismatch=True,
        is_expired=False,
        crossfield_mismatch=False,
        watchlist_hit=False,
        metadata_tampered=False,
        mrz_pass=True
    )
    # Photo replaced (30) + Face mismatch (45) = 75
    assert res["total_risk_score"] >= 70
    assert res["risk_level"] == "CRITICAL"
    assert res["decision"] == "DETAIN_ALERT"
    assert len(res["risk_factors"]) == 2

def test_risk_score_clamping():
    res = calculate_screening_risk(
        photo_replaced=True,
        text_manipulated=True,
        stamp_forged=True,
        face_mismatch=True,
        is_expired=True,
        crossfield_mismatch=True,
        watchlist_hit=True,
        metadata_tampered=True,
        mrz_pass=False
    )
    assert res["total_risk_score"] == 100
    assert res["risk_level"] == "CRITICAL"
