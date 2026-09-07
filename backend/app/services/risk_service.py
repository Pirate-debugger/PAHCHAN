import json
from typing import Dict, Any, List, Optional
from app.core.config import settings

class RiskService:
    @staticmethod
    def calculate_risk(
        validations: List[Dict[str, Any]],
        forensics: List[Dict[str, Any]],
        face_result: Optional[Dict[str, Any]] = None,
        identity_result: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Transparent, explainable risk assessment aggregating all findings.
        """
        contributing_factors = []
        total_points = 0

        # 1. Forensic Contributions
        for f in forensics:
            pts = f.get("risk_contribution", 0)
            if pts > 0:
                total_points += pts
                contributing_factors.append({
                    "title": f.get("title", "Forensic Anomaly"),
                    "category": f.get("category", "TAMPERING"),
                    "points": pts,
                    "severity": f.get("severity", "HIGH")
                })

        # 2. Validation Failures
        for v in validations:
            pts = v.get("risk_points", 0)
            if pts > 0:
                total_points += pts
                contributing_factors.append({
                    "title": v.get("rule_name", "Validation Rule"),
                    "category": v.get("category", "VALIDATION"),
                    "points": pts,
                    "severity": "HIGH" if pts >= 30 else "MEDIUM"
                })

        # 3. Face Verification Signal
        if face_result:
            pts = face_result.get("risk_contribution", 0)
            if pts > 0:
                total_points += pts
                contributing_factors.append({
                    "title": f"Face Comparison Signal: {face_result.get('outcome', 'REVIEW').replace('_', ' ')}",
                    "category": "FACE_VERIFICATION",
                    "points": pts,
                    "severity": "HIGH" if pts >= 30 else "MEDIUM"
                })

        # 4. Identity Consistency Signal
        if identity_result:
            pts = identity_result.get("risk_contribution", 0)
            if pts > 0:
                total_points += pts
                contributing_factors.append({
                    "title": identity_result.get("title", "Identity Duplication Signal"),
                    "category": "IDENTITY_CONSISTENCY",
                    "points": pts,
                    "severity": "CRITICAL" if pts >= 40 else "HIGH"
                })

        # Clamp score to 100 max
        score = min(100, max(0, total_points))

        # Categorize into bands based on configured thresholds
        if score <= settings.RISK_THRESHOLD_LOW:
            risk_level = "LOW"
            primary_concern = "No significant concerns identified"
            recommendation = "Continue with standard verification."
        elif score <= settings.RISK_THRESHOLD_REVIEW:
            risk_level = "REVIEW"
            count = len(contributing_factors)
            primary_concern = f"{count} item{'s' if count > 1 else ''} require{'s' if count == 1 else ''} officer attention"
            recommendation = "Review highlighted concerns before completing screening."
        elif score <= settings.RISK_THRESHOLD_HIGH:
            risk_level = "HIGH"
            count = len(contributing_factors)
            primary_concern = f"{count} significant concern{'s' if count > 1 else ''} identified"
            recommendation = "Refer the case for secondary verification."
        else:
            risk_level = "CRITICAL"
            count = len(contributing_factors)
            primary_concern = f"Critical anomalies detected ({count} flagged factor{'s' if count > 1 else ''})"
            recommendation = "Refer for supervisor review and secondary verification."

        return {
            "total_score": score,
            "risk_level": risk_level,
            "primary_concern": primary_concern,
            "recommendation": recommendation,
            "contributing_factors": contributing_factors
        }

risk_service = RiskService()
