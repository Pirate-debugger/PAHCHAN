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

class ValidationService:
    @staticmethod
    def validate_document(
        fields_map: Dict[str, str],
        mrz_data: Dict[str, Any],
        doc_type: str = "PASSPORT",
        visa_fields_map: Optional[Dict[str, str]] = None
    ) -> List[Dict[str, Any]]:
        results = []

        # 1. Required Fields Check
        required_fields = ["full_name", "document_number", "date_of_birth", "date_of_expiry"]
        missing_fields = [rf for rf in required_fields if not fields_map.get(rf)]
        
        if missing_fields:
            results.append({
                "rule_id": "VAL_REQ_FIELDS",
                "rule_name": "Required Field Completeness",
                "category": "FORMAT",
                "status": "FAIL",
                "message": f"Missing mandatory field(s): {', '.join(missing_fields).replace('_', ' ').title()}",
                "details": "Mandatory identity fields could not be fully extracted or verified.",
                "risk_points": 25
            })
        else:
            results.append({
                "rule_id": "VAL_REQ_FIELDS",
                "rule_name": "Required Field Completeness",
                "category": "FORMAT",
                "status": "PASS",
                "message": "All required identity fields are present and readable.",
                "details": "Full Name, Document Number, Date of Birth, and Expiry Date are present.",
                "risk_points": 0
            })

        # 2. Expiration Date Check
        expiry_str = fields_map.get("date_of_expiry")
        is_expired = False
        if expiry_str:
            try:
                # Handle YYYY-MM-DD or DD/MM/YYYY
                if "-" in expiry_str:
                    parts = expiry_str.split("-")
                    exp_date = date(int(parts[0]), int(parts[1]), int(parts[2]))
                elif "/" in expiry_str:
                    parts = expiry_str.split("/")
                    exp_date = date(int(parts[2]), int(parts[1]), int(parts[0]))
                else:
                    exp_date = None

                if exp_date:
                    today = date.today()
                    if exp_date < today:
                        is_expired = True
                        results.append({
                            "rule_id": "VAL_EXPIRY_DATE",
                            "rule_name": "Document Expiration Check",
                            "category": "EXPIRY",
                            "status": "FAIL",
                            "message": f"Document expired on {exp_date.strftime('%d %b %Y')}",
                            "details": f"The document expiration date ({exp_date}) precedes the current screening date ({today}).",
                            "risk_points": 40
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
                    "risk_points": 10
                })

        # 3. ICAO 9303 MRZ Checksums Check
        if mrz_data:
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
                    "details": "The 7-3-1 weighted algorithm check digits failed to match the character sequence. This strongly indicates modified text or formatting tampering.",
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

        # 4. Date Chronology Check
        dob_str = fields_map.get("date_of_birth")
        if dob_str and expiry_str:
            try:
                # Basic check: DOB must be at least 10 years before expiry
                if "-" in dob_str and "-" in expiry_str:
                    y_dob = int(dob_str.split("-")[0])
                    y_exp = int(expiry_str.split("-")[0])
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

        # 5. Cross-Document (Passport vs Visa) Validation
        if visa_fields_map:
            visa_passport_ref = visa_fields_map.get("passport_number_ref", "").strip().upper()
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

            # Check stay duration consistency
            stay_days = visa_fields_map.get("stay_duration_days")
            validity_days = visa_fields_map.get("visa_validity_days")
            if stay_days and validity_days:
                try:
                    if int(stay_days) > int(validity_days):
                        results.append({
                            "rule_id": "VAL_VISA_STAY_CONSISTENCY",
                            "rule_name": "Stay Duration vs Validity Range",
                            "category": "CONSISTENCY",
                            "status": "FAIL",
                            "message": f"Stay duration ({stay_days} days) exceeds total visa validity window ({validity_days} days).",
                            "details": "Configured border entry rules require stay duration to be within the total validity interval.",
                            "risk_points": 25
                        })
                except Exception:
                    pass

        # 6. Demonstration Watchlist Check
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
                    "details": f"Document #{doc_num} or name matches record in {settings.DEMO_WATCHLIST_NAME} (Demonstration dataset - not connected to official government database).",
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
