from typing import Dict, List, Optional
from app.services.providers.base_provider import VerificationProvider, ProviderStatus, ProviderVerificationResult
from app.services.providers.digilocker_provider import digilocker_provider
from app.services.providers.api_setu_provider import api_setu_provider
from app.services.providers.pan_provider import pan_provider
from app.services.providers.passport_provider import passport_provider
from app.services.providers.voter_provider import voter_provider
from app.services.providers.driving_license_provider import driving_license_provider
from app.services.providers.rc_provider import rc_provider
from app.services.providers.digital_signature_provider import digital_signature_provider
from app.services.providers.visa_provider import visa_provider
from app.services.providers.permit_provider import permit_provider

class ProviderRegistry:
    """Central registry and routing manager for trusted identity & document verification providers."""

    def __init__(self):
        self._providers: Dict[str, VerificationProvider] = {
            digilocker_provider.provider_id: digilocker_provider,
            api_setu_provider.provider_id: api_setu_provider,
            pan_provider.provider_id: pan_provider,
            passport_provider.provider_id: passport_provider,
            voter_provider.provider_id: voter_provider,
            driving_license_provider.provider_id: driving_license_provider,
            rc_provider.provider_id: rc_provider,
            digital_signature_provider.provider_id: digital_signature_provider,
            visa_provider.provider_id: visa_provider,
            permit_provider.provider_id: permit_provider
        }

    def get_provider(self, provider_id: str) -> Optional[VerificationProvider]:
        return self._providers.get(provider_id)

    def list_providers(self) -> List[VerificationProvider]:
        return list(self._providers.values())

    def get_all_statuses(self) -> List[ProviderStatus]:
        """Returns the real-time configuration and health status of all registered providers."""
        return [p.get_status() for p in self._providers.values()]

    def resolve_provider_for_document(self, doc_type: str) -> List[VerificationProvider]:
        """Resolve primary and secondary providers capable of verifying the given document type."""
        normalized_doc = doc_type.upper().replace(" ", "_")
        matched = []

        if "PAN" in normalized_doc:
            matched.extend([pan_provider, api_setu_provider, digilocker_provider])
        elif "PASSPORT" in normalized_doc:
            matched.extend([passport_provider])
        elif "VISA" in normalized_doc:
            matched.extend([visa_provider])
        elif "PERMIT" in normalized_doc:
            matched.extend([permit_provider])
        elif "VOTER" in normalized_doc or "EPIC" in normalized_doc:
            matched.extend([voter_provider, digilocker_provider])
        elif "DRIVING" in normalized_doc or "DL" in normalized_doc:
            matched.extend([driving_license_provider, digilocker_provider, api_setu_provider])
        elif "RC" in normalized_doc or "VEHICLE" in normalized_doc or "REGISTRATION" in normalized_doc:
            matched.extend([rc_provider, digilocker_provider, api_setu_provider])
        elif "CERTIFICATE" in normalized_doc or "DEGREE" in normalized_doc or "MARKSHEET" in normalized_doc:
            matched.extend([digital_signature_provider, digilocker_provider])
        elif "AADHAAR" in normalized_doc:
            matched.extend([digilocker_provider])

        # De-duplicate while preserving order
        seen = set()
        unique_providers = []
        for p in matched:
            if p.provider_id not in seen:
                seen.add(p.provider_id)
                unique_providers.append(p)

        return unique_providers if unique_providers else [digilocker_provider]

provider_registry = ProviderRegistry()
