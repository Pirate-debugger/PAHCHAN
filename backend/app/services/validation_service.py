"""
ICAO Doc 9303 Machine Readable Zone (MRZ) & Rule-Based Document Validation Engine
Supports TD1 (ID Cards), TD2, and TD3 (Passports).
Implements 7-3-1 modulo-10 check digits, date format verification, expiration, and logical checks.
"""

from typing import Dict, Any, List, Tuple
from datetime import datetime, date, timezone

MRZ_WEIGHTS = [7, 3, 1]

def get_char_value(char: str) -> int:
    """ICAO Doc 9303 character values: '0'-'9' is 0-9, 'A'-'Z' is 10-35, '<' is 0."""
    if not char or char == '<':
        return 0
    char = char.upper()
    code = ord(char)
    if 48 <= code <= 57:  # '0'-'9'
        return code - 48
    if 65 <= code <= 90:  # 'A'-'Z'
        return code - 65 + 10
    return 0

def compute_mrz_checksum(data_str: str) -> int:
    """Computes ICAO Doc 9303 7-3-1 modulo 10 checksum."""
    total = 0
    for idx, char in enumerate(data_str):
        val = get_char_value(char)
        weight = MRZ_WEIGHTS[idx % 3]
        total += val * weight
    return total % 10

def parse_mrz_date(yymmdd: str, is_expiry: bool = False) -> Tuple[str, bool]:
    """
    Parses YYMMDD string to YYYY-MM-DD.
    Returns (formatted_date, is_valid_calendar_date).
    """
    if not yymmdd or len(yymmdd) < 6 or not yymmdd[:6].isdigit():
        return "", False
    
    yy = int(yymmdd[:2])
    mm = int(yymmdd[2:4])
    dd = int(yymmdd[4:6])
    
    # Check calendar feasibility
    if mm < 1 or mm > 12 or dd < 1 or dd > 31:
        return f"INVALID_DATE_{yymmdd}", False

    current_year_2digit = datetime.now(timezone.utc).year % 100
    if is_expiry:
        # Expiry is typically within next 20-30 years
        full_year = 2000 + yy if yy <= (current_year_2digit + 30) else 1900 + yy
    else:
        # Date of birth
        full_year = 1900 + yy if yy > current_year_2digit else 2000 + yy
        
    try:
        parsed_dt = date(full_year, mm, dd)
        return parsed_dt.isoformat(), True
    except ValueError:
        return f"IMPOSSIBLE_DATE_{yymmdd}", False

