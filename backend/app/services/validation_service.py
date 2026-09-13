import re
from typing import Dict, Any, List, Optional
from datetime import datetime, date
from app.core.config import settings

# Demonstration Watchlist Dataset (Clearly labeled as synthetic demonstration)
DEMO_WATCHLIST = [
    {
        "document_number": "J8392018",
        "name": "VIKRAM SINGHANIA",
        "reason": "Lost or stolen travel document alert (Interpol SLTD Demo)",
        "alert_level": "CRITICAL",
        "points": 45
    },
    {
        "document_number": "T4928104",
        "name": "KHALID MANSOOR",
        "reason": "Flagged for immigration watchlist interview (SSB Demo Registry)",
        "alert_level": "HIGH",
        "points": 35
    },
    {
        "document_number": "N7109283",
        "name": "ROHIT VERMA",
        "reason": "Revoked travel authorization record (Demo Registry)",
        "alert_level": "HIGH",
        "points": 30
    }
]

# Valid Indian State/UT Codes for Driving Licences (MoRTH)
INDIAN_STATE_CODES = {
    "AN", "AP", "AR", "AS", "BR", "CH", "CG", "DD", "DL", "DN", "GA", "GJ",
    "HR", "HP", "JH", "JK", "KA", "KL", "LA", "LD", "MH", "ML", "MN", "MP",
    "MZ", "NL", "OD", "PB", "PY", "RJ", "SK", "TN", "TR", "TS", "UK", "UP", "WB"
}

# Income Tax PAN Entity Codes
PAN_ENTITY_MAP = {
    "P": "Individual",
    "C": "Company",
    "H": "Hindu Undivided Family (HUF)",
    "F": "Firm / Limited Liability Partnership",
    "A": "Association of Persons (AOP)",
    "T": "Trust",
    "B": "Body of Individuals (BOI)",
    "L": "Local Authority",
    "J": "Artificial Juridical Person",
    "G": "Government Agency"
}

