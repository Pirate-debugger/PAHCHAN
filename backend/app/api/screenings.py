import os
import uuid
import json
from datetime import datetime, timezone, date
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.core.database import get_db
from app.core.config import settings
from app.models.screening import (
    ScreeningSession,
    Document,
    ExtractedField,
    ValidationResult,
    ForensicFinding,
    FaceVerification,
    RiskAssessment,
    ScreeningDecision,
    AuditLogEntry,
    generate_case_id
)
from app.schemas.screening import (
    ScreeningSessionSummary,
    ScreeningSessionDetail,
    ScreeningDecisionRequest,
    EditFieldRequest
)
from app.services import (
    ocr_service,
    validation_service,
    forensic_service,
    face_service,
    risk_service,
    identity_service,
    AuditService
)

router = APIRouter(prefix="/screenings", tags=["Screenings"])

@router.get("/stats")
def get_screening_stats(db: Session = Depends(get_db)):
    """Summary metrics for the Overview Workstation"""
    total = db.query(ScreeningSession).count()
    pending = db.query(ScreeningSession).filter(ScreeningSession.status.in_(["PENDING", "IN_REVIEW"])).count()
    
    # High priority: risk score >= 60 in pending/in_review
    high_priority = db.query(ScreeningSession).join(RiskAssessment).filter(
        ScreeningSession.status.in_(["PENDING", "IN_REVIEW"]),
        RiskAssessment.total_score >= settings.RISK_THRESHOLD_REVIEW
    ).count()

    today_start = datetime.combine(date.today(), datetime.min.time())
    completed_today = db.query(ScreeningSession).filter(
        ScreeningSession.status == "COMPLETED",
        ScreeningSession.updated_at >= today_start
    ).count()

    return {
        "pending_reviews": pending,
        "high_priority_reviews": high_priority,
        "completed_today": completed_today,
        "total_screenings": total
    }