def parse_and_validate_td3(line1: str, line2: str) -> Dict[str, Any]:
    """
    Parses and cryptographically validates a 2-line 44-character Passport MRZ (TD3).
    """
    issues: List[str] = []
    
    l1 = (line1.strip() + "<" * 44)[:44]
    l2 = (line2.strip() + "<" * 44)[:44]

    doc_type = l1[:2].replace("<", "")
    issuing_country = l1[2:5].replace("<", "")
    name_part = l1[5:].replace("<", " ").strip()

    # Document Number + Check Digit (Indices 0..8, check at 9)
    doc_number = l2[:9].replace("<", "")
    doc_number_check_str = l2[9]
    calc_doc_check = compute_mrz_checksum(l2[:9])
    is_doc_check_digit_num = doc_number_check_str.isdigit()
    doc_number_check = int(doc_number_check_str) if is_doc_check_digit_num else -1
    is_doc_valid = (is_doc_check_digit_num and calc_doc_check == doc_number_check)
    if not is_doc_valid:
        issues.append(f"MRZ Document Number Checksum Mismatch: Calculated {calc_doc_check}, found {doc_number_check_str}")

    # Nationality (Indices 10..12)
    nationality = l2[10:13].replace("<", "")

    # Date of Birth (Indices 13..18, check at 19)
    dob_raw = l2[13:19]
    dob_check_str = l2[19]
    calc_dob_check = compute_mrz_checksum(dob_raw)
    is_dob_check_digit_num = dob_check_str.isdigit()
    dob_check = int(dob_check_str) if is_dob_check_digit_num else -1
    is_dob_valid = (is_dob_check_digit_num and calc_dob_check == dob_check)
    dob_iso, is_dob_calendar_valid = parse_mrz_date(dob_raw, is_expiry=False)
    if not is_dob_valid:
        issues.append(f"MRZ DOB Checksum Mismatch: Calculated {calc_dob_check}, found {dob_check_str}")
    if not is_dob_calendar_valid:
        issues.append(f"MRZ DOB specifies impossible calendar date: {dob_raw}")

    # Gender (Index 20)
    gender_char = l2[20].upper()
    gender = "MALE" if gender_char == "M" else "FEMALE" if gender_char == "F" else "UNSPECIFIED"

    # Expiry Date (Indices 21..26, check at 27)
    expiry_raw = l2[21:27]
    expiry_check_str = l2[27]
    calc_expiry_check = compute_mrz_checksum(expiry_raw)
    is_expiry_check_digit_num = expiry_check_str.isdigit()
    expiry_check = int(expiry_check_str) if is_expiry_check_digit_num else -1
    is_expiry_valid = (is_expiry_check_digit_num and calc_expiry_check == expiry_check)
    expiry_iso, is_expiry_calendar_valid = parse_mrz_date(expiry_raw, is_expiry=True)
    if not is_expiry_valid:
        issues.append(f"MRZ Expiry Checksum Mismatch: Calculated {calc_expiry_check}, found {expiry_check_str}")
    if not is_expiry_calendar_valid:
        issues.append(f"MRZ Expiry specifies impossible calendar date: {expiry_raw}")

    # Expiration logic check against current UTC date
    is_expired = False
    if is_expiry_calendar_valid and expiry_iso:
        try:
            exp_date = datetime.strptime(expiry_iso, "%Y-%m-%d").date()
            if exp_date < datetime.now(timezone.utc).date():
                is_expired = True
                issues.append(f"Travel document is expired (Expired on {expiry_iso})")
        except Exception:
            pass

    # Optional Personal Number (Indices 28..41, optional check at 42)
    personal_number = l2[28:42].replace("<", "")

    # Composite Check Digit (Index 43)
    composite_check_str = l2[43]
    # Composite string is doc_number + doc_check + dob + dob_check + expiry + expiry_check + personal_number (or line2[:10] + line2[13:20] + line2[21:43])
    composite_data = l2[:10] + l2[13:20] + l2[21:43]
    calc_composite_check = compute_mrz_checksum(composite_data)
    is_composite_check_digit_num = composite_check_str.isdigit()
    composite_check = int(composite_check_str) if is_composite_check_digit_num else -1
    is_composite_valid = (is_composite_check_digit_num and calc_composite_check == composite_check)
    if not is_composite_valid:
        issues.append(f"MRZ Composite Master Checksum Mismatch: Calculated {calc_composite_check}, found {composite_check_str}")

    mrz_checksum_pass = is_doc_valid and is_dob_valid and is_expiry_valid and is_composite_valid
    overall_valid = mrz_checksum_pass and not is_expired and is_dob_calendar_valid and is_expiry_calendar_valid

    return {
        "format": "TD3",
        "doc_type": doc_type,
        "issuing_country": issuing_country,
        "holder_name": name_part,
        "doc_number": doc_number,
        "nationality": nationality,
        "dob": dob_iso,
        "gender": gender,
        "expiry": expiry_iso,
        "personal_number": personal_number,
        "is_expired": is_expired,
        "is_valid": overall_valid,
        "mrz_checksum_pass": mrz_checksum_pass,
        "mrz_details": {
            "doc_number_valid": is_doc_valid,
            "dob_valid": is_dob_valid,
            "expiry_valid": is_expiry_valid,
            "composite_valid": is_composite_valid,
            "calculated_checksums": {
                "doc": calc_doc_check,
                "dob": calc_dob_check,
                "exp": calc_expiry_check,
                "comp": calc_composite_check
            },
            "expected_checksums": {
                "doc": doc_number_check,
                "dob": dob_check,
                "exp": expiry_check,
                "comp": composite_check
            }
        },
        "issues": issues,
        "normalized_fields": {
            "name": name_part,
            "docNumber": doc_number,
            "dob": dob_iso,
            "expiryDate": expiry_iso,
            "nationality": nationality,
            "gender": gender
        }
    }

