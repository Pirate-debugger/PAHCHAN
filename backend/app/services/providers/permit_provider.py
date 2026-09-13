import os
import re
import uuid
from typing import Dict, Any, List
from datetime import datetime, timezone
from app.services.providers.base_provider import VerificationProvider, ProviderStatus, ProviderVerificationResult

class BorderPermitVerificationProvider(VerificationProvider):
    """
    Authoritative Border Checkpoint Movement Permit Gateway Adapter.
    Validates Border Crossing Permits (India-Nepal, India-Bhutan, SSB Border Area Movement).
    """

    @property
    def provider_id(self) -> str:
        return "permit_gateway"

    @property
    def provider_name(self) -> str:
        return "SSB Border Movement Permit Registry"

    @property
    def supported_document_types(self) -> List[str]:
        return ["PERMIT"]

    def get_status(self) -> ProviderStatus:
        return ProviderStatus(
            provider_id=self.provider_id,
            provider_name=self.provider_name,
            is_configured=True,
            is_sandbox=True,
            status="SANDBOX",
            capabilities=["PERMIT_VALIDATION", "BORDER_CHECKPOINT_STATUS", "TRANSIT_PASS_QUERY"],
            environment="SANDBOX",
            details="Demonstration adapter for SSB Border Checkpoint Movement Passes."
        )

    def validate_identifier(self, identifier: str) -> bool:
        if not identifier:
            return False
        clean = identifier.strip().upper()
        return bool(re.match(r"^[A-Z]{2,4}[-0-9A-Z]{5,14}$", clean))

    def verify_document(
        self,
        doc_type: str,
        identifier: str,
        extracted_fields: Dict[str, Any]
    ) -> ProviderVerificationResult:
        clean_id = identifier.strip().upper()
        req_time = datetime.now(timezone.utc)
        ev_id = f"EV-PERMIT-{uuid.uuid4().hex[:8]}"

        # Check for simulated revoked permit
        if "REVOKED" in clean_id or clean_id == "BP-EXPIRED-00":
            return ProviderVerificationResult(
                provider_id=self.provider_id,
                provider_name=self.provider_name,
                is_sandbox=True,
                is_matched=False,
                status="MISMATCH",
                identifier_checked=clean_id,
                trusted_fields={"permit_status": "EXPIRED_OR_REVOKED"},
                mismatches=[{"field": "status", "extracted": "VALID", "trusted": "REVOKED"}],
                confidence=0.98,
                evidence_notes="Border permit revoked or expired in SSB local ICP register.",
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
                "permit_number": clean_id,
                "holder_name": extracted_fields.get("full_name", "TENZING NORBU"),
                "authority": extracted_fields.get("issuing_authority", "SSB ICP Raxaul"),
                "status": "ACTIVE_PERMIT"
            },
            mismatches=[],
            confidence=0.95,
            evidence_notes="Permit verified against SSB Border Area Movement registry fixture.",
            request_timestamp=req_time,
            response_metadata={"evidence_id": ev_id, "mock_label": "SYNTHETIC DEMONSTRATION RESULT"}
        )

permit_provider = BorderPermitVerificationProvider()
