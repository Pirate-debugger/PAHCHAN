import re
from typing import Optional

def mask_document_number(number: Optional[str], doc_type: Optional[str] = None) -> str:
    """
    Mask sensitive national identity credentials according to privacy guidelines:
    - PAN: 5 letters + 4 masked + 1 letter (e.g. ABCDE****F)
    - Aadhaar: Masked 8 digits + last 4 (e.g. XXXX XXXX 1234)
    - Passport: 1 letter + 3 digits + 4 masked (e.g. P829****)
    - Driving Licence: State/RTO code + masked middle + last 3 (e.g. DL-14********345)
    - Voter ID / EPIC: 3-char prefix + masked middle + last 3 (e.g. WBF****567)
    """
    if not number:
        return "N/A"

    cleaned = str(number).strip().upper()
    dt = (doc_type or "").strip().upper()

    # PAN Card (10 characters: 5 letters + 4 digits + 1 letter)
    if dt == "PAN" or re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]$", cleaned):
        if len(cleaned) == 10:
            return f"{cleaned[:5]}****{cleaned[-1]}"
        return f"{cleaned[:2]}****{cleaned[-1]}"

    # Aadhaar Card (12 digits)
    if dt == "AADHAAR" or (cleaned.replace(" ", "").isdigit() and len(cleaned.replace(" ", "")) == 12):
        digits = cleaned.replace(" ", "")
        return f"XXXX XXXX {digits[-4:]}"

    # Indian Passport (1 letter + 7 digits)
    if dt == "PASSPORT" or re.match(r"^[A-Z][0-9]{7}$", cleaned):
        if len(cleaned) >= 8:
            return f"{cleaned[:4]}****"
        return f"{cleaned[:2]}****"

    # Driving Licence
    if dt in ["DRIVING_LICENCE", "DRIVING_LICENSE", "DL"]:
        if len(cleaned) >= 8:
            return f"{cleaned[:4]}{'*' * (len(cleaned) - 7)}{cleaned[-3:]}"
        return f"{cleaned[:2]}****"

    # Voter ID (EPIC)
    if dt in ["VOTER_ID", "EPIC"] or re.match(r"^[A-Z]{3}[0-9]{7}$", cleaned):
        if len(cleaned) >= 7:
            return f"{cleaned[:3]}****{cleaned[-3:]}"
        return f"{cleaned[:2]}****"

    # Generic Fallback
    if len(cleaned) <= 4:
        return "*" * len(cleaned)
    return f"{cleaned[:2]}{'*' * (len(cleaned) - 4)}{cleaned[-2:]}"
