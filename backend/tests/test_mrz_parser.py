import pytest
from app.services.ocr_service import calculate_check_digit, verify_check_digit, MRZParser

def test_check_digit_calculation():
    # Exact ICAO 7-3-1 weight calculations
    assert verify_check_digit("P8291047", "6")
    assert verify_check_digit("940814", "8")
    assert verify_check_digit("320813", "9")

def test_mrz_td3_parsing():
    l1 = "P<INDMEHTA<<ARJUN<<<<<<<<<<<<<<<<<<<<<<<<<<<"
    l2 = "P8291047<6IND9408148M3208139<<<<<<<<<<<<<<00"
    
    parsed = MRZParser.parse_td3([l1, l2])
    assert parsed["document_type"] == "P"
    assert parsed["issuing_country"] == "IND"
    assert parsed["surname"] == "MEHTA"
    assert parsed["given_names"] == "ARJUN"
    assert parsed["full_name"] == "ARJUN MEHTA"
    assert parsed["document_number"] == "P8291047"
    assert parsed["nationality"] == "IND"
    assert parsed["dob"] == "1994-08-14"
    assert parsed["gender"] == "M"
    assert parsed["expiry"] == "2032-08-13"
    assert parsed["doc_number_valid"] is True
    assert parsed["dob_valid"] is True
    assert parsed["expiry_valid"] is True

def test_mrz_checksum_failure_detection():
    # Modified DOB: 990410 with forged check digit '9' instead of '1'
    l1 = "P<INDKUMAR<<SUNIL<<<<<<<<<<<<<<<<<<<<<<<<<<"
    l2 = "M1948203<9IND9904109M3104098<<<<<<<<<<<<<<00"
    
    parsed = MRZParser.parse_td3([l1, l2])
    assert parsed["full_name"] == "SUNIL KUMAR"
    # dob_valid must be False because for 990410, check digit is 1, not 9
    assert parsed["dob_valid"] is False
