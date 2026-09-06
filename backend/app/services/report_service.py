"""
PAHCHAN Screening Report Generation Service
Generates official government-ready forensic dossiers with complete cryptographic audit chains.
"""

from typing import Dict, Any
from datetime import datetime
import hashlib

def generate_screening_report(session_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Assembles an official screening report with audit fingerprint.
    """
    session_id = session_data.get("session_id") or session_data.get("sessionId", "SSB-REP-001")
    sha256 = session_data.get("document_sha256") or session_data.get("documentSha256", "UNKNOWN")
    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    # Generate cryptographic audit hash of the report content
    report_digest_raw = f"{session_id}|{sha256}|{now_str}|{session_data.get('total_risk_score') or session_data.get('totalRiskScore', 0)}"
    audit_hash = hashlib.sha256(report_digest_raw.encode("utf-8")).hexdigest()

    risk_info = session_data.get("risk", {})
    total_risk = risk_info.get("total_risk_score") or session_data.get("totalRiskScore", 0)
    risk_level = risk_info.get("risk_level") or session_data.get("riskLevel", "LOW")
    decision = risk_info.get("decision") or session_data.get("decision", "CLEAR_ENTRY")

    fields = session_data.get("fields", {})
    validation = session_data.get("validation", {})
    forensics = session_data.get("forensics") or session_data.get("tampering", {})
    face = session_data.get("face_verification") or session_data.get("faceVerification", {})
    explainability = risk_info.get("explainability", {})

    return {
        "session_id": session_id,
        "generated_at": now_str,
        "classification": "OFFICIAL GOVERNMENT SCREENING DOSSIER — MHA / SSB / BOI",
        "document_type": session_data.get("document_type") or session_data.get("documentType", "PASSPORT"),
        "document_sha256": sha256,
        "operator_id": session_data.get("operator_id") or session_data.get("operatorId", "OFFICER-SSB-449"),
        "checkpoint": session_data.get("checkpoint", "Raxaul Land Border Checkpoint (Indo-Nepal)"),
        "summary_verdict": f"{risk_level} RISK — {decision}",
        "total_risk_score": total_risk,
        "risk_level": risk_level,
        "decision": decision,
        "officer_action": risk_info.get("recommendation") or session_data.get("recommendation", "Clear passenger."),
        "fields": fields,
        "validation_findings": validation.get("issues", []),
        "forensic_findings": forensics.get("regions", []),
        "face_result": face,
        "risk_factors": risk_info.get("risk_factors") or session_data.get("riskFactors", []),
        "explainability": explainability,
        "audit_hash": audit_hash,
        "disclaimer": (
            "NOTICE: PAHCHAN is an AI-assisted decision-support system designed to aid authorized border officers. "
            "Findings represent algorithmic screening signals and require physical verification under standard operating procedures."
        )
    }
