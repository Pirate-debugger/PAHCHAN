"""
PAHCHAN Screening API Endpoints
Main screening orchestrator combining OCR, validation, forensics, biometrics, and risk engine.
"""

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import uuid
import json

from app.core.limiter import limiter
from app.database import get_db
from app.core.security import validate_upload_file, compute_sha256, get_authenticated_operator, AuthenticatedOperator
from app.services.ocr_service import extract_fields_from_document
from app.services.validation_service import parse_and_validate_td3
from app.services.forensics_service import run_comprehensive_forensics
from app.services.face_service import verify_biometric_face
from app.services.crossdoc_service import cross_validate_documents
from app.services.watchlist_service import search_watchlist
from app.services.risk_service import calculate_screening_risk
from app.services.explainability_service import generate_explainability_dossier
from app.services.report_service import generate_screening_report
from app.services.audit_service import record_audit_event
from app.models.screening import ScreeningSessionModel

router = APIRouter()

@router.post("/screenings")
@limiter.limit("60/minute")
async def execute_full_screening(
    request: Request,
    doc_file: UploadFile = File(...),
    live_file: Optional[UploadFile] = File(None),
    secondary_doc_file: Optional[UploadFile] = File(None),
    mrz_line1: Optional[str] = Form(None),
    mrz_line2: Optional[str] = Form(None),
    doc_type: str = Form("PASSPORT"),
    checkpoint: str = Form("Raxaul Land Border Checkpoint (Indo-Nepal)"),
    face_threshold: float = Form(75.0),
    auth: AuthenticatedOperator = Depends(get_authenticated_operator),
    db: Session = Depends(get_db)
):
    """
    Full 9-stage screening workflow (requires API key authentication):
    Operator ID is securely derived from the authenticated caller.
    1. Ingestion & File validation
    2. OCR & Field extraction
    3. Document & MRZ validation
    4. Image forensics (ELA, Sobel, EXIF)
    5. Biometric face verification
    6. Cross-document verification (if secondary visa/permit provided)
    7. Multi-signal explainable risk calculation
    8. Structured explainability matrix
    9. Immutable audit logging
    """
    try:
        # Stage 1: Document Ingestion & Integrity Hash
        doc_bytes, doc_sha256 = await validate_upload_file(doc_file)
        session_id = f"PAHCHAN-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        operator_id = auth.operator_id
        
        # Stage 2: OCR & Field Extraction
        ocr_result = extract_fields_from_document(
            doc_bytes,
            filename=doc_file.filename,
            manual_mrz_line1=mrz_line1,
            manual_mrz_line2=mrz_line2
        )
        extracted_fields = ocr_result["fields"]

        # Stage 3: Validation Engine (ICAO Doc 9303)
        effective_mrz1 = mrz_line1 or extracted_fields.get("mrzLine1", "")
        effective_mrz2 = mrz_line2 or extracted_fields.get("mrzLine2", "")
        
        if effective_mrz1 and effective_mrz2:
            val_result = parse_and_validate_td3(effective_mrz1, effective_mrz2)
        else:
            val_result = {
                "format": "NON_MRZ",
                "is_valid": True,
                "is_expired": False,
                "mrz_checksum_pass": True,
                "issues": [],
                "mrz_details": {}
            }

        # Stage 4: Forensic Tampering Layer
        forensic_result = run_comprehensive_forensics(doc_bytes)

        # Stage 5: Biometric Face Verification
        live_bytes = b""
        if live_file and live_file.filename:
            live_bytes, _ = await validate_upload_file(live_file)
        face_result = verify_biometric_face(doc_bytes, live_bytes, threshold=face_threshold)

        # Stage 6: Cross-Document Consistency (if secondary doc uploaded)
        cross_doc_result = {"match": True, "mismatches": []}
        if secondary_doc_file and secondary_doc_file.filename:
            sec_bytes, _ = await validate_upload_file(secondary_doc_file)
            sec_ocr = extract_fields_from_document(sec_bytes, filename=secondary_doc_file.filename)
            cross_doc_result = cross_validate_documents(
                extracted_fields,
                sec_ocr["fields"],
                doc1_label="Passport Bio-Page",
                doc2_label="Attached Visa Sticker"
            )

        # Stage 6.5: Intelligence Watchlist Matching
        holder_name = extracted_fields.get("name") or val_result.get("holder_name")
        doc_num = extracted_fields.get("docNumber") or val_result.get("doc_number")
        watchlist_match = search_watchlist(db=db, name=holder_name, doc_number=doc_num)
        watchlist_hit = bool(watchlist_match and watchlist_match.get("hit", False))

        # Stage 7: Deterministic Explainable Risk Engine
        is_face_mismatch = (face_result.get("match") is False)
        is_face_skipped = (face_result.get("status") == "NO_LIVE_CAPTURE" or face_result.get("match") is None)

        risk_result = calculate_screening_risk(
            photo_replaced=forensic_result.get("photo_replaced", False),
            text_manipulated=forensic_result.get("text_manipulated", False),
            stamp_forged=forensic_result.get("stamp_forged", False),
            face_mismatch=is_face_mismatch,
            face_skipped=is_face_skipped,
            is_expired=val_result.get("is_expired", False),
            crossfield_mismatch=not cross_doc_result.get("match", True),
            watchlist_hit=watchlist_hit,
            metadata_tampered=forensic_result.get("metadata_anomalous", False),
            mrz_pass=val_result.get("mrz_checksum_pass", True),
            text_evidence=forensic_result.get("text_evidence"),
            stamp_evidence=forensic_result.get("stamp_evidence")
        )

        # Stage 8: Grounded Explainability
        explainability = generate_explainability_dossier(
            risk_result,
            val_result,
            forensic_result,
            face_result,
            cross_doc_result
        )
        risk_result["explainability"] = explainability

        response_payload = {
            "session_id": session_id,
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "operator_id": operator_id,
            "checkpoint": checkpoint,
            "document_type": doc_type,
            "document_sha256": doc_sha256,
            "fields": extracted_fields,
            "validation": val_result,
            "forensics": forensic_result,
            "face_verification": face_result,
            "cross_field": cross_doc_result,
            "watchlist_hit": watchlist_match.get("record") if watchlist_hit else None,
            "risk": risk_result
        }

        # Stage 9: Database Persistence & Audit Trail
        now_dt = datetime.now(timezone.utc)
        session_record = ScreeningSessionModel(
            session_id=session_id,
            timestamp=now_dt,
            operator_id=operator_id,
            checkpoint=checkpoint,
            document_type=doc_type,
            document_sha256=doc_sha256,
            document_filename=doc_file.filename,
            total_risk_score=risk_result["total_risk_score"],
            risk_level=risk_result["risk_level"],
            decision=risk_result["decision"],
            recommendation=risk_result["recommendation"],
            face_match=face_result.get("match"),
            face_similarity=face_result.get("similarity"),
            face_status=face_result.get("status", "NO_LIVE_CAPTURE"),
            full_session_json=json.dumps(response_payload)
        )
        db.add(session_record)
        db.commit()

        # Record in Immutable Audit Log
        record_audit_event(
            db=db,
            session_id=session_id,
            action="SCREENING_COMPLETED",
            document_sha256=doc_sha256,
            operator_id=operator_id,
            checkpoint=checkpoint,
            total_risk_score=risk_result["total_risk_score"],
            risk_level=risk_result["risk_level"],
            decision=risk_result["decision"],
            event_details={
                "document_type": doc_type,
                "factors_count": len(risk_result.get("risk_factors", [])),
                "face_similarity": face_result.get("similarity")
            }
        )

        return response_payload
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Screening pipeline error: {str(e)}")

@router.get("/screenings/{session_id}")
async def get_screening_session(session_id: str, db: Session = Depends(get_db)):
    """Retrieves full screening session details by session ID."""
    record = db.query(ScreeningSessionModel).filter(ScreeningSessionModel.session_id == session_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Screening session '{session_id}' not found.")
    if record.full_session_json:
        return json.loads(record.full_session_json)
    return {
        "session_id": record.session_id,
        "timestamp": record.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC"),
        "total_risk_score": record.total_risk_score,
        "risk_level": record.risk_level,
        "decision": record.decision
    }

@router.get("/screenings/{session_id}/report")
async def get_screening_dossier_report(session_id: str, db: Session = Depends(get_db)):
    """Generates official printable screening dossier for the specified session."""
    record = db.query(ScreeningSessionModel).filter(ScreeningSessionModel.session_id == session_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Screening session '{session_id}' not found.")
    
    session_data = json.loads(record.full_session_json) if record.full_session_json else {
        "session_id": record.session_id,
        "document_sha256": record.document_sha256,
        "total_risk_score": record.total_risk_score,
        "risk_level": record.risk_level,
        "decision": record.decision,
        "operator_id": record.operator_id,
        "checkpoint": record.checkpoint
    }
    return generate_screening_report(session_data)