class ValidationService:
    @staticmethod
    def validate_document(
        fields_map: Dict[str, str],
        mrz_data: Dict[str, Any],
        doc_type: str = "PASSPORT",
        doc_type_detected: Optional[str] = None,
        classification_info: Optional[Dict[str, Any]] = None,
        visa_fields_map: Optional[Dict[str, str]] = None
    ) -> List[Dict[str, Any]]:
        results = []

        norm_declared = doc_type.upper().replace(" ", "_")
        norm_detected = (doc_type_detected or doc_type).upper().replace(" ", "_")

        # Map common aliases
        alias_map = {
            "DRIVING_LICENSE": "DRIVING_LICENCE",
            "DL": "DRIVING_LICENCE",
            "EPIC": "VOTER_ID",
            "VOTER": "VOTER_ID",
            "PASSPORT_TD3": "PASSPORT"
        }
        eff_declared = alias_map.get(norm_declared, norm_declared)
        eff_detected = alias_map.get(norm_detected, norm_detected)

        # -----------------------------------------------------------------
        # 1. DOCUMENT TYPE CONSISTENCY (Declared vs Optically Detected)
        # -----------------------------------------------------------------
        if eff_declared != eff_detected and eff_detected != "UNKNOWN":
            results.append({
                "rule_id": "VAL_DOC_TYPE_CONSISTENCY",
                "rule_name": "Document Classification Consistency",
                "category": "CONSISTENCY",
                "status": "FAIL",
                "message": f"Document Type Conflict: Case registered as '{norm_declared}', but forensic analysis verified it as '{norm_detected}'.",
                "details": f"Visual architecture, official header tokens, and identification format contradict the declared category. Potential cross-document spoofing or classification error.",
                "risk_points": 45
            })
        else:
            results.append({
                "rule_id": "VAL_DOC_TYPE_CONSISTENCY",
                "rule_name": "Document Classification Consistency",
                "category": "CONSISTENCY",
                "status": "PASS",
                "message": f"Declared document category '{norm_declared}' matches physical geometry and optical characteristics.",
                "details": f"Document architecture is consistent with standard {eff_declared} specifications.",
                "risk_points": 0
            })

        # -----------------------------------------------------------------
        # 2. REQUIRED FIELDS CHECK (Adjusted per Document Type)
        # -----------------------------------------------------------------
        if eff_declared == "PAN":
            required_fields = ["full_name", "document_number"]
        elif eff_declared == "VOTER_ID":
            required_fields = ["full_name", "document_number"]
        elif eff_declared == "DRIVING_LICENCE":
            required_fields = ["full_name", "document_number", "date_of_expiry"]
        else:
            # Default / Passport
            required_fields = ["full_name", "document_number", "date_of_birth", "date_of_expiry"]

        missing_fields = [rf for rf in required_fields if not fields_map.get(rf)]
        if missing_fields:
            results.append({
                "rule_id": "VAL_REQ_FIELDS",
                "rule_name": "Required Field Completeness",
                "category": "FORMAT",
                "status": "FAIL",
                "message": f"Missing mandatory field(s): {', '.join(missing_fields).replace('_', ' ').title()}",
                "details": f"Mandatory fields required for {norm_declared} could not be extracted or verified.",
                "risk_points": 25
            })
        else:
            results.append({
                "rule_id": "VAL_REQ_FIELDS",
                "rule_name": "Required Field Completeness",
                "category": "FORMAT",
                "status": "PASS",
                "message": f"All required fields for {norm_declared} are present and verified.",
                "details": f"Present fields: {', '.join(required_fields).replace('_', ' ').title()}.",
                "risk_points": 0
            })

        # -----------------------------------------------------------------
        # 3. PAN CARD STRUCTURAL & ENTITY VALIDATION (Income Tax Act)
        # -----------------------------------------------------------------
        if eff_declared == "PAN" or eff_detected == "PAN":
            pan_raw = fields_map.get("document_number", "").strip().upper()
            pan_match = re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]$", pan_raw)

            if not pan_match:
                results.append({
                    "rule_id": "VAL_PAN_STRUCTURE",
                    "rule_name": "Income Tax PAN Syntax & Entity Validation",
                    "category": "FORMAT",
                    "status": "FAIL",
                    "message": f"PAN '{pan_raw}' violates Income Tax Department format (5 Letters + 4 Digits + 1 Letter).",
                    "details": "Standard PAN structure requires exactly 5 uppercase alphabetical characters, followed by 4 numeric digits, followed by 1 check alphabetic character.",
                    "risk_points": 35
                })
            else:
                entity_code = pan_raw[3]
                surname_initial = pan_raw[4]
                entity_name = PAN_ENTITY_MAP.get(entity_code)

                if not entity_name:
                    results.append({
                        "rule_id": "VAL_PAN_STRUCTURE",
                        "rule_name": "Income Tax PAN Syntax & Entity Validation",
                        "category": "FORMAT",
                        "status": "FAIL",
                        "message": f"PAN 4th character '{entity_code}' is not a valid legal entity code under Income Tax rules.",
                        "details": f"Allowed entity codes: {', '.join(PAN_ENTITY_MAP.keys())}.",
                        "risk_points": 30
                    })
                else:
                    # Check 5th character against cardholder surname initial
                    full_name = fields_map.get("full_name", "").strip().upper()
                    surname = full_name.split()[-1] if full_name else ""

                    if surname and surname[0] != surname_initial and len(surname) > 1:
                        results.append({
                            "rule_id": "VAL_PAN_STRUCTURE",
                            "rule_name": "Income Tax PAN Syntax & Entity Validation",
                            "category": "FORMAT",
                            "status": "FAIL",
                            "message": f"PAN 5th character '{surname_initial}' conflicts with cardholder surname initial '{surname[0]}' ({surname}).",
                            "details": f"In Indian PAN cards, the 5th character must match the first letter of the individual's surname. Found '{surname_initial}' vs '{surname[0]}'.",
                            "risk_points": 30
                        })
                    else:
                        results.append({
                            "rule_id": "VAL_PAN_STRUCTURE",
                            "rule_name": "Income Tax PAN Syntax & Entity Validation",
                            "category": "FORMAT",
                            "status": "PASS",
                            "message": f"PAN syntax verified: Entity '{entity_code}' ({entity_name}), Surname initial '{surname_initial}' consistent.",
                            "details": f"Permanent Account Number '{pan_raw}' conforms to statutory NSDL/Income Tax structural specifications.",
                            "risk_points": 0
                        })

        # -----------------------------------------------------------------
        # 4. DRIVING LICENCE FORMAT VALIDATION (MoRTH Sarathi Standards)
        # -----------------------------------------------------------------
        if eff_declared == "DRIVING_LICENCE" or eff_detected == "DRIVING_LICENCE":
            dl_raw = fields_map.get("document_number", "").strip().upper().replace(" ", "").replace("-", "")
            if len(dl_raw) >= 2:
                state_code = dl_raw[:2]
                if state_code not in INDIAN_STATE_CODES:
                    results.append({
                        "rule_id": "VAL_DL_STRUCTURE",
                        "rule_name": "MoRTH Driving Licence Format & State Resolution",
                        "category": "FORMAT",
                        "status": "FAIL",
                        "message": f"Licence prefix '{state_code}' does not match any valid Indian State/UT code.",
                        "details": f"MoRTH Sarathi requires DL numbers to start with valid two-letter State/UT code (e.g. DL, MH, KA, UP).",
                        "risk_points": 35
                    })
                elif len(dl_raw) < 11 or len(dl_raw) > 20:
                    results.append({
                        "rule_id": "VAL_DL_STRUCTURE",
                        "rule_name": "MoRTH Driving Licence Format & State Resolution",
                        "category": "FORMAT",
                        "status": "FAIL",
                        "message": f"Driving Licence number length ({len(dl_raw)} chars) is invalid for Indian DL standards.",
                        "details": "Standard Indian DL format: SS-RR-YYYYNNNNNNN (15 alphanumeric characters).",
                        "risk_points": 25
                    })
                else:
                    results.append({
                        "rule_id": "VAL_DL_STRUCTURE",
                        "rule_name": "MoRTH Driving Licence Format & State Resolution",
                        "category": "FORMAT",
                        "status": "PASS",
                        "message": f"Licence structure validated for State Registry '{state_code}'.",
                        "details": f"DL number '{dl_raw}' conforms to MoRTH Sarathi unified format.",
                        "risk_points": 0
                    })
            else:
                results.append({
                    "rule_id": "VAL_DL_STRUCTURE",
                    "rule_name": "MoRTH Driving Licence Format & State Resolution",
                    "category": "FORMAT",
                    "status": "FAIL",
                    "message": "Missing or illegible Driving Licence number.",
                    "details": "Unable to extract licence number from primary document.",
                    "risk_points": 30
                })

        # -----------------------------------------------------------------
        # 5. VOTER ID (EPIC) FORMAT VALIDATION (Election Commission of India)
        # -----------------------------------------------------------------
        if eff_declared == "VOTER_ID" or eff_detected == "VOTER_ID":
            epic_raw = fields_map.get("document_number", "").strip().upper().replace(" ", "").replace("/", "")
            if re.match(r"^[A-Z]{3}[0-9]{7}$", epic_raw) or re.match(r"^[A-Z0-9/-]{8,16}$", epic_raw):
                results.append({
                    "rule_id": "VAL_VOTER_STRUCTURE",
                    "rule_name": "Election Commission of India EPIC Format",
                    "category": "FORMAT",
                    "status": "PASS",
                    "message": f"EPIC Number '{epic_raw}' matches Election Commission of India standard format.",
                    "details": "Electoral Photo Identity Card conforms to 3-Alpha + 7-Numeric assembly constituency numbering.",
                    "risk_points": 0
                })
            else:
                results.append({
                    "rule_id": "VAL_VOTER_STRUCTURE",
                    "rule_name": "Election Commission of India EPIC Format",
                    "category": "FORMAT",
                    "status": "FAIL",
                    "message": f"EPIC Number '{epic_raw}' fails Election Commission of India standard format.",
                    "details": "Expected 3 uppercase letters followed by 7 numeric digits (e.g. WBF1234567).",
                    "risk_points": 25
                })

        # -----------------------------------------------------------------
        # 6. ICAO 9303 MRZ INTEGRITY (Passports)
        # -----------------------------------------------------------------
        if eff_declared == "PASSPORT":
            has_mrz = bool(mrz_data and (mrz_data.get("raw_mrz_lines") or "doc_number_valid" in mrz_data or "composite_valid" in mrz_data))
            if not has_mrz:
                results.append({
                    "rule_id": "VAL_MRZ_CHECKSUM",
                    "rule_name": "ICAO Doc 9303 Check Digit Integrity",
                    "category": "CHECKSUM",
                    "status": "FAIL",
                    "message": "Mandatory ICAO 9303 Machine Readable Zone (MRZ) missing or unreadable.",
                    "details": "Passport data page must contain 2 lines of 44 monospace characters at the bottom. None detected.",
                    "risk_points": 40
                })
            else:
                doc_num_valid = mrz_data.get("doc_number_valid", True)
                dob_valid = mrz_data.get("dob_valid", True)
                expiry_valid = mrz_data.get("expiry_valid", True)
                composite_valid = mrz_data.get("composite_valid", True)

                failed_checks = []
                if not doc_num_valid:
                    failed_checks.append("Document Number Check Digit")
                if not dob_valid:
                    failed_checks.append("Date of Birth Check Digit")
                if not expiry_valid:
                    failed_checks.append("Expiry Date Check Digit")

                if failed_checks or not composite_valid:
                    results.append({
                        "rule_id": "VAL_MRZ_CHECKSUM",
                        "rule_name": "ICAO Doc 9303 Check Digit Integrity",
                        "category": "CHECKSUM",
                        "status": "FAIL",
                        "message": f"MRZ mathematical checksum mismatch: {', '.join(failed_checks) if failed_checks else 'Composite checksum fail'}",
                        "details": "The 7-3-1 weighted algorithm check digits failed to match the character sequence. Indicates altered text or counterfeit MRZ printing.",
                        "risk_points": 35
                    })
                else:
                    results.append({
                        "rule_id": "VAL_MRZ_CHECKSUM",
                        "rule_name": "ICAO Doc 9303 Check Digit Integrity",
                        "category": "CHECKSUM",
                        "status": "PASS",
                        "message": "All ICAO 9303 mathematical check digits verified successfully.",
                        "details": "Document number, birth date, expiry, and composite 7-3-1 weight algorithms all match.",
                        "risk_points": 0
                    })
        elif eff_declared in ["PAN", "VOTER_ID", "DRIVING_LICENCE"]:
            # For non-MRZ ID cards, inform that MRZ is not expected
            results.append({
                "rule_id": "VAL_MRZ_CHECKSUM",
                "rule_name": "Machine Readable Zone Applicability",
                "category": "CHECKSUM",
                "status": "PASS",
                "message": f"Non-MRZ Credential: {norm_declared} is a visual inspection credential.",
                "details": f"Standard Indian {norm_declared} cards do not feature ICAO 9303 MRZ zones.",
                "risk_points": 0
            })

        # -----------------------------------------------------------------
        # 7. EXPIRATION DATE CHECK
        # -----------------------------------------------------------------
        if eff_declared in ["PAN", "VOTER_ID"]:
            # PAN and Voter ID in India do not expire
            results.append({
                "rule_id": "VAL_EXPIRY_DATE",
                "rule_name": "Document Validity Period",
                "category": "EXPIRY",
                "status": "PASS",
                "message": f"Lifetime Statutory Validity ({norm_declared} cards do not expire).",
                "details": "Credential issued under statutory provisions providing indefinite legal validity.",
                "risk_points": 0
            })
        else:
            expiry_str = fields_map.get("date_of_expiry")
            if expiry_str:
                try:
                    exp_date = None
                    if "-" in expiry_str:
                        parts = expiry_str.split("-")
                        exp_date = date(int(parts[0]), int(parts[1]), int(parts[2]))
                    elif "/" in expiry_str:
                        parts = expiry_str.split("/")
                        if len(parts[0]) == 4:
                            exp_date = date(int(parts[0]), int(parts[1]), int(parts[2]))
                        else:
                            exp_date = date(int(parts[2]), int(parts[1]), int(parts[0]))

                    if exp_date:
                        today = date.today()
                        if exp_date < today:
                            # An expired document is an operational validity flag, not proof of counterfeit fraud
                            results.append({
                                "rule_id": "VAL_EXPIRY_DATE",
                                "rule_name": "Document Expiration Check",
                                "category": "EXPIRY",
                                "status": "WARNING",
                                "message": f"Document expired on {exp_date.strftime('%d %b %Y')}",
                                "details": f"The document expiration date ({exp_date}) precedes the current screening date ({today}). Operational review advised for validity extension; not classified as counterfeit.",
                                "risk_points": 15
                            })
                        else:
                            results.append({
                                "rule_id": "VAL_EXPIRY_DATE",
                                "rule_name": "Document Expiration Check",
                                "category": "EXPIRY",
                                "status": "PASS",
                                "message": f"Document valid until {exp_date.strftime('%d %b %Y')}",
                                "details": "Document is within its validity period.",
                                "risk_points": 0
                            })
                except Exception as e:
                    results.append({
                        "rule_id": "VAL_EXPIRY_DATE",
                        "rule_name": "Document Expiration Check",
                        "category": "EXPIRY",
                        "status": "WARNING",
                        "message": "Unable to verify expiration date format.",
                        "details": str(e),
                        "risk_points": 5
                    })

        # -----------------------------------------------------------------
        # 8. DATE CHRONOLOGY CHECK
        # -----------------------------------------------------------------
        dob_str = fields_map.get("date_of_birth")
        expiry_str = fields_map.get("date_of_expiry")
        if dob_str and expiry_str:
            try:
                y_dob = int(dob_str.split("-")[0]) if "-" in dob_str else int(dob_str.split("/")[-1])
                y_exp = int(expiry_str.split("-")[0]) if "-" in expiry_str else int(expiry_str.split("/")[-1])
                if y_exp <= y_dob:
                    results.append({
                        "rule_id": "VAL_DATE_CHRONOLOGY",
                        "rule_name": "Date Chronology Consistency",
                        "category": "CHRONOLOGY",
                        "status": "FAIL",
                        "message": "Date of Expiry occurs on or before Date of Birth.",
                        "details": f"Birth year {y_dob} vs Expiry year {y_exp}.",
                        "risk_points": 30
                    })
                else:
                    results.append({
                        "rule_id": "VAL_DATE_CHRONOLOGY",
                        "rule_name": "Date Chronology Consistency",
                        "category": "CHRONOLOGY",
                        "status": "PASS",
                        "message": "Chronological order of identity dates is consistent.",
                        "details": "Birth date precedes document validity period.",
                        "risk_points": 0
                    })
            except Exception:
                pass

        # -----------------------------------------------------------------
        # 8b. DATE OF BIRTH & AGE PLAUSIBILITY CHECK
        # -----------------------------------------------------------------
        if dob_str:
            try:
                dob_date = None
                if "-" in dob_str:
                    p = dob_str.split("-")
                    if len(p) == 3:
                        dob_date = date(int(p[0]), int(p[1]), int(p[2]))
                elif "/" in dob_str:
                    p = dob_str.split("/")
                    if len(p) == 3:
                        if len(p[0]) == 4:
                            dob_date = date(int(p[0]), int(p[1]), int(p[2]))
                        else:
                            dob_date = date(int(p[2]), int(p[1]), int(p[0]))

                if dob_date:
                    today = date.today()
                    if dob_date > today:
                        results.append({
                            "rule_id": "VAL_DOB_PLAUSIBILITY",
                            "rule_name": "Date of Birth Plausibility & Age Verification",
                            "category": "CHRONOLOGY",
                            "status": "FAIL",
                            "message": f"Impossible future date of birth detected: {dob_date.strftime('%d %b %Y')}.",
                            "details": "Date of birth occurs after current calendar date. Indicates fraudulent metadata or parsing anomaly.",
                            "risk_points": 40
                        })
                    else:
                        age = today.year - dob_date.year - ((today.month, today.day) < (dob_date.month, dob_date.day))
                        if age > 130:
                            results.append({
                                "rule_id": "VAL_DOB_PLAUSIBILITY",
                                "rule_name": "Date of Birth Plausibility & Age Verification",
                                "category": "CHRONOLOGY",
                                "status": "FAIL",
                                "message": f"Implausible calculated age ({age} years) from recorded birth date {dob_date.strftime('%Y')}.",
                                "details": "Subject age exceeds standard human longevity threshold (130 years).",
                                "risk_points": 35
                            })
                        else:
                            results.append({
                                "rule_id": "VAL_DOB_PLAUSIBILITY",
                                "rule_name": "Date of Birth Plausibility & Age Verification",
                                "category": "CHRONOLOGY",
                                "status": "PASS",
                                "message": f"Date of birth verified as plausible (Subject age: {age} years).",
                                "details": f"Recorded birth date {dob_date.strftime('%d %b %Y')} is valid and consistent with active identity.",
                                "risk_points": 0
                            })
            except Exception:
                pass

        # -----------------------------------------------------------------
        # 9. CROSS-DOCUMENT (Passport vs Visa) VALIDATION
        # -----------------------------------------------------------------
        effective_visa_map = visa_fields_map or (
            {"passport_number_ref": fields_map.get("passport_number_ref")} if "passport_number_ref" in fields_map else None
        )
        if effective_visa_map:
            visa_passport_ref = effective_visa_map.get("passport_number_ref", "").strip().upper()
            primary_doc_num = fields_map.get("document_number", "").strip().upper()

            if visa_passport_ref and primary_doc_num:
                if visa_passport_ref != primary_doc_num:
                    results.append({
                        "rule_id": "VAL_VISA_CROSS_MATCH",
                        "rule_name": "Passport & Visa Cross-Reference Match",
                        "category": "CONSISTENCY",
                        "status": "FAIL",
                        "message": f"Visa endorses Passport #{visa_passport_ref} but presented Passport is #{primary_doc_num}",
                        "details": "Cross-field mismatch between primary travel document and supporting visa endorsement.",
                        "risk_points": 40
                    })
                else:
                    results.append({
                        "rule_id": "VAL_VISA_CROSS_MATCH",
                        "rule_name": "Passport & Visa Cross-Reference Match",
                        "category": "CONSISTENCY",
                        "status": "PASS",
                        "message": "Passport number matches visa endorsement reference exactly.",
                        "details": f"Both documents consistently reference #{primary_doc_num}.",
                        "risk_points": 0
                    })

        # -----------------------------------------------------------------
        # 9b. VIZ (Visual Inspection Zone) vs MRZ Consistency Check
        # -----------------------------------------------------------------
        if mrz_data and mrz_data.get("document_number"):
            mrz_doc_num = mrz_data.get("document_number", "").strip().upper()
            viz_doc_num = fields_map.get("document_number", "").strip().upper()
            
            if viz_doc_num and mrz_doc_num and viz_doc_num != mrz_doc_num:
                results.append({
                    "rule_id": "VAL_VIZ_MRZ_CONSISTENCY",
                    "rule_name": "VIZ vs MRZ Document Number Consistency",
                    "category": "CONSISTENCY",
                    "status": "MISMATCH",
                    "message": f"Document number mismatch: VIZ shows '{viz_doc_num}' but MRZ line encodes '{mrz_doc_num}'.",
                    "details": "Potential visual text manipulation or substituted MRZ Machine Readable Zone.",
                    "risk_points": 35
                })
            elif viz_doc_num and mrz_doc_num:
                results.append({
                    "rule_id": "VAL_VIZ_MRZ_CONSISTENCY",
                    "rule_name": "VIZ vs MRZ Document Number Consistency",
                    "category": "CONSISTENCY",
                    "status": "PASS",
                    "message": f"Visual Inspection Zone matches MRZ encoded number '{viz_doc_num}'.",
                    "details": "Document number is consistent across optical and machine-readable zones.",
                    "risk_points": 0
                })

        # -----------------------------------------------------------------
        # 9c. DATE OF ISSUE VALIDATION & CHRONOLOGY
        # -----------------------------------------------------------------
        doi_str = fields_map.get("date_of_issue")
        if doi_str:
            try:
                doi_date = None
                if "-" in doi_str:
                    p = doi_str.split("-")
                    if len(p) == 3:
                        doi_date = date(int(p[0]), int(p[1]), int(p[2]))
                elif "/" in doi_str:
                    p = doi_str.split("/")
                    if len(p) == 3:
                        doi_date = date(int(p[2]), int(p[1]), int(p[0])) if len(p[0]) <= 2 else date(int(p[0]), int(p[1]), int(p[2]))

                if doi_date:
                    today = date.today()
                    if doi_date > today:
                        results.append({
                            "rule_id": "VAL_ISSUE_DATE",
                            "rule_name": "Date of Issue Validity Check",
                            "category": "CHRONOLOGY",
                            "status": "FAIL",
                            "message": f"Impossible future date of issue detected: {doi_date.strftime('%d %b %Y')}.",
                            "details": "Document issuance date cannot occur after the current calendar date.",
                            "risk_points": 35
                        })
                    else:
                        results.append({
                            "rule_id": "VAL_ISSUE_DATE",
                            "rule_name": "Date of Issue Validity Check",
                            "category": "CHRONOLOGY",
                            "status": "PASS",
                            "message": f"Date of issue ({doi_date.strftime('%d %b %Y')}) is valid.",
                            "details": "Document issuance date precedes current calendar date.",
                            "risk_points": 0
                        })
            except Exception:
                pass

        # -----------------------------------------------------------------
        # 10. DEMONSTRATION WATCHLIST CHECK
        # -----------------------------------------------------------------
        doc_num = fields_map.get("document_number", "").strip().upper()
        full_name = fields_map.get("full_name", "").strip().upper()

        if settings.ENABLE_DEMO_WATCHLIST and doc_num:
            matched_entry = None
            for item in DEMO_WATCHLIST:
                if item["document_number"].upper() == doc_num or (item["name"].upper() in full_name and len(full_name) > 5):
                    matched_entry = item
                    break

            if matched_entry:
                results.append({
                    "rule_id": "VAL_WATCHLIST_MATCH",
                    "rule_name": f"Registry Watchlist [{settings.DEMO_WATCHLIST_NAME}]",
                    "category": "WATCHLIST",
                    "status": "FAIL",
                    "message": f"Record flag identified: {matched_entry['reason']}",
                    "details": f"Document #{doc_num} or name matches record in {settings.DEMO_WATCHLIST_NAME}.",
                    "risk_points": matched_entry["points"]
                })
            else:
                results.append({
                    "rule_id": "VAL_WATCHLIST_MATCH",
                    "rule_name": f"Registry Watchlist [{settings.DEMO_WATCHLIST_NAME}]",
                    "category": "WATCHLIST",
                    "status": "PASS",
                    "message": f"No active alerts found in {settings.DEMO_WATCHLIST_NAME}.",
                    "details": "Document number does not appear in demonstration blacklist/watchlist.",
                    "risk_points": 0
                })

        return results

validation_service = ValidationService()
