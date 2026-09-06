"""
PAHCHAN Cross-Document Consistency Engine
Cross-validates identity records across multiple travel documents (e.g., Passport vs Visa, Passport vs National ID).
Normalizes dates, whitespace, case, and transliterations.
Generates side-by-side mismatch dossiers.
"""

import re
from typing import Dict, Any, List, Optional
from datetime import datetime
from rapidfuzz import fuzz, distance

def normalize_name(name_str: str) -> str:
    """Normalizes names by collapsing multiple spaces, trimming, and upper-casing."""
    if not name_str:
        return ""
    # Strip special MRZ characters like '<' or punctuation
    clean = re.sub(r"[^a-zA-Z\s]", " ", name_str)
    return " ".join(clean.upper().split())

def normalize_date(date_str: str) -> Optional[str]:
    """
    Attempts to parse arbitrary date string formats into standard YYYY-MM-DD.
    Supports: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY, YYYY/MM/DD, DD MMM YYYY.
    """
    if not date_str:
        return None
    clean_date = date_str.strip()
    
    formats = [
        "%Y-%m-%d",
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%Y/%m/%d",
        "%d %b %Y",
        "%d %B %Y",
        "%y%m%d"
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(clean_date, fmt)
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            continue
    return clean_date.upper()

def cross_validate_documents(
    doc1_fields: Dict[str, Any],
    doc2_fields: Dict[str, Any],
    doc1_label: str = "Passport Bio-Page",
    doc2_label: str = "Visa / Permit",
    name_threshold: float = 85.0
) -> Dict[str, Any]:
    """
    Compares two documents field-by-field with normalization and fuzzy matching (P1.4).
    Uses RapidFuzz token sorting and Levenshtein metrics to avoid false-positive critical
    alerts caused by single-character OCR misreads or standard name transliterations.
    """
    mismatches: List[Dict[str, Any]] = []

    # 1. Compare Names with RapidFuzz
    name1 = normalize_name(str(doc1_fields.get("name", "")))
    name2 = normalize_name(str(doc2_fields.get("name", "")))
    name_sim: Optional[float] = None

    if name1 and name2:
        if name1 == name2:
            name_sim = 100.0
        else:
            token_sort = fuzz.token_sort_ratio(name1, name2)
            token_set = fuzz.token_set_ratio(name1, name2)
            name_sim = round(float(max(token_sort, token_set)), 1)

            if name_sim >= name_threshold:
                # Transliteration or minor OCR variance: advisory, NOT critical
                mismatches.append({
                    "field": "Full Name",
                    "source1": doc1_label,
                    "value1": name1,
                    "source2": doc2_label,
                    "value2": name2,
                    "severity": "low",
                    "similarity": name_sim,
                    "description": f"Minor name variation likely due to OCR/transliteration ({name_sim}% similarity): '{name1}' vs '{name2}'."
                })
            else:
                # True discrepancy below similarity threshold
                mismatches.append({
                    "field": "Full Name",
                    "source1": doc1_label,
                    "value1": name1,
                    "source2": doc2_label,
                    "value2": name2,
                    "severity": "critical",
                    "similarity": name_sim,
                    "description": f"Holder full name discrepancy ({name_sim}% similarity): '{name1}' in {doc1_label} does not match '{name2}' in {doc2_label}."
                })

    # 2. Compare Date of Birth with single-digit OCR tolerance
    dob1 = normalize_date(str(doc1_fields.get("dob", "")))
    dob2 = normalize_date(str(doc2_fields.get("dob", "")))
    if dob1 and dob2 and dob1 != dob2:
        # Check Levenshtein distance for single-character OCR transposition
        lev_dist = distance.Levenshtein.distance(dob1, dob2)
        if lev_dist == 1:
            mismatches.append({
                "field": "Date of Birth",
                "source1": doc1_label,
                "value1": dob1,
                "source2": doc2_label,
                "value2": dob2,
                "severity": "medium",
                "description": f"Date of Birth near-match (1-char variance, likely OCR artifact): '{dob1}' vs '{dob2}'."
            })
        else:
            mismatches.append({
                "field": "Date of Birth",
                "source1": doc1_label,
                "value1": dob1,
                "source2": doc2_label,
                "value2": dob2,
                "severity": "critical",
                "description": f"Date of Birth conflict: '{dob1}' in {doc1_label} vs '{dob2}' in {doc2_label}."
            })

    # 3. Compare Nationality
    nat1 = str(doc1_fields.get("nationality", "")).strip().upper()
    nat2 = str(doc2_fields.get("nationality", "")).strip().upper()
    if nat1 and nat2 and nat1 != nat2:
        mismatches.append({
            "field": "Nationality",
            "source1": doc1_label,
            "value1": nat1,
            "source2": doc2_label,
            "value2": nat2,
            "severity": "high",
            "description": f"Nationality conflict: '{nat1}' vs '{nat2}'."
        })

    # 4. Compare Gender
    gen1 = str(doc1_fields.get("gender", "")).strip().upper()
    gen2 = str(doc2_fields.get("gender", "")).strip().upper()
    if gen1 and gen2 and gen1 != gen2:
        mismatches.append({
            "field": "Gender / Sex",
            "source1": doc1_label,
            "value1": gen1,
            "source2": doc2_label,
            "value2": gen2,
            "severity": "high",
            "description": f"Gender designation conflict: '{gen1}' vs '{gen2}'."
        })

    # A document passes consistency if there are no critical or high discrepancies
    has_critical = any(m["severity"] in ("critical", "high") for m in mismatches)
    is_matched = not has_critical

    return {
        "match": is_matched,
        "mismatches": mismatches,
        "has_critical_mismatch": has_critical,
        "checked_fields_count": 4,
        "name_similarity": name_sim
    }
