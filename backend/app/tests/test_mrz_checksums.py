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

def test_td1_genuine_id_card_parsing():
    """P2.2: Verifies 3-line 30-character TD1 ID Card MRZ parsing and cryptographic check digits."""
    from app.services.validation_service import parse_and_validate_td1
    l1 = "I<INDD1234567<7<<<<<<<<<<<<<<<"
    l2 = "9001011M3001019IND<<<<<<<<<<<2"
    l3 = "SHARMA<<RAHUL<<<<<<<<<<<<<<<<<"
    res = parse_and_validate_td1(l1, l2, l3)

    assert res["format"] == "TD1"
    assert res["holder_name"] == "SHARMA  RAHUL"
    assert res["doc_number"] == "D1234567"
    assert res["nationality"] == "IND"
    assert res["dob"] == "1990-01-01"
    assert res["gender"] == "MALE"
    assert res["expiry"] == "2030-01-01"
    assert res["mrz_checksum_pass"] is True
    assert res["is_valid"] is True

def test_td2_genuine_visa_parsing():
    """P2.2: Verifies 2-line 36-character TD2 Travel Card / Visa MRZ parsing and checksums."""
    from app.services.validation_service import parse_and_validate_td2
    l1 = "V<INDSHARMA<<RAHUL<<<<<<<<<<<<<<<<<<"
    l2 = "V9876543<1IND9205107F2905109<<<<<<<0"
    res = parse_and_validate_td2(l1, l2)

    assert res["format"] == "TD2"
    assert res["holder_name"] == "SHARMA  RAHUL"
    assert res["doc_number"] == "V9876543"
    assert res["nationality"] == "IND"
    assert res["dob"] == "1992-05-10"
    assert res["gender"] == "FEMALE"
    assert res["expiry"] == "2029-05-10"
    assert res["mrz_checksum_pass"] is True
    assert res["is_valid"] is True

def test_auto_detect_mrz_format():
    """P2.2: Auto-detects TD1, TD2, and TD3 based on line count and character length."""
    from app.services.validation_service import parse_and_validate_mrz
    # TD1: 3 lines of 30 chars
    td1_res = parse_and_validate_mrz([
        "I<INDD1234567<7<<<<<<<<<<<<<<<",
        "9001011M3001019IND<<<<<<<<<<<2",
        "SHARMA<<RAHUL<<<<<<<<<<<<<<<<<"
    ])
    assert td1_res["format"] == "TD1"

    # TD2: 2 lines of 36 chars
    td2_res = parse_and_validate_mrz([
        "V<INDSHARMA<<RAHUL<<<<<<<<<<<<<<<<<<",
        "V9876543<1IND9205107F2905109<<<<<<<0"
    ])
    assert td2_res["format"] == "TD2"

    # TD3: 2 lines of 44 chars
    td3_res = parse_and_validate_mrz([
        "P<INDKUMAR<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<",
        "Z4819203<0IND0008154M3008155<<<<<<<<<<<<<<00"
    ])
    assert td3_res["format"] == "TD3"

