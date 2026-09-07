import pytest
from app.services.validation_service import validation_service

def test_valid_document_validation():
    fields = {
        "full_name": "ARJUN MEHTA",
        "document_number": "P8291047",
        "date_of_birth": "1994-08-14",
        "date_of_expiry": "2032-08-13"
    }
    mrz_data = {
        "doc_number_valid": True,
        "dob_valid": True,
        "expiry_valid": True,
        "composite_valid": True
    }
    results = validation_service.validate_document(fields, mrz_data, "PASSPORT")
    assert all(r["status"] == "PASS" for r in results)

def test_expired_document_validation():
    fields = {
        "full_name": "MANISH GUPTA",
        "document_number": "H3382910",
        "date_of_birth": "1985-06-20",
        "date_of_expiry": "2023-06-19"  # Expired
    }
    mrz_data = {"doc_number_valid": True, "dob_valid": True, "expiry_valid": True, "composite_valid": True}
    results = validation_service.validate_document(fields, mrz_data, "PASSPORT")
    
    expiry_rule = next(r for r in results if r["rule_id"] == "VAL_EXPIRY_DATE")
    assert expiry_rule["status"] == "FAIL"
    assert expiry_rule["risk_points"] > 0

def test_cross_document_visa_mismatch():
    fields = {
        "full_name": "ANANYA SEN",
        "document_number": "L9028174",
        "date_of_birth": "1996-12-01",
        "date_of_expiry": "2033-12-01"
    }
    visa_fields = {
        "passport_number_ref": "L9029999",  # Mismatched!
        "stay_duration_days": 30,
        "visa_validity_days": 90
    }
    results = validation_service.validate_document(fields, {}, "PASSPORT", visa_fields_map=visa_fields)
    mismatch_rule = next(r for r in results if r["rule_id"] == "VAL_VISA_CROSS_MATCH")
    assert mismatch_rule["status"] == "FAIL"
    assert mismatch_rule["risk_points"] == 40
