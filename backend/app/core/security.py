"""
Security utilities: File validation, MIME inspection, SHA-256 hashing, filename sanitization
"""

import hashlib
import re
from typing import Tuple
from fastapi import HTTPException, UploadFile
from app.core.config import settings

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
