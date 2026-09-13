from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime, timezone

class ProviderStatus(BaseModel):
    provider_id: str
    provider_name: str
    is_configured: bool
    is_sandbox: bool
    status: str  # CONNECTED, NOT_CONFIGURED, SANDBOX, ERROR
    capabilities: List[str]
    environment: str  # PRODUCTION, SANDBOX, UNCONFIGURED
    last_checked: datetime = datetime.now(timezone.utc)
    details: Optional[str] = None

class ProviderVerificationResult(BaseModel):
    provider_id: str
    provider_name: str
    is_sandbox: bool
    is_matched: bool
    status: str  # VERIFIED, UNVERIFIABLE, MISMATCH, NOT_CONFIGURED, ERROR
    identifier_checked: str
    trusted_fields: Dict[str, Any] = {}
    mismatches: List[Dict[str, Any]] = []
    confidence: float = 1.0
    evidence_notes: str
    request_timestamp: datetime = datetime.now(timezone.utc)
    response_metadata: Dict[str, Any] = {}

class VerificationProvider(ABC):
    """Abstract base provider class for authoritative document & identity verification."""
    
    @property
    @abstractmethod
    def provider_id(self) -> str:
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @property
    @abstractmethod
    def supported_document_types(self) -> List[str]:
        pass

    @abstractmethod
    def get_status(self) -> ProviderStatus:
        """Check provider configuration and connectivity."""
        pass

    @abstractmethod
    def verify_document(
        self,
        doc_type: str,
        identifier: str,
        extracted_fields: Dict[str, Any]
    ) -> ProviderVerificationResult:
        """Verify an extracted document against the trusted provider."""
        pass

    @abstractmethod
    def validate_identifier(self, identifier: str) -> bool:
        """Syntax and checksum validation of the document identifier."""
        pass
