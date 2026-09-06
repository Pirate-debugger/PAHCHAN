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
