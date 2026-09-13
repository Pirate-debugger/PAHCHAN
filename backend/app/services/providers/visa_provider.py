import os
import re
import uuid
from typing import Dict, Any, List
from datetime import datetime, timezone
from app.services.providers.base_provider import VerificationProvider, ProviderStatus, ProviderVerificationResult

class VisaVerificationProvider(VerificationProvider):
    """
    Authoritative Immigration & Visa Endorsement Gateway Adapter.
    Validates Visa credentials against immigration visa databases (IVFRT / Foreigners Division).
    """

    @property
    def provider_id(self) -> str:
        return "visa_gateway"

    @property
    def provider_name(self) -> str:
        return "Immigration & Visa Registry (IVFRT Gateway)"

    @property
    def supported_document_types(self) -> List[str]:
        return ["VISA"]

    def get_status(self) -> ProviderStatus:
        return ProviderStatus(
            provider_id=self.provider_id,
            provider_name=self.provider_name,
            is_configured=True,
            is_sandbox=True,
            status="SANDBOX",
            capabilities=["VISA_VALIDATION", "PASS_LINKAGE_CHECK", "ENTRY_STATUS_QUERY"],
            environment="SANDBOX",
            details="Mock demonstration adapter. Live connectivity requires Bureau of Immigration / IVFRT whitelisting."
        )

    def validate_identifier(self, identifier: str) -> bool:
        if not identifier:
            return False
        clean = identifier.strip().upper()
        return bool(re.match(r"^[Vv][-0-9A-Za-z]{6,12}$", clean))

    def verify_document(
        self,
        doc_type: str,
        identifier: str,
        extracted_fields: Dict[str, Any]
    ) -> ProviderVerificationResult:
        clean_id = identifier.strip().upper()
        req_time = datetime.now(timezone.utc)
        ev_id = f"EV-VISA-{uuid.uuid4().hex[:8]}"

        # Check for simulated demo revoked or invalid visa
        if "REVOKED" in clean_id or clean_id == "V-INVALID-99":
            return ProviderVerificationResult(
                provider_id=self.provider_id,
                provider_name=self.provider_name,
                is_sandbox=True,
                is_matched=False,
                status="MISMATCH",
                identifier_checked=clean_id,
                trusted_fields={"status": "REVOKED"},
                mismatches=[{"field": "status", "extracted": "ACTIVE", "trusted": "REVOKED"}],
                confidence=0.98,
                evidence_notes="Visa endorsement revoked in immigration register.",
                request_timestamp=req_time,
                response_metadata={"evidence_id": ev_id, "mock_label": "SYNTHETIC DEMONSTRATION RESULT"}
            )

        # Standard sandbox verification pass
        return ProviderVerificationResult(
            provider_id=self.provider_id,
            provider_name=self.provider_name,
            is_sandbox=True,
            is_matched=True,
            status="VERIFIED",
            identifier_checked=clean_id,
            trusted_fields={
                "visa_number": clean_id,
                "visa_type": extracted_fields.get("visa_type", "TOURIST (T-30)"),
                "entries": extracted_fields.get("entries", "MULTIPLE"),
                "status": "VALID"
            },
            mismatches=[],
            confidence=0.95,
            evidence_notes="Visa endorsement verified against IVFRT sandbox registry fixture.",
            request_timestamp=req_time,
            response_metadata={"evidence_id": ev_id, "mock_label": "SYNTHETIC DEMONSTRATION RESULT"}
        )

visa_provider = VisaVerificationProvider()
