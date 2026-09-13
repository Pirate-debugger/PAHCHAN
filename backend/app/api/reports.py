from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.core.security_privacy import mask_document_number
from app.models.screening import ScreeningSession
from app.services.report_service import report_service
from app.services.audit_service import AuditService

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("")
def list_reports(
    status: Optional[str] = None,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    """List available official screening reports with optional status filtering"""
    query = db.query(ScreeningSession)

    if status and status != "ALL":
        query = query.filter(ScreeningSession.status == status)
    else:
        # Default to cases that have completed initial analysis
        query = query.filter(ScreeningSession.status.in_(["COMPLETED", "IN_REVIEW"]))

    sessions = query.order_by(desc(ScreeningSession.updated_at)).limit(limit).all()

    summaries = []
    for s in sessions:
        name_field = next((f.field_value for f in s.extracted_fields if f.field_key == "full_name"), "N/A")
        doc_num = next((f.field_value for f in s.extracted_fields if f.field_key == "document_number"), "N/A")
        masked_num = mask_document_number(doc_num, s.document_type) if doc_num != "N/A" else "N/A"
        score = s.risk_assessment.total_score if s.risk_assessment else 0
        lvl = s.risk_assessment.risk_level if s.risk_assessment else "PENDING"
        decision = s.decisions[-1].decision if s.decisions else "PENDING"

        summaries.append({
            "report_id": f"REP-{s.id}",
            "case_id": s.id,
            "subject_name": name_field,
            "document_number": doc_num,
            "masked_document_number": masked_num,
            "document_type": s.document_type,
            "screening_date": s.created_at.isoformat(),
            "risk_level": lvl,
            "risk_score": score,
            "decision": decision,
            "is_synthetic": s.is_demo_scenario
        })

    return summaries

@router.get("/{session_id}")
def get_report_detail(session_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Retrieve full official printable report payload with cryptographic audit seal"""
    session = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Screening report not found")

    report_data = report_service.generate_report_data(db, session)

    AuditService.log(
        db=db,
        session_id=session_id,
        action="REPORT_VIEWED",
        details=f"Official screening report REP-{session_id} viewed/exported"
    )

    return report_data