def parse_and_validate_td1(line1: str, line2: str, line3: str) -> Dict[str, Any]:
    """
    P2.2: Parses and validates a 3-line 30-character ID Card MRZ (TD1) per ICAO Doc 9303.
    Line 1: Document Type, Issuing State, Document Number + Check Digit, Optional Data
    Line 2: DOB + Check, Sex, Expiry + Check, Nationality, Optional Data, Composite Check
    Line 3: Holder Primary Identifier / Name
    """
    issues: List[str] = []
    l1 = (line1.strip() + "<" * 30)[:30]
    l2 = (line2.strip() + "<" * 30)[:30]
    l3 = (line3.strip() + "<" * 30)[:30]

    doc_type = l1[:2].replace("<", "")
    issuing_country = l1[2:5].replace("<", "")

    # Document Number (indices 5..13, check digit at 14)
    doc_number = l1[5:14].replace("<", "")
    doc_check_str = l1[14]
    calc_doc_check = compute_mrz_checksum(l1[5:14])
    is_doc_valid = (doc_check_str.isdigit() and calc_doc_check == int(doc_check_str))
    if not is_doc_valid:
        issues.append(f"TD1 Document Number Checksum Mismatch: Calculated {calc_doc_check}, found {doc_check_str}")

    # Date of Birth (Line 2 indices 0..5, check digit at 6)
    dob_raw = l2[:6]
    dob_check_str = l2[6]
    calc_dob_check = compute_mrz_checksum(dob_raw)
    is_dob_valid = (dob_check_str.isdigit() and calc_dob_check == int(dob_check_str))
    dob_iso, is_dob_cal = parse_mrz_date(dob_raw, is_expiry=False)
    if not is_dob_valid:
        issues.append(f"TD1 DOB Checksum Mismatch: Calculated {calc_dob_check}, found {dob_check_str}")
    if not is_dob_cal:
        issues.append(f"TD1 DOB specifies impossible calendar date: {dob_raw}")

    # Gender (Line 2 index 7)
    gender_char = l2[7].upper()
    gender = "MALE" if gender_char == "M" else "FEMALE" if gender_char == "F" else "UNSPECIFIED"

    # Expiry Date (Line 2 indices 8..13, check digit at 14)
    exp_raw = l2[8:14]
    exp_check_str = l2[14]
    calc_exp_check = compute_mrz_checksum(exp_raw)
    is_exp_valid = (exp_check_str.isdigit() and calc_exp_check == int(exp_check_str))
    expiry_iso, is_exp_cal = parse_mrz_date(exp_raw, is_expiry=True)
    if not is_exp_valid:
        issues.append(f"TD1 Expiry Checksum Mismatch: Calculated {calc_exp_check}, found {exp_check_str}")
    if not is_exp_cal:
        issues.append(f"TD1 Expiry specifies impossible calendar date: {exp_raw}")

    # Expiry check
    is_expired = False
    if is_exp_cal and expiry_iso:
        try:
            exp_date = datetime.strptime(expiry_iso, "%Y-%m-%d").date()
            if exp_date < datetime.now(timezone.utc).date():
                is_expired = True
                issues.append(f"Travel document is expired (Expired on {expiry_iso})")
        except Exception:
            pass

    # Nationality (Line 2 indices 15..17)
    nationality = l2[15:18].replace("<", "")

    # Composite Master Checksum (Line 2 index 29)
    # Includes: line 1 (chars 5..30) + line 2 (chars 0..7, 8..15, 18..29)
    composite_check_str = l2[29]
    composite_data = l1[5:30] + l2[0:7] + l2[8:15] + l2[18:29]
    calc_comp_check = compute_mrz_checksum(composite_data)
    is_comp_valid = (composite_check_str.isdigit() and calc_comp_check == int(composite_check_str))
    if not is_comp_valid:
        issues.append(f"TD1 Composite Master Checksum Mismatch: Calculated {calc_comp_check}, found {composite_check_str}")

    # Holder Name (Line 3, 30 chars)
    name_part = l3.replace("<", " ").strip()

    mrz_checksum_pass = is_doc_valid and is_dob_valid and is_exp_valid and is_comp_valid
    overall_valid = mrz_checksum_pass and not is_expired and is_dob_cal and is_exp_cal

    return {
        "format": "TD1",
        "doc_type": doc_type,
        "issuing_country": issuing_country,
        "holder_name": name_part,
        "doc_number": doc_number,
        "nationality": nationality,
        "dob": dob_iso,
        "gender": gender,
        "expiry": expiry_iso,
        "is_expired": is_expired,
        "is_valid": overall_valid,
        "mrz_checksum_pass": mrz_checksum_pass,
        "mrz_details": {
            "doc_number_valid": is_doc_valid,
            "dob_valid": is_dob_valid,
            "expiry_valid": is_exp_valid,
            "composite_valid": is_comp_valid,
            "calculated_checksums": {
                "doc": calc_doc_check,
                "dob": calc_dob_check,
                "exp": calc_exp_check,
                "comp": calc_comp_check
            },
            "expected_checksums": {
                "doc": int(doc_check_str) if doc_check_str.isdigit() else -1,
                "dob": int(dob_check_str) if dob_check_str.isdigit() else -1,
                "exp": int(exp_check_str) if exp_check_str.isdigit() else -1,
                "comp": int(composite_check_str) if composite_check_str.isdigit() else -1
            }
        },
        "issues": issues,
        "normalized_fields": {
            "name": name_part,
            "docNumber": doc_number,
            "dob": dob_iso,
            "expiryDate": expiry_iso,
            "nationality": nationality,
            "gender": gender
        }
    }

