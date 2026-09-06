"""
PAHCHAN Explainability & Decision Support Service
Transforms complex multi-signal forensic detections into structured, grounded explanations.
Answers:
1. What happened?
2. Why is it risky?
3. What evidence supports it?
4. What should the officer do?
"""

from typing import Dict, Any, List

def generate_explainability_dossier(
    risk_result: Dict[str, Any],
    validation_result: Dict[str, Any],
    forensic_result: Dict[str, Any],
    face_result: Dict[str, Any],
    cross_doc_result: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Synthesizes a 4-part grounded explainability breakdown for screening officers.
    """
    score = risk_result.get("total_risk_score", 0)
    risk_level = risk_result.get("risk_level", "LOW")
    factors = risk_result.get("risk_factors", [])
    
    # 1. What Happened?
    if score <= 29:
        what_happened = (
            "Screening completed with no anomalies. Document visual security substrate, "
            "ICAO MRZ check digits, and facial biometric similarity meet all operational standards."
        )
    elif score <= 69:
        what_happened = (
            f"Screening identified {len(factors)} moderate risk indicator(s). Visual or metadata "
            "inconsistencies were detected that require officer clarification before clearance."
        )
    else:
        what_happened = (
            f"Screening triggered {len(factors)} critical alert(s) across physical forensics, "
            "biometric comparison, and/or cross-document credentials."
        )

    # 2. Why is it risky?
    why_is_it_risky: List[str] = []
    for f in factors:
        category = f.get("category", "")
        title = f.get("title", "")
        if category == "PHOTO_TAMPERING":
            why_is_it_risky.append("Portrait splicing indicates possible unauthorized credential modification.")
        elif category == "FACE_BIOMETRIC":
            why_is_it_risky.append("Biometric distance indicates the presenter may not be the legitimate document bearer.")
        elif category == "CROSS_FIELD":
            why_is_it_risky.append("Identity discrepancies across documents may indicate conflicting or fraudulent travel papers.")
        elif category == "VALIDATION":
            why_is_it_risky.append("Expired or syntactically invalid documents are not authorized for border crossing.")
        elif category == "STAMP_TAMPERING":
            why_is_it_risky.append("Counterfeit endorsement stamps bypass authorized immigration controls.")
        elif category == "METADATA":
            why_is_it_risky.append("Digital image editor footprints suggest pre-processing before presentation.")
        else:
            why_is_it_risky.append(f"{title}: Violates standard document integrity criteria.")

    if not why_is_it_risky:
        why_is_it_risky.append("No active risk factors identified. Document conforms to baseline security metrics.")

    # 3. What evidence supports it?
    supporting_evidence: List[str] = []
    for f in factors:
        evidence = f.get("evidence", "")
        if evidence:
            supporting_evidence.append(f"{f.get('title')}: {evidence}")
            
    # Include ELA and MRZ details if notable
    if forensic_result.get("ela_variance", 0) > 400:
        supporting_evidence.append(f"Forensic ELA Error Level Variance: {forensic_result.get('ela_variance')} (Elevated)")
    if not validation_result.get("mrz_checksum_pass", True):
        for issue in validation_result.get("issues", []):
            supporting_evidence.append(f"Validation Check: {issue}")
    if not face_result.get("match", True):
        supporting_evidence.append(f"Biometric Match: {face_result.get('similarity')}% similarity (Threshold {face_result.get('threshold')}%)")
    for mismatch in cross_doc_result.get("mismatches", []):
        supporting_evidence.append(f"Cross-Document Mismatch: {mismatch.get('description')}")

    if not supporting_evidence:
        supporting_evidence.append("All cryptographic check digits (Doc No, DOB, Expiry, Composite) verified. Sobel boundary continuous.")

    # 4. What should the officer do?
    if score <= 29:
        officer_recommendation = "Continue screening. Clear passenger for standard entry and stamp passport."
    elif score <= 69:
        officer_recommendation = (
            "Refer document and passenger to Secondary Inspection Booth. "
            "Perform manual physical inspection under ultraviolet (UV) and oblique lighting, "
            "and verify credentials against official national immigration database."
        )
    else:
        officer_recommendation = (
            "ESCALATE IMMEDIATELY: Notify Shift Commander / Senior Screening Officer. "
            "Re-capture passenger facial image in isolated capture booth, retain physical document "
            "under chain-of-custody, and initiate secondary biometric verification."
        )

    return {
        "what_happened": what_happened,
        "why_is_it_risky": why_is_it_risky,
        "supporting_evidence": supporting_evidence,
        "officer_recommendation": officer_recommendation
    }
