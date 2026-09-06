"""
PAHCHAN Document Services API Endpoints
Provides direct access to OCR, Validation, Forensics, and Cross-Document comparison.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from typing import Optional, Dict, Any

from app.core.limiter import limiter
from app.core.security import validate_upload_file
from app.services.ocr_service import extract_fields_from_document
from app.services.validation_service import parse_and_validate_td3
from app.services.forensics_service import run_comprehensive_forensics
from app.services.crossdoc_service import cross_validate_documents

router = APIRouter()

@router.post("/documents/ocr")
@limiter.limit("60/minute")
async def extract_document_ocr(
    request: Request,
    file: UploadFile = File(...),
    mrz_line1: Optional[str] = Form(None),
    mrz_line2: Optional[str] = Form(None)
):
    """Executes OCR and structured field extraction on uploaded document."""
    contents, sha256 = await validate_upload_file(file)
    res = extract_fields_from_document(
        contents,
        filename=file.filename,
        manual_mrz_line1=mrz_line1,
        manual_mrz_line2=mrz_line2
    )
    return {
        "filename": file.filename,
        "sha256": sha256,
        "fields": res["fields"],
        "confidences": res["confidences"],
        "bounding_boxes": res["bounding_boxes"]
    }

@router.post("/documents/validate")
async def validate_mrz_lines(
    line1: str = Form(...),
    line2: str = Form(...)
):
    """Directly validates 2-line ICAO Doc 9303 TD3 Machine Readable Zone."""
    val_res = parse_and_validate_td3(line1, line2)
    return val_res

@router.post("/documents/forensics")
async def analyze_document_forensics(
    file: UploadFile = File(...)
):
    """Generates Error Level Analysis (ELA), edge discontinuity, and EXIF inspection."""
    contents, sha256 = await validate_upload_file(file)
    forensics = run_comprehensive_forensics(contents)
    return {
        "filename": file.filename,
        "sha256": sha256,
        "forensics": forensics
    }

@router.post("/documents/cross-validate")
async def cross_validate_two_documents(
    doc1_file: UploadFile = File(...),
    doc2_file: UploadFile = File(...),
    doc1_label: str = Form("Primary Passport"),
    doc2_label: str = Form("Accompanying Visa")
):
    """Performs cross-document identity consistency validation between two files."""
    c1, _ = await validate_upload_file(doc1_file)
    c2, _ = await validate_upload_file(doc2_file)
    
    ocr1 = extract_fields_from_document(c1, filename=doc1_file.filename)
    ocr2 = extract_fields_from_document(c2, filename=doc2_file.filename)
    
    cross_res = cross_validate_documents(
        ocr1["fields"],
        ocr2["fields"],
        doc1_label=doc1_label,
        doc2_label=doc2_label
    )
    return {
        "match": cross_res["match"],
        "mismatches": cross_res["mismatches"],
        "doc1_fields": ocr1["fields"],
        "doc2_fields": ocr2["fields"]
    }
