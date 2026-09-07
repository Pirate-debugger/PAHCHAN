import hashlib
import json
from datetime import datetime, timezone
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.screening import ScreeningSession, ScreeningDecision

class ReportService:
    @staticmethod
    def generate_report_data(db: Session, session: ScreeningSession) -> Dict[str, Any]:
        """
        Assemble comprehensive official screening report.
        """
        latest_decision = session.decisions[-1] if session.decisions else None

        report_payload = {
            "report_id": f"REP-{session.id}",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "organization": "MINISTRY OF HOME AFFAIRS / SASHASTRA SEEMA BAL (SSB)",
            "unit": "Police II Division — Border Checkpoint Screening Unit",
            "case_id": session.id,
            "screening_date": session.created_at.isoformat(),
            "document_type": session.document_type,
            "session_status": session.status,
            "is_synthetic_demonstration": session.is_demo_scenario,
            "extracted_identity": {
                f.field_key: {
                    "label": f.field_label,
                    "value": f.field_value,
                    "confidence": f.confidence,
                    "is_edited": f.is_edited
                } for f in session.extracted_fields
            },
            "validations": [
                {
                    "rule_id": v.rule_id,
                    "rule_name": v.rule_name,
                    "status": v.status,
                    "message": v.message,
                    "points": v.risk_points
                } for v in session.validations
            ],
            "forensic_findings": [
                {
                    "id": f.id,
                    "title": f.title,
                    "category": f.category,
                    "severity": f.severity,
                    "explanation": f.explanation,
                    "risk_contribution": f.risk_contribution,
                    "evidence_url": f.evidence_preview_path,
                    "heatmap_url": f.heatmap_overlay_path
                } for f in session.forensic_findings
            ],
            "face_verification": {
                "outcome": session.face_verification.outcome if session.face_verification else "NOT_PERFORMED",
                "similarity_score": session.face_verification.similarity_score if session.face_verification else 0.0,
                "explanation": session.face_verification.explanation if session.face_verification else "No presented photograph compared.",
                "recommendation": session.face_verification.recommendation if session.face_verification else ""
            } if session.face_verification else None,
            "risk_assessment": {
                "total_score": session.risk_assessment.total_score if session.risk_assessment else 0,
                "risk_level": session.risk_assessment.risk_level if session.risk_assessment else "LOW",
                "primary_concern": session.risk_assessment.primary_concern if session.risk_assessment else "None",
                "recommendation": session.risk_assessment.recommendation if session.risk_assessment else "Continue standard verification."
            } if session.risk_assessment else None,
            "officer_decision": {
                "decision": latest_decision.decision if latest_decision else "PENDING",
                "officer_name": latest_decision.officer_name if latest_decision else "Pending Review",
                "officer_id": latest_decision.officer_id if latest_decision else "N/A",
                "notes": latest_decision.notes if latest_decision else None,
                "decided_at": latest_decision.decided_at.isoformat() if latest_decision else None
            } if latest_decision else None,
            "audit_trail_summary": [
                {
                    "timestamp": a.timestamp.isoformat(),
                    "actor": a.actor,
                    "action": a.action,
                    "details": a.details
                } for a in session.audit_logs
            ]
        }

        # Generate cryptographic audit hash for verifiable chain of custody
        serialized = json.dumps(report_payload, sort_keys=True)
        audit_hash = hashlib.sha256(serialized.encode('utf-8')).hexdigest()
        report_payload["security_seal"] = {
            "audit_hash": f"SHA256:{audit_hash}",
            "verification_status": "AUTHENTICATED_LOCAL_AUDIT_RECORD",
            "prototype_disclaimer": "PROTOTYPE DEMONSTRATION SCREENING REPORT — NOT AN OFFICIAL GOVERNMENT DOCUMENT"
        }

        return report_payload

report_service = ReportService()
