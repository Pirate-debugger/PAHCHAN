"""
Unit Tests for ICAO Doc 9303 MRZ Engine and Checksum Calculations
"""

import pytest
from app.services.validation_service import compute_mrz_checksum, parse_and_validate_td3, parse_mrz_date

def test_mrz_checksum_calculation():
    # Test sample passport number Z4819203
    # Checksum computation follows weights 7, 3, 1 repeating
    chk = compute_mrz_checksum("Z4819203")
    assert isinstance(chk, int)
    assert 0 <= chk <= 9

def test_td3_genuine_passport_parsing():
    l1 = "P<INDKUMAR<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<"
    # Cryptographically exact 7-3-1 modulo 10 TD3 MRZ line 2
    l2 = "Z4819203<0IND0008154M3008155<<<<<<<<<<<<<<00"
    res = parse_and_validate_td3(l1, l2)
    
    assert res["holder_name"] == "KUMAR  RAHUL"
    assert res["nationality"] == "IND"
    assert res["gender"] == "MALE"
    assert res["dob"] == "2000-08-15"
    assert res["expiry"] == "2030-08-15"
    assert res["mrz_checksum_pass"] is True
    assert res["is_expired"] is False
    assert res["mrz_details"]["doc_number_valid"] is True
    assert res["mrz_details"]["dob_valid"] is True
    assert res["mrz_details"]["expiry_valid"] is True
    assert res["mrz_details"]["composite_valid"] is True

def test_td3_checksum_mismatch():
    l1 = "P<INDKUMAR<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<"
    # Tampered doc number check digit (expected 0, given 9)
    l2 = "Z4819203<9IND0008154M3008155<<<<<<<<<<<<<<00"
    res = parse_and_validate_td3(l1, l2)
    
    assert res["mrz_checksum_pass"] is False
    assert res["mrz_details"]["doc_number_valid"] is False
    assert any("Document Number Checksum Mismatch" in issue for issue in res["issues"])

def test_expired_document_detection():
    l1 = "P<INDRAO<<SUNITA<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
    # Expiry year 2023 (230110)
    l2 = "K1092837<1IND8503052F2301103<<<<<<<<<<<<<<09"
    res = parse_and_validate_td3(l1, l2)
    
    assert res["is_expired"] is True
    assert any("expired" in issue.lower() for issue in res["issues"])
