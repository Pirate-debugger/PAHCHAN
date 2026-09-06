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
