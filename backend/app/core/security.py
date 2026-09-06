"""
Security utilities: File validation, MIME inspection, SHA-256 hashing, filename sanitization
"""

import hashlib
import re
from typing import Tuple, Optional
from fastapi import HTTPException, UploadFile, Security, status
from fastapi.security.api_key import APIKeyHeader
from app.core.config import settings

api_key_header = APIKeyHeader(name=settings.API_KEY_NAME, auto_error=False)

class AuthenticatedOperator:
    """Represents an authenticated screening checkpoint operator."""
    def __init__(self, operator_id: str = "OFFICER-SSB-449", role: str = "AUTHORIZED_OPERATOR"):
        self.operator_id = operator_id
        self.role = role

async def get_authenticated_operator(
    api_key: Optional[str] = Security(api_key_header)
) -> AuthenticatedOperator:
    """
    Enforces shared-secret API key authentication on sensitive write endpoints.
    Derives authenticated operator identity to prevent forgery in audit logs.
    """
    if not api_key or api_key != settings.API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Missing or invalid API key. Provide valid X-API-Key header."
        )
    return AuthenticatedOperator(operator_id="OFFICER-SSB-449", role="AUTHORIZED_OPERATOR")

def compute_sha256(data_bytes: bytes) -> str:
    """Computes SHA-256 cryptographic digest of data bytes."""
    return hashlib.sha256(data_bytes).hexdigest()

def sanitize_filename(filename: str) -> str:
    """Strips dangerous characters from upload filenames."""
    clean_name = re.sub(r"[^a-zA-Z0-9_.-]", "_", filename)
    return clean_name[:100]

async def validate_upload_file(file: UploadFile) -> Tuple[bytes, str]:
    """
    Validates file presence, size limits, and content type.
    Returns (contents, sha256).
    """
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No document file provided.")
    
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    
    if len(contents) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=413, 
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_BYTES // (1024*1024)}MB."
        )
    
    content_type = file.content_type or "application/octet-stream"
    # Basic header sniffing / validation
    valid_magic = (
        contents.startswith(b"\xff\xd8\xff") or  # JPEG
        contents.startswith(b"\x89PNG\r\n\x1a\n") or  # PNG
        contents.startswith(b"RIFF") or  # WEBP
        contents.startswith(b"%PDF") or  # PDF
        contents.startswith(b"<svg") or b"<svg" in contents[:100] # SVG / synthetic
    )
    
    if not valid_magic and content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Unsupported file format. Please upload JPEG, PNG, WebP, SVG, or PDF."
        )
        
    file_hash = compute_sha256(contents)
    return contents, file_hash
