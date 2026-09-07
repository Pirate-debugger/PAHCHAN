from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.screening import ExtractedField, ScreeningSession

# Demonstration Historical Identity Dataset for cross-screening multi-identity checks
DEMO_HISTORICAL_IDENTITIES = [
    {
        "document_number": "P9182374",
        "full_name": "ANIL KUMAR",
        "historical_case": "PH-0988",
        "historical_name": "ANIL VERMA",
        "note": "Same passport number previously recorded under different surname in demonstration database."
    },
    {
        "document_number": "J8392018",
        "full_name": "VIKRAM SINGHANIA",
        "historical_case": "PH-0912",
        "historical_name": "VIKRAM JOSHI",
        "note": "Portrait biometrics matched across two distinct registered identity names."
    }
]

class IdentityService:
    @staticmethod
    def check_identity_consistency(
        db: Session,
        current_session_id: str,
        doc_number: str,
        full_name: str,
        force_multi_identity: bool = False
    ) -> Optional[Dict[str, Any]]:
        """
        Check for duplicate document number or identity conflicts across screening records.
        """
        doc_number = (doc_number or "").strip().upper()
        full_name = (full_name or "").strip().upper()

        # 1. Forced demo scenario check
        if force_multi_identity:
            return {
                "signal_type": "MULTIPLE_IDENTITY_SIGNAL",
                "title": "Possible Identity Duplication Signal",
                "explanation": "Extracted document portrait matches an existing screening record registered under an alternate name ('AMIT PATEL', Case PH-0941) in the Demonstration Dataset.",
                "details": "Biometric match confidence 94% with divergent identity metadata. Identity consistency review required.",
                "historical_case": "PH-0941",
                "dataset_source": "Demonstration Dataset (Historical Screenings)",
                "risk_contribution": 45
            }

        # 2. Check demonstration registry
        for demo in DEMO_HISTORICAL_IDENTITIES:
            if demo["document_number"] == doc_number and doc_number != "":
                return {
                    "signal_type": "DUPLICATE_DOCUMENT_NUMBER",
                    "title": "Duplicate Document Number Signal",
                    "explanation": f"Document #{doc_number} was previously recorded in screening {demo['historical_case']} with identity name '{demo['historical_name']}', which conflicts with current name '{full_name}'.",
                    "details": demo["note"],
                    "historical_case": demo["historical_case"],
                    "dataset_source": "Demonstration Dataset (Historical Screenings)",
                    "risk_contribution": 40
                }

        # 3. Check actual local database screening sessions
        if doc_number:
            past_fields = db.query(ExtractedField).filter(
                ExtractedField.field_key == "document_number",
                ExtractedField.field_value == doc_number,
                ExtractedField.session_id != current_session_id
            ).all()

            for past_field in past_fields:
                # Find the name in that session
                past_name_field = db.query(ExtractedField).filter(
                    ExtractedField.session_id == past_field.session_id,
                    ExtractedField.field_key == "full_name"
                ).first()
                if past_name_field and past_name_field.field_value and full_name:
                    if past_name_field.field_value.strip().upper() != full_name:
                        return {
                            "signal_type": "CROSS_SESSION_CONFLICT",
                            "title": "Cross-Session Identity Discrepancy",
                            "explanation": f"Document #{doc_number} was screened in Case {past_field.session_id} under name '{past_name_field.field_value}'.",
                            "details": "Identity consistency review required. Not an automatic fraud determination.",
                            "historical_case": past_field.session_id,
                            "dataset_source": "Local System Screening Registry",
                            "risk_contribution": 35
                        }

        return None

identity_service = IdentityService()