def parse_and_validate_td2(line1: str, line2: str) -> Dict[str, Any]:
    """
    P2.2: Parses and validates a 2-line 36-character Visa / ID Card MRZ (TD2) per ICAO Doc 9303.
    Line 1: Document Type, Issuing Country, Holder Name (31 chars)
    Line 2: Doc Number + Check, Nationality, DOB + Check, Sex, Expiry + Check, Optional, Composite Check
    """
    issues: List[str] = []
    l1 = (line1.strip() + "<" * 36)[:36]
    l2 = (line2.strip() + "<" * 36)[:36]

    doc_type = l1[:2].replace("<", "")
    issuing_country = l1[2:5].replace("<", "")
    name_part = l1[5:].replace("<", " ").strip()

    # Document Number (Line 2 indices 0..8, check digit at 9)
    doc_number = l2[:9].replace("<", "")
    doc_check_str = l2[9]
    calc_doc_check = compute_mrz_checksum(l2[:9])
    is_doc_valid = (doc_check_str.isdigit() and calc_doc_check == int(doc_check_str))
    if not is_doc_valid:
        issues.append(f"TD2 Document Number Checksum Mismatch: Calculated {calc_doc_check}, found {doc_check_str}")

    # Nationality (Line 2 indices 10..12)
    nationality = l2[10:13].replace("<", "")

    # Date of Birth (Line 2 indices 13..18, check digit at 19)
    dob_raw = l2[13:19]
    dob_check_str = l2[19]
    calc_dob_check = compute_mrz_checksum(dob_raw)
    is_dob_valid = (dob_check_str.isdigit() and calc_dob_check == int(dob_check_str))
    dob_iso, is_dob_cal = parse_mrz_date(dob_raw, is_expiry=False)
    if not is_dob_valid:
        issues.append(f"TD2 DOB Checksum Mismatch: Calculated {calc_dob_check}, found {dob_check_str}")
    if not is_dob_cal:
        issues.append(f"TD2 DOB specifies impossible calendar date: {dob_raw}")

    # Gender (Line 2 index 20)
    gender_char = l2[20].upper()
    gender = "MALE" if gender_char == "M" else "FEMALE" if gender_char == "F" else "UNSPECIFIED"

    # Expiry Date (Line 2 indices 21..26, check digit at 27)
    exp_raw = l2[21:27]
    exp_check_str = l2[27]
    calc_exp_check = compute_mrz_checksum(exp_raw)
    is_exp_valid = (exp_check_str.isdigit() and calc_exp_check == int(exp_check_str))
    expiry_iso, is_exp_cal = parse_mrz_date(exp_raw, is_expiry=True)
    if not is_exp_valid:
        issues.append(f"TD2 Expiry Checksum Mismatch: Calculated {calc_exp_check}, found {exp_check_str}")
    if not is_exp_cal:
        issues.append(f"TD2 Expiry specifies impossible calendar date: {exp_raw}")

    is_expired = False
    if is_exp_cal and expiry_iso:
        try:
            exp_date = datetime.strptime(expiry_iso, "%Y-%m-%d").date()
            if exp_date < datetime.now(timezone.utc).date():
                is_expired = True
                issues.append(f"Travel document is expired (Expired on {expiry_iso})")
        except Exception:
            pass

    # Composite Master Checksum (Line 2 index 35)
    # Includes: line 2 (chars 0..10, 13..20, 21..35)
    composite_check_str = l2[35]
    composite_data = l2[:10] + l2[13:20] + l2[21:35]
    calc_comp_check = compute_mrz_checksum(composite_data)
    is_comp_valid = (composite_check_str.isdigit() and calc_comp_check == int(composite_check_str))
    if not is_comp_valid:
        issues.append(f"TD2 Composite Master Checksum Mismatch: Calculated {calc_comp_check}, found {composite_check_str}")

    mrz_checksum_pass = is_doc_valid and is_dob_valid and is_exp_valid and is_comp_valid
    overall_valid = mrz_checksum_pass and not is_expired and is_dob_cal and is_exp_cal

    return {
        "format": "TD2",
        "doc_type": doc_type,
        "issuing_country": issuing_country,
        "holder_name": name_part,
        "doc_number": doc_number,
        "nationality": nationality,
        "dob": dob_iso,
        "gender": gender,
        "expiry": expiry_iso,
        "is_expired": is_expired,
        "is_valid": overall_valid,
        "mrz_checksum_pass": mrz_checksum_pass,
        "mrz_details": {
            "doc_number_valid": is_doc_valid,
            "dob_valid": is_dob_valid,
            "expiry_valid": is_exp_valid,
            "composite_valid": is_comp_valid,
            "calculated_checksums": {
                "doc": calc_doc_check,
                "dob": calc_dob_check,
                "exp": calc_exp_check,
                "comp": calc_comp_check
            },
            "expected_checksums": {
                "doc": int(doc_check_str) if doc_check_str.isdigit() else -1,
                "dob": int(dob_check_str) if dob_check_str.isdigit() else -1,
                "exp": int(exp_check_str) if exp_check_str.isdigit() else -1,
                "comp": int(composite_check_str) if composite_check_str.isdigit() else -1
            }
        },
        "issues": issues,
        "normalized_fields": {
            "name": name_part,
            "docNumber": doc_number,
            "dob": dob_iso,
            "expiryDate": expiry_iso,
            "nationality": nationality,
            "gender": gender
        }
    }

def parse_and_validate_mrz(lines: List[str]) -> Dict[str, Any]:
    """
    Auto-detects and validates ICAO Doc 9303 MRZ format (TD1, TD2, TD3).
    - TD1: 3 lines x 30 characters (National ID cards)
    - TD2: 2 lines x 36 characters (Official travel ID / visas)
    - TD3: 2 lines x 44 characters (Passports)
    """
    clean_lines = [l.strip() for l in lines if l.strip()]
    if len(clean_lines) >= 3 and all(len(l) <= 32 for l in clean_lines[:3]):
        return parse_and_validate_td1(clean_lines[0], clean_lines[1], clean_lines[2])
    elif len(clean_lines) >= 2:
        l1, l2 = clean_lines[0], clean_lines[1]
        if max(len(l1), len(l2)) <= 38:
            return parse_and_validate_td2(l1, l2)
        else:
            return parse_and_validate_td3(l1, l2)
    elif len(clean_lines) == 1:
        split = [s.strip() for s in clean_lines[0].splitlines() if s.strip()]
        if len(split) > 1:
            return parse_and_validate_mrz(split)
        return parse_and_validate_td3(clean_lines[0], "")
    return parse_and_validate_td3("", "")

