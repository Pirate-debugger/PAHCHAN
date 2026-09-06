"""
PAHCHAN Biometric Face Verification API
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.core.security import validate_upload_file
from app.services.face_service import verify_biometric_face

router = APIRouter()

@router.post("/face/verify")
async def verify_presenter_face(
    doc_photo: UploadFile = File(...),
    live_photo: Optional[UploadFile] = File(None),
    threshold: float = Form(75.0)
):
    """
    Compares document portrait against live checkpoint webcam presenter photo.
    Returns similarity score, threshold result, landmark indicators, and non-criminalizing advice.
    When live_photo is omitted or empty, returns status NO_LIVE_CAPTURE and match null.
    """
    doc_bytes, _ = await validate_upload_file(doc_photo)
    live_bytes = b""
    if live_photo and live_photo.filename:
        live_bytes, _ = await validate_upload_file(live_photo)
    
    result = verify_biometric_face(doc_bytes, live_bytes, threshold=threshold)
    return result
