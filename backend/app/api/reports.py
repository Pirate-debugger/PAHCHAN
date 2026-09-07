from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.screening import ScreeningSession
from app.services.report_service import report_service
from app.services.audit_service import AuditService

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("")
def list_reports(limit: int = 50, db: Session = Depends(get_db)):
    """List available official screening reports"""
    sessions = db.query(ScreeningSession).filter(
        ScreeningSession.status == "COMPLETED"
    ).order_by(desc(ScreeningSession.updated_at)).limit(limit).all()

    summaries = []
    for s in sessions:
        name_field = next((f.field_value for f in s.extracted_fields if f.field_key == "full_name"), "N/A")
        doc_num = next((f.field_value for f in s.extracted_fields if f.field_key == "document_number"), "N/A")
        score = s.risk_assessment.total_score if s.risk_assessment else 0
        lvl = s.risk_assessment.risk_level if s.risk_assessment else "PENDING"
        decision = s.decisions[-1].decision if s.decisions else "PENDING"

        summaries.append({
            "report_id": f"REP-{s.id}",
            "case_id": s.id,
            "subject_name": name_field,
            "document_number": doc_num,
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
