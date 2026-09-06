"""
Unit Tests for Cross-Document Consistency Normalizer
"""

import pytest
from app.services.crossdoc_service import cross_validate_documents, normalize_name, normalize_date

def test_normalize_name():
    assert normalize_name("rahul   kumar") == "RAHUL KUMAR"
    assert normalize_name("SHARMA<<ANITA") == "SHARMA ANITA"

def test_normalize_date():
    assert normalize_date("14/07/1998") == "1998-07-14"
    assert normalize_date("1998-07-14") == "1998-07-14"
    assert normalize_date("14-07-1998") == "1998-07-14"

def test_matching_documents():
    doc1 = {"name": "Rahul Sharma", "dob": "14/07/1998", "nationality": "IND", "gender": "MALE"}
    doc2 = {"name": "RAHUL SHARMA", "dob": "1998-07-14", "nationality": "IND", "gender": "MALE"}
    res = cross_validate_documents(doc1, doc2)
    assert res["match"] is True
    assert len(res["mismatches"]) == 0

def test_mismatched_documents():
    doc1 = {"name": "Rahul Kumar", "dob": "14/07/1998", "nationality": "IND", "gender": "MALE"}
    doc2 = {"name": "Rahul Sharma", "dob": "14/07/1998", "nationality": "IND", "gender": "MALE"}
    res = cross_validate_documents(doc1, doc2)
    assert res["match"] is False
    assert len(res["mismatches"]) == 1
    assert res["mismatches"][0]["field"] == "Full Name"
    assert res["mismatches"][0]["severity"] == "critical"

def test_fuzzy_transliteration_name_matching():
    """P1.4: Minor transliteration or OCR typo matches above threshold without critical failure."""
    doc1 = {"name": "MOHAMMED RAHMAN", "dob": "1990-05-12", "nationality": "IND", "gender": "MALE"}
    doc2 = {"name": "MOHAMMAD RAHMAN", "dob": "1990-05-12", "nationality": "IND", "gender": "MALE"}
    res = cross_validate_documents(doc1, doc2, name_threshold=85.0)
    # High similarity (>90%) -> match is True, severity is low advisory
    assert res["match"] is True
    assert res["name_similarity"] >= 85.0
    assert len(res["mismatches"]) == 1
    assert res["mismatches"][0]["severity"] == "low"
    assert "Minor name variation" in res["mismatches"][0]["description"]

def test_single_char_date_variance():
    """P1.4: 1-character date difference is flagged with medium severity, not critical block."""
    doc1 = {"name": "ANITA SHARMA", "dob": "1995-11-24", "nationality": "IND", "gender": "FEMALE"}
    doc2 = {"name": "ANITA SHARMA", "dob": "1995-11-21", "nationality": "IND", "gender": "FEMALE"}
    res = cross_validate_documents(doc1, doc2)
    # Single character difference in date produces medium severity
    assert len(res["mismatches"]) == 1
    assert res["mismatches"][0]["field"] == "Date of Birth"
    assert res["mismatches"][0]["severity"] == "medium"

