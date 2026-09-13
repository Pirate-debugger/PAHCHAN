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
        seen_factors = set()
        total_points = 0

        # 1. Forensic Contributions
        for f in forensics:
            pts = f.get("risk_contribution", 0)
            title = f.get("title", "Forensic Anomaly")
            category = f.get("category", "TAMPERING")
            factor_key = f"{category}:{title}"
            if pts > 0 and factor_key not in seen_factors:
                seen_factors.add(factor_key)
                total_points += pts
                contributing_factors.append({
                    "title": title,
                    "category": category,
                    "points": pts,
                    "severity": f.get("severity", "HIGH")
                })

        # 2. Validation Failures (Gateway outages / unverifiable status contribute 0 risk)
        for v in validations:
            pts = v.get("risk_points", 0)
            category = v.get("category", "VALIDATION")
            # If external provider is unavailable or unconfigured, do not treat as fraud
            if category == "GATEWAY" and v.get("status") in ["WARNING", "NOT_APPLICABLE", "INCONCLUSIVE"]:
                pts = 0

            title = v.get("rule_name", "Validation Rule")
            factor_key = f"{category}:{title}"
            if pts > 0 and factor_key not in seen_factors:
                seen_factors.add(factor_key)
                total_points += pts
                contributing_factors.append({
                    "title": title,
                    "category": category,
                    "points": pts,
                    "severity": "HIGH" if pts >= 30 else "MEDIUM"
                })

        # 3. Face Verification Signal
        if face_result:
            pts = face_result.get("risk_contribution", 0)
            outcome = face_result.get("outcome", "REVIEW")
            # Quality rejection, unsupplied photo, or multiple subjects must NEVER contribute fraud risk points
            if outcome in ["UNABLE_TO_ASSESS", "LOW_QUALITY", "NO_FACE", "MULTIPLE_FACES", "NOT_PROVIDED"]:
                pts = 0

            title = f"Face Comparison Signal: {outcome.replace('_', ' ')}"
            factor_key = f"FACE_VERIFICATION:{title}"
            if pts > 0 and factor_key not in seen_factors:
                seen_factors.add(factor_key)
                total_points += pts
                contributing_factors.append({
                    "title": title,
                    "category": "FACE_VERIFICATION",
                    "points": pts,
                    "severity": "HIGH" if pts >= 30 else "MEDIUM"
                })

        # 4. Identity Consistency Signal
        if identity_result:
            pts = identity_result.get("risk_contribution", 0)
            title = identity_result.get("title", "Identity Duplication Signal")
            factor_key = f"IDENTITY_CONSISTENCY:{title}"
            if pts > 0 and factor_key not in seen_factors:
                seen_factors.add(factor_key)
                total_points += pts
                contributing_factors.append({
                    "title": title,
                    "category": "IDENTITY_CONSISTENCY",
                    "points": pts,
                    "severity": "CRITICAL" if pts >= 40 else "HIGH"
                })

        # Clamp score strictly between 0 and 100
        score = min(100, max(0, total_points))

        # Check if quality failure suggests requesting a clearer document
        needs_clearer_doc = (
            any(f.get("recommended_action") == "REQUEST_CLEARER_DOCUMENT" for f in forensics) or
            (face_result and face_result.get("outcome") in ["LOW_QUALITY", "MULTIPLE_FACES"])
        )

        has_operational_warning = any(v.get("category") == "EXPIRY" and v.get("status") == "WARNING" for v in validations)

        # Categorize into bands based on configured thresholds
        if score <= settings.RISK_THRESHOLD_LOW and not has_operational_warning:
            risk_level = "LOW"
            recommended_action = "REQUEST_CLEARER_DOCUMENT" if needs_clearer_doc else "STANDARD_REVIEW"
            primary_concern = "Image quality degraded; review advised" if needs_clearer_doc else "No significant concerns identified"
            recommendation = "Request clearer capture or continue with standard verification." if needs_clearer_doc else "Continue with standard verification."
        elif score <= settings.RISK_THRESHOLD_REVIEW or has_operational_warning:
            risk_level = "REVIEW"
            recommended_action = "SECONDARY_REVIEW"
            count = len(contributing_factors)
            primary_concern = "Document validity period expired; operational review advised" if has_operational_warning else f"{count} item{'s' if count > 1 else ''} require{'s' if count == 1 else ''} officer attention"
            recommendation = "Check for validity extension or renewal; not classified as counterfeit." if has_operational_warning else "Review highlighted concerns before completing screening."
        elif score <= settings.RISK_THRESHOLD_HIGH:
            risk_level = "HIGH"
            recommended_action = "SECONDARY_REVIEW"
            count = len(contributing_factors)
            primary_concern = f"{count} significant concern{'s' if count > 1 else ''} identified"
            recommendation = "Refer the case for secondary verification."
        else:
            risk_level = "CRITICAL"
            recommended_action = "ESCALATE"
            count = len(contributing_factors)
            primary_concern = f"Critical anomalies detected ({count} flagged factor{'s' if count > 1 else ''})"
            recommendation = "Refer for supervisor review and secondary verification."

        return {
            "total_score": score,
            "risk_level": risk_level,
            "recommended_action": recommended_action,
            "primary_concern": primary_concern,
            "recommendation": recommendation,
            "contributing_factors": contributing_factors,
            "prototype_disclaimer": "These prototype thresholds are not official government standards."
        }

risk_service = RiskService()
