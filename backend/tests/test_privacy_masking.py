import pytest
from app.core.security_privacy import mask_document_number

def test_pan_masking():
    assert mask_document_number("ABCDE1234F", "PAN") == "ABCDE****F"
    assert mask_document_number("BPLPK9921M") == "BPLPK****M"

def test_aadhaar_masking():
    assert mask_document_number("123456789012", "AADHAAR") == "XXXX XXXX 9012"
    assert mask_document_number("1234 5678 9012") == "XXXX XXXX 9012"

def test_passport_masking():
    assert mask_document_number("P8291047", "PASSPORT") == "P829****"
    assert mask_document_number("Z1234567") == "Z123****"

def test_driving_licence_masking():
    masked = mask_document_number("DL1420110012345", "DRIVING_LICENCE")
    assert masked.startswith("DL14")
    assert masked.endswith("345")
    assert "*" in masked

def test_voter_id_masking():
    assert mask_document_number("WBF1234567", "VOTER_ID") == "WBF****567"

def test_empty_and_fallback():
    assert mask_document_number(None) == "N/A"
    assert mask_document_number("") == "N/A"
    assert mask_document_number("ABCD") == "****"
