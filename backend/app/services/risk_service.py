"""
PAHCHAN Multi-Signal Risk Engine
Computes transparent, explainable, additive risk scores (0 to 100) based on forensic, biometric, and validation findings.
All weights are configurable and auditable.
"""

from typing import Dict, Any, List, Optional
from app.core.config import settings

def calculate_screening_risk(
    photo_replaced: bool = False,
    text_manipulated: bool = False,
    stamp_forged: bool = False,
    face_mismatch: bool = False,
    face_skipped: bool = False,
    is_expired: bool = False,
    crossfield_mismatch: bool = False,
    watchlist_hit: bool = False,
    metadata_tampered: bool = False,
    mrz_pass: bool = True,
    custom_weights: Optional[Dict[str, int]] = None
) -> Dict[str, Any]:
    """
    Computes explainable additive risk score from 0 to 100.
    Produces risk factors ledger with evidence references.
    """
    weights = settings.DEFAULT_RISK_WEIGHTS.copy()
    if custom_weights:
        weights.update(custom_weights)

    total_score = 0
    factors: List[Dict[str, Any]] = []

    # 1. Photo Integrity / Splicing
    if photo_replaced:
        pts = weights.get("PHOTO_TAMPERING", 30)
        total_score += pts
        factors.append({
            "id": "rf-photo-tamper",
            "category": "PHOTO_TAMPERING",
            "title": "Photo Replacement / Splicing Detected",
            "points": pts,
            "severity": "critical",
            "description": "Error Level Analysis & Sobel edge gradient detected compression mismatch on portrait box.",
            "evidence": "Quantization matrix divergence > 4.2x | Splicing edge discontinuity."
        })

    # 2. Text Manipulation
    if text_manipulated:
        pts = weights.get("TEXT_TAMPERING", 25)
        total_score += pts
        factors.append({
            "id": "rf-text-tamper",
            "category": "TEXT_TAMPERING",
            "title": "Text Manipulation in Critical Fields",
            "points": pts,
            "severity": "critical",
            "description": "Font rasterization irregularity & baseline offset detected in Visual Inspection Zone.",
            "evidence": "Font weight variance > 0.65 | Compression halo detected around numeric characters."
        })

    # 3. Stamp / Seal Counterfeit
    if stamp_forged:
        pts = weights.get("STAMP_TAMPERING", 25)
        total_score += pts
        factors.append({
            "id": "rf-stamp-tamper",
            "category": "STAMP_TAMPERING",
            "title": "Counterfeit / Altered Immigration Stamp",
            "points": pts,
            "severity": "critical",
            "description": "Template structural similarity (SSIM) failed official checkpoint baseline.",
            "evidence": "SSIM similarity < 0.50 | Security guilloche pattern broken."
        })

    # 4. Face Verification Mismatch or Skipped
    if face_mismatch:
        pts = weights.get("FACE_MISMATCH", 45)
        total_score += pts
        factors.append({
            "id": "rf-face-mismatch",
            "category": "FACE_BIOMETRIC",
            "title": "Facial Biometric Impersonation Alert",
            "points": pts,
            "severity": "critical",
            "description": "Live checkpoint presenter facial embedding distance failed required threshold.",
            "evidence": "HOG embedding cosine similarity < threshold | Face mismatch."
        })
    elif face_skipped:
        pts = weights.get("FACE_VERIFICATION_SKIPPED", 35)
        total_score += pts
        factors.append({
            "id": "rf-face-skipped",
            "category": "FACE_BIOMETRIC",
            "title": "Live Biometric Verification Pending",
            "points": pts,
            "severity": "medium",
            "description": "No live camera presenter capture was provided during screening. Identity match could not be confirmed.",
            "evidence": "Live presenter capture omitted (status: NO_LIVE_CAPTURE). Mandatory referral to Secondary Inspection."
        })

    # 5. Expired Travel Document
    if is_expired:
        pts = weights.get("EXPIRED_DOCUMENT", 35)
        total_score += pts
        factors.append({
            "id": "rf-expired-doc",
            "category": "VALIDATION",
            "title": "Expired Travel Document",
            "points": pts,
            "severity": "critical",
            "description": "Document validity period has expired.",
            "evidence": "Expiry date precedes current checkpoint timestamp."
        })

    # 6. Cross-Document Conflict
    if crossfield_mismatch:
        pts = weights.get("CROSSFIELD_MISMATCH", 40)
        total_score += pts
        factors.append({
            "id": "rf-crossfield-mismatch",
            "category": "CROSS_FIELD",
            "title": "Cross-Field Identity Inconsistency",
            "points": pts,
            "severity": "critical",
            "description": "Identity data conflicts between Passport, Visa endorsement, and MRZ.",
            "evidence": "Mismatch in name, document number, or date of birth across travel documents."
        })

    # 7. Intelligence Watchlist Hit
    if watchlist_hit:
        pts = weights.get("WATCHLIST_HIT", 50)
        total_score += pts
        factors.append({
            "id": "rf-watchlist-hit",
            "category": "WATCHLIST",
            "title": "Intelligence Watchlist Interception Flag",
            "points": pts,
            "severity": "critical",
            "description": "Document holder matched active intelligence bulletin.",
            "evidence": "Active bulletin alert on document record."
        })

    # 8. Digital Editing Metadata Footprint
    if metadata_tampered:
        pts = weights.get("METADATA_TAMPERING", 15)
        total_score += pts
        factors.append({
            "id": "rf-metadata-tamper",
            "category": "METADATA",
            "title": "Digital Editing Software Signature Detected",
            "points": pts,
            "severity": "medium",
            "description": "Image metadata contains Adobe Photoshop / GIMP modification footprint.",
            "evidence": "XMP history contains raster edit actions."
        })

    # 9. MRZ Checksum Failure
    if not mrz_pass:
        pts = weights.get("MRZ_CHECKSUM_FAILURE", 20)
        total_score += pts
        factors.append({
            "id": "rf-mrz-checksum",
            "category": "OCR",
            "title": "ICAO MRZ Checksum Failure",
            "points": pts,
            "severity": "high",
            "description": "Calculated 7-3-1 modulo 10 checksum does not match check digits.",
            "evidence": "Cryptographic check digit verification failed."
        })

    # Clamp total score between 0 and 100
    clamped_score = min(100, max(0, total_score))

    # Tiers classification based on config
    if clamped_score <= settings.RISK_LOW_CEILING:
        risk_level = "LOW"
        decision = "CLEAR_ENTRY"
        recommendation = "Document verified authentic across all signals. Clear passenger for standard checkpoint entry."
    elif clamped_score <= settings.RISK_MEDIUM_CEILING:
        risk_level = "MEDIUM"
        decision = "SECONDARY_INSPECTION"
        recommendation = "Elevated risk signals detected. Refer passenger to Secondary Inspection Booth for physical forensics."
    else:
        risk_level = "CRITICAL"
        decision = "DETAIN_ALERT"
        recommendation = "CRITICAL RISK ALERT: Multiple tampering / impersonation signals confirmed. Escalate for senior officer review."

    return {
        "total_risk_score": clamped_score,
        "risk_level": risk_level,
        "decision": decision,
        "recommendation": recommendation,
        "risk_factors": factors,
        "weights_applied": weights
    }