@router.get("", response_model=List[ScreeningSessionSummary])
def list_screenings(
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    """Retrieve list of screening cases with optional search and filter"""
    query = db.query(ScreeningSession)
    
    if status and status != "ALL":
        query = query.filter(ScreeningSession.status == status)

    if search:
        search_term = f"%{search.strip()}%"
        # Search by ID, or join with extracted fields to search name/doc_number
        query = query.filter(
            (ScreeningSession.id.ilike(search_term)) |
            (ScreeningSession.extracted_fields.any(ExtractedField.field_value.ilike(search_term)))
        )

    sessions = query.order_by(desc(ScreeningSession.created_at)).limit(limit).all()

    results = []
    for s in sessions:
        risk_lvl = s.risk_assessment.risk_level if s.risk_assessment else "PENDING"
        score = s.risk_assessment.total_score if s.risk_assessment else 0
        concern = s.risk_assessment.primary_concern if s.risk_assessment else None
        rec = s.risk_assessment.recommendation if s.risk_assessment else None
        decision = s.decisions[-1].decision if s.decisions else None

        results.append(ScreeningSessionSummary(
            id=s.id,
            created_at=s.created_at,
            updated_at=s.updated_at,
            status=s.status,
            document_type=s.document_type,
            risk_level=risk_lvl,
            total_score=score,
            primary_concern=concern,
            recommendation=rec,
            decision=decision,
            is_demo_scenario=s.is_demo_scenario,
            demo_scenario_id=s.demo_scenario_id
        ))

    return results

@router.post("", response_model=ScreeningSessionSummary)
async def create_screening(
    document_file: UploadFile = File(...),
    presented_file: Optional[UploadFile] = File(None),
    document_type: str = Form("PASSPORT"),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Start a new screening session by uploading a document"""
    case_id = generate_case_id()
    while db.query(ScreeningSession).filter(ScreeningSession.id == case_id).first():
        case_id = generate_case_id()

    session = ScreeningSession(
        id=case_id,
        status="PENDING",
        document_type=document_type.upper(),
        officer_notes=notes,
        is_demo_scenario=False
    )
    db.add(session)
    db.commit()

    # Save primary document
    doc_ext = os.path.splitext(document_file.filename)[1] or ".jpg"
    doc_filename = f"{case_id}_primary{doc_ext}"
    doc_path = settings.UPLOADS_DIR / doc_filename

    contents = await document_file.read()
    with open(doc_path, "wb") as f:
        f.write(contents)

    primary_doc = Document(
        id=str(uuid.uuid4()),
        session_id=case_id,
        category="PRIMARY_DOCUMENT",
        filename=doc_filename,
        file_path=str(doc_path),
        mime_type=document_file.content_type or "image/jpeg",
        file_size=len(contents)
    )
    db.add(primary_doc)

    # Save presented photo if provided
    if presented_file and presented_file.filename:
        pres_ext = os.path.splitext(presented_file.filename)[1] or ".jpg"
        pres_filename = f"{case_id}_presented{pres_ext}"
        pres_path = settings.UPLOADS_DIR / pres_filename
        p_contents = await presented_file.read()
        with open(pres_path, "wb") as f:
            f.write(p_contents)

        pres_doc = Document(
            id=str(uuid.uuid4()),
            session_id=case_id,
            category="PRESENTED_PHOTO",
            filename=pres_filename,
            file_path=str(pres_path),
            mime_type=presented_file.content_type or "image/jpeg",
            file_size=len(p_contents)
        )
        db.add(pres_doc)

    db.commit()

    # Log audit event
    AuditService.log(
        db=db,
        session_id=case_id,
        action="SCREENING_CREATED",
        details=f"New screening case created with document {document_file.filename}"
    )

    return ScreeningSessionSummary(
        id=session.id,
        created_at=session.created_at,
        updated_at=session.updated_at,
        status=session.status,
        document_type=session.document_type,
        risk_level="PENDING",
        total_score=0
    )

@router.get("/{session_id}", response_model=ScreeningSessionDetail)
def get_screening_detail(session_id: str, db: Session = Depends(get_db)):
    """Get full screening session details for the Screening Workstation"""
    session = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Screening case not found")

    docs = []
    for d in session.documents:
        # Build URL
        url = f"/uploads/{d.filename}"
        docs.append({
            "id": d.id,
            "category": d.category,
            "filename": d.filename,
            "url": url,
            "mime_type": d.mime_type,
            "file_size": d.file_size,
            "width": d.width,
            "height": d.height,
            "is_synthetic": d.is_synthetic
        })

    fields = [
        {
            "id": f.id,
            "field_key": f.field_key,
            "field_label": f.field_label,
            "field_value": f.field_value,
            "original_value": f.original_value,
            "confidence": f.confidence,
            "bbox_ymin": f.bbox_ymin,
            "bbox_xmin": f.bbox_xmin,
            "bbox_ymax": f.bbox_ymax,
            "bbox_xmax": f.bbox_xmax,
            "is_edited": f.is_edited,
            "source_zone": f.source_zone
        } for f in session.extracted_fields
    ]

    vals = [
        {
            "id": v.id,
            "rule_id": v.rule_id,
            "rule_name": v.rule_name,
            "category": v.category,
            "status": v.status,
            "message": v.message,
            "details": v.details,
            "risk_points": v.risk_points
        } for v in session.validations
    ]

    findings = [
        {
            "id": f.id,
            "category": f.category,
            "severity": f.severity,
            "title": f.title,
            "explanation": f.explanation,
            "evidence_preview_url": f.evidence_preview_path,
            "heatmap_overlay_url": f.heatmap_overlay_path,
            "bbox_ymin": f.bbox_ymin,
            "bbox_xmin": f.bbox_xmin,
            "bbox_ymax": f.bbox_ymax,
            "bbox_xmax": f.bbox_xmax,
            "technical_details": f.technical_details,
            "risk_contribution": f.risk_contribution
        } for f in session.forensic_findings
    ]

    face = None
    if session.face_verification:
        fv = session.face_verification
        face = {
            "id": fv.id,
            "portrait_url": fv.portrait_crop_path,
            "presented_url": fv.presented_photo_path,
            "outcome": fv.outcome,
            "similarity_score": fv.similarity_score,
            "quality_score": fv.quality_score,
            "quality_assessment": fv.quality_assessment,
            "explanation": fv.explanation,
            "recommendation": fv.recommendation,
            "risk_contribution": fv.risk_contribution
        }

    risk = None
    if session.risk_assessment:
        ra = session.risk_assessment
        factors = []
        if ra.contributing_factors:
            try:
                factors = json.loads(ra.contributing_factors)
            except Exception:
                pass
        risk = {
            "id": ra.id,
            "total_score": ra.total_score,
            "risk_level": ra.risk_level,
            "primary_concern": ra.primary_concern,
            "recommendation": ra.recommendation,
            "contributing_factors": factors
        }

    decs = [
        {
            "id": d.id,
            "decision": d.decision,
            "officer_id": d.officer_id,
            "officer_name": d.officer_name,
            "notes": d.notes,
            "decided_at": d.decided_at
        } for d in session.decisions
    ]

    logs = [
        {
            "id": l.id,
            "timestamp": l.timestamp,
            "session_id": l.session_id,
            "actor": l.actor,
            "action": l.action,
            "details": l.details
        } for l in session.audit_logs
    ]

    return ScreeningSessionDetail(
        id=session.id,
        created_at=session.created_at,
        updated_at=session.updated_at,
        status=session.status,
        document_type=session.document_type,
        officer_notes=session.officer_notes,
        is_demo_scenario=session.is_demo_scenario,
        demo_scenario_id=session.demo_scenario_id,
        documents=docs,
        extracted_fields=fields,
        validations=vals,
        forensic_findings=findings,
        face_verification=face,
        risk_assessment=risk,
        decisions=decs,
        audit_logs=logs
    )

@router.post("/{session_id}/analyze")
def run_screening_analysis(
    session_id: str,
    force_scenario_flags: Optional[str] = None,
    force_face_outcome: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Execute full automated analysis pipeline:
    1. OCR Extraction & MRZ Parsing
    2. Validation Rules Check
    3. Forensic Tampering Analysis
    4. Face Verification
    5. Multi-Identity Check
    6. Risk Assessment
    """
    session = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Screening session not found")

    primary_doc = db.query(Document).filter(
        Document.session_id == session_id,
        Document.category == "PRIMARY_DOCUMENT"
    ).first()

    if not primary_doc or not os.path.exists(primary_doc.file_path):
        raise HTTPException(status_code=400, detail="Primary document image missing")

    presented_doc = db.query(Document).filter(
        Document.session_id == session_id,
        Document.category == "PRESENTED_PHOTO"
    ).first()
    presented_path = presented_doc.file_path if presented_doc else None

    # Parse any scenario flags
    flags = {}
    if force_scenario_flags:
        try:
            flags = json.loads(force_scenario_flags)
        except Exception:
            pass

    # Clear previous results if re-analyzing
    db.query(ExtractedField).filter(ExtractedField.session_id == session_id).delete()
    db.query(ValidationResult).filter(ValidationResult.session_id == session_id).delete()
    db.query(ForensicFinding).filter(ForensicFinding.session_id == session_id).delete()
    db.query(FaceVerification).filter(FaceVerification.session_id == session_id).delete()
    db.query(RiskAssessment).filter(RiskAssessment.session_id == session_id).delete()
    db.commit()

    # Step 1: OCR & MRZ Extraction
    ocr_res = ocr_service.extract_from_image(primary_doc.file_path, session.document_type)
    extracted_fields = ocr_res.get("fields", [])
    mrz_data = ocr_res.get("mrz_data", {})

    fields_map = {}
    for f in extracted_fields:
        field_obj = ExtractedField(
            id=str(uuid.uuid4()),
            session_id=session_id,
            field_key=f["field_key"],
            field_label=f["field_label"],
            field_value=f["field_value"],
            original_value=f["field_value"],
            confidence=f["confidence"],
            bbox_ymin=f["bbox_ymin"],
            bbox_xmin=f["bbox_xmin"],
            bbox_ymax=f["bbox_ymax"],
            bbox_xmax=f["bbox_xmax"],
            source_zone=f["source_zone"]
        )
        db.add(field_obj)
        fields_map[f["field_key"]] = f["field_value"]

    db.commit()

    # Step 2: Document Validation Check
    val_results = validation_service.validate_document(
        fields_map=fields_map,
        mrz_data=mrz_data,
        doc_type=session.document_type
    )

    for v in val_results:
        val_obj = ValidationResult(
            id=str(uuid.uuid4()),
            session_id=session_id,
            rule_id=v["rule_id"],
            rule_name=v["rule_name"],
            category=v["category"],
            status=v["status"],
            message=v["message"],
            details=v.get("details"),
            risk_points=v["risk_points"]
        )
        db.add(val_obj)

    db.commit()

    # Step 3: Forensic Tampering Detection
    forensic_findings = forensic_service.analyze_tampering(
        image_path=primary_doc.file_path,
        doc_type=session.document_type,
        force_scenarios=flags
    )

    for f in forensic_findings:
        find_obj = ForensicFinding(
            id=f["id"],
            session_id=session_id,
            category=f["category"],
            severity=f["severity"],
            title=f["title"],
            explanation=f["explanation"],
            evidence_preview_path=f["evidence_preview_path"],
            heatmap_overlay_path=f["heatmap_overlay_path"],
            bbox_ymin=f["bbox_ymin"],
            bbox_xmin=f["bbox_xmin"],
            bbox_ymax=f["bbox_ymax"],
            bbox_xmax=f["bbox_xmax"],
            technical_details=f["technical_details"],
            risk_contribution=f["risk_contribution"]
        )
        db.add(find_obj)

    db.commit()

    # Step 4: Face Verification
    face_res = face_service.compare_faces(
        doc_image_path=primary_doc.file_path,
        presented_image_path=presented_path,
        force_outcome=force_face_outcome
    )

    face_obj = FaceVerification(
        id=str(uuid.uuid4()),
        session_id=session_id,
        portrait_crop_path=face_res.get("portrait_url"),
        presented_photo_path=face_res.get("presented_url"),
        outcome=face_res["outcome"],
        similarity_score=face_res["similarity_score"],
        quality_score=face_res["quality_score"],
        quality_assessment=face_res.get("quality_assessment"),
        explanation=face_res["explanation"],
        recommendation=face_res["recommendation"],
        risk_contribution=face_res["risk_contribution"]
    )
    db.add(face_obj)
    db.commit()

    # Step 5: Multi-Identity & Historical Duplicate Check
    identity_res = identity_service.check_identity_consistency(
        db=db,
        current_session_id=session_id,
        doc_number=fields_map.get("document_number", ""),
        full_name=fields_map.get("full_name", ""),
        force_multi_identity=flags.get("multi_identity", False)
    )

    if identity_res:
        # Add as a critical forensic finding
        dup_finding = ForensicFinding(
            id=str(uuid.uuid4()),
            session_id=session_id,
            category="IDENTITY_CONSISTENCY",
            severity="CRITICAL",
            title=identity_res["title"],
            explanation=identity_res["explanation"],
            evidence_preview_path=None,
            heatmap_overlay_path=None,
            bbox_ymin=None,
            bbox_xmin=None,
            bbox_ymax=None,
            bbox_xmax=None,
            technical_details=json.dumps(identity_res),
            risk_contribution=identity_res["risk_contribution"]
        )
        db.add(dup_finding)
        db.commit()

    # Step 6: Risk Assessment Engine
    risk_res = risk_service.calculate_risk(
        validations=val_results,
        forensics=forensic_findings,
        face_result=face_res,
        identity_result=identity_res
    )

    risk_obj = RiskAssessment(
        id=str(uuid.uuid4()),
        session_id=session_id,
        total_score=risk_res["total_score"],
        risk_level=risk_res["risk_level"],
        primary_concern=risk_res["primary_concern"],
        recommendation=risk_res["recommendation"],
        contributing_factors=json.dumps(risk_res["contributing_factors"])
    )
    db.add(risk_obj)

    # Update session status
    session.status = "IN_REVIEW" if risk_res["risk_level"] in ["REVIEW", "HIGH", "CRITICAL"] else "COMPLETED"
    db.commit()

    # Log audit event
    AuditService.log(
        db=db,
        session_id=session_id,
        action="ANALYSIS_COMPLETED",
        details=f"Analysis completed. Risk: {risk_res['risk_level']} (Score: {risk_res['total_score']})"
    )

    return get_screening_detail(session_id, db)

@router.post("/{session_id}/decision")
def record_screening_decision(
    session_id: str,
    req: ScreeningDecisionRequest,
    db: Session = Depends(get_db)
):
    """Record authorized officer decision (Standard Review, Secondary Review, Escalate, Inconclusive)"""
    session = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Screening session not found")

    decision = ScreeningDecision(
        id=str(uuid.uuid4()),
        session_id=session_id,
        decision=req.decision,
        officer_id=req.officer_id or "SSB-OFFICER-4821",
        officer_name=req.officer_name or "S. Sharma (Inspector/GD)",
        notes=req.notes
    )
    db.add(decision)

    session.status = "COMPLETED"
    if req.notes:
        session.officer_notes = req.notes

    db.commit()

    AuditService.log(
        db=db,
        session_id=session_id,
        actor=req.officer_name or "SSB-OFFICER-4821",
        action="DECISION_RECORDED",
        details=f"Decision recorded: {req.decision}. Notes: {req.notes or 'None'}"
    )

    return {"status": "SUCCESS", "decision": req.decision, "session_id": session_id}

@router.patch("/{session_id}/fields/{field_key}")
def edit_extracted_field(
    session_id: str,
    field_key: str,
    req: EditFieldRequest,
    db: Session = Depends(get_db)
):
    """Allow authorized officer to correct an extracted OCR field with audit trail"""
    field = db.query(ExtractedField).filter(
        ExtractedField.session_id == session_id,
        ExtractedField.field_key == field_key
    ).first()

    if not field:
        raise HTTPException(status_code=404, detail="Field not found")

    old_val = field.field_value
    field.field_value = req.new_value
    field.is_edited = True
    db.commit()

    AuditService.log(
        db=db,
        session_id=session_id,
        action="FIELD_CORRECTED",
        details=f"Field '{field.field_label}' corrected from '{old_val}' to '{req.new_value}'. Notes: {req.officer_notes or 'None'}"
    )

    return {"status": "SUCCESS", "field_key": field_key, "new_value": req.new_value}
